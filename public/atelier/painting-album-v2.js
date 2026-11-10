import { renderArchiveSeal } from './archive-seal.js?v=2';

const numbers = ['一', '二', '三', '四'];
const memories = {
  zanhua: { title: '盛裝之中，一段閒暇', lines: ['從髻上的花，到身上的薄紗，', '再望一眼她們的手勢與目光。'], journal: '簪花見聞冊' },
  'lantern-festival': { title: '燈火之間，三度相逢', lines: ['沿着皇帝的行蹤，', '走過宮中的上元夜。'], journal: '上元見聞冊' },
  'kangqu-listening': { title: '人群之中，聽見慶典', lines: ['循着樂聲走過街頭，', '再看眾人如何共赴這場盛會。'], journal: '康衢見聞冊' },
  luoshen: { title: '人已上路，心仍留在洛水', lines: ['相逢與離別，都留在這一卷。'], journal: '洛水見聞冊' }
};
const blossomSpots = ['blossom-P1', 'blossom-P2', 'blossom-P4', 'blossom-P5', 'blossom-P6'];
const zanhuaDetails = [
  ['blossom', '簪花', blossomSpots, [0, 0, 627, 627]],
  ['fan', '長柄扇', ['fan-maid'], [635, 0, 619, 627]],
  ['dog', '小犬', ['dog-right', 'dog-left'], [0, 640, 660, 614]],
  ['crane', '鶴', ['crane-center'], [675, 625, 579, 629]]
];

// This reads existing discoveries only. Choosing a personal memento is a later feature.
function discoveredDetails(doc, chapterId) {
  if (chapterId !== 'zanhua') return [];
  try {
    const value = JSON.parse(doc.defaultView.localStorage.getItem('chinese-wally:zanhua-findings:v1') || '{}');
    return zanhuaDetails.filter(([id, , origins]) => origins.includes(value?.[id]));
  } catch { return []; }
}

function detailIllustration(doc, [, title, , rect]) {
  const figure = doc.createElement('figure');
  const ns = 'http://www.w3.org/2000/svg';
  const svg = doc.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', rect.join(' '));
  svg.setAttribute('aria-hidden', 'true');
  const image = doc.createElementNS(ns, 'image');
  image.setAttribute('href', new URL('../art/zanhua/collectibles/atlas-v1.png', import.meta.url).href);
  image.setAttribute('width', '1254'); image.setAttribute('height', '1254');
  svg.append(image);
  const caption = doc.createElement('figcaption'); caption.textContent = title;
  figure.append(svg, caption);
  return figure;
}

export function mountPaintingAlbum(container, collectedChapters, revisit, trigger) {
  const doc = container.ownerDocument;
  const toggle = trigger ?? doc.createElement('button');
  toggle.type = 'button';
  if (!trigger) { toggle.className = 'painting-album-toggle'; toggle.textContent = '觀畫帖'; }
  toggle.setAttribute('aria-haspopup', 'dialog');
  const titleId = 'personal-album-title-' + (trigger ? 'desk' : 'chapter');
  const album = doc.createElement('dialog');
  album.className = 'painting-album personal-album';
  album.setAttribute('aria-labelledby', titleId);
  album.innerHTML = `
    <header class="album-heading"><h2 id="${titleId}">我的觀畫帖</h2>
      <form method="dialog"><button class="painting-album-close" autofocus>合上 <span aria-hidden="true">×</span></button></form>
    </header>
    <div class="album-stage"><div class="album-canvas">
      <picture class="album-paper"><source media="(max-width: 650px)" srcset="${new URL('./assets/album-river-v1/album-portrait.png', import.meta.url).href}"><img src="${new URL('./assets/album-river-v1/album-spread.png', import.meta.url).href}" alt="" draggable="false"></picture>
      <div class="album-spread-content">
        <section class="album-left" aria-label="此卷的觀畫紀念">
          <p class="album-volume-number"></p><h3 class="album-chapter-title"></h3>
          <div class="album-memento"><div class="album-impression" role="img"></div><p>此卷已讀 · 留印於此</p></div>
          <p class="album-inscription">把走過的畫境，留在帖中。</p>
        </section>
        <section class="album-right" aria-label="回望這一卷">
          <p class="album-eyebrow">畫中回望</p><h3 class="album-memory-title"></h3>
          <p class="album-memory-lines"></p>
          <div class="album-findings"><p class="album-journal-label"></p><div class="album-details"></div><p class="album-journal-note"></p></div>
          <button class="album-revisit" type="button">再入此卷 <span aria-hidden="true">→</span></button>
        </section>
      </div>
    </div></div>
    <nav class="album-pagination" aria-label="翻閱已完成的畫卷">
      <button class="album-prev" type="button" aria-label="翻往前一卷">←</button><div class="album-page-tabs"></div>
      <button class="album-next" type="button" aria-label="翻往後一卷">→</button>
    </nav><p class="album-page-status" aria-live="polite"></p>`;
  if (!trigger) container.append(toggle);
  container.append(album);
  const query = s => album.querySelector(s);
  let chapters = [];
  let current = 0;
  let renderId = 0;

  function render(animate = false) {
    const chapter = chapters[current];
    if (!chapter) return;
    const version = ++renderId;
    const memory = memories[chapter.id];
    query('.album-volume-number').textContent = '第' + numbers[current] + '卷';
    query('.album-chapter-title').textContent = chapter.title;
    query('.album-memory-title').textContent = memory.title;
    query('.album-memory-lines').textContent = memory.lines.join('\n');
    const details = discoveredDetails(doc, chapter.id);
    query('.album-journal-label').textContent = details.length ? '見聞冊中，已發現的細節' : '見聞仍在畫中';
    query('.album-details').replaceChildren(...details.map(item => detailIllustration(doc, item)));
    query('.album-journal-note').textContent = details.length ? '回到畫中，可再翻閱見聞冊。' : '再入此卷，翻閱見聞冊，繼續細看。';
    const impression = query('.album-impression');
    void renderArchiveSeal(impression).then(() => {
      if (version === renderId) impression.setAttribute('aria-label', chapter.title + '已收藏的觀畫紀念印');
    });
    query('.album-revisit').setAttribute('aria-label', '重訪《' + chapter.title + '》');
    query('.album-prev').disabled = current === 0;
    query('.album-next').disabled = current === chapters.length - 1;
    query('.album-page-status').textContent = '已收 ' + chapters.length + ' 卷 · 正在翻閱第' + numbers[current] + '卷';
    const tabs = chapters.map((item, i) => {
      const button = doc.createElement('button');
      button.type = 'button'; button.textContent = numbers[i];
      button.setAttribute('aria-label', '翻閱《' + item.title + '》');
      if (i === current) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => { current = i; render(true); queryAllTabs()[i]?.focus({preventScroll: true}); });
      return button;
    });
    query('.album-page-tabs').replaceChildren(...tabs);
    if (animate && !doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      query('.album-spread-content').animate([{opacity: .15, transform: 'translateX(8px)'}, {opacity: 1, transform: 'none'}], {duration: 240, easing: 'ease-out'});
    }
  }
  function queryAllTabs() { return album.querySelectorAll('.album-page-tabs button'); }
  function refresh() {
    chapters = collectedChapters();
    toggle.hidden = chapters.length === 0;
    current = Math.max(0, Math.min(current, chapters.length - 1));
    if (album.open) render();
  }
  query('.album-prev').addEventListener('click', () => { if (current > 0) { current--; render(true); } });
  query('.album-next').addEventListener('click', () => { if (current < chapters.length - 1) { current++; render(true); } });
  query('.album-revisit').addEventListener('click', () => { const chapter = chapters[current]; album.close(); if (chapter) revisit(chapter); });
  toggle.addEventListener('click', () => {
    refresh(); if (!chapters.length || album.open) return;
    render(); album.showModal();
  });
  refresh();
  return refresh;
}
