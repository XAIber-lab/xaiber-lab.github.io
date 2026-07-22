#!/usr/bin/env python3
"""
Fetches the published Google Sheet (CSV) of projects and fully
generates:

 1. Each project's page at projects/<slug>.html — header (status,
    time span, funding flags, funding line, description, official
    site + repository links), a Related Publications placeholder
    (filled in at runtime by js/project-publications.js), an About
    section, and a Team section.

 2. projects.html itself, fully regenerated (grid of cards).

Team membership isn't a field on this sheet at all — it's derived
by cross-referencing the Member Activities sheet (the same one
used by sync_members.py): anyone with an activity entry whose
"Project Slug" matches this project is automatically listed,
avoiding a second place to maintain the same fact. This means this
script also fetches MEMBERS_SHEET_CSV_URL and
MEMBER_ACTIVITIES_SHEET_CSV_URL (read-only) alongside its own sheet.

Every part of a project page is sheet-derived, so — same as
Publications and Members — every run fully rewrites both the
project pages and projects.html from scratch.

Requires:
  PROJECTS_SHEET_CSV_URL
  MEMBERS_SHEET_CSV_URL            (read-only, for Team derivation)
  MEMBER_ACTIVITIES_SHEET_CSV_URL  (read-only, for Team derivation)

Standard library only, so the GitHub Action needs no pip install.
"""

import csv
import io
import os
import sys
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
PROJECTS_DIR = os.path.join(ROOT, "projects")
PROJECTS_HTML_PATH = os.path.join(ROOT, "projects.html")

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

EXTLINK_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V10"/><path d="M9 2h5v5"/><path d="M14 2L7 9"/></svg>'

# Known funding-region flags. Add more here (as {region: svg}) to
# support new ones — unrecognized region names in the sheet still
# show as a plain text badge, just without an icon.
FLAG_SVGS = {
    "european": '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="30" height="20" fill="#003399"/><circle cx="15" cy="4" r="0.9" fill="#FFCC00"/><circle cx="18" cy="4.8" r="0.9" fill="#FFCC00"/><circle cx="20.2" cy="7" r="0.9" fill="#FFCC00"/><circle cx="21" cy="10" r="0.9" fill="#FFCC00"/><circle cx="20.2" cy="13" r="0.9" fill="#FFCC00"/><circle cx="18" cy="15.2" r="0.9" fill="#FFCC00"/><circle cx="15" cy="16" r="0.9" fill="#FFCC00"/><circle cx="12" cy="15.2" r="0.9" fill="#FFCC00"/><circle cx="9.8" cy="13" r="0.9" fill="#FFCC00"/><circle cx="9" cy="10" r="0.9" fill="#FFCC00"/><circle cx="9.8" cy="7" r="0.9" fill="#FFCC00"/><circle cx="12" cy="4.8" r="0.9" fill="#FFCC00"/></svg>',
    "italian": '<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#FFFFFF"/><rect x="20" width="10" height="20" fill="#CE2B37"/></svg>',
}


def normalize_key(key):
    return "".join(str(key or "").strip().lower().split()).replace("-", "").replace("_", "")


def esc(s):
    return (str(s or "")
            .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&#039;"))


def paragraphs(text):
    lines = [l.strip() for l in str(text or "").replace("\r\n", "\n").split("\n") if l.strip()]
    return "\n      ".join("<p>" + esc(l) + "</p>" for l in lines)


def fetch_csv_rows(url, label):
    print("Fetching " + label + ": " + url)
    req = urllib.request.Request(url, headers={"User-Agent": "xaiber-lab-projects-sync"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw_bytes = resp.read()
    csv_text = raw_bytes.decode("utf-8-sig")
    return list(csv.DictReader(io.StringIO(csv_text)))


def normalize_project_row(raw):
    out = {normalize_key(k): (v or "").strip() for k, v in raw.items()}
    keywords = [w.strip() for w in out.get("keywords", "").split(",") if w.strip()]
    regions = [r.strip() for r in out.get("fundingregions", "").split(",") if r.strip()]
    return {
        "title": out.get("title", ""),
        "slug": out.get("slug", ""),
        "status": out.get("status", "").lower(),
        "timespan": out.get("timespan", ""),
        "tagline": out.get("tagline", ""),
        "fundingregions": regions,
        "fundingline": out.get("fundingline", ""),
        "description": out.get("description", ""),
        "officialsite": out.get("officialsite", ""),
        "repositoryurl": out.get("repositoryurl", ""),
        "keywords": keywords,
        "image1url": out.get("image1url", ""),
        "image2url": out.get("image2url", ""),
        "image3url": out.get("image3url", ""),
        "about": out.get("about", ""),
    }


def normalize_member_row(raw):
    out = {normalize_key(k): (v or "").strip() for k, v in raw.items()}
    name = out.get("name", "")
    initials = out.get("avatarinitials", "") or "".join(p[0] for p in name.split()[:2])
    return {
        "name": name,
        "slug": out.get("slug", ""),
        "role": out.get("role", ""),
        "photourl": out.get("photourl", ""),
        "avatarinitials": initials[:2].upper(),
    }


def normalize_activity_row(raw):
    out = {normalize_key(k): (v or "").strip() for k, v in raw.items()}
    return {
        "memberslug": out.get("memberslug", ""),
        "projectslug": out.get("projectslug", ""),
    }


def flag_row_html(regions):
    if not regions:
        return ""
    badges = []
    for r in regions:
        svg = FLAG_SVGS.get(r.strip().lower(), "")
        badges.append('<span class="flag-badge">' + svg + " " + esc(r) + "</span>")
    return ('\n      <div class="flag-row" aria-label="Funding region">\n        ' +
            "\n        ".join(badges) + "\n      </div>")


def image_box_html(css_class, url):
    if url:
        return '<div class="' + css_class + '" style="background-image:url(\'' + esc(url) + '\'); background-size:contain; background-repeat:no-repeat; background-position:center;"></div>'
    return '<div class="' + css_class + '" aria-hidden="true"></div>'


def render_project_page(p, team_members):
    status_class = "status-active" if p["status"] == "active" else "status-completed"
    status_label = "Active" if p["status"] == "active" else "Completed"

    flags_html = flag_row_html(p["fundingregions"])

    funding_html = ('<p><strong>Funded by:</strong> ' + esc(p["fundingline"]) + "</p>") if p["fundingline"] else ""

    desc_html = paragraphs(p["description"])

    gallery_items = [p["image1url"], p["image2url"], p["image3url"]]
    gallery_html = ""
    if any(gallery_items):
        boxes = "\n        ".join(image_box_html("mini-gallery-item", u) for u in gallery_items if u or True)
        gallery_html = '\n      <div class="mini-gallery" aria-hidden="true">\n        ' + boxes + "\n      </div>"

    official_html = (
        '<a class="profile-primary-link" href="' + esc(p["officialsite"]) + '" target="_blank" rel="noopener">' +
        EXTLINK_SVG + "Official site</a>"
    ) if p["officialsite"] else ""

    repo_html = (
        '<div class="link-row"><a class="link-chip" href="' + esc(p["repositoryurl"]) +
        '" target="_blank" rel="noopener">Repository</a></div>'
    ) if p["repositoryurl"] else ""

    about_html = paragraphs(p["about"]) if p["about"] else "<p><!-- PLACEHOLDER: add an extended description in the sheet's About column --></p>"

    if team_members:
        team_cards = []
        for m in team_members:
            avatar = (
                '<div class="avatar-placeholder"><img src="' + esc(m["photourl"]) +
                '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div>'
            ) if m["photourl"] else '<div class="avatar-placeholder">' + esc(m["avatarinitials"]) + "</div>"
            team_cards.append(
                '<a class="member-mini" href="../members/' + esc(m["slug"]) + '.html">' +
                avatar + "<h3>" + esc(m["name"]) + '</h3><p class="role">' + esc(m["role"]) + "</p></a>"
            )
        team_html = "\n        ".join(team_cards)
    else:
        team_html = '<!-- No member activity entries reference this project yet (Project Slug=' + esc(p["slug"]) + ') --><p style="font-style: italic; color: var(--slate);">No team members linked yet.</p>'

    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>''' + esc(p["title"]) + ''' &mdash; XAIber-Lab</title>
<meta name="description" content="''' + esc(p["tagline"]) + '''">
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

  <section class="project-hero">
    <div class="wrap">
      <p class="section-tag">[projects]</p>
      <h1>''' + esc(p["title"]) + '''</h1>

      <div class="card-status-row">
        <span class="tag ''' + status_class + '''">''' + status_label + '''</span>
        <span class="card-timespan">''' + esc(p["timespan"]) + '''</span>
      </div>
      ''' + flags_html + '''

      <p class="profile-position">''' + esc(p["tagline"]) + '''</p>
      ''' + gallery_html + '''

      ''' + funding_html + '''
      ''' + desc_html + '''

      ''' + official_html + '''
      ''' + repo_html + '''
    </div>
  </section>

  <section class="teaser">
    <div class="wrap">
      <p class="section-tag">[publications]</p>
      <h2>Related Publications</h2>
      <div id="project-pub-container" data-project-slug="''' + esc(p["slug"]) + '''">
        <p class="pub-loading">Loading publications&hellip;</p>
      </div>
    </div>
  </section>

  <section class="teaser alt">
    <div class="wrap">
      <p class="section-tag">[about]</p>
      <h2>About the project</h2>
      ''' + about_html + '''
    </div>
  </section>

  <section class="teaser">
    <div class="wrap">
      <p class="section-tag">[team]</p>
      <h2>Team</h2>
      <div class="team-row">
        ''' + team_html + '''
      </div>
    </div>
  </section>

  <div class="wrap">
    <a class="back-link" href="../projects.html">&larr; Back to projects</a>
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
<script src="../js/project-publications.js"></script>
<script src="../js/main.js"></script>
</body>
</html>
'''


def render_card(p):
    thumb_html = image_box_html("card-thumb", p["image1url"])
    status_class = "status-active" if p["status"] == "active" else "status-completed"
    status_label = "Active" if p["status"] == "active" else "Completed"
    flags_html = flag_row_html(p["fundingregions"])
    kw_html = ""
    if p["keywords"]:
        tags = "".join('<span class="tag">' + esc(k) + "</span>" for k in p["keywords"])
        kw_html = '<div class="tag-row card-keywords">' + tags + "</div>"

    return ('''      <article class="card">
        ''' + thumb_html + '''
        <div class="card-body">
          <div class="card-status-row">
            <span class="tag ''' + status_class + '''">''' + status_label + '''</span>
            <span class="card-timespan">''' + esc(p["timespan"]) + '''</span>
          </div>''' + flags_html + '''
          <h3>''' + esc(p["title"]) + '''</h3>
          <p>''' + esc(p["tagline"]) + '''</p>
          ''' + kw_html + '''
          <a class="card-link" href="projects/''' + esc(p["slug"]) + '''.html">View project &rarr;</a>
        </div>
      </article>''')


def render_projects_html(projects):
    cards = "\n\n".join(render_card(p) for p in projects)

    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Projects &mdash; XAIber-Lab</title>
<meta name="description" content="Research projects and prototypes built at XAIber-Lab.">
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
      <p class="section-tag">[projects]</p>
      <h1>Projects</h1>
      <p class="lede">Tools and research prototypes built across XAIber-Lab, spanning attack-graph simulation, generative AI assistance, and explainable risk analysis.</p>
    </div>
  </section>

  <section>
    <div class="wrap card-grid" style="padding: 56px 0;">
''' + cards + '''
    </div>
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

<script src="js/main.js"></script>
</body>
</html>
'''


def main():
    projects_url = os.environ.get("PROJECTS_SHEET_CSV_URL", "").strip()
    members_url = os.environ.get("MEMBERS_SHEET_CSV_URL", "").strip()
    activities_url = os.environ.get("MEMBER_ACTIVITIES_SHEET_CSV_URL", "").strip()

    for name, val in [("PROJECTS_SHEET_CSV_URL", projects_url),
                       ("MEMBERS_SHEET_CSV_URL", members_url),
                       ("MEMBER_ACTIVITIES_SHEET_CSV_URL", activities_url)]:
        if not val.startswith("http"):
            print(name + " is not set to a valid URL.", file=sys.stderr)
            sys.exit(1)

    project_rows = fetch_csv_rows(projects_url, "Projects sheet")
    projects = [normalize_project_row(r) for r in project_rows]
    projects = [p for p in projects if p["title"] and p["slug"]]

    member_rows = fetch_csv_rows(members_url, "Members sheet (for Team)")
    members_by_slug = {m["slug"]: m for m in (normalize_member_row(r) for r in member_rows) if m["slug"]}

    activity_rows = fetch_csv_rows(activities_url, "Member Activities sheet (for Team)")
    activities = [normalize_activity_row(r) for r in activity_rows]

    # Build: project slug -> ordered list of unique member slugs who
    # have an activity entry pointing at that project.
    team_by_project = {}
    for a in activities:
        if not a["projectslug"] or not a["memberslug"]:
            continue
        team_by_project.setdefault(a["projectslug"], [])
        if a["memberslug"] not in team_by_project[a["projectslug"]]:
            team_by_project[a["projectslug"]].append(a["memberslug"])

    os.makedirs(PROJECTS_DIR, exist_ok=True)
    for p in projects:
        member_slugs = team_by_project.get(p["slug"], [])
        team_members = [members_by_slug[s] for s in member_slugs if s in members_by_slug]

        path = os.path.join(PROJECTS_DIR, p["slug"] + ".html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(render_project_page(p, team_members))
        print("  " + p["slug"] + ": generated (" + str(len(team_members)) + " team member(s))")

    with open(PROJECTS_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(render_projects_html(projects))

    print("Wrote " + str(len(projects)) + " project page(s) and regenerated projects.html")


if __name__ == "__main__":
    main()
