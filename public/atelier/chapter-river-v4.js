// The landscape is a chapter-navigation metaphor, not a historical map.
export function mountChapterRiver(container, { chapters, progress, activeChapter, enterChapter, afterEnter }) {
  const doc = container.ownerDocument;
  const numbers = ['一', '二', '三', '四'];
  const dialog = doc.createElement('dialog');
  dialog.className = 'chapter-river';
  dialog.setAttribute('aria-labelledby', 'chapter-river-title');
  dialog.innerHTML = `<header class="river-header"><div><p>夜訪畫坊</p><h2 id="chapter-river-title">觀畫長河</h2></div>
    <button class="river-close" type="button" autofocus>收卷 <span aria-hidden="true">×</span></button></header>
    <div class="river-viewport"><div class="river-world">
      <img class="river-landscape" src="${new URL('./assets/album-river-v1/river-landscape.png', import.meta.url).href}" alt="沿河展開的畫境，遠處隱於霧中。" draggable="false">
      <div class="river-places"></div><div class="river-entering-veil" aria-hidden="true"></div>
    </div></div>
    <footer class="river-footer"><button class="river-pan-prev" type="button" aria-label="向卷首移動">←</button>
      <p class="river-status" role="status">點一處畫境，繼續你的旅程。</p>
      <button class="river-pan-next" type="button" aria-label="向卷尾移動">→</button></footer>`;
  // Keep the caption and controls on the scroll, without an extra background.
  const surface = dialog.querySelector('.river-world');
  surface.append(dialog.querySelector('.river-header'), dialog.querySelector('.river-footer'));
  container.append(dialog);
  const viewport = dialog.querySelector('.river-viewport');
  const places = dialog.querySelector('.river-places');
  const status = dialog.querySelector('.river-status');
  let busy = false;
  let opener;
  let entered = false;
  const reduced = () => doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function panTo(button, smooth = true) {
    viewport.scrollTo({left: button.offsetLeft + button.offsetWidth / 2 - viewport.clientWidth / 2, behavior: smooth && !reduced() ? 'smooth' : 'instant'});
  }
  function close() { if (!busy) dialog.close(); }
  dialog.querySelector('.river-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => {
    dialog.classList.remove('is-entering', 'is-leaving');
    if (!entered && opener?.isConnected) opener.focus({preventScroll: true});
  });
  for (const [selector, direction] of [['.river-pan-prev', -1], ['.river-pan-next', 1]]) {
    dialog.querySelector(selector).addEventListener('click', () => viewport.scrollBy({left: direction * viewport.clientWidth * .65, behavior: reduced() ? 'instant' : 'smooth'}));
  }
  function refreshPanControls() {
    const offset = 'translateX(' + viewport.scrollLeft + 'px)';
    dialog.querySelector('.river-header').style.width = viewport.clientWidth + 'px';
    dialog.querySelector('.river-footer').style.width = viewport.clientWidth + 'px';
    dialog.querySelector('.river-header').style.transform = offset;
    dialog.querySelector('.river-footer').style.transform = offset;
    const overflow = viewport.scrollWidth - viewport.clientWidth > 2;
    for (const control of dialog.querySelectorAll('.river-footer button')) control.hidden = !overflow;
    dialog.querySelector('.river-pan-prev').disabled = viewport.scrollLeft < 2;
    dialog.querySelector('.river-pan-next').disabled = viewport.scrollLeft >= viewport.scrollWidth - viewport.clientWidth - 2;
  }
  let drag;
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
    drag = {id: event.pointerId, x: event.clientX, left: viewport.scrollLeft};
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) viewport.scrollLeft = drag.left - (event.clientX - drag.x);
  });
  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;
    drag = null;
    viewport.classList.remove('is-dragging');
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  viewport.addEventListener('scroll', refreshPanControls, {passive: true});
  new doc.defaultView.ResizeObserver(refreshPanControls).observe(viewport);

  function render() {
    const completed = progress();
    places.replaceChildren();
    chapters.forEach((chapter, index) => {
      const locked = index > completed;
      const read = index < completed;
      const place = doc.createElement('div');
      place.className = 'river-place river-place-' + index;
      place.classList.toggle('is-locked', locked);
      place.classList.toggle('is-read', read);
      place.classList.toggle('is-new', !locked && !read);
      const fog = doc.createElement('div'); fog.className = 'river-fog'; fog.setAttribute('aria-hidden', 'true');
      const button = doc.createElement('button');
      button.type = 'button'; button.className = 'river-destination'; button.dataset.chapter = chapter.id;
      button.setAttribute('aria-disabled', String(locked));
      const state = locked ? '尚未開啟' : read ? '已遊 · 可重訪' : '此卷 · 可進入';
      button.setAttribute('aria-label', locked ? '第' + numbers[index] + '卷，尚未開啟' : chapter.title + '，' + state);
      if (activeChapter() === index) button.setAttribute('aria-current', 'location');
      const number = doc.createElement('span'); number.className = 'river-volume'; number.textContent = '第' + numbers[index] + '卷';
      const name = doc.createElement('span'); name.className = 'river-name'; name.textContent = locked ? '未開之境' : chapter.title;
      const label = doc.createElement('span'); label.className = 'river-state'; label.textContent = state;
      button.append(number, name, label);
      button.addEventListener('focus', () => { if (dialog.open && !busy) panTo(place); });
      button.addEventListener('click', async () => {
        if (busy) return;
        if (index > progress()) {
          status.textContent = '完成前一卷，這一處畫境便會開啟。';
          return;
        }
        busy = true;
        dialog.setAttribute('aria-busy', 'true');
        dialog.classList.add('is-entering');
        dialog.querySelector('.river-close').disabled = true;
        places.inert = true;
        status.textContent = '正在展開《' + chapter.title + '》……';
        try {
          await Promise.all([enterChapter(index), new Promise(resolve => setTimeout(resolve, reduced() ? 0 : 550))]);
          entered = true;
          dialog.classList.add('is-leaving');
          await new Promise(resolve => setTimeout(resolve, reduced() ? 0 : 300));
          dialog.close();
          afterEnter?.();
        } catch {
          status.textContent = '畫卷暫未載入，請再點選一次，或收卷稍後再試。';
          dialog.classList.remove('is-entering', 'is-leaving');
        } finally {
          busy = false; places.inert = false;
          dialog.removeAttribute('aria-busy');
          dialog.querySelector('.river-close').disabled = false;
        }
      });
      place.append(fog, button); places.append(place);
    });
  }

  return {
    open(trigger, focusNext = false) {
      if (dialog.open) return;
      opener = trigger; entered = false; render();
      status.textContent = '點一處畫境，繼續你的旅程。';
      dialog.showModal();
      doc.defaultView.requestAnimationFrame(() => {
        const destination = places.querySelector('.river-place-' + Math.min(progress(), chapters.length - 1));
        if (focusNext && destination) {
          panTo(destination, false);
          destination.querySelector('button').focus({preventScroll: true});
        } else viewport.scrollTo({left: 0, behavior: 'instant'});
        refreshPanControls();
      });
    }
  };
}
