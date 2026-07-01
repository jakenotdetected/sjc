const AdminI18n = {
  init() {
    let savedLang = localStorage.getItem('sjc_lang') || 'en';
    if (savedLang !== 'en') {
      this.translateDOM(document.body, savedLang);
    }
    ['en', 'si', 'ta'].forEach(l => {
      const el = document.getElementById('lang-' + l);
      if (el) {
        el.style.color = (l === savedLang) ? 'var(--gold)' : 'var(--text-muted)';
      }
    });
  },
  
  translateDOM(node, lang) {
    if(!window.i18nDict) return;
    
    function walk(n) {
      if(n.nodeType === Node.TEXT_NODE) {
        let t = n.nodeValue.trim().replace(/\s+/g, ' ');
        if (t && t.length > 1 && !/^[0-9\W]+$/.test(t)) {
          if(window.i18nDict[t] && window.i18nDict[t][lang]) {
            n.nodeValue = n.nodeValue.replace(t, window.i18nDict[t][lang]);
          }
        }
      } else {
        if(n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE') {
          for(let child of n.childNodes) {
            walk(child);
          }
        }
      }
    }
    walk(node);
  },
  
  setLang(lang) {
    localStorage.setItem('sjc_lang', lang);
    location.reload();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => AdminI18n.init(), 100);
});

// We must override the innerHTML assignment in showPane to also trigger translation
// But since we can't easily hook it without modifying index.html, we'll modify showPane directly via Python regex.
