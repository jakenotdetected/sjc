(function() {
  var TRANSITION_MS = 820;
  var isTransitioning = false;
  var overlay = null;
  var audioContext = null;

  removeOldLoadingScreen();
  ensureOverlay();
  bindNavigationTransitions();

  window.SJCPageTransition = {
    play: playTransition,
    go: function(url) {
      playTransition(function() {
        window.location.href = url;
      });
    }
  };

  function removeOldLoadingScreen() {
    var loader = document.getElementById('sjc-page-loader');
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }

    document.querySelectorAll('.loader-bar, .loader-spinner').forEach(function(el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function ensureOverlay() {
    overlay = document.querySelector('.sjc-wave-transition');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.className = 'sjc-wave-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<div class="sjc-ocean-panel sjc-ocean-left">',
      '  <div class="sjc-ocean-water"></div>',
      waveSvg(),
      '</div>',
      '<div class="sjc-ocean-panel sjc-ocean-right">',
      '  <div class="sjc-ocean-water"></div>',
      waveSvg(),
      '</div>',
      '<div class="sjc-wave-splash"></div>'
    ].join('');
    document.body.appendChild(overlay);
    return overlay;
  }

  function waveSvg() {
    return [
      '<svg class="sjc-ocean-crest" viewBox="0 0 220 900" preserveAspectRatio="none" focusable="false">',
      '  <defs>',
      '    <linearGradient id="sjc-red-wave-fill" x1="0" y1="0" x2="1" y2="1">',
      '      <stop offset="0%" stop-color="#ff4545"/>',
      '      <stop offset="52%" stop-color="#e20c22"/>',
      '      <stop offset="100%" stop-color="#9b0618"/>',
      '    </linearGradient>',
      '  </defs>',
      '  <path class="sjc-ocean-fill" d="M0 0 H72 C165 20 206 88 126 154 C62 206 64 250 132 302 C214 364 188 436 102 486 C34 526 48 594 132 648 C218 704 184 776 96 826 C56 850 48 878 72 900 H0 Z"/>',
      '  <path class="sjc-ocean-foam" d="M74 8 C166 30 196 86 124 151 C64 205 66 252 134 302 C210 360 184 432 103 485 C35 530 49 594 132 648 C212 704 182 770 99 822 C57 848 50 878 73 892"/>',
      '  <path class="sjc-ocean-highlight" d="M126 70 C172 88 174 122 129 154 M135 302 C182 330 174 365 122 394 M134 648 C181 676 172 712 117 742"/>',
      '</svg>'
    ].join('');
  }

  function bindNavigationTransitions() {
    document.addEventListener('click', function(event) {
      var link = event.target.closest && event.target.closest('a[href]');
      if (!link || !shouldAnimateLink(link, event)) return;

      event.preventDefault();
      playTransition(function() {
        window.location.href = link.href;
      });
    });

    window.addEventListener('beforeunload', function() {
      if (!isTransitioning) showOverlay();
    });
  }

  function shouldAnimateLink(link, event) {
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;

    var href = (link.getAttribute('href') || '').trim();
    if (!href || href.charAt(0) === '#') return false;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return false;
    }

    if (url.origin !== window.location.origin) return false;
    if (url.href === window.location.href) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;

    return true;
  }

  function playTransition(done) {
    if (isTransitioning) return;
    isTransitioning = true;
    showOverlay();
    playSplashSound();

    window.setTimeout(function() {
      if (typeof done === 'function') done();
    }, TRANSITION_MS);
  }

  function showOverlay() {
    ensureOverlay();
    document.body.classList.add('sjc-transitioning');
    overlay.classList.remove('is-active');
    overlay.offsetHeight;
    overlay.classList.add('is-active');
  }

  function playSplashSound() {
    var AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    try {
      audioContext = audioContext || new AudioContextCtor();
      if (audioContext.state === 'suspended') audioContext.resume();

      var now = audioContext.currentTime;
      var master = audioContext.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.22, now + 0.025);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);
      master.connect(audioContext.destination);

      makeSurfNoise(now, master);
      makeWaveSweep(now, master, 140, 360, -0.45);
      makeWaveSweep(now + 0.05, master, 180, 430, 0.45);
      makeSplashPop(now + 0.38, master);
    } catch (error) {
      // Some browsers block audio if the click is not treated as a user gesture.
    }
  }

  function makeSurfNoise(start, destination) {
    var duration = 0.58;
    var sampleRate = audioContext.sampleRate;
    var buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    var data = buffer.getChannelData(0);

    for (var i = 0; i < data.length; i++) {
      var fade = 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * fade;
    }

    var noise = audioContext.createBufferSource();
    var filter = audioContext.createBiquadFilter();
    var gain = audioContext.createGain();

    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(720, start);
    filter.frequency.exponentialRampToValueAtTime(1550, start + duration);
    filter.Q.setValueAtTime(0.8, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    noise.start(start);
    noise.stop(start + duration);
  }

  function makeWaveSweep(start, destination, fromFrequency, toFrequency, panValue) {
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();
    var pan = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(fromFrequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(toFrequency, start + 0.34);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.26, start + 0.055);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.44);

    oscillator.connect(gain);
    if (pan) {
      pan.pan.setValueAtTime(panValue, start);
      gain.connect(pan);
      pan.connect(destination);
    } else {
      gain.connect(destination);
    }

    oscillator.start(start);
    oscillator.stop(start + 0.46);
  }

  function makeSplashPop(start, destination) {
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(620, start);
    oscillator.frequency.exponentialRampToValueAtTime(180, start + 0.18);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.2, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);

    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + 0.22);
  }
})();

// Smooth scroll
(function() {
  var current = window.scrollY;
  var target = window.scrollY;
  var ease = 0.085;
  var running = false;

  window.addEventListener('scroll', function() {
    if (!running) {
      current = window.scrollY;
      target = window.scrollY;
    }
  }, { passive: true });

  window.addEventListener('wheel', function(e) {
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
