(() => {
  const sessionKey = '__chineseWallyFreshSession';

  function createStorage() {
    const entries = new Map();
    return {
      get length() { return entries.size; },
      key(index) { return Array.from(entries.keys())[index] ?? null; },
      getItem(key) { return entries.get(String(key)) ?? null; },
      setItem(key, value) { entries.set(String(key), String(value)); },
      removeItem(key) { entries.delete(String(key)); },
      clear() { entries.clear(); }
    };
  }

  let session;
  if (window.parent !== window) {
    try { session = window.parent[sessionKey]; }
    catch { return; }
  } else if (document.currentScript.hasAttribute('data-fresh-entry') &&
             new URLSearchParams(location.search).get('fresh') === '1') {
    session = { localStorage: createStorage(), sessionStorage: createStorage() };
    history.replaceState(null, '');
    // Returning from the browser's back-forward cache should start a fresh test too.
    window.addEventListener('pageshow', event => {
      if (event.persisted) location.reload();
    });
  }
  if (!session) return;

  Object.defineProperties(window, {
    [sessionKey]: { value: session },
    localStorage: { value: session.localStorage },
    sessionStorage: { value: session.sessionStorage }
  });
})();
