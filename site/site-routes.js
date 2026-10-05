/* Public site destinations. Legacy console screens are not part of this preview. */
(() => {
  const legacyOrigin = 'https://open-platform-portal.bggsandboxdev.com';
  const destination = value => {
    const url = new URL(value, location.origin);
    if (![location.origin, legacyOrigin].includes(url.origin)) return null;
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (path === '/') return '/' + (url.hash === '#access' ? '#onboarding' : url.hash);
    if (/^\/(docs|console\/docs)(\/|$)/.test(path)) return '/docs/' + url.hash;
    if (/^\/(products|catalog)(\/|$)/.test(path)) return '/#capabilities';
    if (/^\/onboarding(\/|$)/.test(path)) return '/#onboarding';
    if (/^\/register(\/|$)/.test(path) || (path === '/login' && url.searchParams.get('scene') === 'register')) return '/register/';
    if (/^\/(apps|console|login|auth|members|kyb)(\/|$)/.test(path)) return '/login/';
    return null;
  };
  window.BGSiteRoutes = { destination };
  const normalize = anchor => {
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    const next = destination(href);
    if (next) {
      anchor.setAttribute('href', next);
      anchor.removeAttribute('target');
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href]').forEach(normalize);
    // React documentation links must also work with keyboard activation / open in new tab.
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;
      if (node.matches('a[href]')) normalize(node);
      node.querySelectorAll('a[href]').forEach(normalize);
    }))).observe(document.body, { childList: true, subtree: true });
  });
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    normalize(anchor);
    const next = destination(anchor.href);
    if (!next) return;
    // Let documentation section links keep their existing SPA/history behavior.
    if (location.pathname.startsWith('/docs') && next.startsWith('/docs/')) return;
    // Use the real page navigation, not the imported SPA's obsolete routes.
    if (anchor.closest('#root')) {
      event.stopImmediatePropagation();
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
        event.preventDefault();
        location.assign(next);
      }
    }
  }, true);
})();
