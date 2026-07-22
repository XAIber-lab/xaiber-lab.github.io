/* =========================================================
   XAIber-Lab — letter reel + suffix decode effect
   The leading letter still slow-reels exactly as before (X, C, H,
   V...). Once it lands, the rest of the title "decodes" into that
   letter's themed word — e.g. landing on C decodes into
   "CyberAI-Lab". The decode is diff-aware: it compares the old and
   new suffix from the END backward, and any trailing characters
   that already match (e.g. "-Lab", or "AI-Lab" whenever both the
   old and new word end that way) are left completely untouched —
   no rebuild, no flicker. Only the leading part that actually
   changes gets the scramble treatment. This is what keeps "-Lab"
   permanently static, and keeps "AI-Lab" static too across every
   transition except the one into/out of X's own irregular word.

   TO EDIT THE LETTER SET: change DEFAULT_LETTERS/DEFAULT_SUFFIXES
   below, or set data-letters="X,C,H" and data-suffixes="AIber-Lab,..."
   on the element to override just for that element. The two lists
   must be the same length and line up index-for-index. Keep new
   suffixes ending in "AI-Lab" (except X, which is a deliberate
   exception) so that shared tail keeps benefiting from the
   no-flicker treatment.
   ========================================================= */

(function () {

  var DEFAULT_LETTERS = ["X", "C", "H", "V"];
  var DEFAULT_SUFFIXES = ["AIber-Lab", "yber AI-Lab", "uman-Centered AI-Lab", "isual AI-Lab"];

  var HOLD_MS = 2400;              // how long the finished word stays put
  var ROLL_MS = 500;               // the existing single-letter roll duration
  var PAUSE_MS = 250;              // beat between the letter landing and the decode starting
  var SCRAMBLE_TICK_MS = 40;       // how often a decoding character flickers
  var SCRAMBLE_STAGGER_MS = 32;    // delay between each character starting to lock in
  var SCRAMBLE_LOCK_MS = 220;      // how long a character flickers before locking in
  var SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  // How many trailing characters of `oldText` and `newText` are
  // identical — that many characters at the end of newText don't
  // need to animate at all.
  function commonSuffixLength(oldText, newText) {
    var maxLen = Math.min(oldText.length, newText.length);
    var i = 0;
    while (i < maxLen && oldText[oldText.length - 1 - i] === newText[newText.length - 1 - i]) {
      i++;
    }
    return i;
  }

  function scrambleTo(el, oldText, newText, onComplete) {
    var staticLen = commonSuffixLength(oldText, newText);
    var changeLen = newText.length - staticLen; // leading characters that actually need to animate

    el.innerHTML = "";
    var spans = [];
    for (var i = 0; i < newText.length; i++) {
      var span = document.createElement("span");
      el.appendChild(span);
      spans.push(span);
    }

    var remaining = newText.length;
    function settle() {
      remaining--;
      if (remaining === 0 && onComplete) onComplete();
    }

    spans.forEach(function (span, i) {
      var ch = newText[i];
      var alreadyMatches = i >= changeLen; // part of the unchanged trailing run
      if (alreadyMatches || !/[a-zA-Z]/.test(ch)) {
        // Unchanged tail, or punctuation/space/hyphen — set once, no animation.
        span.textContent = ch;
        settle();
        return;
      }
      // Show some character immediately (never a blank gap) before this
      // position's staggered lock-in begins.
      span.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      setTimeout(function () {
        var ticks = 0;
        var maxTicks = Math.round(SCRAMBLE_LOCK_MS / SCRAMBLE_TICK_MS);
        var tickTimer = setInterval(function () {
          ticks++;
          if (ticks >= maxTicks) {
            clearInterval(tickTimer);
            span.textContent = ch;
            settle();
          } else {
            span.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }, SCRAMBLE_TICK_MS);
      }, i * SCRAMBLE_STAGGER_MS);
    });
  }

  function buildReel(el) {
    var lettersAttr = el.getAttribute("data-letters");
    var suffixesAttr = el.getAttribute("data-suffixes");
    var letters = lettersAttr
      ? lettersAttr.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
      : DEFAULT_LETTERS.slice();
    var suffixes = suffixesAttr
      ? suffixesAttr.split(",").map(function (s) { return s.trim(); })
      : DEFAULT_SUFFIXES.slice();

    if (letters.length < 2 || suffixes.length !== letters.length) return;

    var suffixEl = el.nextElementSibling;
    var hasSuffixEl = suffixEl && suffixEl.classList.contains("title-suffix");

    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Measure the widest letter so the reel has a fixed width and
    // nothing jitters as the leading letter changes.
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

    var sequence = letters.concat([letters[0]]);
    sequence.forEach(function (l) {
      var s = document.createElement("span");
      s.textContent = l;
      s.style.display = "block";
      s.style.textAlign = "center";
      track.appendChild(s);
    });
    el.appendChild(track);

    if (reduceMotion) return; // stays on the first letter/suffix, fully static

    var lineHeight = track.children[0].getBoundingClientRect().height;
    el.style.height = lineHeight + "px";

    var index = 0;
    track.style.transition = "transform " + ROLL_MS + "ms cubic-bezier(0.65, 0, 0.35, 1)";

    function scheduleNext() {
      setTimeout(rollStep, HOLD_MS);
    }

    function rollStep() {
      index++;
      track.style.transform = "translateY(-" + (index * lineHeight) + "px)";

      var isLoopReset = index === sequence.length - 1;
      var targetIndex = isLoopReset ? 0 : index;

      if (hasSuffixEl) {
        setTimeout(function () {
          var oldText = suffixEl.textContent;
          var newText = suffixes[targetIndex];
          scrambleTo(suffixEl, oldText, newText, function () {
            if (isLoopReset) {
              setTimeout(function () {
                track.style.transition = "none";
                track.style.transform = "translateY(0px)";
                index = 0;
                void track.offsetWidth;
                track.style.transition = "transform " + ROLL_MS + "ms cubic-bezier(0.65, 0, 0.35, 1)";
                scheduleNext();
              }, 20);
            } else {
              scheduleNext();
            }
          });
        }, ROLL_MS + PAUSE_MS);
      } else if (isLoopReset) {
        setTimeout(function () {
          track.style.transition = "none";
          track.style.transform = "translateY(0px)";
          index = 0;
          void track.offsetWidth;
          track.style.transition = "transform " + ROLL_MS + "ms cubic-bezier(0.65, 0, 0.35, 1)";
          scheduleNext();
        }, ROLL_MS + 20);
      } else {
        scheduleNext();
      }
    }

    scheduleNext();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".letter-reel").forEach(buildReel);
  });
})();
