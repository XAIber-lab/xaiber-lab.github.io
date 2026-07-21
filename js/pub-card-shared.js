/* =========================================================
   XAIber-Lab — shared publication card renderer
   Used by both js/publications.js (the full Publications page)
   and js/member-publications.js (the filtered view embedded on
   each member's personal page), so the box is genuinely the same
   component in both places, not two copies kept in sync by hand.
   ========================================================= */

window.PubCard = (function () {

  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeUrl(raw) {
    var v = String(raw || "").trim();
    if (!v || v === "#") return "#";
    if (/^https?:\/\//i.test(v) || /^mailto:/i.test(v)) return v;
    if (/^10\.\d{4,9}\/\S+$/.test(v)) return "https://doi.org/" + v;
    if (/^www\./i.test(v)) return "https://" + v;
    return "https://" + v;
  }

  function extractYear(dateStr) {
    var match = String(dateStr || "").match(/\d{4}/);
    return match ? parseInt(match[0], 10) : 0;
  }

  function sortByDateDesc(data) {
    return data.slice().sort(function (a, b) {
      var ay = extractYear(a.date), by = extractYear(b.date);
      if (ay !== by) return by - ay;
      return String(b.date).localeCompare(String(a.date));
    });
  }

  function venueLine(pub) {
    if (pub.conferencename) {
      var parts = [pub.conferencename];
      if (pub.conferencelocation) parts.push(pub.conferencelocation);
      return parts.join(" · ");
    }
    return pub.venue || "";
  }

  // Year only — no "Presented", no full date.
  function dateLine(pub) {
    var year = extractYear(pub.date);
    return year ? "Published " + year : "";
  }

  // Matches a member slug (e.g. "tiziano-sammarone") against a
  // publication's memberslugs field, which may be an array or a
  // comma-separated string depending on how it was parsed.
  function belongsToMember(pub, slug) {
    var raw = pub.memberslugs;
    if (!raw) return false;
    var list = Array.isArray(raw) ? raw : String(raw).split(",");
    return list.map(function (s) { return s.trim().toLowerCase(); }).indexOf(slug.toLowerCase()) !== -1;
  }

  function createCardEl(pub, index) {
    var wrapper = document.createElement("article");
    wrapper.className = "pub-card";

    var thumbHTML = pub.thumbnailurl
      ? '<img src="' + escapeHTML(pub.thumbnailurl) + '" alt="" loading="lazy" onerror="this.parentElement.innerHTML=\'\';">'
      : "";

    var typeTag = pub.type
      ? '<span class="tag">' + escapeHTML(pub.type) + "</span>"
      : "";

    var fixedUrl = normalizeUrl(pub.url);
    var vLine = venueLine(pub);
    var dLine = dateLine(pub);

    var repoChip = pub.repositoryurl
      ? '<a class="link-chip" href="' + escapeHTML(pub.repositoryurl) + '" target="_blank" rel="noopener">Repository ↗</a>'
      : "";

    var abstractToggle = pub.abstract
      ? '<button type="button" class="link-chip text-toggle" data-target="abstract-' + index + '">Abstract <span class="chevron-char">▾</span></button>'
      : "";
    var abstractBlock = pub.abstract
      ? '<div class="toggle-block" id="abstract-' + index + '">' + escapeHTML(pub.abstract) + "</div>"
      : "";

    var bibtexToggle = pub.bibtex
      ? '<button type="button" class="link-chip text-toggle" data-target="bibtex-' + index + '">BibTeX <span class="chevron-char">▾</span></button>'
      : "";
    var bibtexBlock = pub.bibtex
      ? '<div class="toggle-block mono" id="bibtex-' + index + '">' +
        '<button type="button" class="link-chip copy-btn" data-target="bibtex-' + index + '" style="float:right; margin-bottom:8px;">Copy</button>' +
        '<div style="clear:both;">' + escapeHTML(pub.bibtex) + "</div></div>"
      : "";

    wrapper.innerHTML =
      '<div class="pub-card-thumb" aria-hidden="true">' + thumbHTML + "</div>" +
      "<div>" +
      typeTag +
      '<p class="pub-card-title"><a href="' + escapeHTML(fixedUrl) + '" target="_blank" rel="noopener">' + escapeHTML(pub.title || "Untitled") + "</a></p>" +
      (vLine ? '<p class="pub-card-meta">' + escapeHTML(vLine) + "</p>" : "") +
      (dLine ? '<p class="pub-card-meta pub-card-date">' + escapeHTML(dLine) + "</p>" : "") +
      '<p class="pub-card-authors">' + escapeHTML(pub.authors) + "</p>" +
      '<div class="pub-card-actions">' +
      abstractToggle +
      bibtexToggle +
      '<a class="link-chip" href="' + escapeHTML(fixedUrl) + '" target="_blank" rel="noopener">View publication ↗</a>' +
      repoChip +
      "</div>" +
      abstractBlock +
      bibtexBlock +
      "</div>";

    return wrapper;
  }

  // Event delegation for the Abstract/BibTeX toggles and the
  // BibTeX copy button — attach once per rendered list container.
  function wireListEvents(listEl) {
    listEl.addEventListener("click", function (e) {
      var toggleBtn = e.target.closest(".text-toggle");
      if (toggleBtn) {
        var block = document.getElementById(toggleBtn.dataset.target);
        if (block) block.classList.toggle("open");
        toggleBtn.classList.toggle("open");
        return;
      }
      var copyBtn = e.target.closest(".copy-btn");
      if (copyBtn) {
        var block2 = document.getElementById(copyBtn.dataset.target);
        if (block2 && navigator.clipboard) {
          var text = block2.querySelector("div").textContent;
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = "Copied";
            setTimeout(function () { copyBtn.textContent = "Copy"; }, 1500);
          });
        }
      }
    });
  }

  return {
    escapeHTML: escapeHTML,
    normalizeUrl: normalizeUrl,
    extractYear: extractYear,
    sortByDateDesc: sortByDateDesc,
    venueLine: venueLine,
    dateLine: dateLine,
    belongsToMember: belongsToMember,
    createCardEl: createCardEl,
    wireListEvents: wireListEvents
  };
})();
