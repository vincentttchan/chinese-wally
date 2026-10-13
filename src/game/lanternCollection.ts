import { lanternLampLocations } from './lanternLampLocations.ts';
import { assetPath } from './assets.ts';
import { lanternActors, lanternLocation, lanternSize } from './lanternFestival.ts';
import type { ArtCrop } from './lanternFestival.ts';
import type { SceneActor } from './level.ts';
import { lanternScrollPlacement } from './lanternScrollPlacement.ts';

export type LanternFinding = {
  id: string; court: number; title: string; teaser: string; crop: ArtCrop;
  actor: SceneActor; quote: string; observe: string; note: string; next: string;
  collectible?: {image: string; title: string; caption: string};
};
/** These collectible illustrations are interpretations; observations use the original scroll. */
export const lanternJournalAtlas = assetPath('art/collectibles/lantern-journal-atlas-v1.png');
export const lanternJournalItems: Record<string,{index:number;title:string;mystery:string}> = {
  fireworks:{index:0,title:'一點元宵火光',mystery:'一點火光'},
  'standing-lamp':{index:1,title:'元宵花燈',mystery:'一盞燈影'},
  fish:{index:2,title:'魚形燈的祝願',mystery:'一尾游魚'},
  market:{index:3,title:'宮中的貨郎擔',mystery:'一擔小物'},
  acrobat:{index:4,title:'輪上的童子',mystery:'一場巧技'},
  costume:{index:5,title:'演出中的裝扮',mystery:'一身戲裝'},
};
function finding(id: string, court: number, title: string, teaser: string, tileNumber: number,
  rect: ArtCrop['rect'], hit: readonly [number, number, number, number], quote: string, observe: string, note: string, next: string): LanternFinding {
  const tile = lanternScrollPlacement.find(item => item.number === tileNumber)!;
  const [x,y,width,height] = hit;
  const location = lanternLocation(tileNumber,x,y);
  return {id,court,title,teaser,quote,observe,note,next,
    ...(id==='fireworks'?{collectible:{image:assetPath('art/collectibles/lantern-firelight-v1.png'),title:'一點元宵火光',caption:'收藏圖樣 · 依畫中火光創作'}}:{}),
    crop: {image: assetPath(`art/lantern-festival/detail-${tileNumber}.jpg`), sourceWidth: tile.sourceWidth, rect},
    actor: {id: `finding-${id}`, kind: 'observation', name: `畫中細節${court * 2 + (id === 'fireworks' || id === 'fish' || id === 'acrobat' ? 1 : 2)}`,
      x: location.x, y: location.y, width: width * location.scale / lanternSize.width, height: height * location.scale / lanternSize.height},
  };
}
// Quotes invite play; the separate notes describe the visible painting and museum context.
export const lanternFindings: LanternFinding[] = [
  finding('fireworks',0,'庭前的爆竹','一點火光，幾種反應',9,[430,900,390,440],[560,1260,190,190],
    '先別急着找人，看看這邊的火光！', '留意引火的手、地上的爆竹，以及旁邊人物的反應。',
    '爆竹出現在皇帝觀看的庭前。細小的火光和人物的動作，一起帶出元宵的熱鬧。', '這一庭院還有一盞立在地上的花燈。'),
  finding('standing-lamp',0,'元宵花燈','尋找不同形狀的花燈',17,[485,140,185,365],[580,320,175,350],
    '這盞燈的花樣，你可看清了？', '比較燈面、支架與垂飾，找找長卷裡不同形狀的花燈。',
    '燈面、支架與垂飾都有細線描繪。花燈既是節慶陳設，也讓我們近看畫家的細緻筆法。', '往別的庭院走走，花燈還會換一種模樣。'),
  finding('fish',1,'魚形燈的祝願','一條離開水面的魚',4,[840,1030,385,320],[1000,1170,260,150],
    '魚兒不用下水，也能來鬧元宵！', '看看魚的形狀，還有上方連着提竿的細線。',
    '這是魚形燈。國博介紹它寓意「年年有餘」；同一庭院另有象形燈，寄託「太平有象」的願望。', '這一庭院也有一副裝滿小物的貨郎擔。'),
  finding('market',1,'宮中的貨郎擔','一副裝滿小物的擔子',18,[45,430,705,650],[350,815,530,540],
    '先看一眼這副擔子，東西可不少呢。', '沿着擔子找一找：燈、玩具和小物，怎樣擺在一起？',
    '畫中宮苑仿設街市，貨郎擔吸引童子圍看。這是宮廷安排的節慶場景，不能直接當作民間街市的實況。', '再往表演的庭院看看，有人的姿勢十分出奇。'),
  finding('acrobat',2,'輪上的童子','一個意想不到的立足點',10,[740,210,295,515],[890,380,200,330],
    '先看他站在哪裡，再看看下面的人！', '上面的童子站在輪上，下面的人如何把輪托起？',
    '畫家仔細交代上下兩人的姿勢與配合。從這一處雜耍，可以觀察人物動作如何帶出表演的驚險。', '這一庭院還有人以特別的裝扮參與演出。'),
  finding('costume',2,'演出中的裝扮','兩種不同的演出裝扮',5,[955,1000,290,330],[1090,1140,240,320],
    '看熱鬧，也別錯過我們的裝扮呀。', '比較兩人的帽子、衣服和手中物件，有哪些不同？',
    '國博介紹這一段包含化裝演出與各式雜耍。人物不同的衣飾、神態和動作，讓表演場面各有情趣。', '回看這場元宵，你還注意到哪些細小的動作？'),
];
const storageKey = 'chinese-wally:lantern-findings:v1';
export function loadLanternFindings(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(saved) ? [...new Set(saved.filter((id): id is string => typeof id === 'string' && lanternFindings.some(item => item.id === id)))] : [];
  } catch {return [];}
}
export function saveLanternFindings(ids: string[]) {try {localStorage.setItem(storageKey,JSON.stringify(ids));} catch { /* The current visit still retains its discoveries. */ }}

// Explicit evidence links: nearby bystanders and different lamp/acrobat types do not qualify.
const relatedPeople: Record<string, readonly string[]> = {
  fireworks: [...Array.from({length:16},(_,i)=>`court-one-${i+2}`),'court-one-19','extra-8-4'],
  'standing-lamp':['court-one-0','festival-person-4','extra-7-4','extra-11-3','extra-11-4','extra-11-7','extra-12-3'],
  fish:['festival-person-10'],
  market:[...[0,1,2,3,5,6,7,8,9].map(i=>`festival-person-${i}`),'extra-15-8','extra-15-10','extra-15-11'],
  acrobat:['festival-person-12','festival-person-13'],
  costume:[...[22,23,24].map(i=>`festival-person-${i}`),...[8,9,10,11,12,13,14].map(i=>`extra-11-${i}`),
    ...[1,2,3,4].map(i=>`extra-3-${i}`),...[8,9,10,12].map(i=>`extra-7-${i}`)],
};
const secondMarket = finding('market',1,'宮中的貨郎擔','另一副裝滿小物的擔子',15,[680,950,440,410],[900,1140,440,350],
  '這一副擔子，也有不少小物。','看看兩邊的箱子、上方的燈，以及圍看的人。',
  lanternFindings.find(item=>item.id==='market')!.note,'別的庭院還藏着不同的元宵見聞。');
secondMarket.actor.id='finding-market-second';
const lampFindings = lanternLampLocations.map(([tile,x,y,width,height],index) => {
  const base=lanternFindings.find(item=>item.id==='standing-lamp')!;
  const item=finding('standing-lamp',base.court,base.title,base.teaser,tile,
    [Math.max(0,x-width/2),Math.max(0,y-height/2),width,height],[x,y,width,height],
    '這裡也有花燈，看看它的模樣。',base.observe,base.note,base.next);
  item.actor.id=`finding-lamp-${tile}-${index}`;
  item.actor.name=`花燈細節 ${index+1}`;
  return item;
});
export const lanternAdditionalFindingActors = [secondMarket.actor,...lampFindings.map(item=>item.actor)];
export function lanternFindingAt(actorId: string): LanternFinding | undefined {
  if(actorId===secondMarket.actor.id)return secondMarket;
  const lamp=lampFindings.find(item=>item.actor.id===actorId);
  if(lamp)return lamp;
  const item=lanternFindings.find(value=>value.actor.id===actorId || relatedPeople[value.id]?.includes(actorId));
  if(!item)return;
  const actor=lanternActors.find(value=>value.id===actorId);
  return actor ? {...item,actor} : item;
}
export type LanternFindingOrigins = Record<string,string>;
const originsKey='chinese-wally:lantern-finding-origins:v1';
export function loadLanternFindingOrigins(): LanternFindingOrigins {
  try {
    const saved:unknown=JSON.parse(localStorage.getItem(originsKey)??'{}');
    if(!saved || typeof saved!=='object' || Array.isArray(saved))return {};
    return Object.fromEntries(Object.entries(saved).filter(([id,actor])=>typeof actor==='string' && lanternFindingAt(actor)?.id===id));
  }catch{return {};}
}
export function saveLanternFindingOrigins(origins:LanternFindingOrigins) {
  try{localStorage.setItem(originsKey,JSON.stringify(origins));}catch{/* Keep this visit's location in memory. */}
}
export function lanternFindingFromOrigin(item:LanternFinding, origins:LanternFindingOrigins) {
  const found=lanternFindingAt(origins[item.id]);
  return found?.id===item.id ? found : item;
}
