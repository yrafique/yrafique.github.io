/* MoneyFlows site: header edge, hero entrance, digit roll, pinned product tour,
   period chips, one-shot typing, mobile download dock. No dependencies.
   Everything is readable without this file; it only adds motion and the dock. */
(function () {
  var d = document, w = window;
  var mm = function (q) { return w.matchMedia ? w.matchMedia(q) : { matches: false, addEventListener: function () {} }; };
  var reduceQ = mm("(prefers-reduced-motion: reduce)");
  var reduce = reduceQ.matches;
  var hasIO = "IntersectionObserver" in w;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  // Header: scroll-edge fade appears only once content runs under the glass.
  var nav = $("header.nav");
  var hero = $(".hero"), cta = $("#get"), dock = $("#dock");
  var dockOff = false;
  try { dockOff = sessionStorage.getItem("mf-dock") === "off"; } catch (e) {}
  var ticking = false;
  function frame() {
    ticking = false;
    if (nav) nav.classList.toggle("scrolled", w.scrollY > 8);
    if (dock && hero && cta) {
      var vh = w.innerHeight;
      var show = !dockOff && hero.getBoundingClientRect().bottom < 0 && cta.getBoundingClientRect().top > vh - 40;
      dock.classList.toggle("show", show);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; w.requestAnimationFrame(frame); } }
  frame();
  w.addEventListener("scroll", onScroll, { passive: true });
  w.addEventListener("resize", onScroll, { passive: true });
  if (dock) {
    $(".dock-x", dock).addEventListener("click", function () {
      dockOff = true;
      try { sessionStorage.setItem("mf-dock", "off"); } catch (e) {}
      dock.classList.remove("show");
    });
  }

  // Digit roll: each digit is a 0-9 column that slides to its value (420 ms, 45 ms stagger).
  function buildRoll(el) {
    var text = el.getAttribute("data-roll");
    el.textContent = "";
    var sr = d.createElement("span");
    sr.className = "sr";
    sr.textContent = text;
    el.appendChild(sr);
    var cols = [];
    text.split("").forEach(function (ch) {
      var cell = d.createElement("span");
      cell.setAttribute("aria-hidden", "true");
      if (/[0-9]/.test(ch)) {
        cell.className = "roll";
        var col = d.createElement("span");
        col.className = "col";
        for (var n = 0; n <= 9; n++) { var g = d.createElement("span"); g.textContent = n; col.appendChild(g); }
        cell.appendChild(col);
        cols.push({ col: col, digit: Number(ch) });
      } else { cell.textContent = ch; }
      el.appendChild(cell);
    });
    return cols;
  }
  function playRoll(cols) {
    cols.forEach(function (c, i) {
      c.col.style.transitionDelay = reduce ? "0ms" : i * 45 + "ms";
      c.col.style.transform = "translate3d(0," + -(c.digit * 1.1) + "em,0)";
    });
  }
  var rolls = $$("[data-roll]").map(buildRoll);

  // One-shot typing for the research desk answer: words fade in, text is always in the DOM.
  function typeOnce(shot) {
    var p = $(".typed", shot);
    if (!p || p.getAttribute("data-done")) return;
    p.setAttribute("data-done", "1");
    if (reduce) return;
    var words = $$(".w", p);
    p.parentNode.classList.add("typing");
    var i = 0;
    (function next() {
      if (i >= words.length) return;
      words[i++].classList.add("t");
      w.setTimeout(next, 38);
    })();
  }
  function turnOn(shot) {
    if (!shot) return;
    shot.classList.add("on");
    if (shot.id === "shot-desk") typeOnce(shot);
  }

  // Hero: copy first, then the device, then evidence rows at 45 ms intervals and the roll.
  if (hero) {
    w.requestAnimationFrame(function () {
      hero.classList.add("in");
      var hs = $(".hero-shot");
      if (reduce) { turnOn(hs); rolls.forEach(playRoll); return; }
      w.setTimeout(function () { turnOn(hs); }, 330);
      w.setTimeout(function () { rolls.forEach(playRoll); }, 420);
    });
  }

  // Reveal on scroll.
  var reveals = $$(".reveal, .cta-band");
  if (!hasIO || reduce) {
    reveals.forEach(function (t) { t.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
    reveals.forEach(function (t) { io.observe(t); });
  }

  // Product tour. Wide screens: one pinned phone, the chapter crossing mid-viewport picks its screen.
  // Narrow screens: a stacked sequence, each screen animates once when it scrolls in.
  var chaps = $$(".chap"), shots = $$(".device .shot");
  var wideQ = mm("(min-width: 900px)");
  var current = -1;
  function activate(i) {
    if (i === current) return;
    current = i;
    chaps.forEach(function (c, k) { c.classList.toggle("on", k === i); });
    shots.forEach(function (s, k) {
      var on = k === i;
      s.classList.toggle("before", k < i);
      if (on) { turnOn(s); } else { s.classList.remove("on"); }
      if (on) { s.removeAttribute("aria-hidden"); } else { s.setAttribute("aria-hidden", "true"); }
    });
  }
  function setMode() {
    if (wideQ.matches) {
      var c = current; current = -1; activate(c < 0 ? 0 : c);
    } else {
      current = -1;
      chaps.forEach(function (c) { c.classList.remove("on"); });
      shots.forEach(function (s) { s.removeAttribute("aria-hidden"); s.classList.remove("before"); });
    }
  }
  if (shots.length) {
    if (!hasIO) {
      shots.forEach(turnOn);
    } else {
      var chapIO = new IntersectionObserver(function (es) {
        if (!wideQ.matches) return;
        es.forEach(function (e) { if (e.isIntersecting) activate(Number(e.target.getAttribute("data-i"))); });
      }, { rootMargin: "-45% 0px -45% 0px" });
      chaps.forEach(function (c) { chapIO.observe(c); });
      var shotIO = new IntersectionObserver(function (es) {
        if (wideQ.matches) return;
        es.forEach(function (e) { if (e.isIntersecting) turnOn(e.target); });
      }, { threshold: 0.3 });
      shots.forEach(function (s) { shotIO.observe(s); });
      setMode();
      if (wideQ.addEventListener) wideQ.addEventListener("change", setMode);
    }
  }

  // Period chips: the sample data re-renders and bars retarget from where they are (interruptible).
  var flows = $(".flows[data-flows]");
  if (flows) {
    var data = JSON.parse(flows.getAttribute("data-flows"));
    var shot = flows.closest(".shot");
    var money = function (v) {
      var a = Math.abs(v);
      var s = a < 1 ? Math.round(a * 1000) + "M" : String(Math.round(a * 10) / 10) + "B";
      return (v > 0 ? "+" : v < 0 ? "−" : "") + "$" + s;
    };
    var nice = function (m) {
      var k = 1;
      while (k * 10 <= m) k *= 10;
      while (k > m) k /= 10;
      var f = [1, 2, 2.5, 5, 10];
      for (var i = 0; i < f.length; i++) if (f[i] * k >= m) return f[i] * k;
      return 10 * k;
    };
    $$(".periods button", shot).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-p"), vals = data.periods[p];
        $$(".periods button", shot).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var m = nice(Math.max.apply(null, vals.map(Math.abs)));
        flows.classList.add("live");
        $$("li", flows).forEach(function (li, i) {
          var v = vals[i];
          $(".fpos", li).style.setProperty("--w", (Math.max(v, 0) / m).toFixed(3));
          $(".fneg", li).style.setProperty("--w", Math.min(Math.max(-v, 0) / (m / 2), 1).toFixed(3));
          var arrow = $(".fval > span[aria-hidden]", li);
          arrow.className = v > 0 ? "up" : "down";
          arrow.textContent = v > 0 ? "↗" : "↘";
          $(".fnum", li).textContent = money(v);
        });
        $$(".ticks span", shot).forEach(function (t, i) {
          var tv = [-m / 2, 0, m / 2, m][i];
          t.textContent = tv === 0 ? "$0" : money(tv);
        });
        $$(".pname", shot).forEach(function (n) { n.textContent = p; });
        var tot = Math.round(vals.reduce(function (a, v) { return a + v; }, 0) * 100) / 100;
        var tb = $(".ftotal", shot);
        tb.innerHTML = "";
        var ar = d.createElement("span");
        ar.className = tot > 0 ? "up" : "down"; ar.setAttribute("aria-hidden", "true"); ar.textContent = tot > 0 ? "\u2197" : "\u2198";
        tb.appendChild(ar); tb.appendChild(d.createTextNode(" " + money(tot)));
      });
    });
  }
})();
