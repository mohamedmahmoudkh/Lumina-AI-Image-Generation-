/**
 * Runtime config — loaded before app.js on every page
 */
(function () {
  const origin = window.location.origin;
  const isLocalFile = window.location.protocol === 'file:';
  const apiBase = isLocalFile ? 'http://localhost:4000/api/v1' : `${origin}/api/v1`;

  window.__ENV__ = {
    API_BASE_URL: apiBase,
    MOCK_MODE: 'false',
    APP_URL: origin,
    TRIAL_DAYS: 7,
    TRIAL_CREDITS: 200,
    GA_ID: '',
  };

  if (window.__ENV__.GA_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${window.__ENV__.GA_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', window.__ENV__.GA_ID);
  }
})();
