(function() {
  var TRANSITION_MS = 720;
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
      '<div class="sjc-wave-half sjc-wave-left"></div>',
      '<div class="sjc-wave-half sjc-wave-right"></div>',
      '<div class="sjc-wave-burst"></div>'
    ].join('');
    document.body.appendChild(overlay);
    return overlay;
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
      if (!isTransitioning) {
        showOverlay();
      }
    });
  }

  function shouldAnimateLink(link, event) {
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;
    if ((link.getAttribute('href') || '').trim().charAt(0) === '#') return false;

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
    playWaveSound();

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

  function playWaveSound() {
    var AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    try {
      audioContext = audioContext || new AudioContextCtor();
      if (audioContext.state === 'suspended') audioContext.resume();

      var now = audioContext.currentTime;
      var master = audioContext.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
      master.connect(audioContext.destination);

      makeSweep(now, master, 160, 430, -0.08);
      makeSweep(now + 0.045, master, 210, 520, 0.08);
      makePop(now + 0.34, master);
    } catch (error) {
      // Browsers can block audio if the gesture is not considered user-initiated.
    }
  }

  function makeSweep(start, destination, fromFrequency, toFrequency, panValue) {
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();
    var pan = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(fromFrequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(toFrequency, start + 0.32);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.34, start + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);

    if (pan) {
      pan.pan.setValueAtTime(panValue, start);
      oscillator.connect(gain);
      gain.connect(pan);
      pan.connect(destination);
    } else {
      oscillator.connect(gain);
      gain.connect(destination);
    }

    oscillator.start(start);
    oscillator.stop(start + 0.45);
  }

  function makePop(start, destination) {
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(780, start);
    oscillator.frequency.exponentialRampToValueAtTime(240, start + 0.14);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.26, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + 0.18);
  }
})();
