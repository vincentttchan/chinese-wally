import { renderArchiveSeal } from './archive-seal.js?v=2';

const volumeNumbers = ['一', '二', '三', '四'];

export function mountPaintingAlbum(container, collectedChapters, revisit, trigger) {
  const doc = container.ownerDocument;
  const toggle = trigger ?? doc.createElement('button');
  toggle.type = 'button';
  if (!trigger) {
    toggle.className = 'painting-album-toggle';
    toggle.textContent = '觀畫帖';
  }
  toggle.setAttribute('aria-haspopup', 'dialog');

  const titleId = 'painting-album-title-' + (trigger ? 'desk' : 'chapter');
  const album = doc.createElement('dialog');
  album.className = 'painting-album painting-register';
  album.setAttribute('aria-labelledby', titleId);
  album.innerHTML = `
    <form class="folio-clasp" method="dialog"><button class="painting-album-close" autofocus>合上</button></form>
    <div class="folio-spread">
      <header class="folio-leaf folio-frontispiece">
        <p class="painting-album-eyebrow">夜訪畫坊</p>
        <h2 id="${titleId}">觀畫帖</h2>
        <p class="painting-album-count"></p>
        <div class="folio-owner-seal" role="img" hidden></div>
      </header>
      <section class="folio-leaf folio-contents" aria-label="已藏畫卷">
        <h3>已藏畫卷</h3>
        <ul class="painting-album-list"></ul>
      </section>
    </div>
  `;
  if (!trigger) container.append(toggle);
  container.append(album);
  const count = album.querySelector('.painting-album-count');
  const list = album.querySelector('.painting-album-list');
  const ownerSeal = album.querySelector('.folio-owner-seal');

  function volumeButton(chapter, index) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'painting-volume';
    button.setAttribute('aria-label', '重訪《' + chapter.title + '》');

    const description = doc.createElement('span');
    description.className = 'painting-volume-caption';
    const number = doc.createElement('span');
    number.className = 'painting-volume-number';
    number.textContent = '第' + (volumeNumbers[index] ?? index + 1) + '卷';
    const title = doc.createElement('span');
    title.className = 'painting-volume-title';
    title.textContent = chapter.title;
    description.append(number, title);
    button.append(description);
    const action = doc.createElement('span');
    action.className = 'painting-album-revisit';
    action.textContent = '重訪 →';
    button.append(action);
    button.addEventListener('click', () => {
      album.close();
      revisit(chapter);
    });
    return button;
  }

  function refresh() {
    const chapters = collectedChapters();
    toggle.hidden = chapters.length === 0;
    count.textContent = '已收' + (volumeNumbers[chapters.length - 1] ?? chapters.length) + '卷';
    ownerSeal.hidden = !chapters.some(chapter => chapter.id === 'zanhua');
    list.replaceChildren();
    chapters.forEach((chapter, index) => {
      const row = doc.createElement('li');
      row.append(volumeButton(chapter, index));
      list.append(row);
    });
  }

  toggle.addEventListener('click', () => {
    refresh();
    if (!ownerSeal.hidden) void renderArchiveSeal(ownerSeal);
    album.showModal();
  });
  refresh();
  return refresh;
}
