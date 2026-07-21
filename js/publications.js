/* =========================================================
   XAIber-Lab — Publications page
   Reads data/publications.json, which is kept up to date by a
   scheduled GitHub Action (.github/workflows/sync-publications.yml)
   that pulls from a published Google Sheet. Falls back to local
   sample data if that file is missing or fails to load.

   Card rendering itself lives in js/pub-card-shared.js (window.PubCard),
   shared with the filtered view on each member's personal page.
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
      thumbnailurl: "", bibtex: "", repositoryurl: "", memberslugs: ""
    }
  ];

  var state = { all: [] };
  var PC = window.PubCard;

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
      list.appendChild(PC.createCardEl(pub, i));
    });
    listWrap.appendChild(list);
    PC.wireListEvents(list);
  }

  /* --- rendering: year filter row (built once per full data load) --- */

  function renderYearFilter(container, years, onRangeChange) {
    if (!years.length) return;

    var maxYear = years[0];              // years arrives sorted descending
    var minYear = years[years.length - 1];
    var ascYears = years.slice().sort(function (a, b) { return a - b; });

    var wrap = document.createElement("div");
    wrap.className = "year-filter-control";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "link-chip year-filter-toggle";
    wrap.appendChild(toggle);

    var panel = document.createElement("div");
    panel.className = "year-filter-panel";

    var fromLabel = document.createElement("label");
    fromLabel.textContent = "From";
    var fromSelect = document.createElement("select");
    var toLabel = document.createElement("label");
    toLabel.textContent = "To";
    var toSelect = document.createElement("select");

    ascYears.forEach(function (y) {
      var o1 = document.createElement("option");
      o1.value = y; o1.textContent = y;
      fromSelect.appendChild(o1);
      var o2 = document.createElement("option");
      o2.value = y; o2.textContent = y;
      toSelect.appendChild(o2);
    });
    fromSelect.value = minYear;
    toSelect.value = maxYear;

    var resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "year-filter-reset";
    resetBtn.textContent = "Show all";

    panel.appendChild(fromLabel);
    panel.appendChild(fromSelect);
    panel.appendChild(toLabel);
    panel.appendChild(toSelect);
    panel.appendChild(resetBtn);

    wrap.appendChild(panel);
    container.appendChild(wrap);

    function updateToggleLabel() {
      var f = fromSelect.value, t = toSelect.value;
      var label = (f === String(minYear) && t === String(maxYear))
        ? "Filter by year"
        : (f === t ? "Year: " + f : "Years: " + f + "\u2013" + t);
      toggle.innerHTML = PC.escapeHTML(label) + ' <span class="chevron-char">\u25BE</span>';
    }

    function applyFilter() {
      var f = parseInt(fromSelect.value, 10);
      var t = parseInt(toSelect.value, 10);
      if (f > t) { var tmp = f; f = t; t = tmp; }
      updateToggleLabel();
      onRangeChange(f, t);
    }

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
    });
    fromSelect.addEventListener("change", applyFilter);
    toSelect.addEventListener("change", applyFilter);
    resetBtn.addEventListener("click", function () {
      fromSelect.value = minYear;
      toSelect.value = maxYear;
      applyFilter();
    });

    updateToggleLabel();
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

    var sorted = PC.sortByDateDesc(data);
    state.all = sorted;

    var years = Array.from(
      new Set(sorted.map(function (p) { return PC.extractYear(p.date); }).filter(Boolean))
    ).sort(function (a, b) { return b - a; });

    var listWrap = document.createElement("div");

    renderYearFilter(container, years, function (fromYear, toYear) {
      var filtered = state.all.filter(function (p) {
        var y = PC.extractYear(p.date);
        return y >= fromYear && y <= toYear;
      });
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
