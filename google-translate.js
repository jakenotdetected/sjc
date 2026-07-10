// ── SJC language switcher, backed by Google Translate ──────────────────────
// Replaces the old hand-maintained dictionary (which only covered strings
// someone remembered to add, and drifted out of date as pages changed) with
// Google's real machine translation, applied to the whole page automatically.
// The switcher UI in the topbar (English | Sinhala | Tamil) is unchanged —
// it still just calls changeLanguage('en'|'si'|'ta').
(function () {
  var COOKIE_NAME = 'googtrans';

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    var base = name + '=' + value + '; expires=' + d.toUTCString() + '; path=/';
    document.cookie = base;
    // Also set at the parent domain so it survives subdomain quirks
    var host = location.hostname;
    var parts = host.split('.');
    if (parts.length > 2) {
      document.cookie = base + '; domain=.' + parts.slice(-2).join('.');
    }
  }

  function clearCookie(name) {
    var expired = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = expired;
    var host = location.hostname;
    var parts = host.split('.');
    if (parts.length > 2) {
      document.cookie = expired + '; domain=.' + parts.slice(-2).join('.');
    }
  }

  function currentLang() {
    var c = getCookie(COOKIE_NAME); // format: /en/si
    if (c) {
      var target = c.split('/')[2];
      if (target) return target;
    }
    return 'en';
  }

  // Called by the topbar links: onclick="changeLanguage('si')" etc.
  window.changeLanguage = function (lang) {
    localStorage.setItem('sjc_lang', lang);
    localStorage.setItem('sjc_lang_picked', '1');
    if (lang === 'en') {
      clearCookie(COOKIE_NAME);
    } else {
      setCookie(COOKIE_NAME, '/en/' + lang, 365);
    }
    location.reload();
  };

  window.SJCCurrentLang = currentLang;

  window.googleTranslateElementInit = function () {
    if (!window.google || !window.google.translate) return;
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'si,ta',
      autoDisplay: false
    }, 'google_translate_element');
  };

  function ensureContainer() {
    if (document.getElementById('google_translate_element')) return;
    var div = document.createElement('div');
    div.id = 'google_translate_element';
    document.body.appendChild(div);
  }

  function loadScript() {
    if (document.getElementById('google-translate-script')) return;
    var s = document.createElement('script');
    s.id = 'google-translate-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(s);
  }

  // The googtrans cookie alone isn't reliably picked up by Google's widget on
  // load — the guaranteed way to trigger translation is to set the value on
  // its own <select class="goog-te-combo"> and fire a change event (the same
  // thing that happens when a visitor uses Google's native dropdown UI). That
  // select is created asynchronously once the widget script finishes, so we
  // poll briefly for it.
  function waitForCombo(callback, timeoutMs) {
    var deadline = Date.now() + (timeoutMs || 8000);
    (function poll() {
      var combo = document.querySelector('select.goog-te-combo');
      if (combo) { callback(combo); return; }
      if (Date.now() > deadline) return;
      setTimeout(poll, 150);
    })();
  }

  function applyCurrentLang() {
    var lang = currentLang();
    if (lang === 'en') return; // nothing to trigger — page is already English
    waitForCombo(function (combo) {
      if (combo.value === lang) return;
      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
    });
  }

  function init() {
    ensureContainer();
    loadScript();
    document.documentElement.setAttribute('data-lang', currentLang());
    applyCurrentLang();

    // Highlight the active language link in the topbar, if present
    document.querySelectorAll('.lang-opt').forEach(function (a) {
      var m = a.getAttribute('onclick') && a.getAttribute('onclick').match(/changeLanguage\('(\w+)'\)/);
      if (m && m[1] === currentLang()) a.classList.add('lang-opt-active');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
