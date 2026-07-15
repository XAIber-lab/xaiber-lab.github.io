/* =========================================================
   XAIber-Lab — Members page summary sentence
   Scans whatever .member-card[data-rank] elements are actually
   present on the page and builds a sentence like:
   "XAIber-Lab is composed of 5 members: 1 director, 1 professor,
   2 PhD candidates, 1 collaborator."
   Add, remove, or re-tag member cards in members.html and this
   updates itself on next page load — no count to maintain by hand.
   ========================================================= */

(function () {

  var RANK_LABELS = {
    director: { singular: "director", plural: "directors" },
    professor: { singular: "professor", plural: "professors" },
    phd: { singular: "PhD candidate", plural: "PhD candidates" },
    collaborator: { singular: "collaborator", plural: "collaborators" }
  };

  // Order the summary sentence lists ranks in, regardless of the
  // order cards happen to appear in the DOM.
  var RANK_ORDER = ["director", "professor", "phd", "collaborator"];

  document.addEventListener("DOMContentLoaded", function () {
    var target = document.getElementById("member-summary");
    if (!target) return;

    var cards = document.querySelectorAll(".member-card[data-rank]");
    if (!cards.length) return;

    var counts = {};
    cards.forEach(function (card) {
      var rank = card.getAttribute("data-rank");
      counts[rank] = (counts[rank] || 0) + 1;
    });

    var total = cards.length;

    var parts = RANK_ORDER
      .filter(function (rank) { return counts[rank]; })
      .map(function (rank) {
        var n = counts[rank];
        var label = RANK_LABELS[rank] || { singular: rank, plural: rank + "s" };
        return n + " " + (n === 1 ? label.singular : label.plural);
      });

    // Any ranks used in the HTML but not in RANK_ORDER/RANK_LABELS
    // still get counted, just appended after the known ones.
    Object.keys(counts).forEach(function (rank) {
      if (RANK_ORDER.indexOf(rank) === -1) {
        var n = counts[rank];
        parts.push(n + " " + rank + (n === 1 ? "" : "s"));
      }
    });

    var sentence = "XAIber-Lab is composed of " + total + " member" + (total === 1 ? "" : "s");
    if (parts.length) sentence += ": " + parts.join(", ");
    sentence += ".";

    target.textContent = sentence;
  });
})();
