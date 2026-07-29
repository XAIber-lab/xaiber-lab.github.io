# Site Images

Host member photos, project thumbnails, and other site imagery here,
the same way `papers/` works for publication PDFs.

## The site logo — fixed filenames, don't rename

Three files are the exception to the "anything readable" rule below,
because their filenames are hardcoded directly in the HTML/CSS/Python
(not typed into a Google Sheet cell), so the name must stay exact:

```
images/xaiberlab-logo.png              — the small circular mark in the header, every page
images/xaiberlab-favicon.png           — browser tab / bookmark icon
images/xaiberlab-apple-touch-icon.png  — iOS "add to home screen" icon
```

To update the logo in the future: replace these three files with the
new artwork, **keeping the exact same filenames**, then commit/push. No
HTML, CSS, or script edit needed anywhere — every page picks it up
automatically. If you ever want to size them freshly from a source
image, keep `xaiberlab-logo.png` roughly square (it's displayed at
28×28 and clipped to a circle via CSS), `xaiberlab-favicon.png` at
512×512, and `xaiberlab-apple-touch-icon.png` at 180×180.

## Naming convention (everything else)

Anything readable and unique, e.g.:
```
images/tiziano-sammarone.jpg
images/faradai-topology-diagram.png
```

## Linking it

Once an image is here and pushed, its live URL is:
```
https://xaiber-lab.github.io/images/<filename>
```
Paste that **full URL** wherever an image URL is needed (see the main
README's "Where images go" section for the specific spot per page
type). Same rule as PDFs: always the full `https://...` URL, never a
relative path — several of these images render on pages at different
folder depths (site root vs. `members/...`), and a relative path that
works from one breaks on the other.

## Using Google Drive instead

For an `<img>` tag to actually display a Drive-hosted image (rather
than showing Drive's preview page), use:
```
https://drive.google.com/uc?export=view&id=FILE_ID
```
Note this is **`export=view`**, not `export=download` — that's the
PDF-download format from `papers/README.md`, and won't display inline.
`FILE_ID` is the long ID string in the middle of Drive's share URL.
