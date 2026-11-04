/* MoneyFlows site: header edge, reveal on scroll, tabular digit roll. No dependencies. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header: hairline appears only once content scrolls under the glass.
  var nav = document.querySelector("header.nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Digit roll: each digit is a 0-9 column that slides to its value (420 ms, 45 ms stagger).
  function buildRoll(el) {
    var text = el.getAttribute("data-roll");
    el.setAttribute("aria-label", text);
    el.textContent = "";
    var cols = [];
    text.split("").forEach(function (ch) {
      var cell = document.createElement("span");
      cell.setAttribute("aria-hidden", "true");
      if (/[0-9]/.test(ch)) {
        cell.className = "roll";
        var col = document.createElement("span");
        col.className = "col";
        for (var n = 0; n <= 9; n++) {
          var d = document.createElement("span");
          d.textContent = n;
          col.appendChild(d);
        }
        cell.appendChild(col);
        cols.push({ col: col, digit: Number(ch) });
      } else {
        cell.textContent = ch;
      }
      el.appendChild(cell);
    });
    return cols;
  }
  function playRoll(cols) {
    cols.forEach(function (c, i) {
      c.col.style.transitionDelay = reduce ? "0ms" : i * 45 + "ms";
      c.col.style.transform = "translate3d(0," + -(c.digit * 1.05) + "em,0)";
    });
  }
  var rolls = [];
  document.querySelectorAll("[data-roll]").forEach(function (el) {
    var cols = buildRoll(el);
    if (reduce) { playRoll(cols); } else { rolls.push(cols); }
  });

  // Reveal: hero first, evidence rows follow at 45 ms intervals via --i.
  var targets = document.querySelectorAll(".reveal, .chart, .bars");
  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(function (t) { t.classList.add("in"); });
    rolls.forEach(playRoll);
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  targets.forEach(function (t) { io.observe(t); });

  // Start the roll once the hero card has settled in.
  requestAnimationFrame(function () {
    setTimeout(function () { rolls.forEach(playRoll); }, 250);
  });
})();
