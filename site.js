/* Extra Time Coaching - shared site script */

/* ---------- Mobile navigation ---------- */
(function () {
  var toggle = document.getElementById('mobile-menu-toggle');
  var menu = document.getElementById('mobile-navigation');
  var openIcon = document.getElementById('mobile-menu-icon-open');
  var closeIcon = document.getElementById('mobile-menu-icon-close');
  if (!toggle || !menu) return;

  function setMenuOpen(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (openIcon) openIcon.hidden = open;
    if (closeIcon) closeIcon.hidden = !open;
  }

  toggle.addEventListener('click', function () { setMenuOpen(menu.hidden); });
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenuOpen(false); });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  window.addEventListener('resize', function () {
    if (window.matchMedia('(min-width: 768px)').matches) setMenuOpen(false);
  });
  setMenuOpen(false);
})();

/* ---------- Testimonial carousel (homepage only) ---------- */
(function () {
  var track = document.getElementById('testimonial-track');
  var allDots = document.querySelectorAll('.testimonial-dot');
  if (!track || !allDots.length) return;

  var current = 0;
  var paused = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isMobile() { return window.matchMedia('(max-width: 767px)').matches; }
  function getDots() {
    return document.querySelectorAll(isMobile() ? '.testimonial-dot-mobile' : '.testimonial-dot-desktop');
  }
  function getMaxIndex() { return isMobile() ? 3 : 1; }

  function showTestimonial(index) {
    current = Math.min(index, getMaxIndex());
    var slideWidth = isMobile() ? 100 : 33.333333;
    track.style.transform = 'translateX(-' + (current * slideWidth) + '%)';
    allDots.forEach(function (dot) {
      dot.classList.remove('bg-white');
      dot.classList.add('bg-white/30');
    });
    var active = getDots()[current];
    if (active) {
      active.classList.remove('bg-white/30');
      active.classList.add('bg-white');
    }
  }

  allDots.forEach(function (dot) {
    dot.addEventListener('click', function () { showTestimonial(Number(dot.dataset.index)); });
  });
  window.addEventListener('resize', function () { showTestimonial(current); });

  var carousel = track.parentNode;
  ['mouseenter', 'focusin', 'touchstart'].forEach(function (evt) {
    carousel.addEventListener(evt, function () { paused = true; }, { passive: true });
  });
  ['mouseleave', 'focusout'].forEach(function (evt) {
    carousel.addEventListener(evt, function () { paused = false; });
  });

  if (!reduceMotion) {
    setInterval(function () {
      if (paused || document.hidden) return;
      var maxIndex = getMaxIndex();
      showTestimonial(current >= maxIndex ? 0 : current + 1);
    }, 5000);
  }
})();

/* ---------- Cookie consent (Google Analytics only loads after Accept) ---------- */
(function () {
  var GA_ID = 'G-7VZRC7DC56';
  var KEY = 'etc-cookie-consent';
  var banner = null;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(value) { try { localStorage.setItem(KEY, value); } catch (e) { /* storage unavailable */ } }

  function loadAnalytics() {
    if (window.__etcGaLoaded) return;
    window.__etcGaLoaded = true;
    window['ga-disable-' + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearAnalyticsCookies() {
    window['ga-disable-' + GA_ID] = true;
    var host = location.hostname;
    var bare = host.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        var expired = '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = name + expired;
        document.cookie = name + expired + '; domain=' + host;
        document.cookie = name + expired + '; domain=.' + bare;
      }
    });
  }

  function hideBanner() { if (banner) banner.hidden = true; }

  function buildBanner() {
    banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.className = 'fixed bottom-0 inset-x-0 z-[1500] bg-[#03152d] text-white border-t border-white/20 shadow-2xl';
    banner.innerHTML =
      '<div class="max-w-7xl mx-auto px-5 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">' +
        '<p class="text-sm leading-relaxed flex-1">We use analytics cookies to understand how this website is used. They are only set if you accept. ' +
        '<a href="privacy.html#cookies" class="underline font-bold hover:text-blue-300">Privacy &amp; cookies</a></p>' +
        '<div class="flex gap-3 md:flex-none">' +
          '<button type="button" data-consent="denied" class="flex-1 md:flex-none border border-white text-white hover:bg-white hover:text-[#03152d] px-6 py-3 uppercase text-xs tracking-[0.15em] font-black">Reject</button>' +
          '<button type="button" data-consent="granted" class="flex-1 md:flex-none border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 uppercase text-xs tracking-[0.15em] font-black">Accept</button>' +
        '</div>' +
      '</div>';
    banner.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-consent]');
      if (!btn) return;
      var value = btn.getAttribute('data-consent');
      setChoice(value);
      if (value === 'granted') loadAnalytics(); else clearAnalyticsCookies();
      hideBanner();
    });
    document.body.appendChild(banner);
  }

  function showBanner(focus) {
    if (!banner) buildBanner();
    banner.hidden = false;
    if (focus) {
      var first = banner.querySelector('button');
      if (first) first.focus();
    }
  }

  function init() {
    var choice = getChoice();
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') showBanner(false);

    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function () { showBanner(true); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ---------- Open the FAQ that a link points to (e.g. faqs.html#faq-9) ---------- */
(function () {
  function openFromHash() {
    if (!location.hash) return;
    var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el && el.tagName === 'DETAILS') {
      el.open = true;
      el.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', openFromHash);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openFromHash);
  else openFromHash();
})();
