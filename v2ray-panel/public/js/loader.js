// Injects the vault loading screen and dismisses it once the page is ready.
(function () {
  const html = `
    <div id="loader">
      <div class="orb hero">
        <span class="core"></span>
        <span class="ring r1"></span>
        <span class="ring r2"></span>
        <span class="ring r3"></span>
      </div>
      <div class="loader-word">V2Ray Vault</div>
      <div class="loader-sub">Jake Network</div>
      <div class="loader-bar"><span></span></div>
    </div>`;
  document.body.insertAdjacentHTML('afterbegin', html);

  const start = Date.now();
  const MIN_MS = 1500; // let the animation breathe
  function dismiss() {
    const wait = Math.max(0, MIN_MS - (Date.now() - start));
    setTimeout(() => {
      const el = document.getElementById('loader');
      if (el) el.classList.add('done');
    }, wait);
  }
  if (document.readyState === 'complete') dismiss();
  else window.addEventListener('load', dismiss);
})();
