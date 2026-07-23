# XAIber-Lab website

Static site (plain HTML/CSS/JS, no build step) for the XAIber-Lab showcase
website. Built to run directly on GitHub Pages.

## Structure

```
index.html          → landing page (done)
projects.html        → stub, to be built next
members.html          → stub, to be built next
publications.html      → stub, to be built next
css/style.css        → shared design tokens & styles
js/main.js           → shared behavior (mobile nav toggle)
```

## Deploying on GitHub Pages

1. Push this folder's contents to the root of a repository (or to a `/docs`
   folder, or a `gh-pages` branch — any of these work).
2. In the repo settings → Pages, set the source to that location.
3. The site will be live at `https://<username>.github.io/<repo>/`.

No build tools, package.json, or dependencies are required — it's just
static files.

## Where the placeholders are

Everything that needs real content is either:
- wrapped in an HTML comment `<!-- PLACEHOLDER: ... -->`, or
- visually marked with the amber left-border "placeholder" style (the lab
  description paragraph on the homepage).

On `index.html` specifically:
- Hero description paragraph (lab mission/affiliation)
- 3 project teaser cards (title, one-line description, thumbnail)
- 4 member teaser cards (name, role, avatar)
- 3 publication teaser entries (title, authors, venue/year)
- Footer affiliation text and contact email

## Design notes

- Fonts: Newsreader (headings), IBM Plex Sans (body), IBM Plex Mono
  (the `[bracket-tag]` section labels and data-like bits), loaded from
  Google Fonts.
- Color tokens, layout widths, and radii are defined as CSS custom
  properties at the top of `css/style.css` — change the site's look by
  editing values there rather than hunting through individual rules.
- The hero's network-graph SVG is hand-authored inline in `index.html`;
  it's decorative (`aria-hidden="true"`) and purely a visual signature.

## Where images go

Every image on the site right now is a placeholder (a gray box, or a
generic icon). Here's exactly where to add a real one for each type,
and whether it goes through a sheet or needs direct HTML editing.

**First, host the actual image file.** Two options, same as PDFs:
- Add it to the `images/` folder in this repo (see `images/README.md`)
  — simplest, no external accounts needed.
- Or use Google Drive with the `export=view` URL format (also covered
  in `images/README.md` — note this is different from the
  `export=download` format used for PDFs).

Either way, you end up with one **full URL** per image. What you do
with that URL depends on where it's going:

**Member photos** — sheet-driven, no HTML editing.
Paste the URL into that member's **Photo URL** cell in the Members
sheet, then run "Sync Members." It replaces the initials-circle with
the real photo automatically, both on `members.html` and on their own
page — nothing to touch by hand.

**Publication thumbnails** — sheet-driven, no HTML editing.
Same idea: paste the URL into that publication's **Thumbnail URL**
cell in the Publications sheet, then run "Sync Publications."

**Homepage hero carousel** — hand-edited HTML.
Open `index.html`, find the `.hero-carousel-slide` divs (there are 4).
Each one currently has no `background-image` of its own (it inherits
the placeholder icon from CSS). Add a real one directly on the
element, e.g.:
```html
<div class="hero-carousel-slide active" data-caption="Lab workshop"
     style="background-image:url('https://xaiber-lab.github.io/images/workshop.jpg'); background-size:cover; background-position:center;"></div>
```
Do this for each of the 4 slides you want to replace (or delete extra
`<div>`s if you have fewer than 4 real photos, or copy the block for
more).

**Project thumbnails & mini-gallery** — sheet-driven, no HTML editing.
Paste URLs into the **Image 1/2/3 URL** columns on that project's row
in the Projects sheet, then run "Sync Projects." Image 1 doubles as
the card thumbnail on `projects.html`; all three (if filled in) appear
in the mini-gallery on the project's own page. These use `contain`
rather than `cover` — project images are more often screenshots or
diagrams where cropping would cut off something that matters, so the
whole image shows, letterboxed against the placeholder background if
the proportions don't match exactly.

**Logo / favicon** — the small network-graph mark in the header is
hand-drawn SVG, not a photo; there's nothing to swap in unless you want
to replace the mark itself, which would mean editing the inline `<svg>`
in each page's header (or asking me to help redesign it).

## Next steps (in order)

1. ~~Build out `members.html`~~ done.
2. ~~Build out `projects.html`~~ done.
3. ~~Build out `publications.html`~~ done — see setup below.

## The homepage teasers update themselves

`index.html`'s three teaser sections (Projects, Members, Publications)
are no longer static placeholders — `js/homepage-feed.js` fetches
`data/projects.json`, `data/members.json`, and `data/publications.json`
(the same feeds the sync scripts already produce) and renders the
first few real entries:

- **Projects**: first 3, in the order they appear in the Projects sheet.
- **Members**: first 4, in rank order (Director → Professors → PhD
  Candidates → Collaborators), matching the grouping on `members.html`.
- **Publications**: the 3 most recent by date, same sort as the full
  Publications page.

There's nothing to configure — as soon as any of the three syncs run
and update its data file, the homepage reflects it on next page load.
If a data file is ever missing or fails to load, that teaser shows a
plain "coming soon" message rather than breaking or reverting to fake
placeholder content.

`data/members.json` is written by `sync_members.py` and
`data/projects.json` by `sync_projects.py`, alongside the HTML pages
those scripts already generate — both are lightweight feeds (name,
role, slug, etc.) rather than full page content, purely for this kind
of cross-page summary use.

## Setting up the live Publications sync

The Publications page reads `data/publications.json`. That file starts out
as committed seed/example data, and is kept up to date by a scheduled
GitHub Action (`.github/workflows/sync-publications.yml`) that pulls from
a published Google Sheet. Here's the one-time setup:

**1. Create the sheet.**
Import `publications-template.csv` into a new Google Sheet (File → Import).
It has the exact header row the sync script expects:
`Title, Authors, Date, Venue, URL, Abstract, Type, Conference Name,
Conference Date, Conference Location, Thumbnail URL, BibTeX, Repository URL,
Member Slugs, PDF URL, APA Citation`.

**Member Slugs** is what links a publication to a member's own personal
page: a comma-separated list of member page filenames without the
`.html` (e.g. `tiziano-sammarone`). Any publication tagged with a
member's slug automatically shows up in a compact version of the same
box on that member's page — nothing is duplicated by hand, and it stays
current whenever the sheet updates. Leave it blank for anyone without a
page yet.

**PDF URL** adds two buttons: "View PDF" (opens the PDF in a new tab)
and "Download PDF" (forces a direct save-as instead of just viewing).
Host the PDF either in this repo's `papers/` folder (see
`papers/README.md` for the exact steps) or on Google Drive. **Must be a
full URL** (`https://...`), never a relative path — these cards render
both on the Publications page (site root) and embedded on member pages
(one folder down), so a relative link that works from one breaks on
the other.

**Important for a real forced download:** if the PDF is hosted in this
repo's `papers/` folder, the URL in the sheet **must** be the live
`https://xaiber-lab.github.io/papers/<filename>.pdf` page (same domain
as the site) — not a `https://github.com/XAIber-lab/...blob/main/...`
link. The `blob/...` URL is GitHub's file-preview *webpage*, not the
file itself, so both buttons would just open that GitHub page instead
of the PDF. The "Download PDF" button specifically only forces an
actual download when the URL is same-origin with the site (true for
the `xaiber-lab.github.io/papers/...` URL); a Google Drive
`uc?export=download&id=...` URL (see `papers/README.md`) also triggers
a real download, since Google's server itself sends the right headers.

**APA Citation** adds an "APA Citation" button, same collapsible-with-
copy-button pattern as BibTeX. This is a plain text field you paste a
verified citation into — it's deliberately not auto-generated from the
other fields, since real APA formatting has enough special cases
(conference vs. journal, author-initial style) that a computed version
risks looking correct while being subtly wrong.

Everything except `Title, Authors, Date, Venue, URL, Abstract` is optional —
leave a cell blank and that piece just won't render for that row.

**2. Publish it as CSV.**
In Sheets: File → Share → Publish to web → choose the correct sheet/tab →
format "Comma-separated values (.csv)" → Publish. Copy the URL it gives
you. (This only exposes a read-only snapshot of the data — it does not
give anyone edit access to the sheet.)

**3. Add the URL as a repository variable.**
In the GitHub repo: Settings → Secrets and variables → Actions → Variables
tab → New repository variable → name it `PUBLICATIONS_SHEET_CSV_URL`,
paste the published CSV URL as the value.

**4. Push this site to the repo, then run the sync once manually.**
Go to the Actions tab → "Sync Publications" → Run workflow. This fetches
the sheet, writes `data/publications.json`, and commits it (only if the
content actually changed). GitHub Pages will pick up the new commit and
redeploy automatically, same as any other push.

**5. From then on**, it runs automatically once a day (see the `cron`
line in the workflow file — adjust the schedule if you want it more or
less frequent). After adding a new paper to the sheet, you can also just
trigger the workflow manually from the Actions tab instead of waiting for
the next scheduled run.

**How to tell which data is showing:** the page displays a small amber
notice ("showing seed/example data…") whenever `data/publications.json`
has `"source": "seed"` (i.e. the sync has never run) or when the file
fails to load entirely. Once the Action has run successfully at least
once, `"source"` becomes `"google-sheets"` and the notice disappears.

## Setting up the live Members sync

Same idea as Publications, replicated for the member roster — sheets,
a sync script, a GitHub Action. Unlike Publications, a member's page
has two genuinely different kinds of content, so it's split across
**two linked sheets**:

- **Members** — one row per person: profile fields (name, rank, bio,
  links, badge, keywords, PhD topic).
- **Member Activities** — one row per timeline entry (a project, a
  teaching role, a hobby), linked back to a member by slug.

Both are needed because a member's Projects/Teaching/Hobbies list is
naturally one-to-many (zero or more entries per person) — trying to
cram that into single cells on the Members sheet would mean fragile
custom delimiters. As two clean sheets, each activity is just its own
normal row.

**Everything on a member's page comes from these two sheets — nothing
is left hand-authored.** That means `scripts/sync_members.py` fully
rewrites every member page and `members.html` on every run, the same
way `sync_publications.py` rewrites `data/publications.json`. Adding a
new member means adding one row to Members and (optionally) a few rows
to Member Activities — nothing else. It also means **hand-editing a
generated page directly will be overwritten on the next sync** — make
any change in the sheets instead.

**Members sheet columns:** `Name, Slug, Rank, Role, Institution, Bio,
Bio Snippet, Avatar Initials, Photo URL, Badge Word, Email, LinkedIn,
Google Scholar, ResearchGate, Personal Site, Keywords, Research Summary,
PhD Date, PhD Topic Title, PhD Topic Description`.

- **Slug** becomes the filename (`members/<slug>.html`) and is what
  Publications' "Member Slugs" column matches against, and what Member
  Activities' "Member Slug" column links back to — keep all three
  consistent.
- **Rank** must be exactly `director`, `professor`, `phd`, or
  `collaborator` (lowercase) — controls grouping on `members.html`.
- **Bio** is the long version on the personal page; **Bio Snippet** is
  the short version on the members-list card.
- **Keywords** is comma-separated; the card shows only the first three.
- **PhD Date** is free text shown as a small line above the PhD Topic
  title (e.g. `Since November 2023`, or a range like `Nov 2023 – 2026`)
  — write it however you'd like it displayed. Leave blank to omit it.
- **PhD Topic Title/Description/Date** only render when Rank is `phd`,
  and the PhD Topic section is the first thing shown on the page after
  the profile header, above Research Interests.
- Any blank field (Photo URL, Badge Word, social links, PhD Topic) is
  simply omitted rather than shown broken.
- **Email** also drives the plain-text "Contact:" line shown near the
  bottom of the profile header (e.g. `Contact: tiziano dot sammarone at
  linkstudents dot it`) — the same de-spam-bot obfuscation as before,
  just now labeled.

**Member Activities sheet columns:** `Member Slug, Section, Date Range,
Title, Org Line, Description, Bullets, Project Slug`.

- **Section** must be exactly `projects`, `teaching`, or `hobbies`.
- **Bullets** holds multiple bullet points in one cell — put each on
  its own line within the cell (Alt+Enter in Sheets adds a line break
  without leaving the cell).
- **Date Range**, **Org Line**, and **Description** can all be left
  blank for a simple entry that's just a title.
- **Project Slug** links the entry's title to a real project page —
  set it to that project's filename without `.html` (e.g. `faradai`
  for `projects/faradai.html`) and the title becomes a clickable link
  to it. Leave blank for entries with no matching project page, and
  the title just renders as plain text.
- If a member has no rows at all for a given section, that section
  shows a small placeholder telling you exactly which Member
  Slug/Section to add a row for — rather than an empty-looking gap.

**Funding-region flags on project pages:** a small `.flag-row` of
`.flag-badge` elements (flag emoji + label) shown near a project's
status/timespan, on both its card in `projects.html` and its own page.
These are hand-added to each project's HTML (Projects isn't
sheet-generated) — see `projects/project-template.html` for the
pattern to copy.

**One-time setup:**
1. Import `members-template.csv` into one new Google Sheet tab, and
   `member-activities-template.csv` into a **second tab in that same
   spreadsheet** — both are pre-filled with the current 5 members,
   including your own real data and activities.
2. Publish **each tab separately**: File → Share → Publish to web →
   pick the tab → CSV format → Publish → copy each URL (you'll get two
   different URLs, one per tab).
3. Add both as repository variables: `MEMBERS_SHEET_CSV_URL` and
   `MEMBER_ACTIVITIES_SHEET_CSV_URL`.
4. Push this site, then run "Sync Members" manually once from the
   Actions tab to confirm it works.
5. It then runs daily on its own (see `.github/workflows/sync-members.yml`),
   or trigger it manually any time after editing either sheet.

This workflow reuses the same `PUBLICATIONS_PUSH_TOKEN` secret already
set up for Publications — no second token needed.

## Setting up the live Projects sync

Same idea again, for projects — a sheet, `scripts/sync_projects.py`,
and `.github/workflows/sync-projects.yml`. Two things make this one
a little different from Members and Publications:

**Team membership isn't a field on the Projects sheet at all.** It's
derived automatically by cross-referencing the Member Activities
sheet: anyone with an activity entry whose **Project Slug** matches
this project is listed on the Team section, automatically, with no
separate place to maintain the same fact twice. This means
`sync_projects.py` also reads `MEMBERS_SHEET_CSV_URL` and
`MEMBER_ACTIVITIES_SHEET_CSV_URL` (read-only) — both already set up
from the Members sync, no new variables needed for this part.

**Related Publications work the same way Member pages already do** —
live, at runtime, not baked in at sync time. A publication shows up on
a project's page if its **Project Slugs** column (in the Publications
sheet — see that section above) includes this project's slug. Add
that column to your existing Publications sheet if you haven't already.

**Projects sheet columns:** `Title, Slug, Status, Time Span, Tagline,
Funding Regions, Funding Line, Description, Official Site, Repository
URL, Keywords, Image 1 URL, Image 2 URL, Image 3 URL, About`.

- **Slug** becomes the filename (`projects/<slug>.html`) — and is
  what Member Activities' **Project Slug** column links back to, and
  what a publication's **Project Slugs** column links to.
- **Status** must be `Active` or `Completed`.
- **Funding Regions** is comma-separated (e.g. `European, Italian`) —
  each becomes a small flag badge. Only `European` and `Italian` have
  a real flag icon built in right now; anything else still shows as a
  text badge without one. To add more, edit the `FLAG_SVGS` dict at
  the top of `scripts/sync_projects.py`.
- **Description** (short, shown in the header) and **About** (the
  fuller section further down) can each hold multiple paragraphs —
  put each on its own line within the cell, same as Bullets on the
  Member Activities sheet.
- **Image 1/2/3 URL** are optional. Image 1 doubles as the thumbnail
  on the project's card in `projects.html`. Leave all three blank to
  keep the placeholder "image goes here" boxes.
- Everything except Title, Slug, Status, Time Span, and Tagline is
  optional — leave a cell blank and that piece just won't render.

**One-time setup:** same pattern as the others — import
`projects-template.csv` (pre-filled with FaRADAI's real data) into a
new sheet, publish it to web as CSV, add the URL as repository
variable `PROJECTS_SHEET_CSV_URL`, push, then run "Sync Projects"
manually once from the Actions tab to confirm it works. It reuses the
same `PUBLICATIONS_PUSH_TOKEN` secret — no new token needed.

**`projects/project-template.html` is no longer part of the live
site** now that projects.html is fully generated — it stays in the
repo purely as a structural reference for the HTML/CSS patterns this
script produces, not linked from anywhere real.

