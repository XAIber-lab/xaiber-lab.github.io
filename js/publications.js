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

  var state = { all: [] };

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

  /* --- rendering: one entry --- */

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
      ? '<a class="link-chip" href="' + escapeHTML(pub.repositoryurl) + '" target="_blank" rel="noopener">Repository</a>'
      : "";

    var abstractToggle = pub.abstract
      ? '<button type="button" class="link-chip text-toggle" data-target="abstract-' + index + '">Abstract</button>'
      : "";
    var abstractBlock = pub.abstract
      ? '<div class="toggle-block" id="abstract-' + index + '">' + escapeHTML(pub.abstract) + "</div>"
      : "";

    var bibtexToggle = pub.bibtex
      ? '<button type="button" class="link-chip text-toggle" data-target="bibtex-' + index + '">BibTeX</button>'
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
      '<a class="link-chip" href="' + escapeHTML(fixedUrl) + '" target="_blank" rel="noopener">View publication ↗</a>' +
      abstractToggle +
      repoChip +
      bibtexToggle +
      "</div>" +
      abstractBlock +
      bibtexBlock +
      "</div>";

    return wrapper;
  }

  /* --- rendering: the list itself (re-run on every filter change) --- */

  function populateList(listWrap, data) {
    listWrap.innerHTML = "";

    if (!data.length) {
      listWrap.innerHTML = '<p class="pub-empty">No publications for this year.</p>';
      return;
    }

    var list = document.createElement("div");
    list.className = "pub-card-list";
    data.forEach(function (pub, i) {
      list.appendChild(createCardEl(pub, i));
    });
    listWrap.appendChild(list);

    list.addEventListener("click", function (e) {
      var toggleBtn = e.target.closest(".text-toggle");
      if (toggleBtn) {
        var block = document.getElementById(toggleBtn.dataset.target);
        if (block) block.classList.toggle("open");
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

  /* --- rendering: year filter row (built once per full data load) --- */

  function renderYearFilter(container, years, onSelect) {
    var row = document.createElement("div");
    row.className = "year-filter-row";

    var allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "year-filter-btn active";
    allBtn.textContent = "All";
    allBtn.dataset.year = "all";
    row.appendChild(allBtn);

    years.forEach(function (y) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "year-filter-btn";
      b.textContent = String(y);
      b.dataset.year = String(y);
      row.appendChild(b);
    });

    row.addEventListener("click", function (e) {
      var btn = e.target.closest(".year-filter-btn");
      if (!btn) return;
      row.querySelectorAll(".year-filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      onSelect(btn.dataset.year);
    });

    container.appendChild(row);
  }

  /* --- top-level render: filter row + list, given a full dataset --- */

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
    state.all = sorted;

    var years = Array.from(
      new Set(sorted.map(function (p) { return extractYear(p.date); }).filter(Boolean))
    ).sort(function (a, b) { return b - a; });

    var listWrap = document.createElement("div");

    renderYearFilter(container, years, function (yearStr) {
      var filtered = yearStr === "all"
        ? state.all
        : state.all.filter(function (p) { return String(extractYear(p.date)) === String(yearStr); });
      populateList(listWrap, filtered);
    });

    container.appendChild(listWrap);
    populateList(listWrap, sorted);
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
