// ── Loading screen ─────────────────────────────────────────────────────────────
(function () {
  var loader = document.getElementById('sjc-page-loader');
  if (!loader) return;

  var bar = loader.querySelector('.sjc-loader-progress');
  var progress = 0;
  var dismissed = false;

  // Fake-but-natural progress climb while the page loads
  var timer = setInterval(function () {
    // Ease toward 90%, never quite reaching it until load fires
    progress += (90 - progress) * 0.08 + 0.6;
    if (progress > 90) progress = 90;
    if (bar) bar.style.width = progress.toFixed(1) + '%';
  }, 120);

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearInterval(timer);
    if (bar) bar.style.width = '100%';
    setTimeout(function () {
      loader.classList.add('sjc-loader-done');
      setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 650);
    }, 200);
  }

  // Dismiss on whichever comes first: full load, or a hard cap so it NEVER hangs
  if (document.readyState === 'complete') {
    setTimeout(dismiss, 400);
  } else {
    window.addEventListener('load', function () { setTimeout(dismiss, 350); });
  }
  setTimeout(dismiss, 3500); // safety cap — guarantees the loader always clears
})();

// ── Page transition curtain ────────────────────────────────────────────────────
(function () {
  var COVER_MS = 380;
  var curtain = null;
  var busy = false;

  function getCurtain() {
    if (curtain) return curtain;
    curtain = document.createElement('div');
    curtain.id = 'sjc-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);
    return curtain;
  }

  function navigate(url) {
    if (busy) return;
    busy = true;
    var c = getCurtain();
    c.classList.remove('sjc-curtain-out');
    c.classList.add('sjc-curtain-in');
    setTimeout(function () { window.location.href = url; }, COVER_MS);
  }

  function reveal() {
    var c = getCurtain();
    c.classList.add('sjc-curtain-start');
    c.offsetHeight;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        c.classList.remove('sjc-curtain-start');
        c.classList.add('sjc-curtain-out');
      });
    });
  }

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

  // Only reveal the curtain after the loading screen has had its turn
  if (document.readyState === 'complete') {
    reveal();
  } else {
    window.addEventListener('load', reveal);
  }

  window.SJCNav = { go: navigate };
})();

// ── Smooth scroll ──────────────────────────────────────────────────────────────
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
