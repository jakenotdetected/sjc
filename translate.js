let textNodes = [];

function findTextNodes(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let t = node.nodeValue.trim().replace(/\s+/g, ' ');
    if (t && t.length > 1 && !/^[0-9\W]+$/.test(t)) {
        textNodes.push({node: node, original: t});
    }
  } else {
    for (let child of node.childNodes) {
      if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
        findTextNodes(child);
      }
    }
  }
}

function changeLanguage(lang) {
  localStorage.setItem('sjc_lang', lang);
  if (!window.i18nDict) return;
  textNodes.forEach(item => {
    if (item.current === undefined) {
      item.current = item.original;
    }
    const entry = window.i18nDict[item.original];
    if (entry) {
      const translation = entry[lang] || item.original;
      item.node.nodeValue = item.node.nodeValue.replace(item.current, translation);
      item.current = translation;
    }
  });
  document.documentElement.lang = lang;
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    findTextNodes(document.body);
    let savedLang = localStorage.getItem('sjc_lang');
    if (savedLang && savedLang !== 'en') {
      changeLanguage(savedLang);
    }
  }, 100);
});

// Dynamic layout adjustments for Sinhala and Tamil menu items to prevent overflow
(function() {
  const style = document.createElement('style');
  style.id = 'sjc-lang-layout-adjustments';
  style.textContent = `
    /* General desktop adjustments for Sinhala and Tamil to prevent nav overflow */
    html[lang="si"] .nav-links a,
    html[lang="ta"] .nav-links a,
    html[lang="si"] .nav-dropdown-toggle,
    html[lang="ta"] .nav-dropdown-toggle {
      font-size: 0.73rem !important;
      padding: 6px 7px !important;
    }
    html[lang="si"] .nav-cta,
    html[lang="ta"] .nav-cta {
      padding: 8px 12px !important;
      font-size: 0.73rem !important;
      margin-left: 4px !important;
    }
    html[lang="si"] .brand-name,
    html[lang="ta"] .brand-name {
      font-size: 0.98rem !important;
    }
    html[lang="si"] .brand-sub,
    html[lang="ta"] .brand-sub {
      font-size: 0.72rem !important;
    }
    html[lang="si"] .nav-inner,
    html[lang="ta"] .nav-inner {
      gap: 8px !important;
    }

    /* Show burger menu earlier for Sinhala and Tamil (under 1380px) to prevent layout wrapping */
    @media (max-width: 1380px) {
      html[lang="si"] .topbar-right,
      html[lang="ta"] .topbar-right {
        display: none !important;
      }
      html[lang="si"] .nav-links,
      html[lang="ta"] .nav-links {
        display: none !important;
      }
      html[lang="si"] .burger,
      html[lang="ta"] .burger {
        display: flex !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
