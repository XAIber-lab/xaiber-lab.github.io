# Apps Script reference copies

The three Google Sheets behind this site (Members, Projects,
Publications) each have a small `onEdit` trigger installed directly in
their own Apps Script editor (open the spreadsheet -> Extensions ->
Apps Script). These files are **not executed from here** — Google
Sheets has no mechanism to pull script code from a GitHub repo, or
anywhere else outside the spreadsheet itself.

They're kept in this folder purely as a version-controlled backup and
reference, since the live Apps Script project inside each spreadsheet
has no history of its own — if someone accidentally clears or
overwrites it, there is nothing to recover it from except this folder.

**If you edit the live script in a spreadsheet, copy the final version
back into the matching file here** so the two don't drift apart:

| File here | Paste into |
|---|---|
| `members-onedit.gs` | Members spreadsheet |
| `projects-onedit.gs` | Projects spreadsheet |
| `publications-onedit.gs` | Publications spreadsheet |

See the main `README.md`'s "Slug auto-generation" section for what
this trigger actually does and why it's a script rather than a plain
spreadsheet formula.
