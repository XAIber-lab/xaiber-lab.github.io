# Paper PDFs

Drop publication PDFs here to host them directly on GitHub Pages.

## Naming convention

Use the publication's slug-like short name, e.g.:
```
papers/sammarone-2025-controls-library.pdf
```
Anything readable and unique works — it doesn't need to match anything
else in the sheet, since the sheet stores the full URL directly.

## Linking it from the sheet

Once a PDF is here and pushed, its live URL will be:
```
https://xaiber-lab.github.io/papers/<filename>.pdf
```
Paste that **full URL** (not just the filename) into the **PDF URL**
column for that publication's row in the Publications sheet.

**Important:** always use the full URL, not a relative path like
`papers/file.pdf`. Publication cards render both on the main
Publications page (at the site root) and embedded on personal member
pages (one folder down, `members/<slug>.html`) — a relative link that
works from one breaks on the other. A full `https://...` URL works
correctly from anywhere.

## Using Google Drive instead

If a PDF is hosted on Google Drive rather than here, don't use the
normal "share" link (`.../file/d/FILE_ID/view?usp=sharing`) — that
opens Drive's preview page, not a direct download. Use this format
instead, which actually triggers a download:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```
`FILE_ID` is the long ID string in the middle of Drive's share URL.
