/* =========================================================
   XAIber-Lab — homepage teaser feeds
   Pulls real data into the Projects/Members/Publications teasers
   from the same data/*.json files the full pages and sync scripts
   already produce — nothing here is duplicated or hand-maintained.
   ========================================================= */

(function () {

  var PC = window.PubCard; // for escapeHTML / extractYear / sortByDateDesc / normalizeUrl

  function esc(s) {
    return PC ? PC.escapeHTML(s) : String(s || "");
  }

  function showFallback(container, label) {
    container.innerHTML = '<p style="font-style: italic; color: var(--slate);">' + label + " coming soon.</p>";
  }

  /* --- Projects --- */

  function renderProjectCard(p) {
    var thumbStyle = p.image1url
      ? ' style="background-image:url(\'' + esc(p.image1url) + "'); background-size:contain; background-repeat:no-repeat; background-position:center;\""
      : "";
    return (
      '<article class="card">' +
      '<div class="card-thumb" aria-hidden="true"' + thumbStyle + "></div>" +
      '<div class="card-body">' +
      "<h3>" + esc(p.title) + "</h3>" +
      "<p>" + esc(p.tagline) + "</p>" +
      '<a class="card-link" href="projects/' + esc(p.slug) + '.html">Learn more &rarr;</a>' +
      "</div></article>"
    );
  }

  function loadProjects() {
    var container = document.getElementById("home-project-grid");
    if (!container) return;
    fetch("data/projects.json", { cache: "no-store" })
      .then(function (res) { if (!res.ok) throw new Error("fetch failed"); return res.json(); })
      .then(function (payload) {
        var items = ((payload && payload.projects) || []).slice(0, 3);
        if (!items.length) { showFallback(container, "Projects"); return; }
        container.innerHTML = items.map(renderProjectCard).join("");
      })
      .catch(function () { showFallback(container, "Projects"); });
  }

  /* --- Members --- */

  function renderMemberMini(m) {
    var avatar = m.photourl
      ? '<div class="avatar-placeholder"><img src="' + esc(m.photourl) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div>'
      : '<div class="avatar-placeholder">' + esc(m.avatarinitials) + "</div>";
    return (
      '<a class="member-mini" href="members/' + esc(m.slug) + '.html">' +
      avatar + "<h3>" + esc(m.name) + '</h3><p class="role">' + esc(m.role) + "</p></a>"
    );
  }

  function loadMembers() {
    var container = document.getElementById("home-member-grid");
    if (!container) return;
    fetch("data/members.json", { cache: "no-store" })
      .then(function (res) { if (!res.ok) throw new Error("fetch failed"); return res.json(); })
      .then(function (payload) {
        var items = ((payload && payload.members) || []).slice(0, 4);
        if (!items.length) { showFallback(container, "Members"); return; }
        container.innerHTML = items.map(renderMemberMini).join("");
      })
      .catch(function () { showFallback(container, "Members"); });
  }

  /* --- Publications --- */

  function renderPubItem(pub) {
    var year = PC ? PC.extractYear(pub.date) : "";
    var venue = pub.conferencename || pub.venue || "";
    var url = PC ? PC.normalizeUrl(pub.url) : (pub.url || "#");
    return (
      '<li class="pub-item">' +
      '<span class="pub-meta">' + esc(year) + "<br>" + esc(venue) + "</span>" +
      "<div>" +
      '<p class="pub-title"><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(pub.title || "Untitled") + "</a></p>" +
      '<p class="pub-authors">' + esc(pub.authors) + "</p>" +
      "</div></li>"
    );
  }

  function loadPublications() {
    var container = document.getElementById("home-pub-list");
    if (!container) return;
    fetch("data/publications.json", { cache: "no-store" })
      .then(function (res) { if (!res.ok) throw new Error("fetch failed"); return res.json(); })
      .then(function (payload) {
        var rows = (payload && payload.publications) || [];
        var sorted = PC ? PC.sortByDateDesc(rows) : rows;
        var items = sorted.slice(0, 3);
        if (!items.length) { showFallback(container, "Publications"); return; }
        container.innerHTML = items.map(renderPubItem).join("");
      })
      .catch(function () { showFallback(container, "Publications"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadProjects();
    loadMembers();
    loadPublications();
  });
})();
