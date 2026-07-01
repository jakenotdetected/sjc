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
    const entry = window.i18nDict[item.original];
    if (entry && entry[lang]) {
      item.node.nodeValue = item.node.nodeValue.replace(item.original, entry[lang]);
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
