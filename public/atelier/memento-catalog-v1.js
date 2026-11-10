// Read existing chapter discoveries without awarding, migrating or changing them.
import { discoveredDetails as firstTwo } from './album-discoveries-v1.js?v=1';
const publicURL = path => new URL('../' + path, import.meta.url).href;
const paintingSources = {
 zanhua:{label:'原畫影像資料',url:'https://commons.wikimedia.org/wiki/File:Zhou_Fang._Court_Ladies_Wearing_Flowered_Headdresses._(46x180)_Liaoning_Provincial_Museum,_Shenyang..jpg'},
 'lantern-festival':null,
 luoshen:{label:'故宮館藏資料',url:'https://www.dpm.org.cn/collection/paint/234597.html'}
};
const firstCopy = {
 blossom:'花朵簪在高髻上，與金色髮飾相襯。回想畫中女子的盛裝，髻上的花也是她們妝扮的一部分。',
 fan:'侍女雙手握着長柄，扇面斜向上方。同在遊賞的畫面裏，她執扇侍候，與拈花、逗犬的女子各有動作。',
 dog:'小犬出現在女子身旁。順着牠與人物的目光、手勢看，庭園中的一刻便多了一點動靜。',
 crane:'鶴立在女子附近，長頸與細足清晰可見。牠和小犬一起，為人物之間的空間添上生氣。',
 fireworks:'畫中有人俯身引火，也有人站在旁邊觀看。一點火光，連起了上元夜裏不同人物的動作。',
 'standing-lamp':'圓形花燈架在燈座上。沿着燈座向上看，一格格裝飾把庭院妝點得熱鬧。',
 fish:'魚形燈懸在長桿下方。魚的輪廓不只可供玩賞，也讓人聯想到年節裏對富足有餘的祝願。',
 market:'小小貨郎擔上陳列着各式物件。宮中的上元遊樂，也把市集買賣的熱鬧搬到了眼前。',
 acrobat:'童子站在輪上的表演裝置上。留意他和下方器具的關係，便能看出這場遊戲怎樣吸引周圍的人觀看。',
 costume:'這個人物以和尚的裝束參與戲演。畫中可見服飾與姿勢；這張收藏插畫保留了這些線索。',
 stove:'幾個人靠近爐火取暖。熱鬧的上元場面裏，也藏着這樣一個停下來暖身的小片刻。',
 zhongkui:'這個人物扮成鍾馗，衣帽和鬚貌格外醒目。這是節慶戲裝，並非畫中人物的日常衣着。'
};
const kangqu = {"id":"kangqu-listening-v2","version":"2.3.1","collections":[{"id":"flag","title":"儀仗旗","body":"相近的衣著、接連的旗幟和整齊的隊列，構成皇家儀仗。視線沿着旗列伸展，便能看出這場慶典的規模，以及熱鬧之中的禮儀秩序。","source":null,"instances":["flag-upper-1","flag-upper-2","flag-upper-3","flag-upper-4","flag-upper-5","flag-upper-6","flag-upper-7","flag-upper-8","flag-upper-9","flag-lower-1","flag-lower-2","flag-lower-3","flag-lower-4","flag-lower-5","flag-lower-6","flag-lower-7","flag-lower-8","flag-lower-9","flag-lower-10","flag-lower-11","flag-lower-12","flag-lower-13","flag-lower-14","flag-lower-roof-left","flag-lower-roof-right"],"image":"art/animations/kangqu-flags-v2-detail/frames/group-01.png"},{"id":"painted-wall","title":"彩牆吉祥圖樣","body":"盤長寄託福壽綿長，方勝表達同心相合；花葉與結帶，則讓牆面充滿喜慶生意。收下的圖樣、寓意與畫中位置，一起留在這裏。","source":{"label":"故宮：方勝紋的構成","url":"https://www.dpm.org.cn/lemmas/241568.html"},"instances":["wall-1","wall-2","wall-3","wall-4","wall-5","wall-6","wall-7","wall-8","wall-9","wall-10","wall-11","wall-12","wall-13","wall-14"],"image":"chapters/kangqu-listening/collections/painted-wall-illustration-v1.png"},{"id":"ensemble","title":"亭內合奏","body":"六位樂手聚在亭內，吹奏與敲擊各有分工。畫中仔細描繪他們的樂器和姿勢，讓我們從靜止的畫面，也能想像祝壽時的合奏場面。","source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"},"instances":["pavilion-ensemble-six"],"image":"chapters/kangqu-listening-v2/animation/group-master.png"},{"id":"audience","title":"表演與觀看","body":"表演者的裝束與姿勢、周圍人群的不同朝向，再加上彩牆與亭臺，讓街邊成了可供演出和觀看的場所。祝壽的盛況，就在人物與布景的相互呼應中展開。","source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"},"instances":["street-audience"],"image":"art/animations/kangqu-audience-v2-seven/group-master.png"},{"id":"pavilion-stage","title":"亭臺上的身影","body":"為皇太后祝壽，沿途安排戲曲等演出。亭臺讓表演者有演出的地方，也讓觀看的人有所停留；本處不據彩衣指定劇目或角色。","source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"},"instances":[],"image":"chapters/kangqu-listening-v2/expansion-art/stage/collection.png"},{"id":"grotto-music","title":"布景中的樂聲","body":"樂隊也是沿街祝壽安排的一部分。佛手形外框把演奏與造景結合，讓樂手成為可觀看的場面；形狀依原畫描述，曲目及各人姓名未經核定。","source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"},"instances":[],"image":"chapters/kangqu-listening-v2/expansion-art/grotto/collection.png"},{"id":"brocade-gathering","title":"官員賀壽","body":"館藏介紹記載文武群臣聚京祝壽。這組人物的長袍、方形補飾呈現官員形象，與紅衣儀仗、樂手及表演者各有分工；小尺寸補飾不足以核定品級或姓名。","source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"},"instances":[],"image":"chapters/kangqu-listening-v2/expansion-art/revision-2.1.2/officials-collection.png"}],"motifs":[{"id":"motif:jade","title":"雙菱方勝","body":"兩個菱形交疊，是方勝紋的構成方式。這格以綠色菱形、方折線與捲曲纏帶組成裝飾。","instance":"wall-3","image":"chapters/kangqu-listening-v2/expansion-art/revision-2.1.8/jade-collectible.png","box":[333,2394,488,2493],"source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"}},{"id":"motif:fan","title":"結帶紋樣局部","body":"花木遮住了圖樣的一部分，上方結帶、右側回捲線條及下方綠色部分仍然可見。沿着這些相連輪廓，對照牆上的裝飾。","instance":"wall-5","image":"chapters/kangqu-listening-v2/expansion-art/revision-2.1.8/fan-collectible.png","box":[1340,2405,1565,2503],"source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"}},{"id":"motif:lotus","title":"花葉纏帶","body":"粉紅花葉形輪廓向右舒展，下接綠色與粉紅部分；纏帶從兩側捲出。把花葉、相連的形狀與帶子一起看，便能讀出這格裝飾的布局。","instance":"wall-13","image":"chapters/kangqu-listening-v2/expansion-art/revision-2.1.8/lotus-collectible.png","box":[3410,2306,3577,2390],"source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"}},{"id":"motif:basket","title":"雙環結帶","body":"兩個粉紅環形輪廓相疊，綠色纏帶從上方穿繞而下。人物遮住了部分圖樣，插圖保留原畫可見的環形、結帶及下方垂飾。","instance":"wall-14","image":"chapters/kangqu-listening-v2/expansion-art/revision-2.1.8/basket-collectible.png","box":[3620,2308,3778,2420],"source":{"label":"故宮館藏資料","url":"https://www.dpm.org.cn/collection/paint/232815.html"}}],"sideIds":["pavilion-stage","grotto-music","brocade-gathering"]};
const walls = [{"id":"wall-1","box":[0,2417,64,2500]},{"id":"wall-2","box":[115,2398,284,2490]},{"id":"wall-3","box":[333,2394,488,2493]},{"id":"wall-4","box":[546,2398,713,2490]},{"id":"wall-5","box":[1340,2405,1565,2503]},{"id":"wall-6","box":[1594,2405,1668,2476]},{"id":"wall-7","box":[1723,2365,1764,2480]},{"id":"wall-8","box":[1815,2327,1984,2418]},{"id":"wall-9","box":[2030,2330,2180,2418]},{"id":"wall-10","box":[2235,2327,2338,2417]},{"id":"wall-11","box":[2805,2325,2970,2411]},{"id":"wall-12","box":[3060,2320,3120,2375]},{"id":"wall-13","box":[3410,2306,3577,2390]},{"id":"wall-14","box":[3620,2308,3778,2420]}];
const luoshen = [
 ['dragon','龍形',7,'開首可見單獨的龍形，雲車前又有龍形相連。一處伴着神女，一處牽引車駕，位置串起不同的場面。'],
 ['boat','舟船',1,'樓船上層是曹植與同行者，下層是操船的人。沿着上下兩層看，便能分清乘舟尋望與操船的不同角色。'],
 ['canopy','華蓋',5,'隊伍上方的蓋與長柄，是辨認華蓋的線索。它在人間隊伍與雲車附近都出現，與身旁的人物相互呼應。'],
 ['bird','鳥形',3,'開首的鳥在飛，離別處的長頸鳥伴在神女身旁。不同姿態和相伴的人，讓同卷的鳥形各有位置。'],
 ['ribbon','衣帶',14,'長長的衣帶隨人物回轉而彎曲。沿着線條看，可以讀出姿態的變化；衣帶的方向不等同真實風向。'],
 ['beast','神獸',2,'雲車旁的一對淺色神獸，長角和伸展的四肢格外可見。這裏按畫面稱為神獸，具體名稱仍待核實。']
].map(([id,title,count,body])=>({id,title,body,origins:Array.from({length:count},(_,i)=>id+'-'+i),image:publicURL('art/luoshen/collection-'+id+'-cutout.png'),source:paintingSources.luoshen}));
function inside(point,box) { return Array.isArray(point)&&point.length===2&&point.every(Number.isFinite)&&point[0]>=box[0]&&point[0]<=box[2]&&point[1]>=box[1]&&point[1]<=box[3]; }
export function discoveredMementos(doc, chapterId) {
 try {
  const storage=doc.defaultView.localStorage;
  if(chapterId==='zanhua'||chapterId==='lantern-festival') return firstTwo(doc,chapterId).map(item=>({...item,body:firstCopy[item.id],source:paintingSources[chapterId]}));
  if(chapterId==='luoshen') {
   const data=JSON.parse(storage.getItem('painting-luoshen-v1')||'null');
   return data&&[1,2].includes(data.version)?luoshen.filter(item=>item.origins.includes(data.origins?.[item.id])):[];
  }
  if(chapterId==='kangqu-listening') {
   const raw=storage.getItem('chinese-wally:kangqu-listening-v2:journal:v2');
   const data=JSON.parse(raw??storage.getItem('chinese-wally:kangqu-listening-v2:journal:v1')??'null');
   if(!data||data.chapter!=='kangqu-listening-v2'||data.version!==(raw===null?1:2)) return [];
   const items=kangqu.collections.filter(item=>{
    const record=data.items?.[item.id];
    if(kangqu.sideIds.includes(item.id)) return data.version===2&&record?.instance===item.id&&(!data.sideScenes?.[item.id]||data.sideScenes[item.id].completed===true);
    if(item.instances.includes(record?.instance)) return true;
    // The chapter also recovers a wall from an individually recorded motif.
    return item.id==='painted-wall'&&walls.some(w=>[data.wallDetails?.[w.id],...kangqu.motifs.filter(m=>m.instance===w.id).map(m=>data.details?.[m.id.slice(6)])].some(r=>r?.instance===w.id&&inside(r.point,w.box)));
   });
   const motifs=kangqu.motifs.filter(item=>{const r=data.details?.[item.id.slice(6)];return r?.instance===item.instance&&inside(r.point,item.box);});
   return [...items,...motifs].map(item=>({...item,image:publicURL(item.image)}));
  }
 } catch { /* Unavailable or malformed discovery saves never become stickers. */ }
 return [];
}
export const mementoKey='chinese-wally:atelier:mementos:v1';
export function selectedMemento(doc,chapterId) {
 try {
  const saved=JSON.parse(doc.defaultView.localStorage.getItem(mementoKey)||'null');
  return saved?.version===1?discoveredMementos(doc,chapterId).find(item=>item.id===saved.selections?.[chapterId]):undefined;
 } catch { return undefined; }
}
export function saveMemento(doc,chapters,chapterId,itemId) {
 if(!chapters.some(chapter=>chapter.id===chapterId)||!discoveredMementos(doc,chapterId).some(item=>item.id===itemId)) return false;
 try {
  let saved;try{saved=JSON.parse(doc.defaultView.localStorage.getItem(mementoKey)||'null')}catch{}
  const selections={};
  if(saved?.version===1&&saved.selections&&typeof saved.selections==='object') {
   for(const id of ['zanhua','lantern-festival','kangqu-listening','luoshen']) if(typeof saved.selections[id]==='string') selections[id]=saved.selections[id];
  }
  selections[chapterId]=itemId;
  doc.defaultView.localStorage.setItem(mementoKey,JSON.stringify({version:1,selections}));
  return true;
 } catch { return false; }
}
let nextArt=0;
export function stickerArt(doc,item) {
 const ns='http://www.w3.org/2000/svg';
 const el=(tag,attrs={})=>{const node=doc.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));return node;};
 const svg=el('svg',{viewBox:'0 0 300 300','aria-hidden':'true',class:'memento-art'});
 const id='memento-edge-'+(++nextArt), alphaId=id+'-alpha';
 const defs=el('defs'),filter=el('filter',{id,x:'-20%',y:'-20%',width:'140%',height:'140%','color-interpolation-filters':'sRGB'});
 const threshold=el('feComponentTransfer',{in:'SourceAlpha',result:'solid'});threshold.append(el('feFuncA',{type:'discrete',tableValues:'0 0 0 1 1'}));
 const dilation=el('feMorphology',{in:'solid',operator:'dilate',radius:3,result:'edge'});
 const flood=el('feFlood',{'flood-color':'#fff9eb',result:'paper'}),composite=el('feComposite',{in:'paper',in2:'edge',operator:'in',result:'border'});
 const merge=el('feMerge');merge.append(el('feMergeNode',{in:'border'}),el('feMergeNode',{in:'SourceGraphic'}));
 filter.append(threshold,dilation,flood,composite,merge);defs.append(filter);
 if(item.alphaStudy){const af=el('filter',{id:alphaId,'color-interpolation-filters':'sRGB'}),t=el('feComponentTransfer');t.append(el('feFuncA',{type:'linear',slope:'1.333333',intercept:'-.333333'}));af.append(t);defs.append(af);}
 svg.append(defs);
 const g=el('g',{filter:'url(#'+id+')'}),f=item.frame??{image:item.image,width:1,height:1,rect:[0,0,1,1]},inner=el('svg',{x:12,y:12,width:276,height:276,viewBox:f.rect.join(' '),overflow:'hidden'}),image=el('image',{href:f.image,width:f.width,height:f.height});
 if(item.alphaStudy)image.setAttribute('filter','url(#'+alphaId+')');
 inner.append(image);g.append(inner);svg.append(g);return svg;
}
