/* =========================================================
   XAIber-Lab — member card keywords
   For member cards that link to a real personal page, this
   fetches that page and mirrors the exact tags found in its
   #member-keywords element — so editing keywords on someone's
   own page is the only place that needs updating; this list
   view stays in sync automatically on next load.

   Cards without a personal page just keep whatever manual
   <span class="tag"> placeholders are already in their markup.
   ========================================================= */

(function () {

  function populateFrom(container, url) {
    fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("fetch failed: " + res.status);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var source = doc.getElementById("member-keywords");
        if (!source) throw new Error("no #member-keywords found in " + url);

        var tags = Array.from(source.querySelectorAll(".tag")).map(function (t) {
          return t.textContent.trim();
        });
        if (!tags.length) return;

        container.innerHTML = "";
        tags.forEach(function (word) {
          var span = document.createElement("span");
          span.className = "tag";
          span.textContent = word;
          container.appendChild(span);
        });
      })
      .catch(function (err) {
        console.warn("Could not load keywords from", url, err);
        // Leave the container as-is (empty) rather than showing a broken state.
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".card-keywords[data-keywords-source]").forEach(function (el) {
      populateFrom(el, el.getAttribute("data-keywords-source"));
    });
  });
})();
