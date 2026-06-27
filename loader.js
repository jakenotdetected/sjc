(function() {
  // ── Page loader ───────────────────────────────────────────────────────────
  var fallback = setTimeout(dismissLoader, 4000);
  if (document.readyState === 'complete') {
    clearTimeout(fallback); dismissLoader();
  } else {
    window.addEventListener('load', function() { clearTimeout(fallback); dismissLoader(); });
  }
  function dismissLoader() {
    var loader = document.getElementById('sjc-page-loader');
    if (loader && !loader.classList.contains('fade-out')) {
      loader.classList.add('fade-out');
      setTimeout(function() { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 500);
    }
  }
})();

// ── Smooth scroll ─────────────────────────────────────────────────────────────
(function() {
  var current = window.scrollY;
  var target  = window.scrollY;
  var ease    = 0.085;
  var running = false;

  // Keep current in sync when not animating (browser nav, anchors, etc.)
  window.addEventListener('scroll', function() {
    if (!running) { current = window.scrollY; target = window.scrollY; }
  }, { passive: true });

  window.addEventListener('wheel', function(e) {
    // Skip if user is scrolling inside an overflow element (modal, dropdown, etc.)
    var el = e.target;
    while (el && el !== document.body) {
      var s = getComputedStyle(el);
      if ((s.overflow + s.overflowY).match(/auto|scroll/) && el.scrollHeight > el.clientHeight) return;
      el = el.parentElement;
    }

    e.preventDefault();
    target += e.deltaY * 1.1;
    target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
    if (!running) tick();
  }, { passive: false });

  function tick() {
    running = true;
    current += (target - current) * ease;
    window.scrollTo(0, current);
    if (Math.abs(target - current) < 0.5) {
      current = target;
      window.scrollTo(0, current);
      running = false;
      return;
    }
    requestAnimationFrame(tick);
  }
})();
