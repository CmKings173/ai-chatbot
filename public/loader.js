(function () {
  /**
   * 1-line embed loader
   * Usage:
   * <script async src="https://cms.example.com/loader.js" data-api-url="https://api.example.com" data-api-key="sk_live_..."> </script>
   */

  function getCurrentScript() {
    // Best-effort current script detection
    if (document.currentScript) return document.currentScript;

    var scripts = document.getElementsByTagName('script');
    if (!scripts || scripts.length === 0) return null;

    return scripts[scripts.length - 1];
  }

  function normalizeOrigin(url) {
    return String(url || '').replace(/\/$/, '');
  }

  var scriptEl = getCurrentScript();
  if (!scriptEl) return;

  var apiKey = scriptEl.getAttribute('data-api-key') || '';
  var apiUrl = normalizeOrigin(scriptEl.getAttribute('data-api-url') || '');

  if (!apiKey || !apiUrl) {
    console.error('[AI Chatbot] Missing data-api-key or data-api-url');
    return;
  }

  var loaderSrc = scriptEl.getAttribute('src') || '';
  var assetOrigin = '';
  try {
    assetOrigin = new URL(loaderSrc, window.location.href).origin;
  } catch {
    assetOrigin = '';
  }

  var cssHref = assetOrigin + '/chatbox.min.css';
  var jsSrc = assetOrigin + '/chatbox.min.js';

  // Merge config (do not wipe existing fields if user sets them)
  window.WPAIChatboxConfig = Object.assign({}, window.WPAIChatboxConfig || {}, {
    apiKey: apiKey,
    apiUrl: apiUrl,
  });

  // Inject CSS once
  if (!document.querySelector('link[data-wp-ai-chatbot="chatbox-css"]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    link.setAttribute('data-wp-ai-chatbot', 'chatbox-css');
    document.head.appendChild(link);
  }

  // Inject JS once
  if (!document.querySelector('script[data-wp-ai-chatbot="chatbox-js"]')) {
    var s = document.createElement('script');
    s.src = jsSrc;
    s.async = true;
    s.setAttribute('data-wp-ai-chatbot', 'chatbox-js');

    // Ensure we attach after config is set
    document.body.appendChild(s);
  }
})();
