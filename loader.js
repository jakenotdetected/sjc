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

  // Guarantee the loader is actually SEEN on every device. On a fast PC the page
  // can finish loading in <0.4s, making the loader flash by so quickly it looks
  // like it never appeared. So we hold it on screen for a minimum time, then
  // dismiss once the page has also finished loading.
  var START = Date.now();
  var MIN_MS = 1100; // minimum time the loader stays visible, on any device

  function requestDismiss() {
    var waited = Date.now() - START;
    setTimeout(dismiss, Math.max(0, MIN_MS - waited));
  }

  if (document.readyState === 'complete') {
    requestDismiss();
  } else {
    window.addEventListener('load', requestDismiss);
  }
  setTimeout(dismiss, 4000); // safety cap — guarantees the loader always clears
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

// ── Scroll ───────────────────────────────────────────────────────────────────
// Native browser scrolling is used intentionally. A previous version hijacked the
// mouse wheel and eased it in JS, which scrolled inconsistently across PCs (wheel
// deltas differ per device — pixels vs lines) and broke keyboard/trackpad scroll.
// Native scroll is smooth and consistent on every machine.
