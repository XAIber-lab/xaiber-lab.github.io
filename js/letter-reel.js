/* =========================================================
   XAIber-Lab — letter reel
   Animates the leading letter of the wordmark cycling through a
   configurable set of candidates (X is an unknown/variable — the
   letter rotates to make that literal), like a combination-lock
   reel: hold, roll to the next letter, hold again.

   TO EDIT THE LETTER SET: change DEFAULT_LETTERS below, or set
   a per-element data-letters="X,C,H" attribute in the HTML to
   override it just for that element. Order matters — it cycles
   in the order given, then loops back to the first.
   ========================================================= */

(function () {

  var DEFAULT_LETTERS = ["X", "C", "H"]; // edit this list to add/remove letters
  var HOLD_MS = 1800;    // how long each letter stays put
  var ROLL_MS = 500;     // how long the roll animation between letters takes

  function buildReel(el) {
    var lettersAttr = el.getAttribute("data-letters");
    var letters = lettersAttr
      ? lettersAttr.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
      : DEFAULT_LETTERS.slice();

    if (letters.length < 2) return; // nothing to rotate through

    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Measure the widest letter (in this element's own font) so the
    // reel has a fixed width and nothing jitters as letters change.
    var probe = document.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "nowrap";
    probe.style.font = window.getComputedStyle(el).font;
    document.body.appendChild(probe);
    var maxWidth = 0;
    letters.forEach(function (l) {
      probe.textContent = l;
      maxWidth = Math.max(maxWidth, probe.getBoundingClientRect().width);
    });
    document.body.removeChild(probe);

    el.innerHTML = "";
    el.style.display = "inline-block";
    el.style.overflow = "hidden";
    el.style.verticalAlign = "bottom";
    el.style.width = Math.ceil(maxWidth) + "px";

    var track = document.createElement("span");
    track.style.display = "block";

    // Duplicate the first letter at the end so the reel can loop
    // seamlessly: once it "rolls onto" the duplicate, we snap back
    // to position zero with transitions off — invisible, since the
    // duplicate looks identical to the real first letter.
    var sequence = letters.concat([letters[0]]);
    sequence.forEach(function (l) {
      var s = document.createElement("span");
      s.textContent = l;
      s.style.display = "block";
      s.style.textAlign = "center";
      track.appendChild(s);
    });
    el.appendChild(track);

    if (reduceMotion) return; // stays on the first letter, fully static

    var lineHeight = track.children[0].getBoundingClientRect().height;
    el.style.height = lineHeight + "px";

    var index = 0;
    track.style.transition = "transform " + ROLL_MS + "ms cubic-bezier(0.65, 0, 0.35, 1)";

    function step() {
      index++;
      track.style.transform = "translateY(-" + (index * lineHeight) + "px)";
      if (index === sequence.length - 1) {
        setTimeout(function () {
          track.style.transition = "none";
          track.style.transform = "translateY(0px)";
          index = 0;
          void track.offsetWidth; // force reflow before re-enabling transition
          track.style.transition = "transform " + ROLL_MS + "ms cubic-bezier(0.65, 0, 0.35, 1)";
        }, ROLL_MS + 20);
      }
    }

    setInterval(step, HOLD_MS);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var reels = document.querySelectorAll(".letter-reel");
    reels.forEach(buildReel);
  });
})();
