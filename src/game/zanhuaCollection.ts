import {assetPath} from './assets.ts';
import type {SceneActor} from './level.ts';
import type {Point,Size} from './geometry.ts';
import type {LanternFinding} from './lanternCollection.ts';
import type {CollectionArtwork} from '../components/LanternCollectionImage.tsx';
import type {JournalEdition} from '../components/LanternJournal.tsx';
import {zanhuaImage,zanhuaPeople,zanhuaSource} from './zanhuaPreview.ts';

export type ZanhuaCategory='blossom'|'fan'|'dog'|'crane';
export type ZanhuaOrigins=Partial<Record<ZanhuaCategory,string>>;
type Spot={category:ZanhuaCategory;actor:SceneActor;crop:readonly [number,number,number,number];polygon:number[][]};
function spot(id:string,category:ZanhuaCategory,name:string,rect:number[],polygon?:number[][]):Spot{
 const [x,y,w,h]=rect;
 return {category,actor:{id,name,kind:'object',x:(x+w/2)/6455,y:(y+h/2)/1378,width:w/6455,height:h/1378},crop:[x,y,w,h],polygon:polygon??[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]};
}
/** Complete inventory of the four chosen categories: five head flowers, one fan, two dogs, one crane. */
export const zanhuaSpots:Spot[]=[
 spot('blossom-P1','blossom','垂首女子的簪花',[5430,0,350,150]),
 spot('blossom-P2','blossom','抬手女子的簪花',[4490,0,280,125]),
 spot('blossom-P4','blossom','持花女子的簪花',[2900,0,330,150]),
 spot('blossom-P5','blossom','紅衣女子的簪花',[1750,155,245,145]),
 spot('blossom-P6','blossom','斜首女子的簪花',[1200,0,290,155]),
 spot('fan-maid','fan','侍女的長柄扇',[3550,385,620,565],[[3855,500],[3890,440],[3980,390],[4075,395],[4155,450],[4160,520],[4130,580],[4050,625],[3910,638],[3605,935],[3568,910],[3865,582],[3855,555]]),
 spot('dog-right','dog','卷右的小犬',[4900,995,250,165],[[4900,1115],[4920,1068],[4965,1063],[5002,1031],[5055,1018],[5098,1041],[5124,1024],[5140,1056],[5110,1090],[5125,1126],[5050,1154],[4995,1140],[4930,1143]]),
 spot('dog-left','dog','卷左的小犬',[1865,1175,290,175],[[1875,1240],[1880,1210],[1920,1190],[1975,1195],[2010,1210],[2070,1180],[2140,1190],[2145,1240],[2110,1265],[2145,1305],[2105,1315],[2055,1280],[2010,1280],[1980,1335],[1910,1340],[1900,1300],[1870,1270]]),
 spot('crane-center','crane','畫中的鶴',[2215,815,500,540],[[2225,875],[2300,842],[2340,820],[2385,835],[2395,875],[2360,920],[2440,855],[2560,865],[2685,915],[2700,960],[2600,955],[2660,1030],[2615,1115],[2570,1170],[2580,1300],[2630,1320],[2600,1350],[2510,1320],[2540,1305],[2535,1180],[2505,1175],[2440,1250],[2430,1290],[2400,1295],[2400,1240],[2480,1160],[2420,1100],[2370,1050],[2300,1010],[2265,965],[2285,915],[2345,875]]),
];
export const zanhuaSpot=(id:string)=>zanhuaSpots.find(s=>s.actor.id===id);

const atlas=assetPath('art/zanhua/collectibles/atlas-v1.png');
const frame=(rect:readonly [number,number,number,number])=>({image:atlas,width:1254,height:1254,rect});
export const zanhuaCollectionItems:Record<string,CollectionArtwork>={
 blossom:{index:0,title:'簪花',mystery:'髮髻上的花',frame:frame([0,0,627,627])},
 fan:{index:1,title:'長柄扇',mystery:'手邊的一縷風',frame:frame([635,0,619,627])},
 dog:{index:2,title:'小犬',mystery:'腳邊的小伙伴',frame:frame([0,640,660,614])},
 crane:{index:3,title:'鶴',mystery:'長頸與細足',frame:frame([675,625,579,629])},
};
const texts:Record<ZanhuaCategory,{court:number;observe:string;note:string;next:string}>={
 blossom:{court:0,observe:'花朵簪在髮髻上，與細小髮飾並置。',note:'五位女子的頭上都可見花飾。花的形狀與髮飾的位置各有差異，是比對人物裝扮的線索。這裡只收藏髮髻上的簪花，不把手中花或花樹算作同一類。',next:'再看看執扇侍女的髮髻，有甚麼不同？'},
 fan:{court:1,observe:'一根長柄連着橢圓扇面，扇面上也有花葉線條。',note:'侍女以雙手持着長柄扇。順着長柄追看，就能把人物手勢與器物連起來；扇面上的裝飾則要靠近原畫細看。',next:'看看人物手中還拿着甚麼。'},
 dog:{court:2,observe:'小犬身上可見濃密毛髮與紅色繫帶。',note:'全畫有兩隻小犬，分布在不同女子附近。牠們的朝向與人物的動作相互呼應；發現另一隻仍可比較，但收藏只記一次。',next:'另一段畫面裡，也有一位毛茸茸的小伙伴。'},
 crane:{court:2,observe:'鶴彎曲的長頸、羽翼與細足，都由線條交代。',note:'畫中這隻鶴與兩隻小犬一起，讓人物之間的空位也有可看的細節。先看牠的姿態，再看與周圍人物的距離，不用替畫中動物補上沒有依據的故事。',next:'動物附近的人物，正做着甚麼？'},
};
export const zanhuaCategories=Object.keys(texts) as ZanhuaCategory[];
export function zanhuaFindings(origins:ZanhuaOrigins):LanternFinding[]{
 return zanhuaCategories.map(id=>{
  const location=zanhuaSpot(origins[id]??'')??zanhuaSpots.find(s=>s.category===id)!;
  return {id,title:zanhuaCollectionItems[id].title,teaser:zanhuaCollectionItems[id].mystery,quote:'',...texts[id],crop:{image:zanhuaImage,sourceWidth:6455,rect:location.crop},actor:location.actor};
 });
}
export const zanhuaJournalEdition:JournalEdition={title:'簪花見聞冊',introduction:'把衣飾、器物與小動物，收成自己的畫中見聞。',emptyHint:'回到畫中，點點髮髻上的花、扇子或小動物。',courts:['髮髻與裝扮','手勢與器物','畫中動物'],items:zanhuaCollectionItems,sourceUrl:zanhuaSource,sourceLabel:'《簪花仕女圖》完整原畫與來源',sourceNote:'左側為原畫；收藏圖樣是依畫中細節製作的遊戲插畫，不當作原畫證據。詳情回看的位置，是你首次發現這一類見聞的地方。',illustrationCaption:'依原畫創作的收藏圖樣',souvenirTitle:'我的簪花見聞',souvenirBody:'從髮髻上的花，到長柄扇、小犬與鶴，你已看見人物之外的細節。',souvenirObserve:'這些細節讓衣飾、動作與身邊的小伙伴，在畫中有了聯繫。',souvenirSource:'《簪花仕女圖》 · 遼寧省博物館藏'};

const storageKey='chinese-wally:zanhua-findings:v1';
export function loadZanhuaOrigins():ZanhuaOrigins{
 try{const value:unknown=JSON.parse(localStorage.getItem(storageKey)??'{}');if(!value||typeof value!=='object'||Array.isArray(value))return{};
  const origins:ZanhuaOrigins={};
  for(const [category,id] of Object.entries(value)){if(typeof id!=='string')continue;const location=zanhuaSpot(id);if(location&&location.category===category)origins[location.category]=id;}
  return origins;
 }catch{return{};}
}
export function saveZanhuaOrigins(origins:ZanhuaOrigins){try{localStorage.setItem(storageKey,JSON.stringify(origins));return true;}catch{return false;}}

function inside(point:Point,polygon:number[][]){
 let result=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const [x,y]=polygon[i],[u,v]=polygon[j];
  if((y>point.y)!==(v>point.y)&&point.x<(u-x)*(point.y-y)/(v-y)+x)result=!result;
 }
 return result;
}
function nearOutline(point:Point,polygon:number[][],radius:number){
 return polygon.some(([x,y],i)=>{
  const [u,v]=polygon[(i+1)%polygon.length],dx=u-x,dy=v-y;
  const t=Math.max(0,Math.min(1,((point.x-x)*dx+(point.y-y)*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(point.x-x-t*dx,point.y-y-t*dy)<=radius;
 });
}
/** Object outlines win over people; touch expansion is only used after painted bounds. */
export function resolveZanhuaHit(world:Point,scale:number,size:Size,actors:SceneActor[]){
 const p={x:world.x*6455/size.width,y:world.y*1378/size.height};
 const collection=zanhuaSpots.find(s=>inside(p,s.polygon));if(collection)return collection.actor;
 const contains=(a:SceneActor,padded:boolean)=>Math.abs(world.x-a.x*size.width)<=Math.max(a.width*size.width,padded?44/scale:0)/2&&Math.abs(world.y-a.y*size.height)<=Math.max(a.height*size.height,padded?44/scale:0)/2;
 const painted=zanhuaPeople.filter(p=>contains(p,false));
 if(painted.length)return painted.sort((a,b)=>Math.hypot(world.x-a.x*size.width,world.y-a.y*size.height)-Math.hypot(world.x-b.x*size.width,world.y-b.y*size.height))[0];
 const expanded=actors.filter(a=>{
  if(!contains(a,true))return false;
  const location=zanhuaSpot(a.id);
  // A diagonal handle's bounding box includes a large unpainted triangle.
  return !location||nearOutline(p,location.polygon,22*6455/size.width/scale);
 });
 return expanded.sort((a,b)=>Math.hypot(world.x-a.x*size.width,world.y-a.y*size.height)-Math.hypot(world.x-b.x*size.width,world.y-b.y*size.height))[0]??null;
}
