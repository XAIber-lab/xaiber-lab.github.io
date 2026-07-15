/* =========================================================
   XAIber-Lab — homepage hero image carousel
   Auto-advances through slides, pausing on hover; respects
   prefers-reduced-motion (no autoplay, dots still work).
   ========================================================= */

(function () {

  var AUTOPLAY_MS = 4000;

  function initCarousel(root) {
    var slides = root.querySelectorAll(".hero-carousel-slide");
    var dotsWrap = document.getElementById("hero-carousel-dots");
    var captionEl = document.getElementById("hero-carousel-caption");
    if (!slides.length) return;

    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0;
    var timer = null;

    function show(i) {
      slides.forEach(function (s, si) { s.classList.toggle("active", si === i); });
      if (dotsWrap) {
        dotsWrap.querySelectorAll(".hero-carousel-dot").forEach(function (d, di) {
          d.classList.toggle("active", di === i);
        });
      }
      if (captionEl) captionEl.textContent = slides[i].getAttribute("data-caption") || "";
      index = i;
    }

    function next() { show((index + 1) % slides.length); }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function startAutoplay() {
      if (reduceMotion) return;
      stopAutoplay();
      timer = setInterval(next, AUTOPLAY_MS);
    }

    if (dotsWrap) {
      slides.forEach(function (s, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero-carousel-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Show slide " + (i + 1));
        dot.addEventListener("click", function () {
          show(i);
          startAutoplay();
        });
        dotsWrap.appendChild(dot);
      });
    }

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);

    show(0);
    startAutoplay();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector(".hero-carousel");
    if (root) initCarousel(root);
  });
})();
