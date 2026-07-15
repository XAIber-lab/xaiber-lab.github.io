// XAIber-Lab — shared site behavior (kept intentionally minimal)

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Generic collapsible widget (e.g. the "latest work" showcase on member pages).
  // Uses event delegation so it also works for content added dynamically
  // after page load (not just what's present at DOMContentLoaded).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.collapsible-toggle');
    if (!btn) return;
    var box = btn.closest('.collapsible');
    if (!box) return;
    var isOpen = box.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});
