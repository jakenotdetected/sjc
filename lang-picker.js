// ── Language picker ────────────────────────────────────────────────────────────
// Shown on every visit to the homepage, after the page loader clears. Reuses the
// same localStorage key ('sjc_lang') and changeLanguage() function that the
// top-bar language links (translate.js) already use, so a pick here is fully
// consistent with switching languages later from the top of any page.
(function () {
  var LANGS = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'si', label: 'Sinhala', native: 'සිංහල' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
  ];

  function buildOverlay() {
    var style = document.createElement('style');
    style.textContent =
      '#sjc-lang-picker{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;' +
      'background:radial-gradient(circle at 50% 30%,rgba(58,14,14,0.97),rgba(10,2,2,0.98));' +
      'opacity:0;transition:opacity .35s ease;padding:24px}' +
      '#sjc-lang-picker.sjc-lp-in{opacity:1}' +
      '#sjc-lang-picker .sjc-lp-card{max-width:420px;width:100%;text-align:center;font-family:\'DM Sans\',\'Inter\',sans-serif;' +
      'transform:translateY(14px);opacity:0;transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .45s ease}' +
      '#sjc-lang-picker.sjc-lp-in .sjc-lp-card{transform:translateY(0);opacity:1}' +
      '#sjc-lang-picker .sjc-lp-logo{width:60px;height:60px;border-radius:14px;background:#fff;padding:8px;margin:0 auto 20px;display:block;object-fit:contain}' +
      '#sjc-lang-picker h2{color:#faf6ee;font-size:1.4rem;font-weight:600;margin-bottom:6px;letter-spacing:.01em}' +
      '#sjc-lang-picker p{color:rgba(250,246,238,0.55);font-size:0.86rem;margin-bottom:30px}' +
      '#sjc-lang-picker .sjc-lp-opts{display:flex;flex-direction:column;gap:10px}' +
      '#sjc-lang-picker .sjc-lp-btn{display:flex;align-items:center;justify-content:space-between;gap:12px;' +
      'padding:16px 22px;border-radius:12px;border:1.5px solid rgba(201,168,76,0.25);background:rgba(255,255,255,0.04);' +
      'color:#faf6ee;font-size:1rem;font-weight:500;cursor:pointer;transition:all .18s;text-align:left;width:100%;font-family:inherit}' +
      '#sjc-lang-picker .sjc-lp-btn:hover{background:rgba(201,168,76,0.12);border-color:rgba(201,168,76,0.55);transform:translateY(-1px)}' +
      '#sjc-lang-picker .sjc-lp-btn .sjc-lp-native{color:#c9a84c;font-weight:600}' +
      '#sjc-lang-picker .sjc-lp-btn svg{width:16px;height:16px;flex-shrink:0;opacity:0;transition:opacity .18s,transform .18s;transform:translateX(-4px)}' +
      '#sjc-lang-picker .sjc-lp-btn:hover svg{opacity:1;transform:translateX(0)}' +
      '#sjc-lang-picker .sjc-lp-skip{margin-top:24px;background:none;border:none;color:rgba(250,246,238,0.4);font-size:0.78rem;' +
      'cursor:pointer;font-family:inherit;text-decoration:underline;text-underline-offset:3px}';
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'sjc-lang-picker';

    var card = document.createElement('div');
    card.className = 'sjc-lp-card';

    var logo = document.createElement('img');
    logo.className = 'sjc-lp-logo';
    logo.src = '/logo.jpg';
    logo.alt = 'SJC Logo';
    card.appendChild(logo);

    var h2 = document.createElement('h2');
    h2.textContent = 'Pick your language';
    card.appendChild(h2);

    var p = document.createElement('p');
    p.textContent = 'භාෂාව තෝරන්න · மொழியைத் தேர்ந்தெடுக்கவும்';
    card.appendChild(p);

    var opts = document.createElement('div');
    opts.className = 'sjc-lp-opts';

    LANGS.forEach(function (l) {
      var btn = document.createElement('button');
      btn.className = 'sjc-lp-btn';
      btn.type = 'button';
      btn.innerHTML =
        '<span>' + l.label + (l.code !== 'en' ? ' &middot; <span class="sjc-lp-native">' + l.native + '</span>' : '') + '</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
      btn.addEventListener('click', function () { pick(l.code); });
      opts.appendChild(btn);
    });
    card.appendChild(opts);

    var skip = document.createElement('button');
    skip.className = 'sjc-lp-skip';
    skip.type = 'button';
    skip.textContent = 'Continue in English';
    skip.addEventListener('click', function () { pick('en'); });
    card.appendChild(skip);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    // Same rAF-starvation issue as the page-transition curtain: if this tab
    // isn't actively visible when the page loads, requestAnimationFrame can
    // be paused indefinitely, so fall back to a plain timeout too.
    var fadedIn = false;
    function fadeIn() {
      if (fadedIn) return;
      fadedIn = true;
      overlay.classList.add('sjc-lp-in');
    }
    requestAnimationFrame(fadeIn);
    setTimeout(fadeIn, 60);
  }

  function pick(code) {
    localStorage.setItem('sjc_lang', code);
    var overlay = document.getElementById('sjc-lang-picker');
    if (overlay) overlay.classList.remove('sjc-lp-in');
    setTimeout(function () {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (window.changeLanguage) window.changeLanguage(code);
    }, 300);
  }

  function showWhenReady() {
    var loader = document.getElementById('sjc-page-loader');
    if (!loader) { buildOverlay(); return; }
    var done = false;
    var obs = new MutationObserver(function () {
      if (done || document.body.contains(loader)) return;
      done = true;
      obs.disconnect();
      buildOverlay();
    });
    obs.observe(document.body, { childList: true });
    // Safety fallback in case the loader element is never removed for some reason
    setTimeout(function () {
      if (done) return;
      done = true;
      obs.disconnect();
      buildOverlay();
    }, 4500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showWhenReady);
  } else {
    showWhenReady();
  }
})();
