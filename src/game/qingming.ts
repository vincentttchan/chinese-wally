import {assetPath} from './assets.ts';
import type {PaintingTile,SceneActor} from './level.ts';

export const qingmingSize={width:38414,height:1800};
export const qingmingArt=(name:string)=>assetPath(`art/qingming/${name}`);
export const qingmingImage=qingmingArt('full-scroll.jpg');
export const qingmingTiles:PaintingTile[]=Array.from({length:10},(_,i)=>({id:`qingming-tile-${i+1}`,image:qingmingArt(`tile-${String(i+1).padStart(2,'0')}.jpg`),x:i*4000/38414,width:Math.min(4000,38414-i*4000)/38414}));
export type Bounds=readonly [number,number,number,number];
export const center=(b:Bounds)=>({x:(b[0]+b[2])/2/38414,y:(b[1]+b[3])/2/1800});
export function paintingActor(id:string,name:string,b:Bounds,kind:SceneActor['kind']='object'):SceneActor{
 return {id,name,kind,...center(b),width:(b[2]-b[0])/38414,height:(b[3]-b[1])/1800};
}
export type QingmingPerson={actor:SceneActor;art:string;appearance:string;hints:readonly string[];district:Bounds;replies:readonly string[]};
export const qingmingPeople:QingmingPerson[]=[
 {actor:paintingActor('person-paper','挑着兩籃的行人',[27609,327,27734,467],'target'),art:'paper-head.png',appearance:'戴低低的深色帽，臉略朝前。',hints:['他挑着擔，兩邊各有一只籃子。','在河岸店舖一帶，留意紙馬鋪附近。'],district:[25900,0,28600,1400],replies:['這路上的生意，可不止一種。','我挑的甚麼？先看看附近店招吧。','節令用品，也有人專門來買。']},
 {actor:paintingActor('person-wine','正店牌旁的坐姿人物',[4410,883,4515,1057],'target'),art:'wine-head.png',appearance:'帽子低平，臉較朝向你。',hints:['他坐着，和旁邊站着的人不同。','入城後，留意門面結彩的酒樓。'],district:[3400,180,5700,1660],replies:['坐一會兒，也能看看街上熱鬧。','門上那些裝飾，你留意了嗎？','好看的門面，遠遠便能看見。']},
 {actor:paintingActor('person-lodging','住宿招牌旁伸手的人物',[3340,1260,3465,1420],'target'),art:'lodging-head.png',appearance:'側着臉，頭部輪廓向後突出。',hints:['他伸手指向一邊，下半身被屋頂遮住。','在「久住」招牌附近。'],district:[2500,620,4500,1800],replies:['看那邊，有塊「久住」招牌。','先讀讀招牌，看看提供甚麼。','遠來的人，總得有地方落腳。']},
 {actor:paintingActor('person-incense','高帽長袍人物',[2961,585,3045,816],'target'),art:'incense-head.png',appearance:'深色帽較高，臉略朝前。',hints:['穿長袍，手收在身前。','在高立香鋪招牌附近，旁邊還有相似的人。'],district:[2400,180,4200,1300],replies:['這塊店招，寫着賣甚麼。','留意那些說商品的字。','各家專營的東西，並不相同。']},
 {actor:paintingActor('person-medicine','醫藥鋪內的坐姿人物',[1488,730,1568,913],'target'),art:'medicine-head.png',appearance:'戴深色帽，臉較長。',hints:['他坐在店內，附近有站着的人。','看看「趙太丞家」店內。'],district:[950,230,2750,1370],replies:['店名旁邊，還有介紹本領的字。','近看些，小字才容易辨認。','買物之外，人也需要專門服務。']},
];
export const qingmingObjects=[
 paintingActor('paper-sign','紙馬鋪店招',[26882,49,26936,240]),
 paintingActor('paper-display','纸馬鋪前陳列',[26952,66,27142,240]),
 paintingActor('landmark-bridge','大木橋',[18870,146,20155,570],'observation'),
 paintingActor('bridge-boat','橋下船工',[19460,420,20435,822],'observation'),
 paintingActor('bridge-people','橋上觀看船隻的人群',[19150,125,19875,305],'observation'),
 paintingActor('bridge-stalls','橋西端攤販',[18250,390,18640,750]),
 paintingActor('landmark-gate','城門',[7240,450,7490,1100],'observation'),
 paintingActor('wine-sign','正店牌',[4475,779,4555,923]),
 paintingActor('wine-decoration','酒樓入口裝飾',[4395,275,4925,777]),
 paintingActor('lodging-sign','久住王員外家招牌',[3235,1300,3320,1520]),
 paintingActor('incense-sign','香鋪高立招牌',[3102,339,3164,580]),
 paintingActor('incense-goods','香鋪招牌商品字詞',[3102,419,3164,547]),
 paintingActor('medicine-name','趙太丞家店名',[1455,596,1670,653]),
 paintingActor('medicine-advertisement','醫藥鋪治療宣傳字樣',[1440,659,1488,910]),
];
// Individually registered neighbours, not large group boxes pretending to cover people.
export const qingmingNeighbours=[
 {actor:paintingActor('neighbour-paper-pole','屋頂後的挑擔人',[27161,264,27262,338],'witness'),replies:['屋頂擋着身子，還能看見肩上的擔。','沿河走，兩旁都有生意。','要認人，帽子和面形也得看。']},
 {actor:paintingActor('neighbour-paper-right','籃子旁站着的人',[27725,308,27830,437],'witness'),replies:['這一帶店面挨着店面。','看看商品怎樣擺在門前。','路上的行人，各有自己的事情。']},
 {actor:paintingActor('neighbour-wine-robed','酒樓前深色長袍人物',[4727,832,4823,1110],'witness'),replies:['人多，留意各人的站姿。','門前和樓上，都有細節。','這一座酒樓，門面很熱鬧。']},
 {actor:paintingActor('neighbour-incense-door','香鋪門旁站立人物',[2911,603,2957,800],'witness'),replies:['看招牌，便知道是甚麼生意。','字有大有小，不妨近看。','同在街上，各家所賣不同。']},
 {actor:paintingActor('neighbour-medicine-standing','醫藥鋪內站立人物',[1590,741,1668,923],'witness'),replies:['這家店，招牌不只寫了名字。','留意門旁那些細字。','對讀史料，還能看見不同專科。']},
];
export const qingmingActors=[...qingmingPeople.map(p=>p.actor),...qingmingNeighbours.map(p=>p.actor),...qingmingObjects];
export const actorById=(id:string)=>qingmingActors.find(a=>a.id===id)!;

export type SourcePassage={volume:string;title:string;quote:string;gloss:string;url:string;context:string};
const volume=(n:string)=>`https://zh.wikisource.org/zh-hant/東京夢華錄/卷${n}`;
export const qingmingSources={
 paper:{volume:'卷七',title:'清明節',quote:'紙馬鋪皆於當街……疊成樓閣之狀。',gloss:'書中記載，紙馬鋪在街邊展示紙製樓閣。紙馬是祭祀用紙製品。',url:volume('七'),context:'完整句為「紙馬鋪皆於當街用紙袞疊成樓閣之狀」。主線以省略號節錄；「紙袞」的校注仍待核對。書中的展示方式可與原畫陳列對讀，不等於每個畫中形狀都是這種樓閣。'},
 bridge:{volume:'卷一',title:'河道',quote:'運東南之糧，凡東南方物，自此入京城，公私仰給焉。',gloss:'方物：各地物產。仰給：依靠供應。',url:volume('一'),context:'此段記載汴河把東南糧食、物產送入京城。原畫呈現河上船隻、船工與岸邊活動，文字補充它們對城市供應的意義；不能從畫面確定每艘船的貨物，也不能把漕運直接等同海外貿易。'},
 wine:{volume:'卷二',title:'酒樓',quote:'凡京師酒店，門首皆縛彩樓歡門。',gloss:'彩樓歡門：店門前搭起的彩飾門架。',url:volume('二'),context:'原畫的招牌與入口裝飾，能與書中酒店門面的描述對讀。書中另記京師正店與腳店；制度與店舖規模的詳解適合延伸閱讀，不把正店直接等同現代星級酒店。'},
 lodging:{volume:'卷三',title:'大內前州橋東街巷',quote:'南方官員商賈兵級，皆於此安泊。',gloss:'商賈：商人。安泊：住宿。',url:volume('三'),context:'原文描述保康門一帶的客店，接待外來官員、商人等人口。畫中「久住」招牌提供另一份住宿服務線索；不能据此認定畫中人物来自南方，也不能把書中客店地址直接套到原畫。'},
 incense:{volume:'卷二',title:'東角樓街巷',quote:'餘皆真珠、匹帛、香藥鋪席。',gloss:'匹帛：紡織品。這句列舉了不同種類的專門店舖。',url:volume('二'),context:'書中列出珠寶、布帛及香藥等專門生意。原畫劉家香鋪的商品文字，提示這家店的經營類型。「沉檀」是來源釋讀，完整招牌有不同釋讀；不由此推斷特定商品的產地或海外航線。'},
 medicine:{volume:'卷三',title:'馬行街北諸醫鋪',quote:'「口齒咽喉藥」　「醫小兒」',gloss:'兩處分散節錄，分別涉及口齒咽喉用藥及小兒醫療。',url:volume('三'),context:'原文並記不同醫鋪及「產科」，可見服務的專業分工。眼前趙太丞家的店名、療效宣傳是原畫證據；書中其他店鋪的專科並不全屬於這家店。治療宣傳是當時的廣告文字，不作現代醫療指引。'},
} satisfies Record<string,SourcePassage>;

export type StudyStep={kind:'observe';title:string;question:string;ids:readonly string[];fact:string;focusId:string}|{kind:'source';source:SourcePassage};
export type QingmingStage={id:string;title:string;subjectId:string;personId?:string;region:Bounds;arrival:string;steps:readonly StudyStep[];meaning:string;relay:string};
const observe=(title:string,question:string,ids:string[],fact:string):StudyStep=>({kind:'observe',title,question,ids,fact,focusId:ids[0]});
const reading=(source:SourcePassage):StudyStep=>({kind:'source',source});
export const qingmingStages:QingmingStage[]=[
 {id:'paper',title:'節令也有生意',subjectId:'person-paper',personId:'person-paper',region:[26500,0,28200,950],arrival:'想看這裏的生意？先看看那塊店招。',steps:[observe('看看店招','這間鋪子賣甚麼？點看店招。',['paper-sign'],'來源將這處店招指認為王家紙馬鋪。紙馬是祭祀用紙製品。'),reading(qingmingSources.paper),observe('街邊的陳列','商品怎樣擺給人看？點看店前的陳列。',['paper-display'],'原畫可見店前的陳列形態；書中亦記街邊展示。兩份線索可以對讀。')],meaning:'祭祀與節令用品，也能形成專門的生意。',relay:'沿河往城裏看，先找那座大木橋。'},
 {id:'bridge',title:'河運連着城市',subjectId:'landmark-bridge',region:[18000,0,21200,1000],arrival:'橋下的人正忙着，留步看看。',steps:[observe('船上的動作','船上的人正忙着甚麼？點看船工。',['bridge-boat'],'船工的手勢、長杆與船身位置，把過橋的場面連在一起。'),observe('橋上的人群','橋上的人看向哪裏？點看橋上人群。',['bridge-people'],'橋上有人轉身、探看船隻；橋上與船上的動作互相呼應。'),reading(qingmingSources.bridge),observe('岸上也有買賣','船運與岸上的生活有甚麼聯繫？點看橋邊攤販。',['bridge-stalls'],'橋邊聚集攤販與行人。原畫呈現水陸活動，史料補充河運與城市供應的聯繫。')],meaning:'河運把外地物產帶入京城，是城市供應的重要聯繫。',relay:'再往畫卷左邊找，城门就在街市之前。'},
 {id:'gate',title:'入城看看街市',subjectId:'landmark-gate',region:[6300,0,8100,1800],arrival:'找到城門了。入城後，還有不同的生意。',steps:[observe('城門與街道','點看城門通道，看看人們從哪裏往來。',['landmark-gate'],'原畫中，城門通道把城外與城內街市連起來。')],meaning:'從河岸走到城內，繼續看人們的交易與服務。',relay:'往畫卷左邊的街市看，找門面結彩的酒樓。'},
 {id:'wine',title:'酒樓怎樣招徠客人',subjectId:'person-wine',personId:'person-wine',region:[4200,110,5120,1200],arrival:'這家店的門面，你可看仔細了？',steps:[observe('正店的招牌','這是甚麼店？點看「正店」牌。',['wine-sign'],'原畫可辨認「正店」二字；店門、招牌與樓房同在這個場面。'),reading(qingmingSources.wine),observe('彩樓歡門','入口怎樣吸引人注意？點看彩飾門架。',['wine-decoration'],'入口的門架、彩飾與懸掛裝飾，讓店面從街上可見，與史料的彩樓歡門對讀。')],meaning:'招牌與彩飾門面，讓街上的人看見店舖、前來消費。',relay:'看看街的另一邊，那塊「久住」招牌。'},
 {id:'lodging',title:'遠來的人住在哪裏',subjectId:'person-lodging',personId:'person-lodging',region:[3150,1110,3900,1600],arrival:'那塊招牌，說的是住下來的生意。',steps:[observe('住宿的招牌','這塊招牌提供甚麼服務？點看「久住」牌。',['lodging-sign'],'來源把「久住王員外家」指認為住宿招牌，與酒樓的「正店」牌提供不同線索。'),reading(qingmingSources.lodging),observe('回看酒樓','先回看酒樓招牌：這裏是飲食的生意。',['wine-sign'],'「正店」牌及酒樓門面，對應飲食消費。'),observe('再看客店','再點客店的「久住」牌，比較兩種服務。',['lodging-sign'],'「久住」牌指向住宿。城市服務既包括吃喝，也接待往來人口。')],meaning:'往來京城的人需要住宿，客店是城市服務的一部分。',relay:'沿街往左看，找高高立起的香鋪招牌。'},
 {id:'incense',title:'專門店舖賣甚麼',subjectId:'person-incense',personId:'person-incense',region:[2830,290,3400,1040],arrival:'想知道賣甚麼，先看看店招。',steps:[observe('香鋪的店招','店招告訴你甚麼？點看高立招牌。',['incense-sign'],'招牌可見劉家及商品字詞。完整招牌有不同釋讀，畫面與輔讀並置。'),reading(qingmingSources.incense),observe('商品的字詞','哪些字說的是商品？點看招牌中段。',['incense-goods'],'「沉檀」是來源對香料字詞的釋讀，支持將這處理解為香鋪，不推定具體產地。')],meaning:'城市商業有不同種類，店舖可以專營某類商品。',relay:'再沿街往左，找「趙太丞家」的招牌。'},
 {id:'medicine',title:'生意也包括專門服務',subjectId:'person-medicine',personId:'person-medicine',region:[1220,560,1850,1050],arrival:'這裏的招牌，還寫着治甚麼病。',steps:[observe('醫藥鋪的店名','除了店名，還有哪些介紹？先點看店名。',['medicine-name'],'橫向店名可對讀為「趙太丞家」；門旁另有藥品、治療介紹。'),reading(qingmingSources.medicine),observe('介紹自己的本領','這家店怎樣介紹本領？點看店名旁的宣傳文字。',['medicine-advertisement'],'館方解說指認有「五勞七傷」等宣傳文字。這是店舖的歷史廣告，不是現代療效證明。')],meaning:'城市生意不只售賣物品，也提供有專門本領的服務。',relay:'一路看過來，各家都有自己的生意。'},
];

export type QingmingFinding={id:string;title:string;hint:string;actorIds:readonly string[];art:string;sceneArt:string;stageId:string;note:string};
export const qingmingFindings:QingmingFinding[]=[
 {id:'paper-shop',title:'紙馬鋪陳列',hint:'河岸的一間節令用品鋪',actorIds:['paper-sign','paper-display'],art:'paper-display.jpg',sceneArt:'paper-scene.jpg',stageId:'paper',note:'祭祀、節令需求也形成專門生意。比較畫中陳列與書中街邊展示，保留圖文差異。'},
 {id:'rainbow-bridge',title:'虹橋見聞',hint:'船、人群與橋邊買賣',actorIds:['landmark-bridge','bridge-boat','bridge-people','bridge-stalls'],art:'bridge-arch.jpg',sceneArt:'bridge-scene.jpg',stageId:'bridge',note:'同一局部中，橋上通行、橋下船運與岸邊交易相遇。水陸活動幫助理解城市與外地的聯繫。'},
 {id:'wine-shop',title:'酒樓門面',hint:'門前有彩飾的大店',actorIds:['wine-sign','wine-decoration'],art:'wine-decoration.jpg',sceneArt:'wine-scene.jpg',stageId:'wine',note:'招牌、彩飾門架與建築都是店面的線索。它們讓人辨認店舖，也呈現飲食消費的場景。'},
 {id:'lodging-shop',title:'客店招牌',hint:'讓遠來的人落腳',actorIds:['lodging-sign'],art:'lodging-sign.jpg',sceneArt:'lodging-scene.jpg',stageId:'lodging',note:'「久住」招牌與書中客店的記載相互補充，讓玩家看見外來人口及住宿服務。'},
 {id:'incense-shop',title:'香鋪商品',hint:'看看高立店招的商品字',actorIds:['incense-sign','incense-goods'],art:'incense-sign.jpg',sceneArt:'incense-scene.jpg',stageId:'incense',note:'專門店舖反映商品種類與消費需求。原畫、文字釋讀與史料各有自己的證據範圍。'},
 {id:'medicine-shop',title:'醫藥鋪宣傳',hint:'店名之外，還介紹本領',actorIds:['medicine-name','medicine-advertisement'],art:'medicine-advertisement.jpg',sceneArt:'medicine-scene.jpg',stageId:'medicine',note:'商業也包含醫藥服務。原畫療效宣傳可與史料的醫鋪分工對讀，但不可混同各家的專科。'},
];
export const findingAt=(id:string)=>qingmingFindings.find(f=>f.actorIds.includes(id));
export const personAt=(id:string)=>qingmingPeople.find(p=>p.actor.id===id);
export const passageAt=(id:string)=>qingmingSources[id as keyof typeof qingmingSources];
export const qingmingPaintingSources=[
 {title:'故宮博物院 · 張擇端清明上河圖卷',url:'https://www.dpm.org.cn/collection/paint/228226.html'},
 {title:'故宮名畫記 · 清明上河圖',url:'https://minghuaji.dpm.org.cn/paint/detail?id=592d80e225aac624977fee2e19452c1f'},
 {title:'故宮講壇 · 局部與店舖解說',url:'https://www.dpm.org.cn/forum_detail/99722.html'},
 {title:'故宮研究 · 店舖與文字史料對讀',url:'https://img.dpm.org.cn/Uploads/File/2018/06/05/u5b167df5352f9.pdf'},
 {title:'原畫影像來源 · Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/File:Alongtheriver_QingMing.jpg'},
];
export const qingmingEpilogue=[
 {title:'城市連着遠方',text:'河上船運與岸上活動，配合史料中的糧食、物產入京，讓我們看見城市與外地供應的聯繫。',focusId:'bridge-boat'},
 {title:'各家有自己的生意',text:'紙馬鋪、酒樓與香鋪，對應節令、飲食及不同商品需求；客店與醫藥鋪則提供住宿及專門服務。',focusId:'wine-sign'},
 {title:'從一卷畫看城市發展',text:'運輸、商品與服務連成汴京的城市生活。畫作與史料提供豐富線索；人口增長和城市化的變化，還需要其他時期的資料一起解讀。',focusId:'lodging-sign'},
];
