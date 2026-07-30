# Quick Guide — Adding Yourself, a Project, or a Publication to the XAIber-Lab Site

The site is **never edited by hand**: it rebuilds itself automatically from three Google Sheets (Members, Projects, Publications). Just fill in the right row in the right sheet — the site rebuilds itself once a day, at the times listed at the bottom of this guide.

## Sheet links

*(to be filled in — direct links to the three sheets, so you don't have to go looking for them)*

- **Members**: [insert link]
- **Projects**: [insert link]
- **Publications**: [insert link]

The Hub sheet (the one with the Rank, Status, Funding Regions, etc. lists) is deliberately not linked here — you never need to open it, the dropdown menus in the three sheets above already read from it automatically.

## General rules, valid across all sheets

- **The "Slug" column**: never type over it by hand. It fills itself in automatically the moment you type the Name/Title on that row. If you do change it by mistake, a warning will pop up — read it, it explains what you risk (anything already linking to that row will stop working until you fix it).
- **Columns with a dropdown menu** (Rank, Status, Funding Regions, Section, Publication Type, and the "…Slug" fields that link to members/projects): only pick from the options offered, don't type a new value by hand — it would be rejected. If the value you need isn't in the list (e.g. a new funding region), **don't invent a similar-looking variant**: ask Professor Angelini, who manages that list in the Hub sheet — the new value will be selectable everywhere within moments.
- **"Keywords" columns** (research keywords): here you can write freely, comma-separated — this isn't a closed list, having a varied and growing number of terms is normal.

## How to upload photos and images

Profile photos and project images **cannot be uploaded to GitHub** — members only have read access to the site's repository, so you wouldn't be able to do this anyway. Use Google Drive instead:

1. Upload the image to your Google Drive.
2. Right-click the file → **Share** → change access to **"Anyone with the link"** (without this step the image won't be visible to site visitors).
3. Copy the share link — it looks like `https://drive.google.com/file/d/AbCdEfGhIjKlMnOp/view?usp=sharing`. The only part you need is the long code in the middle (`AbCdEfGhIjKlMnOp` in this example).
4. Build the link to paste into the sheet like this:
   ```
   https://drive.google.com/uc?export=view&id=AbCdEfGhIjKlMnOp
   ```
   (only replace the code, keep `export=view` exactly as it is — it's different from the format used for PDFs, see below).
5. Paste this link into the right cell (Photo URL for your profile, Image 1/2/3 URL for a project).

## Uploading a publication's PDF

Here too, the PDF **cannot be uploaded to GitHub** directly by you — same reason as the images. You have two routes, and they're deliberately different from each other.

**Right away, on your own — Google Drive (temporary solution).** Same procedure as images: upload the PDF to Drive, Share → "Anyone with the link", then build the link like this:
```
https://drive.google.com/uc?export=download&id=YOUR-CODE
```
(note: here it's `export=download`, not `export=view` like for images). Paste it into the **PDF URL** cell — the publication is live right away.

**The permanent solution — an admin adds it on GitHub.** A PDF hosted on Drive has a real technical limitation, not just a theoretical one: the site's two buttons "View PDF" and "Download PDF" end up behaving identically (both trigger an immediate download), instead of staying distinct as they're designed to. The correct fix is having the file live in the repository's `papers/` folder — which only someone with write access can do.

**What to do in practice**: go ahead and publish on Drive right away so you don't lose time, then send an email to **[admin name/email]** with the PDF attached, asking for it to be moved to its permanent location. It's not urgent, but it's the right thing to do for a publication meant to stay online long-term.

---

## 1. Adding yourself as a member (**Members** sheet, "Members" tab)

Add a new row at the bottom and fill in:

| Column | How to fill it in |
|---|---|
| Name | Your full name |
| Slug | **Leave blank**, it fills itself in |
| Rank | Dropdown: `director` / `professor` / `phd` / `collaborator` |
| Role | Fills itself in automatically based on the Rank you choose (e.g. `professor` → "Professor"). You can leave it as is, or customize it if you want a more specific title — e.g. "Director and Full Professor of [subject]" instead of the generic "Director" — once you edit it by hand it stays that way |
| Institution | Institutional affiliation |
| Bio | Long-form text for your personal page |
| Bio Snippet | Short version, for your card in the members list |
| Avatar Initials | Your initials, used only if you don't upload a photo |
| Photo URL | Direct link to a photo of you — see the "How to upload photos and images" section above |
| Badge Word | A short word/label shown on your card |
| Email | Your normal address (e.g. `name.surname@linkstudents.it`) — the site automatically converts it to an anti-spam format for display, you don't need to type it already "obfuscated" |
| LinkedIn / Google Scholar / ResearchGate / Personal Site | Direct links to your profiles, one per column |
| Keywords | Research keywords, comma-separated, free text |
| Research Summary | Short paragraph about your research interests |
| PhD Date | PhD candidates only: free text, write it however you want it to appear (e.g. "Since November 2023" or "41st Cycle") |
| PhD Topic Title / PhD Topic Description | PhD candidates only: title and description of your PhD topic |

---

## 2. Adding your activities (same Members sheet, "Member Activities" tab)

One row per entry in your timeline — a project you work on, a teaching role, a hobby.

| Column | How to fill it in |
|---|---|
| Member Slug | Dropdown: pick your name from the list, rather than typing it by hand |
| Section | Dropdown: `projects` / `teaching` / `hobbies` |
| Date Range | Free text (e.g. "2024 – present") |
| Title | Title of the entry |
| Org Line | Line with the organization/course/context |
| Description | Short description |
| Bullets | Bullet points: one per line within the same cell — press **Alt+Enter** (Option+Enter on Mac) to start a new line without leaving the cell |
| Project Slug | Only if this activity relates to a project on the site: dropdown, pick the project |

---

## 3. Adding a project (**Projects** sheet)

| Column | How to fill it in |
|---|---|
| Title | Project title |
| Slug | **Leave blank**, it fills itself in |
| Status | Dropdown: `Active` / `Completed` |
| Time Span | Free text (e.g. "2024–2027") |
| Tagline | Short introductory sentence |
| Funding Regions | **Multi-select** dropdown: pick one or more regions from the list |
| Funding Line | Text naming the funding body |
| Description / About | Long description and "about" section for the project |
| Official Site / Repository URL | Direct links |
| Keywords | Free keywords, comma-separated |
| Image 1/2/3 URL | Image links — same procedure described in "How to upload photos and images" above |

The project's "Team" **is not entered here**: it appears on its own, derived automatically from whoever has linked that project via "Project Slug" in the Member Activities tab.

---

## 4. Adding a publication (**Publications** sheet)

| Column | How to fill it in |
|---|---|
| Title | Exact title of the publication |
| Slug | **Leave blank**, it fills itself in |
| Authors / Date / Venue | As they appear on the publication |
| URL | Link to the publication's page/DOI |
| Abstract | Paper abstract |
| Type | Dropdown (e.g. `Conference paper` / `Journal article`) |
| Conference Name / Date / Location | Only if relevant |
| Thumbnail URL | Preview image |
| BibTeX / APA Citation | Citations in both formats |
| Repository URL | Link to associated code/data, if any |
| Member Slugs | **Multi-select** dropdown: the authors who are lab members |
| Project Slugs | **Multi-select** dropdown: the projects linked to this publication |
| PDF URL | To publish right away, use Google Drive — see "Uploading a publication's PDF" above for the procedure and for when it's worth asking for the permanent setup |

The **publication's own keywords** (if added in the future) don't go through any dropdown: they stay exactly as published, even if slightly different from one paper to another on the same topic — this is intentional, to stay faithful to the original publication.

---

## Frequently asked questions

**Why is Rank a mandatory dropdown, but Role can be edited freely?**
They're two different things. Rank decides which section you appear in on the members list (Director/Professors/PhD Candidates/Collaborators) — it must be exactly one of the four proposed values, otherwise that logic breaks, which is why it's closed. Role, on the other hand, is just the text shown on your card and your page — it doesn't drive any site logic, so you can make it more specific than the generic Rank value, with no risk. You don't have to write anything if you don't want to: as soon as you pick a Rank, Role fills itself in with a sensible default (e.g. "Professor", "PhD Candidate"). If you'd rather have a more precise title — e.g. "Director and Full Professor of [subject]" instead of the plain "Director" — you can type it yourself, and from then on it stays that way, even if your Rank changes later.

**The value I need isn't in the dropdown (e.g. a new funding region)?**
Ask Professor Angelini — he's the only one who can add it to the Hub sheet. Once added, it becomes selectable everywhere, with nothing else needed.

**I mistyped my Slug/a project's Slug and corrected the cell by hand — is that a problem?**
A warning pops up when you do this: it means any publications/activities that pointed at the old Slug will stop linking correctly. If that Slug was already in use somewhere, update those references yourself, or flag it to Professor Angelini if you're not sure where to look.

**How long does the site take to update after I edit a sheet?**
The site rebuilds itself automatically once a day, at roughly these times (Italian time, one hour earlier in winter):

| Sheet | Update time |
|---|---|
| Publications | around 8:00 AM |
| Members | around 9:00 AM |
| Projects | around 10:00 AM |

If you edit the sheet after that day's run, the change appears on the site the following day. There's nothing you need to do to trigger it — it's automatic, just wait for the next run.
