# Site Images

Host member photos, project thumbnails, and other site imagery here,
the same way `papers/` works for publication PDFs.

## Naming convention

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
