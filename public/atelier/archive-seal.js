// Use the same inscription, font and frame as the in-painting souvenir seal.
export async function renderArchiveSeal(container) {
  const doc = container.ownerDocument;
  let inscription = '觀畫留記';
  try { inscription = doc.defaultView.localStorage.getItem('chinese-wally:atelier:zanhua-seal:v1') || inscription; } catch {}
  inscription = Array.from(inscription).slice(0, 4).join('');
  container.setAttribute('aria-label', '簪花仕女圖已收藏 · ' + inscription);
  const family = 'Atelier Chong Xi Seal';
  const fontUrl = new URL('../fonts/chongxi/chongxi_seal.otf', import.meta.url);
  try {
    const font = new doc.defaultView.FontFace(family, 'url("' + fontUrl.href + '")');
    doc.fonts.add(await font.load());
  } catch {}
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = doc.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  const frame = doc.createElementNS(namespace, 'image');
  frame.setAttribute('href', new URL('../art/zanhua/seal/collector-frame-v3.png', import.meta.url).href);
  frame.setAttribute('x', '-5');
  frame.setAttribute('y', '-5');
  frame.setAttribute('width', '110');
  frame.setAttribute('height', '110');
  svg.append(frame);
  const letters = Array.from(inscription);
  const cells = letters.length === 1 ? [[12,10,76,80]] : letters.length === 2 ? [[53,10,37,80],[10,10,37,80]] : letters.length === 3 ? [[53,10,37,80],[10,10,37,37],[10,53,37,37]] : [[53,10,37,37],[53,53,37,37],[10,10,37,37],[10,53,37,37]];
  const context = doc.createElement('canvas').getContext('2d');
  context.font = '100px "' + family + '", serif';
  letters.forEach((letter, index) => {
    const metrics = context.measureText(letter);
    const cell = doc.createElementNS(namespace, 'svg');
    ['x','y','width','height'].forEach((attribute, position) => cell.setAttribute(attribute, cells[index][position]));
    cell.setAttribute('viewBox', [-metrics.actualBoundingBoxLeft, -metrics.actualBoundingBoxAscent, metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent].join(' '));
    cell.setAttribute('preserveAspectRatio', 'none');
    const text = doc.createElementNS(namespace, 'text');
    text.setAttribute('font-family', '"' + family + '", serif');
    text.setAttribute('font-size', '100');
    text.setAttribute('fill', '#b34539');
    text.textContent = letter;
    cell.append(text);
    svg.append(cell);
  });
  container.replaceChildren(svg);
}
