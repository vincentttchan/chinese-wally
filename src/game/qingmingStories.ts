import {qingmingActors,actorById,paintingActor,qingmingSources,center} from './qingming.ts';
import type {Bounds,SourcePassage} from './qingming.ts';

export const qingmingStoryDetails=[
 paintingActor('detail-bridge-hull','橋下大船的船舷',[19900,722,20040,774]),
 paintingActor('detail-boat-deck','前景大船的外露船板',[23815,962,24040,1015]),
 paintingActor('detail-boat-mast','前景大船的桅杆',[24169,310,24205,851]),
 paintingActor('detail-boat-rope','前景大船的繩圈',[24348,810,24417,862]),
 paintingActor('detail-boat-window','前景大船露面人物身旁的船窗與船舷',[23945,1045,24120,1165]),
 paintingActor('detail-transport-wheel','載物獨輪車的車輪',[5555,1077,5625,1155]),
];
export const qingmingStoryActors=[...qingmingActors,...qingmingStoryDetails];
export const storyActorById=(id:string)=>qingmingStoryDetails.find(a=>a.id===id)??actorById(id);
export const qingmingZoomStops=[1,1.25,1.75,2.5,3.5,5] as const;
export type Observation={key:string;label:string;ids:string[];response:string;focus:string};
export type StoryFocus='bridge-search'|'boat'|'both'|'boat-window-face'|'boat-outside-search'|'boat-window-scene'|'transport-left'|'transport-right'|'transport-left-west'|'transport-left-east'|'transport-right-west'|'transport-right-east'|'transport-left-scene'|'transport-right-scene'|'transport-loads'|'transport-cart'|'transport-cargo'|'transport-all';
export type StoryStep={kind:'observe';title:string;question:string;groups:Observation[];revisit?:boolean;autoContinue?:boolean;reflection?:boolean;focus?:StoryFocus;questionDelayMs?:number;actionLabel?:string;collectOnContinue?:boolean}|{kind:'source';title:string;source:SourcePassage};
export type PaintingStory={id:string;title:string;question:string;region:Bounds;entryIds:string[];steps:StoryStep[];meaning:string;limits:string;art:string;source?:SourcePassage;ordered?:boolean;quietOpening?:boolean;version?:number;optionalGroups?:Observation[];extraReading?:string;extraReadingTitle?:string;noteLabel?:string;finishInPainting?:boolean};
const observationLabels:Record<string,string>={
 'bridge-watch':'橋邊探看的人物','bridge-work':'船上的人物動作','bridge-hull':'橋下大船的船身','bridge-return':'橋上與船上的聯繫','bridge-stall':'橋頭攤位',
 carriage:'最先停留的一處','transport-link':'沿着長杆看','transport-other':'長杆另一端的人',cart:'獨輪車與載物',cargo:'牲口背上的負載','transport-return':'街上的運輸',deck:'人物腳下的船板',standing:'站立的人物',bending:'俯身的人物',tools:'桅杆或繩圈','boat-person-return':'船上人物','boat-tool-return':'船板或器具',
 'wine-sign':'正店招牌','wine-decoration':'酒樓入口裝飾','wine-return':'酒樓門面','medical-name':'趙太丞家店名','medical-ad':'門旁宣傳文字','medical-person':'店內人物','medical-tools':'桌案與器物','paper-display':'鋪前陳列','paper-sign':'紙馬鋪店招','paper-return':'陳列與道路',
 'boat-window-person':'船窗裏露面的身影','boat-window-opening':'人物身旁的船窗','boat-outside-person':'同一艘船上的其他身影','nearby-boat-person':'附近另一艘船上的人物',
};
const group=(key:string,ids:string[],response:string):Observation=>({key,label:observationLabels[key],ids,response,focus:ids[0]});
const observe=(title:string,question:string,groups:Observation[],revisit=false):StoryStep=>({kind:'observe',title,question,groups,revisit});
const source=(title:string,source:SourcePassage):StoryStep=>({kind:'source',title,source});
const rp=(...n:number[])=>n.map(i=>`extra-person-river-${String(i).padStart(3,'0')}`);
const cp=(...n:number[])=>n.map(i=>`extra-person-city-${String(i).padStart(3,'0')}`);
const co=(...n:number[])=>n.map(i=>`extra-object-city-${String(i).padStart(3,'0')}`);
const bridgeWatch=rp(199,202,203,208,209,212);
const bridgeWork=rp(222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,247,248,249,250,251,252,253,254);
const bridgeHull=['extra-object-river-045','detail-bridge-hull'];
export const bridgeReachingPerson='extra-person-river-231';
export const bridgeVesselIds=[...bridgeHull,...bridgeWork.filter(id=>id!=='extra-person-river-222')];
const bridgeStalls=['bridge-stalls',...Array.from({length:7},(_,i)=>`extra-object-river-${String(32+i).padStart(3,'0')}`),'extra-object-river-048','extra-object-river-052','extra-object-river-062','extra-object-river-063'];
const carriage=[...co(39,40),...cp(148,150,151,153,155,156)];
const leftCarriers=cp(148,150,151),rightCarriers=cp(153,155,156);
const cart=[...co(45),'detail-transport-wheel'],cargo=co(42,44);
const medicalPeople=['person-medicine','neighbour-medicine-standing'];
const boatPeople=['extra-person-outskirts-033','extra-person-outskirts-104','extra-person-outskirts-105'];
const boatWindowPeople=['extra-person-outskirts-034','extra-person-outskirts-035'];
const boatTools=['detail-boat-mast','detail-boat-rope'];

export const bridgeIntroduction:PaintingStory={
 id:'intro-bridge',title:'虹橋見聞',question:'在橋邊停一停。',region:[18000,0,21200,1000],entryIds:[],art:'bridge-scene.jpg',source:qingmingSources.bridge,
 steps:[
  {kind:'observe',title:'在橋邊停一停',question:'在橋邊停一停。',groups:[group('bridge-watch',bridgeWatch,'橋邊有人探身朝河面看。')],autoContinue:true},
  {kind:'observe',title:'橋欄邊的身影',question:'這幾個人，正在留意甚麼？',groups:[group('bridge-hull',bridgeVesselIds,'船與橋靠得很近。')],revisit:true,autoContinue:true,focus:'bridge-search',questionDelayMs:1600},
  {kind:'observe',title:'船上的身影',question:'留意船左側伸出的手臂。點那個人看看。',groups:[group('bridge-work',[bridgeReachingPerson],'船的左側，有人伸臂前傾。')],revisit:true,autoContinue:true,focus:'boat',questionDelayMs:1200},
  {kind:'observe',title:'橋上橋下的一幕',question:'橋邊的探看，與船上的忙碌，在這一刻交會。這些人是否正在互相呼應？畫中仍留着疑問。',groups:[],reflection:true,focus:'both',questionDelayMs:1000,actionLabel:'看過了'},
  source('河上的往來，又怎樣連着城裏的生活？',qingmingSources.bridge),
  {kind:'observe',title:'回到畫中對照',question:'書中說物產沿汴河入京。回到畫中，點這艘大船，對照書中的河運。',groups:[group('bridge-return',bridgeVesselIds,'河上的船，連着京城的供應與往來。')],revisit:true,autoContinue:true},
  {kind:'observe',title:'河運與城市',question:'河上的船，連着京城的供應與往來；眼前這艘船載甚麼，仍不能確定。',groups:[],reflection:true,focus:'both',actionLabel:'收下這則見聞',collectOnContinue:true},
 ],meaning:'橋邊的探看、船上的動作，一起記在這則見聞裏。接下來，選一處你想停留的地方。',limits:'橋上探看與船上動作可以比較；不斷言已發生事故，也不能確定每艘船的貨物。收藏小景是對關係的手繪整理，不是原畫證據或橋樑工程復原。',
};
export const qingmingStories:PaintingStory[]=[
 {id:'story-street-transport',title:'長杆兩端的人',question:'到街上停一停。',region:[4100,1010,5060,1440],entryIds:carriage,art:'story-street.jpg',ordered:true,quietOpening:true,version:3,noteLabel:'街上見聞',finishInPainting:true,steps:[
  {kind:'observe',title:'在街上停一停',question:'在街上停一停。',groups:[group('carriage',carriage,'人物身旁有長杆，旁邊是一頂轎子。')],autoContinue:true},
  {kind:'observe',title:'長杆的另一端',question:'他肩上的長杆，另一端連着甚麼？',groups:[group('transport-link',carriage,'長杆把轎身與兩旁扶杆、扛杆的人連在一起。')],autoContinue:true,questionDelayMs:1400,focus:'transport-left'},
  {kind:'observe',title:'長杆的另一邊',question:'再沿着長杆看看，另一端還有誰？',groups:[group('transport-other',[...leftCarriers,...rightCarriers],'轎身另一邊，也有人與伸出的長杆挨在一起。')],autoContinue:true,questionDelayMs:1100,focus:'transport-left'},
  {kind:'observe',title:'長杆兩端的人',question:'長杆連着轎身，也連着兩旁的人。幾個人的動作，在這裏接了起來。',groups:[],reflection:true,questionDelayMs:1000,focus:'transport-left-scene',actionLabel:'收下這則見聞'},
 ],meaning:'沿着人物身旁的長杆，能看見轎身與另一端的人。分散在轎子兩邊的動作，透過同一件器物連在一起。',limits:'只依據人物、長杆與同頂轎身的可見關係；扶杆、扛杆與身旁站立並非相同動作。不指定乘客身份、目的地、對話，也不編造讓路或爭執。',optionalGroups:[group('cart',cart,'一個車輪托着車架，物件捆放在上面。'),group('cargo',cargo,'物件繫在牲口背上。')],extraReading:'同一段街道上，也能看見載物獨輪車與背上有負載的牲口。把它們與轎子放在一起看，能比較人力、車具與牲口怎樣承載人和物；畫面不能告訴我們各自的目的地或貨物種類。'},
 {id:'story-boat-work',title:'船窗裏的人',question:'到船邊停一停。',region:[23760,780,25100,1260],entryIds:boatWindowPeople,art:'story-boat.jpg',ordered:true,quietOpening:true,version:2,noteLabel:'船上見聞',finishInPainting:true,steps:[
  {kind:'observe',title:'在船邊停一停',question:'在船邊停一停。',groups:[group('boat-window-person',boatWindowPeople,'船身低處的開口裏，露出人物的面孔。')],autoContinue:true},
  {kind:'observe',title:'露面的地方',question:'他從船的哪一處露出臉來？',groups:[group('boat-window-opening',['detail-boat-window'],'人物的臉露在船身的木框開口裏。')],autoContinue:true,focus:'boat-window-face',questionDelayMs:1400},
  {kind:'observe',title:'同一艘船上',question:'同一艘船上，其他人在哪裏？',groups:[group('boat-outside-person',boatPeople,'船窗以外，船板或艙棚邊也有人。')],autoContinue:true,focus:'boat-outside-search',questionDelayMs:1100},
  {kind:'observe',title:'船窗裏的人',question:'船窗裏有人露面，艙棚旁也有人活動。同一艘船，容下不同位置的人與活動。',groups:[],reflection:true,focus:'boat-window-scene',questionDelayMs:1000,actionLabel:'收下這則見聞'},
 ],meaning:'從船窗裏的面孔看起，再看船板與艙棚邊的人，能看見同一艘船上不同的活動空間。至於他們的身份與具體工作，畫中仍留下疑問。',limits:'只把同一前景立桅大船的船窗人物與外側人物連起來，不把後方另一艘船上的俯身人物混作同船證據。不從露臉判定坐姿、休息或乘客身份；不把俯身解作卸貨、修船或煮食。',source:qingmingSources.bridge,optionalGroups:[
  group('deck',['detail-boat-deck','extra-person-outskirts-033'],'前景大船的船舷外側留着活動的位置。'),
  group('standing',['extra-person-outskirts-105'],'這人直着身子，在艙棚邊。'),group('bending',['extra-person-outskirts-104'],'這人低下身子，部分身體被棚柱遮住。'),
  group('tools',boatTools,'桅杆高出船艙，索具伸向船上不同位置。'),
  group('boat-person-return',boatPeople,'船窗外也能看見其他人物的身影。'),group('boat-tool-return',['detail-boat-deck',...boatTools],'船板和器具，與人物同在這艘船上。'),
  group('nearby-boat-person',['extra-person-outskirts-024'],'附近另一艘船上，也有俯身的人物。這不是船窗所在的同一艘船。'),
 ],extraReadingTitle:'船上還有甚麼細節？',extraReading:'桅杆、繩圈與船板都能繼續近看。它們讓我們比較人物、器具和活動空間的關係；畫面不足以替每個人定下工作，也不能確定船上載着甚麼。'},
 {id:'story-wine-front',title:'酒樓門面',question:'這間店的門面有不少裝飾。路上的人，可以從哪裏認出它？',region:[4200,110,5120,1200],entryIds:['wine-sign','wine-decoration','person-wine','neighbour-wine-robed'],art:'wine-scene.jpg',source:qingmingSources.wine,steps:[
  observe('先找店招','門面附近，哪裏寫着字？',[group('wine-sign',['wine-sign'],'這塊牌上可辨認「正店」二字。')]),
  observe('再看入口','門前除了招牌，還掛着甚麼？',[group('wine-decoration',['wine-decoration'],'門架上有彩飾和懸掛物，入口裝點得很醒目。')]),
  source('書中怎樣寫酒店門面？',qingmingSources.wine),
  observe('回看整個門面','把招牌與入口裝飾放在一起看。',[group('wine-return',['wine-sign','wine-decoration'],'招牌提供辨認線索，入口裝飾則讓門面引人注意。')],true),
 ],meaning:'原畫的店招與彩飾，可以和書中的酒店門面對讀，看見店舖怎樣在街上展示自己。',limits:'店旁人物不因位置而被定為店主或客人；原畫與書中酒店活動對讀，不逐店對號。'},
 {id:'story-medical-service',title:'醫藥鋪宣傳',question:'屋簷下有店名，門旁還有一行小字。它們在告訴路人同一件事嗎？',region:[1220,560,1850,1050],entryIds:['medicine-name','medicine-advertisement','extra-object-city-006',...medicalPeople],art:'medicine-scene.jpg',source:qingmingSources.medicine,steps:[
  observe('這間店叫甚麼？','看看屋簷下面橫着的一行字。',[group('medical-name',['medicine-name'],'店名橫着寫在屋簷下面：「趙太丞家」。')]),
  observe('旁邊還寫了甚麼？','再看門旁直行的小字。',[group('medical-ad',['medicine-advertisement'],'這行文字與店名分開，介紹這家的醫藥本領。來源指認有「五勞七傷」等宣傳字詞。')]),
  source('城裏的醫鋪都做同一種服務嗎？',qingmingSources.medicine),
  observe('回到店內看看','招牌下面，還有哪些人物和器物？',[group('medical-person',medicalPeople,'店內有人坐着，也有人站着。'),group('medical-tools',['extra-object-city-006'],'桌案上放着器物，與人物同在店內。')],true),
 ],meaning:'城市商業也包含專門服務。店名讓人辨認這家店，宣傳文字則介紹它的本領。',limits:'短句是書中其他醫鋪的例子，不全屬趙太丞家；不指定醫者或病人。只提供已核對的宣傳字詞，不補讀模糊小字。'},
 {id:'story-paper-display',title:'紙馬鋪陳列',question:'這間鋪前擺着高低不同的東西。從街上走過，先會看見甚麼？',region:[26500,0,28200,950],entryIds:['paper-sign','paper-display','extra-object-outskirts-023','person-paper','neighbour-paper-right'],art:'paper-scene.jpg',source:qingmingSources.paper,steps:[
  observe('先看陳列的樣子','留意成排的物件、立架和懸掛物。',[group('paper-display',['paper-display'],'鋪前的陳列高低不一，有立着的，也有掛着的。')]),
  observe('再找店招','陳列旁邊，哪裏掛着細長的牌？',[group('paper-sign',['paper-sign'],'細長店招立在鋪旁；來源將這處指認為紙馬鋪。紙馬是祭祀用紙製品。')]),
  source('書中也有街邊展示',qingmingSources.paper),
  observe('從路上看這間鋪','再看陳列與道路的位置。',[group('paper-return',['paper-display','extra-object-outskirts-023'],'陳列朝向街道，路過的人可以看見它。')],true),
 ],meaning:'節令與祭祀需求形成專門生意，店前展示也成為街上的一部分。',limits:'書中紙製樓閣與原畫陳列保留形態差異；「紙袞」校注待核，短句保留省略號。不認定附近人物正在購買。'},
];
export const storyById=(id:string)=>id===bridgeIntroduction.id?bridgeIntroduction:qingmingStories.find(s=>s.id===id);
/** Keep questions and journal evidence tied to the details the player actually selected. */
export function storyStepAt(story:PaintingStory,p:{step:number;seen:Record<string,string>}):StoryStep|undefined{
 const step=story.steps[p.step];
 if(story.id==='story-boat-work'&&step?.kind==='observe'&&p.step===3){
  const outside=p.seen['boat-outside-person'];
  const activity=outside==='extra-person-outskirts-033'?'船舷邊也有人':outside==='extra-person-outskirts-104'?'艙棚旁有人俯着身':'艙棚旁有人直着身子';
  return {...step,question:`船窗裏有人露面，${activity}。船的內外，都留着人的身影。`};
 }
 if(story.id!=='story-street-transport'||step?.kind!=='observe')return step;
 const first=p.seen.carriage,right=first==='extra-object-city-040'||rightCarriers.includes(first);
 const object=first==='extra-object-city-039'||first==='extra-object-city-040';
 if(p.step===0&&first){
  const response=object?'長杆從轎身旁伸出。':cp(150,151,155).includes(first)?'這人的肩旁橫着長杆。':first===cp(148)[0]?'這人的手扶着橫杆。':'這人的身旁橫着長杆。';
  return {...step,groups:[{...step.groups[0],response}]};
 }
 if(p.step===1){
  const ids=object?(right?rightCarriers:leftCarriers):co(right?40:39);
  const shoulder=cp(150,151,155).includes(first);
  const west=cp(148,153).includes(first);
  return {...step,focus:object?(right?'transport-right':'transport-left'):right?(west?'transport-right-west':'transport-right-east'):(west?'transport-left-west':'transport-left-east'),question:object?'沿着轎旁的長杆，看看有哪些人與它連在一起。':shoulder?'他肩上的長杆，另一端連着甚麼？':first===cp(148)[0]?'他扶着的長杆，另一端連着甚麼？':'他身旁的長杆，另一端連着甚麼？',groups:[{...step.groups[0],ids,focus:ids[0],response:object?'沿着長杆，能從轎身看到旁邊的人。':'順着人物身旁的長杆，能看見相連的轎身。'}]};
 }
 if(p.step===2){
  const person=first==='extra-object-city-039'||first==='extra-object-city-040'?p.seen['transport-link']:first;
  const west=cp(148,153).includes(person);
  const ids=right?(west?cp(155,156):cp(153)):(west?cp(150,151):cp(148));
  return {...step,focus:right?'transport-right':'transport-left',groups:[{...step.groups[0],ids,focus:ids[0]}]};
 }
 if(p.step===3)return {...step,focus:right?'transport-right-scene':'transport-left-scene'};
 return step;
}
export const storyAt=(id:string)=>qingmingStories.find(s=>s.entryIds.includes(id));
export const storyCenter=(story:PaintingStory)=>center(story.region);
export const qingmingDestinationCopy:Record<string,{title:string;teaser:string}>={
 'story-street-transport':{title:'到街上停一停。',teaser:''},
 'story-boat-work':{title:'到船邊停一停。',teaser:''},
 'story-wine-front':{title:'這間店，門面格外熱鬧。',teaser:'字牌與彩飾，都朝着街上。'},
 'story-medical-service':{title:'店名旁邊，還有話要說。',teaser:'屋簷下與門旁，各寫着字。'},
 'story-paper-display':{title:'鋪前，有高低不同的陳列。',teaser:'有的立着，有的掛着。'},
};
export const cityConnections=[
 {title:'人與物的移動',text:'街道與河道承載往來；虹橋的史料也提醒我們，城市與外地供應相連。',ids:['extra-object-city-045','detail-boat-deck'],labels:['回看街上的運輸','回看船上的活動']},
 {title:'店舖的展示',text:'招牌、彩飾與陳列，把不同生意帶到街上，讓往來的人看見。',ids:['wine-decoration','paper-display'],labels:['回看酒樓門面','回看紙馬鋪陳列']},
 {title:'專門服務',text:'城市除了買賣物品，也提供專門服務。原畫的宣傳與書中的醫鋪記載，各自留下線索。',ids:['medicine-name','medicine-advertisement'],labels:['回看店名','回看宣傳文字']},
 {title:'把見聞連起來',text:'船運、街道、店舖與服務，把不同的人和需求連在一起。你已看過其中幾段生活，畫中還有更多細節值得停留。',ids:[],labels:[]},
];
