const covers = {
  zanhua: '../art/zanhua/full-scroll.jpg',
  'lantern-festival': '../art/lantern-festival/detail-9.jpg',
  'kangqu-listening': '../chapters/kangqu-listening/art/overview.jpg'
};

export function mountPaintingAlbum(container, collectedChapters, revisit) {
  const doc = container.ownerDocument;
  const toggle = doc.createElement('button');
  toggle.type = 'button';
  toggle.className = 'painting-album-toggle';
  toggle.textContent = '觀畫帖';
  toggle.setAttribute('aria-haspopup', 'dialog');

  const album = doc.createElement('dialog');
  album.className = 'painting-album';
  album.setAttribute('aria-labelledby', 'painting-album-title');
  album.innerHTML = `
    <header>
      <div>
        <h2 id="painting-album-title">我的觀畫帖</h2>
        <p class="painting-album-count"></p>
      </div>
      <form method="dialog"><button class="painting-album-close" autofocus>關閉</button></form>
    </header>
    <ul class="painting-album-list"></ul>
  `;
  container.append(toggle, album);
  const count = album.querySelector('.painting-album-count');
  const list = album.querySelector('.painting-album-list');

  function refresh() {
    const chapters = collectedChapters();
    toggle.hidden = chapters.length === 0;
    count.textContent = '已收藏 ' + chapters.length + ' 卷';
    list.replaceChildren();

    for (const chapter of chapters) {
      const row = doc.createElement('li');
      const button = doc.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', '重訪《' + chapter.title + '》');
      const artwork = doc.createElement('img');
      artwork.alt = '';
      artwork.loading = 'lazy';
      artwork.src = new URL(covers[chapter.id], import.meta.url).href;
      const title = doc.createElement('span');
      title.textContent = '《' + chapter.title + '》';
      const action = doc.createElement('span');
      action.className = 'painting-album-revisit';
      action.textContent = '重訪 →';
      button.append(artwork, title, action);
      row.append(button);
      list.append(row);
      button.addEventListener('click', () => {
        album.close();
        revisit(chapter);
      });
    }
  }

  toggle.addEventListener('click', () => {
    refresh();
    album.showModal();
  });
  refresh();
  return refresh;
}
