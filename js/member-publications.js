/* =========================================================
   XAIber-Lab — member page publications
   Fetches the same data/publications.json used by the main
   Publications page, filters it down to whatever's tagged with
   this member's slug, and renders it with the exact same
   PubCard component — so these boxes are taken from the
   Publications page's data, never hand-duplicated, and stay
   current automatically whenever that data updates.
   ========================================================= */

(function () {

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById("member-pub-container");
    if (!container) return;

    var slug = container.getAttribute("data-member-slug");
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
          return PC.belongsToMember(p, slug);
        }));

        container.innerHTML = "";
        if (!mine.length) {
          container.innerHTML = '<p class="pub-empty">No publications linked to this member yet.</p>';
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
        console.warn("Could not load this member's publications:", err);
        container.innerHTML = '<p class="pub-empty">Publications couldn\'t be loaded right now.</p>';
      });
  });
})();
