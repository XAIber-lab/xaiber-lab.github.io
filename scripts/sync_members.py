#!/usr/bin/env python3
"""
Fetches the published Google Sheet (CSV) of member profiles and:

 1. Creates or updates each member's personal page at
    members/<slug>.html — but ONLY the sheet-managed "profile
    block" (the region between the SHEET:PROFILE:START/END
    markers: header photo/name/badge/bio/links, Research
    Interests, the Publications reference, and PhD Topic).
    Everything else on an existing page (Projects/Teaching/
    Hobbies — genuinely hand-authored prose) is left completely
    untouched. Brand-new members get a full page scaffolded,
    with that section pre-filled with editable placeholders.

 2. Fully regenerates members.html, since every bit of that page
    is sheet-derived — safe to rewrite from scratch each run.

Requires the MEMBERS_SHEET_CSV_URL environment variable, set to a
Google Sheets "Publish to web" CSV URL.

Standard library only, so the GitHub Action needs no pip install.
"""

import csv
import io
import os
import re
import sys
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
MEMBERS_DIR = os.path.join(ROOT, "members")
MEMBERS_HTML_PATH = os.path.join(ROOT, "members.html")

MARKER_START = "<!-- SHEET:PROFILE:START -->"
MARKER_END = "<!-- SHEET:PROFILE:END -->"

RANK_ORDER = ["director", "professor", "phd", "collaborator"]
RANK_SECTION_TITLES = {
    "director": "Director",
    "professor": "Professors",
    "phd": "PhD Candidates",
    "collaborator": "Collaborators",
}

LOGO_MARK = (
    '<svg class="logo-mark" viewBox="0 0 40 40" width="22" height="22" aria-hidden="true">'
    '<line class="edge" x1="8" y1="10" x2="28" y2="8"/>'
    '<line class="edge-active" x1="28" y1="8" x2="20" y2="28"/>'
    '<line class="edge" x1="8" y1="10" x2="10" y2="30"/>'
    '<line class="edge" x1="20" y1="28" x2="10" y2="30"/>'
    '<circle class="node" cx="8" cy="10" r="3"/>'
    '<circle class="node" cx="28" cy="8" r="2.6"/>'
    '<circle class="node-highlight" cx="20" cy="28" r="4"/>'
    '<circle class="node" cx="10" cy="30" r="2.6"/>'
    '</svg>'
)

SCHOLAR_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>'
RESEARCHGATE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 8.365 8.365 0 0 0-.078.53 9 9 0 0 0-.05.727c-.01.282-.013.621-.013 1.016a31.121 31.123 0 0 0 .014 1.017 9 9 0 0 0 .05.727 7.946 7.946 0 0 0 .077.53h-.005a3.334 3.334 0 0 0 .113.438c.245.743.65 1.303 1.214 1.68.565.376 1.256.564 2.075.564.8 0 1.536-.213 2.105-.603.57-.39.94-.916 1.175-1.65.076-.235.135-.558.177-.93a10.9 10.9 0 0 0 .043-1.207v-.82c0-.095-.047-.142-.14-.142h-3.064c-.094 0-.14.047-.14.141v.956c0 .094.046.14.14.14h1.666c.056 0 .084.03.084.086 0 .36 0 .62-.036.865-.038.244-.1.447-.147.606-.108.385-.348.664-.638.876-.29.212-.738.35-1.227.35-.545 0-.901-.15-1.21-.353-.306-.203-.517-.454-.67-.915a3.136 3.136 0 0 1-.147-.762 17.366 17.367 0 0 1-.034-.656c-.01-.26-.014-.572-.014-.939a26.401 26.403 0 0 1 .014-.938 15.821 15.822 0 0 1 .035-.656 3.19 3.19 0 0 1 .148-.76 1.89 1.89 0 0 1 .742-1.01c.344-.244.593-.352 1.137-.352.508 0 .815.096 1.144.303.33.207.528.492.764.925.047.094.111.118.198.07l1.044-.43c.075-.048.09-.115.042-.199a3.549 3.549 0 0 0-.466-.742 3 3 0 0 0-.679-.607 3.313 3.313 0 0 0-.903-.41A4.068 4.068 0 0 0 19.586 0zM8.217 5.836c-1.69 0-3.036.086-4.297.086-1.146 0-2.291 0-3.007-.029v.831l1.088.2c.744.144 1.174.488 1.174 2.264v11.288c0 1.777-.43 2.12-1.174 2.263l-1.088.2v.832c.773-.029 2.12-.086 3.465-.086 1.29 0 2.951.057 3.667.086v-.831l-1.49-.2c-.773-.115-1.174-.487-1.174-2.264v-4.784c.688.057 1.29.057 2.206.057 1.748 3.123 3.41 5.472 4.355 6.56.86 1.032 2.177 1.691 3.839 1.691.487 0 1.003-.086 1.318-.23v-.744c-1.031 0-2.063-.716-2.808-1.518-1.26-1.376-2.95-3.582-4.355-6.074 2.32-.545 4.04-2.722 4.04-4.9 0-3.208-2.492-4.698-5.758-4.698zm-.515 1.29c2.406 0 3.839 1.26 3.839 3.552 0 2.263-1.547 3.782-4.097 3.782-.974 0-1.404-.03-2.063-.086v-7.19c.66-.059 1.547-.059 2.32-.059z"/></svg>'
EMAIL_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M2 4l6 5 6-5"/></svg>'
EXTLINK_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V10"/><path d="M9 2h5v5"/><path d="M14 2L7 9"/></svg>'


def normalize_key(key):
    return "".join(str(key or "").strip().lower().split()).replace("-", "").replace("_", "")


def esc(s):
    return (str(s or "")
            .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&#039;"))


def obfuscate_email(email):
    if not email or "@" not in email:
        return ""
    local, domain = email.split("@", 1)
    return local.replace(".", " dot ") + " at " + domain.replace(".", " dot ")


def normalize_row(raw):
    out = {normalize_key(k): (v or "").strip() for k, v in raw.items()}
    keywords = [w.strip() for w in out.get("keywords", "").split(",") if w.strip()]
    name = out.get("name", "")
    initials = out.get("avatarinitials", "") or "".join(p[0] for p in name.split()[:2])
    return {
        "name": name,
        "slug": out.get("slug", ""),
        "rank": out.get("rank", "").lower(),
        "role": out.get("role", ""),
        "institution": out.get("institution", ""),
        "bio": out.get("bio", ""),
        "biosnippet": out.get("biosnippet", ""),
        "avatarinitials": initials[:2].upper(),
        "photourl": out.get("photourl", ""),
        "badgeword": out.get("badgeword", ""),
        "email": out.get("email", ""),
        "linkedin": out.get("linkedin", ""),
        "googlescholar": out.get("googlescholar", ""),
        "researchgate": out.get("researchgate", ""),
        "personalsite": out.get("personalsite", ""),
        "keywords": keywords,
        "researchsummary": out.get("researchsummary", ""),
        "phdtopictitle": out.get("phdtopictitle", ""),
        "phdtopicdescription": out.get("phdtopicdescription", ""),
    }


def avatar_html(m, css_class):
    if m["photourl"]:
        return ('<div class="' + css_class + '"><img src="' + esc(m["photourl"]) +
                '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div>')
    return '<div class="' + css_class + '">' + esc(m["avatarinitials"]) + "</div>"


def social_chip(icon_html, label, url):
    if url:
        return ('<a class="social-chip" href="' + esc(url) + '" target="_blank" rel="noopener">' +
                icon_html + " " + label + "</a>")
    return ('<a class="social-chip" href="#" target="_blank" rel="noopener"><!-- PLACEHOLDER: add ' +
            label + ' link -->' + icon_html + " " + label + "</a>")


def render_profile_block(m):
    avatar = avatar_html(m, "avatar-placeholder-lg")
    badge_html = '<p class="identity-badge">' + esc(m["badgeword"]) + "</p>" if m["badgeword"] else ""

    obf = obfuscate_email(m["email"])
    email_line = '<p class="email-plain">' + esc(obf) + "</p>" if obf else ""

    if m["personalsite"]:
        primary_link = ('<a class="profile-primary-link" href="' + esc(m["personalsite"]) +
                         '" target="_blank" rel="noopener">' + EXTLINK_SVG + "Personal site</a>")
    else:
        primary_link = ('<!-- PLACEHOLDER: add personal website link -->'
                         '<a class="profile-primary-link" href="#" target="_blank" rel="noopener">' +
                         EXTLINK_SVG + "Personal site</a>")

    linkedin_icon = '<span class="icon-badge" aria-hidden="true">in</span>'
    social_row = "\n          ".join([
        social_chip(linkedin_icon, "LinkedIn", m["linkedin"]),
        social_chip(SCHOLAR_SVG, "Google Scholar", m["googlescholar"]),
        social_chip(RESEARCHGATE_SVG, "ResearchGate", m["researchgate"]),
        ('<a class="social-chip" href="mailto:' + esc(m["email"]) + '">' + EMAIL_SVG + "Email</a>")
        if m["email"] else
        ('<!-- PLACEHOLDER: add email --><a class="social-chip" href="#">' + EMAIL_SVG + "Email</a>"),
    ])

    kw_html = "\n        ".join('<span class="tag">' + esc(k) + "</span>" for k in m["keywords"])
    if not kw_html:
        kw_html = '<!-- PLACEHOLDER: add keywords in the sheet --><span class="tag">keyword one</span>'

    research_summary = ('<p>' + esc(m["researchsummary"]) + "</p>") if m["researchsummary"] else ""

    phd_section = ""
    if m["rank"] == "phd" and (m["phdtopictitle"] or m["phdtopicdescription"]):
        phd_section = (
            '\n\n  <section class="teaser">\n    <div class="wrap">\n'
            '      <p class="section-tag">[phd topic]</p>\n      <h2>PhD Topic</h2>\n'
            '      <p class="profile-theme" style="margin-bottom: 14px;">' + esc(m["phdtopictitle"]) + '</p>\n'
            '      <p>' + esc(m["phdtopicdescription"]) + '</p>\n    </div>\n  </section>'
        )

    return MARKER_START + '''
  <!-- ============ STANDARD PROFILE BLOCK ============
       Generated from the Members sheet by scripts/sync_members.py —
       edit there, not here. Everything below this marked region
       (Projects/Teaching/Hobbies) is hand-authored and is left
       completely untouched whenever this runs again. -->
  <section class="profile-hero">
    <div class="wrap profile-header">

      ''' + avatar + '''

      <div class="profile-info-block">
        <p class="section-tag">[people]</p>
        <h1>''' + esc(m["name"]) + '''</h1>

        ''' + badge_html + '''
        <p class="profile-title">''' + esc(m["role"]) + '''</p>
        <p class="profile-institution">''' + esc(m["institution"]) + '''</p>

        <p>''' + esc(m["bio"]) + '''</p>

        ''' + email_line + '''

        ''' + primary_link + '''

        <div class="profile-social-row">
          ''' + social_row + '''
        </div>
      </div>
    </div>
  </section>

  <section class="teaser">
    <div class="wrap">
      <p class="section-tag">[research interests]</p>
      <h2>Research Interests</h2>
      ''' + research_summary + '''
      <div class="tag-row" id="member-keywords">
        ''' + kw_html + '''
      </div>
    </div>
  </section>

  <section class="teaser alt">
    <div class="wrap">
      <p class="section-tag">[publications]</p>
      <h2>Publications</h2>
      <div id="member-pub-container" data-member-slug="''' + esc(m["slug"]) + '''">
        <p class="pub-loading">Loading publications&hellip;</p>
      </div>
    </div>
  </section>''' + phd_section + '''
  ''' + MARKER_END


ACTIVITIES_SCAFFOLD = '''
  <!-- ============ PROJECTS ============ -->
  <section class="teaser alt">
    <div class="wrap">
      <p class="section-tag">[projects]</p>
      <h2>Projects</h2>
      <!-- PLACEHOLDER: add real project or research-role entries -->
      <div class="timeline-item">
        <div class="timeline-meta">&nbsp;</div>
        <div>
          <h4>Project placeholder</h4>
          <p class="org">Add a real project or research role entry here.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ TEACHING ============ -->
  <section class="teaser">
    <div class="wrap">
      <p class="section-tag">[teaching]</p>
      <h2>Teaching</h2>
      <!-- PLACEHOLDER: teaching entry — add real ones as they happen -->
      <div class="timeline-item">
        <div class="timeline-meta">&nbsp;</div>
        <div>
          <h4>Teaching placeholder</h4>
          <p class="org">This is where teaching assignments go &mdash; e.g. a course TA'd, a workshop run, or a guest lecture given.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ HOBBIES ============ -->
  <section class="teaser alt">
    <div class="wrap">
      <p class="section-tag">[hobbies]</p>
      <h2>Hobbies</h2>
      <!-- PLACEHOLDER: hobbies entry — add real ones whenever useful -->
      <div class="timeline-item">
        <div class="timeline-meta">&nbsp;</div>
        <div>
          <h4>Hobbies placeholder</h4>
          <p class="org">This is where a non-academic interest worth sharing goes.</p>
        </div>
      </div>
    </div>
  </section>'''


def render_new_page(m, profile_block):
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>''' + esc(m["name"]) + ''' &mdash; XAIber-Lab</title>
<meta name="description" content="''' + esc(m["name"]) + ''', ''' + esc(m["role"]) + ''' at XAIber-Lab.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css">
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
  <div class="wrap">
    <a href="../index.html" class="logo">''' + LOGO_MARK + '''XAIber<span class="accent">-Lab</span></a>
    <nav class="site-nav">
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">Menu</button>
      <ul id="nav-menu">
        <li><a href="../about.html">About</a></li>
        <li><a href="../projects.html">Projects</a></li>
        <li><a href="../members.html">Members</a></li>
        <li><a href="../publications.html">Publications</a></li>
      </ul>
    </nav>
  </div>
</header>

<main id="main">

''' + profile_block + '''
''' + ACTIVITIES_SCAFFOLD + '''

  <div class="wrap">
    <a class="back-link" href="../members.html">&larr; Back to members</a>
  </div>

</main>

<footer class="site-footer">
  <div class="wrap">
    <div>
      <p><strong>XAIber-Lab</strong><br>
      Placeholder affiliation / department / university.<br>
      <a href="mailto:placeholder@example.edu">placeholder@example.edu</a></p>
    </div>
    <ul class="footer-links">
      <li><a href="../about.html">About</a></li>
      <li><a href="../projects.html">Projects</a></li>
      <li><a href="../members.html">Members</a></li>
      <li><a href="../publications.html">Publications</a></li>
    </ul>
  </div>
</footer>

<script src="../js/pub-card-shared.js"></script>
<script src="../js/member-publications.js"></script>
<script src="../js/main.js"></script>
</body>
</html>
'''


def sync_member_page(m):
    path = os.path.join(MEMBERS_DIR, m["slug"] + ".html")
    profile_block = render_profile_block(m)

    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            content = f.read()
        pattern = re.compile(re.escape(MARKER_START) + r".*?" + re.escape(MARKER_END), re.DOTALL)
        if pattern.search(content):
            new_content = pattern.sub(lambda _m: profile_block, content)
            action = "updated (profile section only)"
        else:
            print("WARNING: markers not found in " + path + " — leaving file untouched.", file=sys.stderr)
            return "skipped (no markers)"
    else:
        new_content = render_new_page(m, profile_block)
        action = "created"

    os.makedirs(MEMBERS_DIR, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return action


def render_card(m):
    avatar = avatar_html(m, "avatar-placeholder")
    kw = m["keywords"][:3]
    kw_block = ""
    if kw:
        kw_html = "".join('<span class="tag">' + esc(k) + "</span>" for k in kw)
        kw_block = '\n          <div class="tag-row card-keywords">' + kw_html + "</div>"

    return ('''        <article class="member-card" data-rank="''' + esc(m["rank"]) + '''">
          ''' + avatar + '''
          <h3>''' + esc(m["name"]) + '''</h3>
          <p class="role">''' + esc(m["role"]) + '''</p>
          <p class="bio-snippet">''' + esc(m["biosnippet"]) + '''</p>''' + kw_block + '''
          <a class="card-link" href="members/''' + esc(m["slug"]) + '''.html">View profile &rarr;</a>
        </article>''')


def render_members_html(members):
    groups = {}
    for m in members:
        groups.setdefault(m["rank"], []).append(m)

    sections = []
    for rank in RANK_ORDER:
        rows = groups.get(rank, [])
        if not rows:
            continue
        cards = "\n\n".join(render_card(m) for m in rows)
        sections.append(
            '      <h2 class="member-group-heading">' + RANK_SECTION_TITLES[rank] + '</h2>\n'
            '      <div class="member-list-grid">\n' + cards + '\n      </div>\n'
        )
    body = "\n".join(sections)

    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Members &mdash; XAIber-Lab</title>
<meta name="description" content="Meet the researchers of XAIber-Lab.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
  <div class="wrap">
    <a href="index.html" class="logo">''' + LOGO_MARK + '''XAIber<span class="accent">-Lab</span></a>
    <nav class="site-nav">
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">Menu</button>
      <ul id="nav-menu">
        <li><a href="about.html">About</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="members.html">Members</a></li>
        <li><a href="publications.html">Publications</a></li>
      </ul>
    </nav>
  </div>
</header>

<main id="main">

  <section class="page-head">
    <div class="wrap">
      <p class="section-tag">[people]</p>
      <h1>Members</h1>
      <p class="lede">Meet the researchers, PhD candidates, and collaborators working across XAIber-Lab's projects on explainable AI and cyber risk management.</p>
      <!-- Populated automatically by js/members-summary.js, based on
           whatever .member-card[data-rank] elements actually exist
           below — this page is itself generated from the Members
           sheet by scripts/sync_members.py, so both always agree. -->
      <p class="lede" id="member-summary" style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--teal);"></p>
    </div>
  </section>

  <section style="padding: 56px 0;">
    <div class="wrap">
''' + body + '''    </div>
  </section>

</main>

<footer class="site-footer">
  <div class="wrap">
    <div>
      <p><strong>XAIber-Lab</strong><br>
      Placeholder affiliation / department / university.<br>
      <a href="mailto:placeholder@example.edu">placeholder@example.edu</a></p>
    </div>
    <ul class="footer-links">
      <li><a href="about.html">About</a></li>
      <li><a href="projects.html">Projects</a></li>
      <li><a href="members.html">Members</a></li>
      <li><a href="publications.html">Publications</a></li>
    </ul>
  </div>
</footer>

<script src="js/members-summary.js"></script>
<script src="js/main.js"></script>
</body>
</html>
'''


def main():
    sheet_url = os.environ.get("MEMBERS_SHEET_CSV_URL", "").strip()
    if not sheet_url.startswith("http"):
        print(
            "MEMBERS_SHEET_CSV_URL is not set to a valid URL.\n"
            "Set it as a repository variable in Settings -> Secrets and "
            "variables -> Actions -> Variables.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("Fetching: " + sheet_url)
    req = urllib.request.Request(sheet_url, headers={"User-Agent": "xaiber-lab-members-sync"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw_bytes = resp.read()

    csv_text = raw_bytes.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(csv_text))
    members = [normalize_row(r) for r in reader]
    members = [m for m in members if m["name"] and m["slug"]]

    for m in members:
        result = sync_member_page(m)
        print("  " + m["slug"] + ": " + result)

    with open(MEMBERS_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(render_members_html(members))

    print("Wrote " + str(len(members)) + " member page(s) and regenerated members.html")


if __name__ == "__main__":
    main()
