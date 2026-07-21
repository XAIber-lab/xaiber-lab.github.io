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

## Next steps (in order)

1. ~~Build out `members.html`~~ done.
2. ~~Build out `projects.html`~~ done.
3. ~~Build out `publications.html`~~ done — see setup below.

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
Member Slugs`.

**Member Slugs** is what links a publication to a member's own personal
page: a comma-separated list of member page filenames without the
`.html` (e.g. `tiziano-sammarone`). Any publication tagged with a
member's slug automatically shows up in a compact version of the same
box on that member's page — nothing is duplicated by hand, and it stays
current whenever the sheet updates. Leave it blank for anyone without a
page yet.
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

Same idea as Publications, replicated for the member roster — a sheet,
a sync script, a GitHub Action — but with one important difference:
**member pages have hand-written prose** (the Projects/Teaching/Hobbies
sections) that a sheet can't reasonably capture, so the system only
manages part of each page.

**How it works:** `scripts/sync_members.py` fetches the Members sheet
and, for each row:
- If `members/<slug>.html` already exists, it replaces **only** the
  content between the `<!-- SHEET:PROFILE:START -->` and
  `<!-- SHEET:PROFILE:END -->` markers (the header photo/name/badge/bio/
  links, Research Interests, the Publications reference, and PhD Topic).
  Everything below that — Projects, Teaching, Hobbies — is left exactly
  as it was, untouched, no matter how many times the sync runs.
- If the file doesn't exist yet, it creates the whole page: the
  sheet-managed section plus a starter Projects/Teaching/Hobbies
  section full of editable placeholders.
- `members.html` itself is fully rewritten every run, since every bit
  of that page comes from the sheet — there's nothing hand-authored on
  it to protect.

**Sheet columns:** `Name, Slug, Rank, Role, Institution, Bio,
Bio Snippet, Avatar Initials, Photo URL, Badge Word, Email, LinkedIn,
Google Scholar, ResearchGate, Personal Site, Keywords, Research Summary,
PhD Topic Title, PhD Topic Description`.

- **Slug** becomes the filename (`members/<slug>.html`) and is what
  Publications' "Member Slugs" column matches against — keep them
  consistent between the two sheets.
- **Rank** must be exactly one of `director`, `professor`, `phd`,
  `collaborator` (lowercase) — it controls which group a member lands
  in on `members.html`, in that order.
- **Bio** is the long version on the personal page; **Bio Snippet** is
  the short version shown on the members-list card — they're
  deliberately separate fields.
- **Keywords** is comma-separated; the personal page shows all of them,
  the members-list card shows only the first three (kept short on
  purpose).
- **PhD Topic Title/Description** only render when Rank is `phd`, and
  only if at least one of them is filled in.
- Any blank field (Photo URL, Badge Word, social links, PhD Topic) is
  simply omitted from the page rather than shown broken.

**One-time setup** (same pattern as Publications):
1. Import `members-template.csv` into a new Google Sheet — it's
   pre-filled with the current 5 members, including your own real data.
2. File → Share → Publish to web → that sheet/tab → CSV format → Publish.
3. Add the URL as repository variable `MEMBERS_SHEET_CSV_URL`.
4. Push this site, then run "Sync Members" manually once from the
   Actions tab to confirm it works, same as with Publications.
5. It then runs daily on its own (see the `cron` line in
   `.github/workflows/sync-members.yml`), or trigger it manually
   any time after editing the sheet.

This workflow reuses the same `PUBLICATIONS_PUSH_TOKEN` secret already
set up for Publications — no second token needed.

**If you ever want to hand-edit something in the profile section**
(outside of Projects/Teaching/Hobbies), do it in the sheet, not the
HTML — the next sync will overwrite that region with whatever the
sheet says.
