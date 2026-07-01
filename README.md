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
Conference Date, Conference Location, Thumbnail URL, BibTeX, Repository URL`.
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
