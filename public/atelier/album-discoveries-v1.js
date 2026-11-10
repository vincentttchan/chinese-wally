// Same category IDs and illustrations as each chapter's findings journal.
// Reading this module never awards, selects, migrates or writes a collectible.
const url = path => new URL('../art/' + path, import.meta.url).href;
const zanhuaAtlas = url('zanhua/collectibles/atlas-v1.png');
const lanternAtlas = url('collectibles/lantern-journal-atlas-v1.png');
const frame = (image, width, height, rect) => ({image, width, height, rect});
const zanhua = [
  {id:'blossom',title:'簪花',origins:['blossom-P1','blossom-P2','blossom-P4','blossom-P5','blossom-P6'],frame:frame(zanhuaAtlas,1254,1254,[0,0,627,627])},
  {id:'fan',title:'長柄扇',origins:['fan-maid'],frame:frame(zanhuaAtlas,1254,1254,[635,0,619,627])},
  {id:'dog',title:'小犬',origins:['dog-right','dog-left'],frame:frame(zanhuaAtlas,1254,1254,[0,640,660,614])},
  {id:'crane',title:'鶴',origins:['crane-center'],frame:frame(zanhuaAtlas,1254,1254,[675,625,579,629])}
];
const lantern = [
  {id:'fireworks',title:'一點元宵火光',frame:frame(lanternAtlas,1536,1024,[0,0,512,512])},
  {id:'standing-lamp',title:'元宵花燈',frame:frame(lanternAtlas,1536,1024,[512,0,512,512])},
  {id:'fish',title:'魚形燈的祝願',frame:frame(lanternAtlas,1536,1024,[1024,0,512,512])},
  {id:'market',title:'宮中的貨郎擔',frame:frame(lanternAtlas,1536,1024,[0,512,512,512])},
  {id:'acrobat',title:'輪上的童子',frame:frame(lanternAtlas,1536,1024,[512,512,512,512])},
  {id:'costume',title:'和尚戲裝',frame:frame(url('animations/lantern-monk/monk-poses-v1.png'),2172,724,[55,85,470,610]),alphaStudy:true},
  {id:'stove',title:'爐旁取暖',image:url('collectibles/lantern-stove-v2.png'),alphaStudy:true},
  {id:'zhongkui',title:'鍾馗戲裝',image:url('collectibles/lantern-zhongkui-v1.png'),alphaStudy:true}
];

export function discoveredDetails(doc, chapterId) {
  try {
    const storage = doc.defaultView.localStorage;
    if (chapterId === 'zanhua') {
      const value = JSON.parse(storage.getItem('chinese-wally:zanhua-findings:v1') || '{}');
      return zanhua.filter(item => item.origins.includes(value?.[item.id]));
    }
    if (chapterId === 'lantern-festival') {
      const value = JSON.parse(storage.getItem('chinese-wally:lantern-findings:v1') || '[]');
      if (!Array.isArray(value)) return [];
      const ids = new Set(value.filter(id => typeof id === 'string'));
      return lantern.filter(item => ids.has(item.id));
    }
  } catch { /* Malformed or unavailable storage does not invent a discovery. */ }
  return [];
}

let illustrationId = 0;
export function detailIllustration(doc, item) {
  const figure = doc.createElement('figure');
  figure.dataset.findingId = item.id;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = doc.createElementNS(ns,'svg');
  const dimensions = item.frame ?? {image:item.image,width:1,height:1,rect:[0,0,1,1]};
  svg.setAttribute('viewBox', dimensions.rect.join(' '));
  svg.setAttribute('aria-hidden','true');
  if (item.alphaStudy) {
    const id = 'album-study-alpha-' + ++illustrationId;
    const defs = doc.createElementNS(ns,'defs');
    const filter = doc.createElementNS(ns,'filter');filter.id = id;
    filter.setAttribute('color-interpolation-filters','sRGB');
    const transfer = doc.createElementNS(ns,'feComponentTransfer');
    const alpha = doc.createElementNS(ns,'feFuncA');
    alpha.setAttribute('type','linear');alpha.setAttribute('slope','1.333333');alpha.setAttribute('intercept','-.333333');
    transfer.append(alpha);filter.append(transfer);defs.append(filter);svg.append(defs);
    svg.dataset.artFilter = id;
  }
  const image = doc.createElementNS(ns,'image');
  image.setAttribute('href',dimensions.image);image.setAttribute('width',String(dimensions.width));image.setAttribute('height',String(dimensions.height));
  if (svg.dataset.artFilter) image.setAttribute('filter','url(#' + svg.dataset.artFilter + ')');
  svg.append(image);
  const caption = doc.createElement('figcaption');caption.textContent=item.title;
  figure.append(svg,caption);return figure;
}
