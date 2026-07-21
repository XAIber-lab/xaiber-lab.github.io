#!/usr/bin/env python3
"""
Fetches the published Google Sheet (CSV) and writes it out as
data/publications.json, in the shape the site's front end expects.

Requires the PUBLICATIONS_SHEET_CSV_URL environment variable to be
set to a Google Sheets "Publish to web" CSV URL.

Uses only the standard library on purpose, so the GitHub Action
doesn't need a pip install step.
"""

import csv
import io
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "publications.json")


def normalize_key(key):
    return "".join(str(key or "").strip().lower().split()).replace("-", "").replace("_", "")


def normalize_url(raw):
    v = (raw or "").strip()
    if not v or v == "#":
        return "#"
    if v.lower().startswith("http://") or v.lower().startswith("https://") or v.lower().startswith("mailto:"):
        return v
    if re.match(r"^10\.\d{4,9}/\S+$", v):
        return "https://doi.org/" + v
    if v.lower().startswith("www."):
        return "https://" + v
    return "https://" + v  # assume a domain/path just missing its scheme


def normalize_row(raw):
    out = {normalize_key(k): (v or "").strip() for k, v in raw.items()}
    return {
        "title": out.get("title", ""),
        "authors": out.get("authors", ""),
        "date": out.get("date") or out.get("publicationdate", ""),
        "venue": out.get("venue") or out.get("sourcepublisher") or out.get("publisher") or out.get("source", ""),
        "url": normalize_url(out.get("url") or out.get("doihtml") or out.get("doi") or out.get("link") or "#"),
        "abstract": out.get("abstract") or out.get("descriptionabstract") or out.get("description", ""),
        "type": out.get("type", ""),
        "conferencename": out.get("conferencename", ""),
        "conferencedate": out.get("conferencedate", ""),
        "conferencelocation": out.get("conferencelocation", ""),
        "thumbnailurl": out.get("thumbnailurl") or out.get("thumbnail") or out.get("paperthumbnail") or out.get("coverimage", ""),
        "bibtex": out.get("bibtex", ""),
        "repositoryurl": out.get("repositoryurl") or out.get("repository") or out.get("repo", ""),
        # Comma-separated member page slugs (e.g. "tiziano-sammarone"),
        # used to show a filtered set of these same cards on each
        # member's own personal page. Leave blank if nobody with a
        # page yet is an author.
        "memberslugs": out.get("memberslugs") or out.get("members") or "",
        # Full URL to a downloadable PDF (GitHub-hosted in a papers/
        # folder, or a Google Drive direct-download link). Must be a
        # full URL, not a relative path — these cards render both at
        # the site root and one folder down on member pages.
        "pdfurl": normalize_url(out.get("pdfurl") or out.get("pdf") or "") if (out.get("pdfurl") or out.get("pdf")) else "",
        # A verified, human-written APA-format citation string —
        # not auto-generated, so it's never subtly wrong.
        "apacitation": out.get("apacitation") or out.get("apa", ""),
    }


def main():
    sheet_url = os.environ.get("PUBLICATIONS_SHEET_CSV_URL", "").strip()
    if not sheet_url.startswith("http"):
        print(
            "PUBLICATIONS_SHEET_CSV_URL is not set to a valid URL.\n"
            "Set it as a repository variable in Settings -> Secrets and "
            "variables -> Actions -> Variables.",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Fetching: {sheet_url}")
    req = urllib.request.Request(sheet_url, headers={"User-Agent": "xaiber-lab-publications-sync"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw_bytes = resp.read()

    csv_text = raw_bytes.decode("utf-8-sig")  # handles a possible BOM from Sheets
    reader = csv.DictReader(io.StringIO(csv_text))
    rows = [normalize_row(r) for r in reader]
    rows = [r for r in rows if r["title"]]

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "google-sheets",
        "publications": rows,
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote {len(rows)} publication(s) to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
