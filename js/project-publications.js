/* =========================================================
   XAIber-Lab — project page publications
   Fetches the same data/publications.json used by the main
   Publications page, filters it down to whatever's tagged with
   this project's slug (via "Project Slugs" in the Publications
   sheet), and renders it with the exact same PubCard component.
   ========================================================= */

(function () {

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById("project-pub-container");
    if (!container) return;

    var slug = container.getAttribute("data-project-slug");
    var PC = window.PubCard;
    if (!slug || !PC) return;

    container.innerHTML = '<p class="pub-loading">Loading publications…</p>';

    fetch("../data/publications.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("publications.json fetch failed: " + res.status);
        return res.json();
      })
      .then(function (payload) {
        var rows = (payload && payload.publications) || [];
        var mine = PC.sortByDateDesc(rows.filter(function (p) {
          return PC.belongsToProject(p, slug);
        }));

        container.innerHTML = "";
        if (!mine.length) {
          container.innerHTML = '<p style="font-style: italic; color: var(--slate);">No publication is linked to this project yet &mdash; when one is published, it will be listed here.</p>';
          return;
        }

        var list = document.createElement("div");
        list.className = "pub-card-list";
        mine.forEach(function (pub, i) {
          list.appendChild(PC.createCardEl(pub, i));
        });
        container.appendChild(list);
        PC.wireListEvents(list);
      })
      .catch(function (err) {
        console.warn("Could not load this project's publications:", err);
        container.innerHTML = '<p class="pub-empty">Publications couldn\'t be loaded right now.</p>';
      });
  });
})();
