/* ==========================================================================
   Get Noticed AI — Blog behaviour
   Mirrors the homepage: theme toggle persisted in localStorage under
   'gna-theme' (dark is the default) + mobile nav toggle.
   Load with: <script src="/blog/blog.js" defer></script>
   ========================================================================== */
(function () {
  'use strict';

  var sunSVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  var moonSVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var openIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  var closeIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  /* ---- Theme ---- */
  var root = document.documentElement;
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var theme = 'dark';
  try { theme = localStorage.getItem('gna-theme') || 'dark'; } catch (e) { /* private mode */ }
  root.setAttribute('data-theme', theme);

  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? sunSVG : moonSVG;
    themeBtn.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem('gna-theme', theme); } catch (e) {}
      themeBtn.innerHTML = theme === 'dark' ? sunSVG : moonSVG;
      themeBtn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }

  /* ---- Mobile nav ---- */
  var menuBtn = document.querySelector('[data-mobile-menu]');
  var mobileNav = document.getElementById('mobileNav');
  if (menuBtn && mobileNav) {
    menuBtn.innerHTML = openIcon;
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuBtn.innerHTML = open ? closeIcon : openIcon;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-close-menu]'), function (l) {
      l.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        menuBtn.innerHTML = openIcon;
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Sticky header shadow ---- */
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,.15)' : 'none';
    }, { passive: true });
  }

  /* ---- Privacy-safe content and funnel events ---- */
  function clean(value) { return String(value || 'none').replace(/[^a-zA-Z0-9._~-]/g, '_').slice(0, 80) || 'none'; }
  var query = new URLSearchParams(window.location.search);
  var referrerHost = 'direct';
  try { referrerHost = document.referrer ? new URL(document.referrer).hostname : 'direct'; } catch (e) {}
  var analyticsContext = {
    page_path: window.location.pathname,
    page_group: window.location.pathname === '/blog/' ? 'blog_hub' : 'article',
    offer_path: 'education',
    viewport: window.innerWidth < 768 ? 'mobile' : 'desktop',
    utm_source: clean(query.get('utm_source') || 'direct'),
    utm_medium: clean(query.get('utm_medium') || 'none'),
    utm_campaign: clean(query.get('utm_campaign') || 'none'),
    utm_content: clean(query.get('utm_content') || 'none'),
    referrer_host: clean(referrerHost)
  };
  function pushEvent(name, details) {
    var payload = Object.assign({ event: name }, analyticsContext, details || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    try { window.posthog && window.posthog.capture(name, payload); } catch (e) {}
  }
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;
    var target;
    try { target = new URL(link.getAttribute('href') || '', window.location.href); } catch (e) { return; }
    var placement = clean(link.id || link.className || link.textContent.trim());
    var destinationType = target.hostname === 'audit.app.getnoticedai.com' ? 'audit' : target.origin === window.location.origin ? 'internal' : 'external';
    if (target.hostname === 'audit.app.getnoticedai.com') {
      pushEvent('audit_click', { placement: placement, destination_type: destinationType });
    } else if (target.pathname.indexOf('/command/') === 0) {
      pushEvent('command_entry_click', { placement: placement, destination_type: destinationType });
    } else if (target.hash === '#pricing') {
      pushEvent('pricing_click', { plan: 'unspecified', billing: 'unspecified', placement: placement, destination_type: destinationType });
      pushEvent('nova_click', { plan: 'unspecified', billing: 'unspecified', placement: placement, destination_type: destinationType });
    } else if (/^\/(resources|compare|guides|industries|blog|local-seo-for-)/.test(target.pathname)) {
      pushEvent('resource_click', { content_id: clean(target.pathname), placement: placement, destination_type: destinationType });
    }
  });
})();
