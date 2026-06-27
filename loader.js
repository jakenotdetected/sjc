// ── Page transition ───────────────────────────────────────────────────────────
(function () {
  var COVER_MS   = 380;   // how long until we navigate (curtain fully in)
  var REVEAL_MS  = 480;   // how long curtain takes to leave on new page

  var curtain = null;
  var busy    = false;

  // Remove old loader if it exists
  var old = document.getElementById('sjc-page-loader');
  if (old && old.parentNode) old.parentNode.removeChild(old);

  // Build curtain element once
  function getCurtain() {
    if (curtain) return curtain;
    curtain = document.createElement('div');
    curtain.id = 'sjc-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);
    return curtain;
  }

  // Cover screen → navigate
  function navigate(url) {
    if (busy) return;
    busy = true;

    var c = getCurtain();
    c.classList.remove('sjc-curtain-out');
    c.classList.add('sjc-curtain-in');

    setTimeout(function () {
      window.location.href = url;
    }, COVER_MS);
  }

  // On page load: reveal by sliding out
  function reveal() {
    var c = getCurtain();
    // Start fully covering (no transition so it's instant)
    c.classList.add('sjc-curtain-start');
    c.offsetHeight; // force reflow
    // Then animate out
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        c.classList.remove('sjc-curtain-start');
        c.classList.add('sjc-curtain-out');
      });
    });
  }

  // Intercept internal link clicks
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    var href = (link.getAttribute('href') || '').trim();
    if (!href || href.charAt(0) === '#') return;

    var url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin) return;
    if (url.href === location.href) return;
    if (url.pathname === location.pathname && url.hash) return;

    e.preventDefault();
    navigate(link.href);
  });

  // Reveal on load
  if (document.readyState === 'complete') {
    reveal();
  } else {
    window.addEventListener('load', reveal);
  }

  window.SJCNav = { go: navigate };
})();

// ── Smooth scroll ─────────────────────────────────────────────────────────────
(function () {
  var current = window.scrollY;
  var target  = window.scrollY;
  var ease    = 0.085;
  var running = false;

  window.addEventListener('scroll', function () {
    if (!running) { current = window.scrollY; target = window.scrollY; }
  }, { passive: true });

  window.addEventListener('wheel', function (e) {
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
