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

  // Generic collapsible widget (e.g. the "latest work" showcase on member pages)
  document.querySelectorAll('.collapsible').forEach(function (box) {
    var btn = box.querySelector('.collapsible-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = box.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
});
