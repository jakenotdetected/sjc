/* ===================================================================
   SJC Interactive Helper Widget
   Adds a sketch cartoon counsellor guide to tutor users on how to use SJC CGU.
   =================================================================== */

(function() {
  // Only show the helper on the appointments page
  const pathname = window.location.pathname.toLowerCase();
  const isAppointmentsPage = pathname === '/appointments' || 
                             pathname === '/appointments.html' || 
                             pathname.endsWith('/appointments') || 
                             pathname.endsWith('/appointments.html');
  if (!isAppointmentsPage) {
    return;
  }

  // Create stylesheet for the widget
  const style = document.createElement('style');
  style.textContent = `
    .cgu-helper-widget {
      position: fixed;
      bottom: 0;
      right: 24px;
      z-index: 99999;
      display: flex;
      align-items: flex-end;
      gap: 16px;
      font-family: 'Inter', sans-serif;
      pointer-events: none;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
    }
    .cgu-helper-widget.widget-minimized {
      transform: translateY(82%);
      opacity: 0.25;
    }
    .cgu-helper-widget.widget-minimized:hover {
      transform: translateY(0);
      opacity: 1;
    }
    .cgu-helper-avatar-container {
      width: 250px;
      height: 385px;
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
      animation: cguHelperFloat 3s ease-in-out infinite;
    }
    .cgu-helper-avatar-container:hover {
      transform: scale(1.05) translateY(-4px);
    }
    .cgu-helper-avatar-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .cgu-helper-bubble {
      background: #ffffff;
      border: 1.5px solid rgba(122, 24, 24, 0.12);
      border-radius: 16px 16px 0 16px;
      padding: 18px;
      width: 300px;
      box-shadow: 0 10px 32px rgba(42, 8, 8, 0.15);
      pointer-events: auto;
      opacity: 0;
      visibility: hidden;
      transform: translateY(12px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
      margin-bottom: 140px;
    }
    .cgu-helper-bubble.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    .cgu-helper-bubble-arrow {
      position: absolute;
      bottom: 24px;
      right: -8px;
      width: 16px;
      height: 16px;
      background: #ffffff;
      border-bottom: 1.5px solid rgba(122, 24, 24, 0.12);
      border-right: 1.5px solid rgba(122, 24, 24, 0.12);
      transform: rotate(-45deg);
      z-index: 1;
    }
    .cgu-helper-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--maroon-deep, #2a0808);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cgu-helper-text {
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--ink-soft, #3a2828);
      margin-bottom: 12px;
    }
    .cgu-helper-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .cgu-helper-btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .cgu-helper-btn-primary {
      background: var(--maroon-deep, #2a0808);
      color: var(--cream, #faf6ee);
    }
    .cgu-helper-btn-primary:hover {
      background: var(--maroon, #7a1818);
    }
    .cgu-helper-btn-secondary {
      background: rgba(122, 24, 24, 0.05);
      color: var(--maroon, #7a1818);
    }
    .cgu-helper-btn-secondary:hover {
      background: rgba(122, 24, 24, 0.1);
    }
    @keyframes cguHelperFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @media(max-width: 576px) {
      .cgu-helper-widget {
        bottom: 16px;
        right: 16px;
      }
      .cgu-helper-avatar-container {
        width: 130px;
        height: 200px;
      }
      .cgu-helper-bubble {
        width: 240px;
        margin-bottom: 70px;
      }
    }
  `;
  document.head.appendChild(style);

  // Define page-specific tips
  const tips = {
    '/': {
      title: 'Guide: SJC Counselling',
      text: "Welcome! I'm your SJC guidance counsellor. If you need help with study stress, stream choices, or booking a confidential session, just click 'Book Appointment' above!",
      actionText: 'How to Book?',
      action: () => showTutorial('booking')
    },
    '/about': {
      title: 'About the Unit',
      text: "Our Guidance Unit has been supporting Josephians since 1898. Explore our history, meet our guidance masters, and learn about our confidentiality promise on this page.",
      actionText: 'Book Session',
      action: () => window.location.href = '/appointments'
    },
    '/services': {
      title: 'Our Services',
      text: "We offer Personal Counselling, Career Guidance, and Academic Support. All services are free and strictly confidential for every student. Choose a service to learn more.",
      actionText: 'How to Book?',
      action: () => showTutorial('booking')
    },
    '/careers': {
      title: 'Career guidance',
      text: "Unsure which A/L stream fits your future? Explore math, science, arts, commerce, and tech stream guides right here. If you need an aptitude test, book a session with us!",
      actionText: 'Book Session',
      action: () => window.location.href = '/appointments'
    },
    '/university': {
      title: 'University Guidance',
      text: "Browse national state universities and foreign pathways, check entry requirements, or learn how to apply for scholarships.",
      actionText: 'How to Book?',
      action: () => showTutorial('booking')
    },
    '/resources': {
      title: 'Wellness Tools',
      text: "Use our Daily Mood Check on this page to log your feelings and see positive daily affirmations! If you are facing urgent difficulties, emergency contacts are below.",
      actionText: 'Try Mood Check',
      action: () => {
        const el = document.getElementById('moodEmojis');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    '/events': {
      title: 'Events & Camps',
      text: "Register for active student workshops, leadership orientations, and university guidance camps. Seats are limited — click 'Register Now' to secure your spot!",
      actionText: 'How to Book?',
      action: () => showTutorial('booking')
    },
    '/school': {
      title: 'SJC History',
      text: "Josephians have walked these halls since 1898. Read about our school legacy, achievements, and structural growth on this page.",
      actionText: 'Book Session',
      action: () => window.location.href = '/appointments'
    },
    '/parents': {
      title: 'Parent Resources',
      text: "Guidance for parents on supporting child mental health, A/L stream selection, and exam stress management.",
      actionText: 'Book Session',
      action: () => window.location.href = '/appointments'
    },
    '/success': {
      title: 'Success Stories',
      text: "Josephians who navigated streams successfully. Read their testimonials and see how expert guidance helped shape their careers.",
      actionText: 'Book Session',
      action: () => window.location.href = '/appointments'
    },
    '/appointments': {
      title: 'Booking Guidance',
      text: "To book a session: 1. Enter your Name, Grade, and Class. 2. Write down what issues you want to discuss. 3. Select how you prefer us to contact you, then submit. We will reach out with a date & time!",
      actionText: 'Got it!',
      action: () => closeBubble()
    }
  };

  // Resolve current page path
  let currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath === '/index.html' || currentPath === '/index') {
    currentPath = '/';
  } else {
    // strip .html
    currentPath = currentPath.replace('.html', '');
  }

  // Get active tip
  const activeTip = tips[currentPath] || {
    title: 'SJC CGU Guide',
    text: "Hello! If you'd like to schedule a confidential counselling session, explore careers, or ask questions, click Book Appointment anytime.",
    actionText: 'Book Session',
    action: () => window.location.href = '/appointments'
  };

  // Create widget HTML structure
  const widget = document.createElement('div');
  widget.className = 'cgu-helper-widget';

  const bubble = document.createElement('div');
  bubble.className = 'cgu-helper-bubble';
  
  let actionsHTML = '';
  if (currentPath === '/' || currentPath === '/index' || currentPath === '') {
    actionsHTML = `
      <div class="cgu-helper-actions-menu" style="display:flex; flex-direction:column; gap:8px; width:100%; margin-top:10px;">
        <button class="cgu-helper-btn cgu-helper-btn-primary" onclick="window.location.href='/appointments'" style="text-align:left; display:flex; align-items:center; gap:8px; padding:8px 12px; width:100%; font-size:0.75rem; border-radius:8px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Book Counselling Session
        </button>
        <button class="cgu-helper-btn cgu-helper-btn-secondary" onclick="window.location.href='/careers'" style="text-align:left; display:flex; align-items:center; gap:8px; padding:8px 12px; width:100%; font-size:0.75rem; border-radius:8px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          Explore A/L Streams
        </button>
        <button class="cgu-helper-btn cgu-helper-btn-secondary" onclick="window.location.href='/university'" style="text-align:left; display:flex; align-items:center; gap:8px; padding:8px 12px; width:100%; font-size:0.75rem; border-radius:8px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><line x1="2" y1="22" x2="22" y2="22"/><line x1="4" y1="12" x2="4" y2="18"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="20" y1="12" x2="20" y2="18"/><path d="M2 12h20L12 4z"/></svg>
          University Pathways
        </button>
        <button class="cgu-helper-btn cgu-helper-btn-secondary" onclick="window.location.href='/resources'" style="text-align:left; display:flex; align-items:center; gap:8px; padding:8px 12px; width:100%; font-size:0.75rem; border-radius:8px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Wellness &amp; Mood Tools
        </button>
      </div>
    `;
  } else {
    actionsHTML = `
      <div class="cgu-helper-actions">
        <button class="cgu-helper-btn cgu-helper-btn-secondary cgu-helper-dismiss">Dismiss</button>
        <button class="cgu-helper-btn cgu-helper-btn-primary cgu-helper-action-btn">${activeTip.actionText}</button>
      </div>
    `;
  }

  bubble.innerHTML = `
    <div class="cgu-helper-bubble-arrow"></div>
    <div class="cgu-helper-title">
      <span>${activeTip.title}</span>
      <span style="font-size:0.8rem;cursor:pointer;opacity:0.6;" class="cgu-helper-close">✕</span>
    </div>
    <div class="cgu-helper-text">${activeTip.text}</div>
    ${actionsHTML}
  `;

  const avatar = document.createElement('div');
  avatar.className = 'cgu-helper-avatar-container';
  avatar.innerHTML = `<img src="/assets/characters/helper.png?v=6" alt="SJC Counsellor Helper"/>`;

  widget.appendChild(bubble);
  widget.appendChild(avatar);
  document.body.appendChild(widget);

  // Event Listeners
  avatar.addEventListener('click', function() {
    // If minimized, restore it first on click
    if (widget.classList.contains('widget-minimized')) {
      widget.classList.remove('widget-minimized');
      bubble.classList.add('visible');
    } else {
      bubble.classList.toggle('visible');
    }
  });

  // Minimize on scroll down to not block page content
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      widget.classList.add('widget-minimized');
      bubble.classList.remove('visible');
    } else {
      widget.classList.remove('widget-minimized');
    }
  }, { passive: true });

  bubble.querySelector('.cgu-helper-close').addEventListener('click', closeBubble);
  
  const dismissBtn = bubble.querySelector('.cgu-helper-dismiss');
  if (dismissBtn) dismissBtn.addEventListener('click', closeBubble);
  
  const actionBtn = bubble.querySelector('.cgu-helper-action-btn');
  if (actionBtn) {
    actionBtn.addEventListener('click', function() {
      activeTip.action();
    });
  }

  // Automatically show the bubble after 2 seconds
  setTimeout(function() {
    bubble.classList.add('visible');
  }, 2500);

  function closeBubble() {
    bubble.classList.remove('visible');
  }

  // Tutorial display
  function showTutorial(topic) {
    if (topic === 'booking') {
      bubble.querySelector('.cgu-helper-title span').textContent = 'How to Book a Session';
      bubble.querySelector('.cgu-helper-text').innerHTML = `
        To request a counselling session:
        <ol style="margin-left: 18px; margin-top: 6px; display: grid; gap: 4px;">
          <li>Go to the <strong>Book Appointment</strong> page.</li>
          <li>Fill in your <strong>Name</strong>, <strong>Grade</strong>, and <strong>Class</strong>.</li>
          <li>Write a brief note about the <strong>Issue</strong>.</li>
          <li>Select your <strong>Contact Preference</strong> (Email, Meet, or Phone).</li>
          <li>Submit! We will contact you to schedule.</li>
        </ol>
      `;
      actionBtn.textContent = 'Go to Booking';
      actionBtn.onclick = function() {
        window.location.href = '/appointments';
      };
    }
  }
})();
