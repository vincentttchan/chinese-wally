import { assetPath } from './assets.ts';
import type { PaintingTile, SceneActor } from './level.ts';
import { lanternExtraPeople } from './lanternExtraPeople.ts';
import { lanternScrollPlacement } from './lanternScrollPlacement.ts';

export type ArtCrop = {image: string; sourceWidth: number; rect: readonly [number, number, number, number]};
export type LanternTarget = {id: string; detail: ArtCrop; head: ArtCrop; portrait: ArtCrop; action: string; discovery: string; region: {x: number; y: number}};
export const lanternSize = {width: 9781, height: 651};
const art = (name: string) => assetPath(`art/lantern-festival/${name}.jpg`);
export const lanternFullScroll = art('full-scroll');
// Recognition illustration only; the historical painting and evidence crops stay original.
export const lanternAppearanceCard = assetPath('art/ui/lantern-search-note-v4.png');
export const lanternFaceIllustration = assetPath('art/portraits/xianzong-recognition-v2.png') + '?v=2';
function projectiveCSS(matrix: number[][]) {
  const h = matrix;
  return `matrix3d(${[h[0][0],h[1][0],0,h[2][0], h[0][1],h[1][1],0,h[2][1], 0,0,1,0, h[0][2],h[1][2],0,h[2][2]].join(',')})`;
}
export const lanternTiles: PaintingTile[] = lanternScrollPlacement.map(tile => ({
  id: `original-${tile.number}`, image: art(`detail-${tile.number}`),
  x: 0, y: 0,
  width: tile.sourceWidth / lanternSize.width, height: tile.sourceHeight / lanternSize.height,
  transform: projectiveCSS(tile.matrix),
}));
const crop9 = (rect: ArtCrop['rect']): ArtCrop => ({image: art('detail-9'), sourceWidth: 1296, rect});
const crop1 = (rect: ArtCrop['rect']): ArtCrop => ({image: art('detail-1'), sourceWidth: 1296, rect});
const crop5 = (rect: ArtCrop['rect']): ArtCrop => ({image: art('detail-5'), sourceWidth: 1254, rect});

function location(number: number, x: number, y: number) {
  const tile = lanternScrollPlacement.find(item => item.number === number)!;
  const scale = tile.width / tile.sourceWidth;
  const h = tile.matrix, denominator = h[2][0] * x + h[2][1] * y + h[2][2];
  return {x: (h[0][0] * x + h[0][1] * y + h[0][2]) / denominator / lanternSize.width,
    y: (h[1][0] * x + h[1][1] * y + h[1][2]) / denominator / lanternSize.height, scale};
}
export const lanternTargets: LanternTarget[] = [
  {id: 'emperor-first', detail: crop9([1130, 350, 80, 92]), head: crop9([1110, 290, 120, 160]), portrait: crop9([1000, 300, 280, 345]),
    action: '再留意深色袍服，以及坐着觀看的姿勢。', discovery: '這是明憲宗，正坐在黃幔下觀看爆竹。', region: location(9, 900, 750)},
  {id: 'emperor-second', detail: crop1([355, 505, 75, 96]), head: crop1([335, 450, 115, 160]), portrait: crop1([270, 450, 230, 335]),
    action: '這次他站着，雙手放在腰旁。再比對袍服紋樣。', discovery: '同一位皇帝，換上龍袍站在石台旁觀看宮中街市。', region: location(1, 600, 750)},
  {id: 'emperor-third', detail: crop5([80, 435, 70, 95]), head: crop5([55, 385, 115, 160]), portrait: crop5([10, 385, 220, 345]),
    action: '這次他穿淺黃色袍服，坐在帳幔下觀看。', discovery: '皇帝再次坐於帳幔下，前庭安排了表演。', region: location(5, 450, 750)},
];

export type LanternObservation = {
  study: ArtCrop;
  artTitle: string; artText: string;
  historyTitle: string; historyText: string;
};
// The art readings below describe visible evidence, rather than assigning an
// undocumented intention to the painter. Court context follows the museum.
export const lanternObservations: Record<string, LanternObservation> = {
  'emperor-first': {
    study: crop9([960, 270, 336, 440]),
    artTitle: '細線與設色，一起描繪人物',
    artText: '輪廓、衣褶和紋樣由細密線條描繪，設色又幫助區分衣袍與周圍景物。從這些細節，可以觀察畫作精細的表現方式。',
    historyTitle: '皇帝觀看，庭院燃放',
    historyText: '這是明憲宗。國博介紹他戴便帽、坐在黃幔下觀看；前庭的太監與男女童子燃放爆竹，呈現宮廷元宵的熱鬧。',
  },
  'emperor-second': {
    study: crop1([180, 330, 1000, 1050]),
    artTitle: '用建築，安排觀看的層次',
    artText: '台階與欄杆的斜線連起不同高度，門窗與地磚的細線描繪建築。人物放在其中，讓我們讀出誰在觀看、活動在哪裡發生。',
    historyTitle: '宮中，也仿設民間街市',
    historyText: '憲宗換上黃色龍袍，站在殿前石台旁觀看。這一庭院仿設街市，呈現元宵節俗；它是宮廷對街市生活的安排，不能直接當作民間實況。',
  },
  'emperor-third': {
    study: crop5([0, 350, 1254, 1100]),
    artTitle: '讓同一人物，在長卷裡再次出現',
    artText: '皇帝在不同庭院先後出現，紅牆把場景分段。隨着左右展卷，我們把不同活動連起來讀，感受事情逐步展開。',
    historyTitle: '宮廷元宵，還有表演',
    historyText: '這一段的憲宗穿淺黃色龍袍，坐在帳幔下觀看；庭院安排了化裝表演與各式雜耍。爆竹、街市與表演，共同構成畫中的行樂生活。',
  },
};

// Fictional dialogue connects the search stages; it is not a historical quotation.
export const lanternJourneyClues = [
  {quote: '聽聞宮裡擺起了買賣，朕也想去看看。', lines: ['聽聞宮裡擺起了買賣，', '朕也想去看看。'], trail: '他提起宮裡的買賣。'},
  {quote: '買賣看過了，再去瞧瞧獻藝的熱鬧。', lines: ['買賣看過了，', '再去瞧瞧獻藝的熱鬧。'], trail: '他想去看看獻藝的熱鬧。'},
];

export const lanternEmperorScenes = [
  {id: 'first', label: '第一庭院', activity: '觀看爆竹', overviewX: .943,
    portrait: crop9([1000, 300, 280, 345]),
    text: '戴便帽，坐在黃幔下。前庭的人正在燃放爆竹；這是最先探索的庭院。'},
  {id: 'second', label: '第二庭院', activity: '觀賞宮中街市', overviewX: .655,
    portrait: {image: art('detail-1'), sourceWidth: 1296, rect: [270, 450, 230, 335]} as ArtCrop,
    text: '換上黃色龍袍，站在殿前石台旁，觀看庭院中的活動。宮中仿設街市，呈現元宵節俗。'},
  {id: 'third', label: '第三庭院', activity: '觀看表演', overviewX: .056,
    portrait: {image: art('detail-5'), sourceWidth: 1254, rect: [10, 385, 220, 345]} as ArtCrop,
    text: '穿淺黃色龍袍，再次坐於帳幔下觀看。這一段的庭院中，安排了化裝表演與各式雜耍。'},
];
function person(id: string, number: number, x: number, y: number, width: number, height: number, index: number): SceneActor {
  const point = location(number, x, y);
  return {id, kind: 'candidate', name: `畫中人物${index}`, x: point.x, y: point.y,
    width: width * point.scale / lanternSize.width, height: height * point.scale / lanternSize.height};
}
// Neutral names and nearby distractors keep the accessible controls from naming answers.
const firstCourtPeople = [
  [52,390,90,285], [108,510,125,275], [393,447,110,248], [46,854,82,268],
  [249,952,135,240], [505,807,145,228], [651,870,130,275], [838,960,175,250],
  [1180,951,110,260], [1030,1200,135,280], [1200,1350,100,205], [1394,1052,100,190],
  [1460,956,120,180], [1502,1128,155,225], [1892,1028,135,222], [2110,991,150,276],
  [1897,1203,130,215], [2210,1280,172,205], [2575,1170,115,240], [2623,1247,110,260],
  [2738,1190,145,268], [2942,1336,128,217], [3148,1280,210,225],
];
export const lanternActors: SceneActor[] = [
  ...firstCourtPeople.map(([x,y,w,h], i) => x < 1183
    ? person(`court-one-${i}`,17,x*1231/1238,y*1491/1500,w*1231/1238,h*1491/1500,i+1)
    : person(`court-one-${i}`,x < 2350 ? 9 : 2,x-(x < 2350 ? 1183 : 2350),y,w,h,i+1)),
  person('emperor-first',9,1150,485,205,330,24),
  person('emperor-second',1,390,620,185,300,25),
  person('emperor-third',5,115,555,200,300,26),
  ...[[640,600],[720,560],[780,620],[1030,900],[900,1030],[300,1130],[164,1330]].map(([x,y],i) => person(`court-two-${i}`,1,x,y,100,190,27+i)),
  ...[[660,300],[815,290],[890,340],[1120,460],[1160,530],[420,1270],[570,1270],[640,1350]].map(([x,y],i) => person(`court-three-${i}`,5,x,y,100,190,34+i)),

  ...[[18,390,850],[18,660,820],[18,535,940],[18,640,960],[18,505,1260],
    [4,260,950],[4,610,960],[4,780,1080],[4,860,880],[4,930,880],[4,1110,1190],
    [10,600,800],[10,900,320],[10,880,580],[10,1140,610],[10,380,800],[10,120,940],
    [10,450,1000],[10,570,1280],[10,800,1220],[10,1120,1240],[10,1180,180],
    [5,1030,865],[5,1050,1130],[5,1140,1140]].map(([tile,x,y],i) => person(`festival-person-${i}`,tile,x,y,110,230,42+i)),
  ...lanternExtraPeople.map((item,i) => person(item.id,item.tile,item.x,item.y,item.width,item.height,67+i)),
];

export const lanternCourtMarkers = [
  {label: '高台', ...location(1, 490, 940), offset: {x: 42, y: -12}},
  {label: '庭院', ...location(1, 440, 1300), offset: {x: -60, y: 8}},
];

export const lanternSources = [
  {label: '中國國家博物館：元宵專題', href: 'https://www.chnmuseum.cn/portals/0/web/zt/202102yuaxiao/'},
  {label: '國博研究：畫中的元宵活動', href: 'https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_36656.shtml'},
  ...lanternScrollPlacement.map(tile => tile.number).map(n => ({label: `原畫局部圖 ${n} · Wikimedia Commons`, href: `https://commons.wikimedia.org/wiki/File:明憲宗元宵行樂圖${n}.jpg`})),
  {label: '全卷圖 · Wikimedia Commons', href: 'https://commons.wikimedia.org/wiki/File:Ming_Emperor_Xianzong_Enjoying_the_Lantern_Festival_(Ming_Dynasty).jpg'},
];

export {location as lanternLocation};
