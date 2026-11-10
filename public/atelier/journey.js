const chapters = [
  {id: 'zanhua', title: '簪花仕女圖', page: '../?atelier=1#zanhua'},
  {id: 'lantern-festival', title: '宮中鬧元宵', page: 'lantern.html'},
  {id: 'kangqu-listening', title: '在人群中聽樂', page: 'kangqu.html'},
  {id: 'luoshen', title: '洛水之間', page: '../?atelier=1#luoshen'}
];
const progressKey = 'chinese-wally:atelier:completed-chapters:v1';
const previewProgressKey = 'chinese-wally:study-v12:completed-chapters';

function readProgress() {
  try {
    const saved = Number(localStorage.getItem(progressKey) ?? localStorage.getItem(previewProgressKey));
    return Number.isInteger(saved) && saved >= 0 && saved <= chapters.length ? saved : 0;
  } catch {
    return 0;
  }
}

function chapterFromLink(link) {
  const url = new URL(link.href);
  if (url.origin !== location.origin) return undefined;
  const hash = url.hash.slice(1);
  if (hash === 'painting-selection') return chapters[0].id;
  if (chapters.some(chapter => chapter.id === hash)) return hash;
  if (url.pathname.includes('/lantern-shangyuan-v2-0.1.8-live/')) return 'lantern-festival';
  if (url.pathname.includes('/kangqu-listening-v2-2.3.1/')) return 'kangqu-listening';
}

export function chapterJourney(frame, prompt, {
  hideChapterNavigation = false,
  keepNextChapter = false,
  chapterPromptStylesheet,
  mountAlbum,
  onReturnToRoom
} = {}) {
  let next;
  let completed = readProgress();
  let active = 0;
  let observer;
  let pending = false;
  let started = false;
  let refreshAlbum;

  function bindChapterPrompt() {
    next = prompt.querySelector('.chapter-next');
    next.addEventListener('click', () => openChapter(active + 1));
    prompt.querySelector('.chapter-stay').addEventListener('click', () => {
      if (keepNextChapter) showNextChapter(true);
      else prompt.hidden = true;
      if (chapterPromptStylesheet) next.focus({preventScroll: true});
      else frame.focus();
    });
  }

  function saveCompleted(count) {
    completed = Math.max(completed, readProgress(), count);
    try { localStorage.setItem(progressKey, String(completed)); }
    catch { /* Progress remains available for this visit. */ }
    if (frame.contentDocument) updateNavigation(frame.contentDocument);
    refreshAlbum?.();
  }

  function roomChapter() {
    return chapters[Math.min(chapters.length - 1, Math.max(1, completed, readProgress()))];
  }

  function collectedChapters() {
    return chapters.slice(0, completed);
  }

  function openCollected(id) {
    const index = chapters.findIndex(chapter => chapter.id === id);
    if (index >= 0 && index < completed) openChapter(index);
  }

  function openChapter(index) {
    if (index < 0 || index >= chapters.length || index > completed) return;
    active = index;
    pending = true;
    prompt.hidden = true;
    prompt.classList.remove('is-compact');
    frame.title = chapters[index].title;
    const url = new URL(chapters[index].page, import.meta.url);
    const current = frame.contentDocument?.URL;
    if (current?.split('#')[0] === url.href.split('#')[0]) {
      const chapterWindow = frame.contentWindow;
      // A hash change alone does not fire the frame load that sets up the chapter.
      if (current !== url.href) chapterWindow.history.replaceState(null, '', url);
      chapterWindow.location.reload();
    } else if (started && current && current !== 'about:blank') {
      frame.contentWindow.location.replace(url);
    } else {
      frame.src = url;
      started = true;
    }
  }

  function showNextChapter(compact = false) {
    const following = chapters[active + 1];
    prompt.querySelector('p').textContent = mountAlbum
      ? '《' + chapters[active].title + '》已收入觀畫帖 · 已收藏 ' + completed + ' 卷'
      : '已解鎖《' + following.title + '》';
    next.textContent = '前往《' + following.title + '》 →';
    next.setAttribute('aria-label', '前往《' + following.title + '》');
    prompt.classList.toggle('is-compact', compact);
    prompt.hidden = false;
  }

  function updateNavigation(doc) {
    if (hideChapterNavigation) return;
    for (const nav of doc.querySelectorAll('.chapter-links')) {
      const entries = new Map();
      for (const link of nav.querySelectorAll('a')) {
        const id = link.dataset.studyChapter || (link.hasAttribute('href') && chapterFromLink(link));
        if (!id) continue;
        link.dataset.studyChapter = id;
        entries.set(id, link);
        const index = chapters.findIndex(chapter => chapter.id === id);
        const locked = index > completed;
        const marker = link.querySelector('.study-lock');
        if (locked && !marker) {
          link.dataset.studyHref = link.getAttribute('href');
          link.removeAttribute('href');
          link.removeAttribute('data-preload-src');
          link.setAttribute('aria-disabled', 'true');
          link.classList.add('chapter-pending');
          const label = doc.createElement('span');
          label.className = 'study-lock';
          label.textContent = ' · 已上鎖';
          link.append(label);
        } else if (!locked && marker) {
          link.setAttribute('href', link.dataset.studyHref);
          link.removeAttribute('aria-disabled');
          link.classList.remove('chapter-pending');
          marker.remove();
        }
      }
      const luoshen = entries.get('luoshen');
      const kangqu = entries.get('kangqu-listening');
      if (luoshen && kangqu && (luoshen.compareDocumentPosition(kangqu) & 4)) {
        kangqu.after(luoshen);
      }
    }
  }

  frame.addEventListener('load', () => {
    observer?.disconnect();
    const doc = frame.contentDocument;
    if (!doc?.documentElement || doc.URL === 'about:blank') return;
    pending = false;
    if (chapterPromptStylesheet) {
      const stylesheet = doc.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = chapterPromptStylesheet;
      doc.head.append(stylesheet);
      const newPrompt = doc.importNode(prompt, true);
      prompt.remove();
      prompt = newPrompt;
      bindChapterPrompt();
      doc.body.append(prompt);
    }
    if (hideChapterNavigation) {
      const style = doc.createElement('style');
      style.textContent = '.chapter-links { display: none !important; }';
      doc.head.append(style);
    } else {
      updateNavigation(doc);
      observer = new MutationObserver(() => updateNavigation(doc));
      observer.observe(doc.documentElement, {childList: true, subtree: true});
    }
    delete doc.documentElement.dataset.studyLoading;
    refreshAlbum = mountAlbum?.(doc.body, collectedChapters, chapter => openCollected(chapter.id));
    if (keepNextChapter && active < completed && active < chapters.length - 1 && prompt.hidden) showNextChapter(true);

    frame.contentWindow.addEventListener('click', event => {
      const link = event.target.closest?.('a');
      if (!link) return;
      const id = link.dataset.studyChapter || (link.hasAttribute('href') && chapterFromLink(link));
      const index = chapters.findIndex(chapter => chapter.id === id);
      if (index < 0) return;
      if (index === active && link.getAttribute('aria-current') === 'page') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!pending) openChapter(index);
    }, true);
  });

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type !== 'study-chapter-complete' || event.data.chapter !== chapters[active].id) return;
    if (active > completed) return;
    if (active === chapters.length - 1) {
      saveCompleted(chapters.length);
      prompt.hidden = true;
      onReturnToRoom?.(chapters[active], true);
      return;
    }
    if (active === 0 && event.data.returnToRoom && onReturnToRoom) {
      prompt.hidden = true;
      onReturnToRoom(roomChapter());
      return;
    }
    if (active === 0 && event.data.deferPrompt && onReturnToRoom) return;
    saveCompleted(active + 1);
    showNextChapter();
  });

  bindChapterPrompt();

  return {
    openFirst: () => openChapter(0),
    openSaved: () => openChapter(completed),
    openCollected,
    collectedChapters,
    roomChapter,
    archiveFirst: () => saveCompleted(1),
    savedChapter: () => completed > 0 ? chapters[completed] : null,
    isReady: () => {
      const doc = frame.contentDocument;
      const painting = doc?.querySelector('.painting-world > img.painting, #painting');
      return !pending && Boolean(doc?.querySelector('h1') && painting?.complete && painting.naturalWidth > 0);
    },
    firstCover: () => frame.contentDocument?.querySelector('[aria-label="簪花仕女圖封面"]')
  };
}
