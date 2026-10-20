/* Shared by the React entry and the saved Kangqu document. */
(() => {
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const veil = document.createElement('div');
  veil.className = 'chapter-transition-veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.append(veil);
  let busy = true;
  let animation = null;
  let generation = 0;
  const frames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const warmed = new Set();
  function warm(link) {
    const source = link?.getAttribute('data-preload-src');
    if (!source || warmed.has(source)) return;
    warmed.add(source);
    const image = new Image();
    image.src = source;
    image.decode().catch(() => {});
  }
  async function presentationReady(token) {
    const deadline = performance.now() + 8000;
    while (token === generation) {
      const cover = document.querySelector('.introduction:not([hidden]), [data-chapter-preview]');
      const scene = document.querySelector('.scroll-frame');
      const preview = document.querySelector('#painting-preview');
      if (document.querySelector('.scene-status button, #loading:not([hidden]) button')) return;
      // Do not reveal an unfinished cover merely because a timer expired.
      if (!cover && performance.now() >= deadline) return;
      // Original painting and scene geometry live outside the introduction.
      const settled = cover && (scene ? scene.dataset.assetsReady === 'true' : preview ? preview.complete && preview.naturalWidth > 0 : true);
      if (settled) {
        const images = [...document.querySelectorAll('.painting, .painting-detail-tile, .introduction img')].filter(image => {
          if (image.id === 'painting') return false; // Kangqu reveals its decoded preview first.
          const rect = image.getBoundingClientRect();
          return rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight && rect.width > 0;
        });
        if (images.every(image => image.complete) && document.fonts?.status !== 'loading') {
          await Promise.all(images.filter(image => image.naturalWidth).map(image => image.decode().catch(() => {})));
          await Promise.race([document.fonts?.ready, new Promise(resolve => setTimeout(resolve, 1200))]);
          await frames();
          return;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  }
  async function fade(from, to, duration) {
    animation?.cancel();
    veil.style.opacity = String(from);
    if (reduce()) {veil.style.opacity = String(to);return;}
    const currentAnimation = veil.animate([{opacity: from}, {opacity: to}], {
      duration, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'both'
    });
    animation = currentAnimation;
    try { await currentAnimation.finished; } catch {return;}
    // Commit the final opacity before releasing the compositor's filled frame.
    if (animation !== currentAnimation) return;
    veil.style.opacity = String(to);
    currentAnimation.cancel();
    animation = null;
  }
  async function reveal(token = ++generation) {
    // Allow React's new route and the saved document's cover to reach the DOM.
    await frames();
    await presentationReady(token);
    if (token !== generation) return;
    await fade(1, 0, 300);
    if (token !== generation) return;
    busy = false;
    veil.classList.remove('is-blocking');
    document.querySelectorAll('.chapter-links a[data-preload-src]').forEach(warm);
  }
  async function leave(action) {
    if (busy) return;
    busy = true;
    const token = ++generation;
    veil.classList.add('is-blocking');
    await fade(Number(getComputedStyle(veil).opacity), 1, 180);
    try {
      const stays = await action();
      if (stays) await reveal(token);
    } catch {
      await reveal(token);
    }
  }
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('.chapter-links a, a.chapter-back') : null;
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || link.target === '_blank') return;
    const destination = new URL(link.href, location.href);
    if (!['http:', 'https:', 'file:'].includes(destination.protocol)) return;
    if (destination.href === location.href || link.getAttribute('aria-current') === 'page') {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    warm(link);
    const sameDocument = destination.origin === location.origin && destination.pathname === location.pathname && destination.search === location.search && link.target !== '_top';
    void leave(() => {
      if (sameDocument) {
        location.hash = destination.hash;
        return true;
      }
      (link.target === '_top' ? window.top : window).location.assign(destination.href);
      return false;
    });
  }, true);
  for (const type of ['pointerover', 'focusin']) document.addEventListener(type, event => {
    if (event.target instanceof Element) warm(event.target.closest('.chapter-links a'));
  });
  window.addEventListener('chapter-cover-request', event => {
    void leave(async () => {
      if (typeof event.detail === 'function') await event.detail();
      else window.dispatchEvent(new Event('chapter-cover'));
      return true;
    });
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { busy = false; void reveal(); }
  });
  // Browser back/forward also enters through the same veil.
  window.addEventListener('hashchange', () => {
    if (!busy) {
      veil.style.opacity = '1';
      void reveal();
    }
  });
  veil.style.opacity = '1';
  veil.classList.add('is-blocking');
  document.documentElement.classList.add('chapter-motion-ready');
  void reveal();
})();
