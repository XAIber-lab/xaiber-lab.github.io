/* =========================================================
   XAIber-Lab — Publications page
   Reads data/publications.json, which is kept up to date by a
   scheduled GitHub Action (.github/workflows/sync-publications.yml)
   that pulls from a published Google Sheet. Falls back to local
   sample data if that file is missing or fails to load.
   ========================================================= */

(function () {

  var DATA_URL = "data/publications.json";

  /* -----------------------------------------------------------
     Fallback / sample data — last-resort safety net, used only
     if data/publications.json can't be fetched at all (e.g. the
     file is missing). Under normal operation the seed/synced
     JSON file is the source of truth, not this array.
     ----------------------------------------------------------- */
  var FALLBACK_DATA = [
    {
      title: "Placeholder Publication",
      authors: "Author One, Author Two",
      date: "2025",
      venue: "Journal Name",
      url: "#",
      abstract: "data/publications.json could not be loaded, so this placeholder is shown instead.",
      type: "",
      conferencename: "", conferencedate: "", conferencelocation: "",
      thumbnailurl: "", bibtex: "", repositoryurl: ""
    }
  ];

  /* --- helpers --- */

  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

  function metaLine(pub) {
    if (pub.conferencename) {
      var parts = [pub.conferencename];
      if (pub.conferencelocation) parts.push(pub.conferencelocation);
      if (pub.conferencedate) parts.push(pub.conferencedate);
      return parts.join(" · ");
    }
    var parts2 = [];
    if (pub.venue) parts2.push(pub.venue);
    if (pub.date) parts2.push(pub.date);
    return parts2.join(" · ");
  }

  /* --- rendering --- */

  function createCardEl(pub, index) {
    var wrapper = document.createElement("article");
    wrapper.className = "pub-card";

    var thumbHTML = pub.thumbnailurl
      ? '<img src="' + escapeHTML(pub.thumbnailurl) + '" alt="" loading="lazy" onerror="this.parentElement.innerHTML=\'\';">'
      : "";

    var typeTag = pub.type
      ? '<span class="tag">' + escapeHTML(pub.type) + "</span>"
      : "";

    var repoChip = pub.repositoryurl
      ? '<a class="link-chip" href="' + escapeHTML(pub.repositoryurl) + '" target="_blank" rel="noopener">Repository</a>'
      : "";

    var bibtexControls = pub.bibtex
      ? '<button type="button" class="link-chip bibtex-toggle" data-index="' + index + '">BibTeX</button>'
      : "";

    var bibtexBlock = pub.bibtex
      ? '<div class="bibtex-block" id="bibtex-' + index + '">' +
        '<button type="button" class="link-chip copy-btn" data-index="' + index + '" style="float:right; margin-bottom:8px;">Copy</button>' +
        '<div style="clear:both;">' + escapeHTML(pub.bibtex) + "</div></div>"
      : "";

    wrapper.innerHTML =
      '<div class="pub-card-thumb" aria-hidden="true">' + thumbHTML + "</div>" +
      "<div>" +
      typeTag +
      '<p class="pub-card-title"><a href="' + escapeHTML(pub.url) + '" target="_blank" rel="noopener">' + escapeHTML(pub.title || "Untitled") + "</a></p>" +
      '<p class="pub-card-meta">' + escapeHTML(metaLine(pub)) + "</p>" +
      '<p class="pub-card-authors">' + escapeHTML(pub.authors) + "</p>" +
      (pub.abstract ? '<p class="pub-card-abstract">' + escapeHTML(pub.abstract) + "</p>" : "") +
      '<div class="pub-card-actions">' +
      '<a class="link-chip" href="' + escapeHTML(pub.url) + '" target="_blank" rel="noopener">View publication ↗</a>' +
      repoChip +
      bibtexControls +
      "</div>" +
      bibtexBlock +
      "</div>";

    return wrapper;
  }

  function render(data, opts) {
    opts = opts || {};
    var container = document.getElementById("pub-container");
    var notice = document.getElementById("pub-data-notice");
    container.innerHTML = "";

    if (notice) {
      notice.style.display = opts.live ? "none" : "inline-block";
    }

    if (!data.length) {
      container.innerHTML = '<p class="pub-empty">No publications to show yet.</p>';
      return;
    }

    var sorted = sortByDateDesc(data);
    var list = document.createElement("div");
    list.className = "pub-card-list";
    sorted.forEach(function (pub, i) {
      list.appendChild(createCardEl(pub, i));
    });
    container.appendChild(list);

    list.addEventListener("click", function (e) {
      var toggleBtn = e.target.closest(".bibtex-toggle");
      if (toggleBtn) {
        var block = document.getElementById("bibtex-" + toggleBtn.dataset.index);
        if (block) block.classList.toggle("open");
        return;
      }
      var copyBtn = e.target.closest(".copy-btn");
      if (copyBtn) {
        var block2 = document.getElementById("bibtex-" + copyBtn.dataset.index);
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

  /* --- init --- */

  function init() {
    var container = document.getElementById("pub-container");
    if (!container) return;

    container.innerHTML = '<p class="pub-loading">Loading publications…</p>';

    fetch(DATA_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("publications.json fetch failed: " + res.status);
        return res.json();
      })
      .then(function (payload) {
        var rows = (payload && payload.publications) || [];
        var isLive = payload && payload.source === "google-sheets";
        if (!rows.length) throw new Error("publications.json has no rows");
        render(rows, { live: isLive });
      })
      .catch(function (err) {
        console.warn("Falling back to embedded sample data:", err);
        render(FALLBACK_DATA, { live: false });
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
