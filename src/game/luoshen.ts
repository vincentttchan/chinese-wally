import {assetPath} from './assets.ts';
import type {SceneActor,PaintingTile} from './level.ts';
export const luoshenSize={width:19950,height:943};
export const luoshenImage=assetPath('art/luoshen/full-scroll.jpg');
export const luoshenTiles:PaintingTile[]=Array.from({length:10},(_,i)=>({id:`luoshen-${i}`,image:assetPath(`art/luoshen/detail-${i}.jpg`),x:i/10,width:.1}));
type Box=readonly [number,number,number,number];
/** Source coordinates belong to the unchanged research image (global origin 15300,0). */
export function luoshenActor(id:string,name:string,box:Box,kind:SceneActor['kind']='witness'):SceneActor{
 const [l,t,r,b]=box;return {id,name,kind,x:((l+r)/2-300)/19950,y:((t+b)/2-92)/943,width:(r-l)/19950,height:(b-t)/943};
}
/** Verified tile coordinates: see docs/chapters/luoshen-coverage-2026-10-19.md. */
const fromTile=(tile:number,box:Box):Box=>[tile*1995+box[0]+300,box[1]+92,tile*1995+box[2]+300,box[3]+92];
const people:[string,string,Box][]=[
 ['C1','岸上初見的曹植',fromTile(8,[1795,410,1940,790])],['C2','坐榻凝望的曹植',[12210,510,12400,760]],['C3','岸邊送別的曹植',fromTile(4,[495,480,605,840])],['C4','樓船上的曹植',fromTile(2,[-55,345,50,555])],['C5','岸邊坐候的曹植',[3000,650,3210,920]],['C6','車中回望的曹植',[980,585,1130,840]],
 ['L1','初見的洛神',[16940,450,17300,900]],['L2','俯身回轉的洛神身影',[15700,580,15930,950]],['L3','下方雙人場面的主角候選',[14420,590,14650,900]],['L4','上方雙人場面的主角候選',[14000,160,14260,470]],['L5','柳旁回身的主角候選',[13380,480,13650,920]],['L6','雙人場面的主角候選',[12870,430,13110,800]],['L7','坐榻前的洛神身影',[11880,390,12130,800]],['L8','長頸鳥形旁的洛神身影',fromTile(4,[30,563,135,723])],['L9','雲車中的洛神',fromTile(3,[275,355,390,610])],
 ['attendant-opening-left','岸上同行者',fromTile(8,[1755,385,1835,760])],['attendant-opening-rear','持傘同行者',fromTile(8,[1920,365,1980,585])],['attendant-opening-beard','長髯同行者',fromTile(9,[0,440,75,790])],['attendant-opening-middle','岸邊同行者',[18300,490,18395,760]],['attendant-opening-green','綠衣同行者',fromTile(9,[110,410,205,785])],['attendant-opening-box','捧物同行者',fromTile(9,[220,400,325,790])],
 ['horse-keeper','馬旁的同行者',[19600,240,19780,600]],['sitting-keeper','岸邊蹲坐者',[19600,640,19780,1010]],
 ['companion-L3','水邊同行神女',fromTile(7,[410,590,610,835])],['companion-L4','上方同行神女',fromTile(6,[1820,140,1995,445])],['companion-L6','雙人場面的同行神女',[13000,480,13250,800]],
 ['attendant-seat-fan','持扇同行者',fromTile(6,[100,395,150,630])],['attendant-seat-front','榻旁長髯者',fromTile(6,[150,435,215,735])],['attendant-seat-green','榻旁綠衣者',fromTile(6,[215,425,295,720])],
 ['attendant-farewell-back','送別隊伍持傘者',fromTile(4,[610,480,665,735])],['attendant-farewell-beard','送別隊伍長髯者',fromTile(4,[665,500,730,830])],['attendant-farewell-box','送別隊伍捧物者',fromTile(4,[735,495,835,820])],
 ['cloud-companion','雲車同行神女',fromTile(3,[175,340,265,555])],['cloud-driver','龍形之前的神靈',[6050,380,6340,660]],
 ['boat-companion-one','樓船上層同行者',fromTile(2,[55,345,110,555])],['boat-companion-two','樓船上層另一同行者',fromTile(2,[115,345,175,555])],['boatman-left','左側操船人',[4090,660,4240,890]],['boatman-right','右側操船人',fromTile(2,[265,600,365,825])],
 ['shore-attendant','岸邊坐榻後的同行者',[3190,520,3330,850]],['shore-standing','岸邊站立的同行者',[2810,520,2950,880]],
 ['carriage-front','車前同行者',fromTile(0,[615,475,680,690])],['carriage-horse-left','左側騎者',[480,430,660,750]],['carriage-horse-right','右側騎者',[1280,650,1430,950]],['carriage-driver','駕車者',fromTile(0,[535,555,615,835])],['carriage-rear','車後騎者',[830,430,950,570]],
 ['held-object-goddess','上方持物神女',fromTile(7,[1170,140,1430,470])],
 ['cloud-spirit-right','雲車旁的神靈',fromTile(3,[650,490,1140,750])],
 ['drummer','鼓旁奏樂者',[10240,360,10410,660]],['wind-spirit','雲上的神靈',fromTile(5,[1250,25,1425,285])],['water-attendant','水畔俯身者',[11200,690,11400,1000]],['floating-woman','水上同行神女',[10920,380,11200,740]],
];
export const luoshenPeople=people.map(([id,name,box])=>luoshenActor(id,name,box));
export const person=(id:string)=>luoshenPeople.find(a=>a.id===id)!;
export type Observation={id:string;question:string;actor:SceneActor;caption?:string};
const observe=(id:string,name:string,box:Box,question:string,caption?:string):Observation=>({id,question,actor:luoshenActor(id,name,box,'observation'),caption});
const observePerson=(id:string,question:string,caption?:string):Observation=>({id:`observe-${id}`,question,actor:{...person(id),id:`observe-${id}`,kind:'observation'},caption});
export type LuoshenStep={noteTitle:string;noteResult:string;id:string;title:string;name:string;appearance:string;hint:string;region:string;speech:string;lead:string;result:string;supplement:string;reading:string[];comparisons:{label:string;actors:string[]}[];observations:Observation[]};
export const luoshenSteps:LuoshenStep[]=[
 {noteTitle:'衣袖',noteResult:'同行者收袖，曹植展袖。他的姿態格外不同。',id:'C1',title:'岸上初見',name:'曹植',appearance:'留意有鬚的面孔與冠的輪廓。',hint:'他站在人群前方，衣袖向兩側展開。',region:'看看畫卷右段、岸上持傘的同行隊伍。',speech:'我不由得停下腳步。',lead:'水邊出現了神女。認清她的髮式，再去尋她。',result:'同行者收攏衣袖，曹植卻向外展袖。兩種姿態，讓初遇時的他格外顯眼。',supplement:'這裡比較的是原畫可見的動作；人物當時的心情不能單憑姿態確定。',reading:['C1','attendant-opening-beard'],comparisons:[{label:'看曹植展袖',actors:['C1']},{label:'看同行者收袖',actors:['attendant-opening-beard']}],observations:[observe('sleeve-C1','曹植展開的衣袖',[17990,620,18120,750],'看看曹植展開的衣袖。'),observe('sleeve-attendant','同行者收攏的衣袖',fromTile(9,[0,565,70,715]),'再看同行者收攏的衣袖。')]},
 {noteTitle:'飛鳥與龍形',noteResult:'「翩若驚鴻，婉若游龍」：如鳥輕盈，如龍婉轉。',id:'L1',title:'水邊的神女',name:'洛神',appearance:'看看面形與雙環高髮。',hint:'衣帶在身旁延展，她獨立在水岸之間。',region:'留意初見隊伍以左的水邊。',speech:'你也看見我了？',lead:'岸上還有坐下來的曹植，再尋他的身影。',result:'「翩若驚鴻，婉若游龍」：輕盈如飛鳥，婉轉如游龍。回看神女的姿態，再看畫中的鳥與龍。',supplement:'飛鳥與游龍是《洛神賦》形容神女的比喻；原畫也出現相應形象。這是圖文對讀，不把畫中動物一概當成比喻的直接圖解。',reading:['L1'],comparisons:[{label:'看神女姿態',actors:['L1']},{label:'看飛鳥與龍形',actors:['bird','dragon-first']}],observations:[observe('bird','飛鳥',fromTile(8,[1120,50,1330,152]),'先看神女附近的飛鳥。'),observe('dragon-first','開首龍形',fromTile(8,[1055,165,1375,435]),'再看飛鳥附近的龍形。')]},
 {noteTitle:'髮式與姿態',noteResult:'髮式相似，姿態不同。同一位神女，在畫中再次出現。',id:'C2',title:'同一人，另一時刻',name:'曹植',appearance:'比對鬚貌、面形與冠。',hint:'這一次，他坐在榻上，身旁仍有同行者。',region:'往畫卷中段，留意扇形儀物與坐榻。',speech:'這一刻，真想多留片刻。',lead:'再尋她，看看這一次她與岸上人怎樣相對。',result:'初見時獨立水邊，這裡又來到坐榻前。相似的髮式連起兩處身影，姿態則帶出不同時刻。',supplement:'重複人物的指認依冠髮、衣飾與場景比對；髮式相似是線索，不能單靠它確定所有身分。',reading:['L7','C2'],comparisons:[{label:'回看初見神女',actors:['L1']},{label:'回看坐榻前',actors:['L7','C2']}],observations:[observe('hair-L7','坐榻前的神女髮式',[11900,385,12080,535],'看看曹植面前神女的髮式。'),observe('hair-L1','初見神女髮式',[16960,430,17110,590],'回看初見神女，比較髮式。'),observePerson('L7','再看坐榻前神女的姿態。')]},
 {noteTitle:'兩岸相對',noteResult:'「恨人神之道殊」：人神殊途，相遇終須離別。',id:'L8',title:'相遇之後',name:'洛神',appearance:'再認她的眉眼與環形髮髻。',hint:'這次她低下身，身旁有長頸鳥形。',region:'看看送別隊伍左方、水岸附近。',speech:'水岸相隔，話還未說盡。',lead:'她將乘雲車離去。再認一次她的面孔。',result:'「恨人神之道殊」：人與神的道路不同。神女低身，曹植在岸上；相遇的故事走到離別。',supplement:'人神分離的意思來自《洛神賦》，不是單憑兩人的表情得出的結論。可分別回看兩處原畫。',reading:['L8'],comparisons:[{label:'看低身神女',actors:['L8']},{label:'看岸上曹植',actors:['C3']}],observations:[observePerson('L8','先看神女低身的姿態。'),observePerson('C3','再看對岸送別的曹植。')]},
 {noteTitle:'雲車離去',noteResult:'神女乘雲車離去，龍形在前牽引。',id:'L9',title:'雲車離去',name:'洛神',appearance:'留意額髮與面形，別把同行者當成她。',hint:'她與另一位人物同乘，身旁有圓形物。',region:'往前看，留意龍形與雲車聚集的場面。',speech:'雲車將遠，容我再回望。',lead:'她已遠去。再尋乘舟的曹植。',result:'神女乘上雲車，車前有龍形牽引。文字中的神話離別，在畫卷裡成了一支遠去的行列。',supplement:'《洛神賦》寫「六龍儼其齊首」。畫中龍形互相重疊，本段著重車駕與牽引的關係，不以逐條辨數作通關條件。',reading:['L9','cloud-car'],comparisons:[{label:'看神女與雲車',actors:['L9','cloud-car']},{label:'看車前龍形',actors:['dragon-link']}],observations:[observe('cloud-car','雲車車體',[6440,650,6770,830],'看看神女乘坐的雲車。'),observe('dragon-link','牽引車駕的龍形',[5880,540,6190,780],'再看車前牽引的龍形。')]},
 {noteTitle:'乘舟尋望',noteResult:'「御輕舟而上溯」：曹植乘舟，仍在尋望。',id:'C4',title:'仍想再望一眼',name:'曹植',appearance:'比對有鬚的面孔與冠。',hint:'他在樓船的上層，身旁另有同行者。',region:'雲車場面以左，有一艘樓船。',speech:'她已遠去，我仍沿水尋望。',lead:'舟行之後，畫卷還留下了他的身影。',result:'「御輕舟而上溯」：乘舟逆水尋望。畫中曹植在上層，舟人在下層操船；她已離去，他仍在追尋。',supplement:'文本的「輕舟」與畫中的樓船並非精確同物；這裡連讀的是乘舟尋望的故事，不據此還原船型。',reading:['C4','boatman-left'],comparisons:[{label:'看上層曹植',actors:['C4']},{label:'看下層舟人',actors:['boatman-left']}],observations:[observePerson('C4','先看樓船上層的曹植。'),observePerson('boatman-left','再看下層操船的人。'),observe('boat-oar','船邊操船長桿',[4160,770,4250,990],'看看舟人伸向水面的長桿。')]},
];
export const luoshenEnding=[
 {title:'回到岸邊',question:'看看岸邊坐榻上的曹植。',observation:observePerson('C5','點看岸邊坐榻上的曹植。'),result:'曹植又在岸邊出現，冠髮與鬚貌依然可認。',supplement:'身前器物的名稱仍待核實。本段以人物與場景作觀察依據，不以未確定的器物名稱解釋故事。'},
 {title:'踏上歸途',question:'看看歸途車駕的車輪。',observation:observe('carriage-wheel','歸途車輪',[1005,765,1145,990],'點看車駕的車輪。'),result:'由樓船、岸邊到車駕，旅程仍在繼續。'},
 {title:'足往心留',question:'再看車中戴冠、留鬚的曹植。',observation:observePerson('C6','點看車中的曹植。'),result:'人已上路，心仍留在洛水。反覆的身影，串起不同時刻。'},
];
export const luoshenFindings=[{id:'dragon',name:'龍形',text:'開首可見單獨的龍形，雲車前又有龍形相連。留意它們的位置：一處伴著神女，一處牽引車駕。'},{id:'boat',name:'舟船',text:'上層是曹植與同行者，下層是操船的人。沿著上下兩層看，便能分清乘舟尋望與操船的不同角色。'},{id:'canopy',name:'華蓋',text:'隊伍上方的蓋與長柄，是找華蓋的線索。它在人間隊伍與雲車附近都出現；回看時，比較蓋的輪廓和旁邊的人。'},{id:'bird',name:'鳥形',text:'開首的鳥在飛，離別處的長頸鳥伴在神女身旁。比較姿態與相伴的人，再讀「翩若驚鴻」的比喻。'},{id:'ribbon',name:'衣帶',text:'順著衣帶看，長線隨人物回轉而彎曲。比較兩處身影，便能看出姿態的變化；衣帶的方向不等同真實風向。'}];
/** Local rectangles in 1995×943 unchanged tiles; convert to the research coordinate system. */
export const luoshenNewCollectionSites:[string,string,number,Box][]=[
 ['bird-0','開首左側飛鳥',8,[1125,55,1222,124]],
 ['bird-1','開首右側飛鳥',8,[1220,86,1325,146]],
 ['bird-2','送別場面的長頸鳥形',4,[140,635,280,755]],
 ['ribbon-0','初見神女身旁衣帶',8,[810,480,985,550]],
 ['ribbon-1','回身神女身旁衣帶',7,[1570,540,1695,591]],
 ['ribbon-2','下方同行神女衣帶',7,[286,536,390,591]],
 ['ribbon-3','下方回身神女衣帶',7,[465,611,610,651]],
 ['ribbon-4','上方持物神女衣帶',7,[1280,243,1405,317]],
 ['ribbon-5','柳旁神女衣帶',6,[1235,548,1355,593]],
 ['ribbon-6','雙人場面後方衣帶',6,[761,389,872,431]],
 ['ribbon-7','雙人場面前方衣帶',6,[813,468,963,515]],
 ['ribbon-8','上方雙人場面後方衣帶',6,[1760,240,1850,280]],
 ['ribbon-9','上方雙人場面前方衣帶',6,[1880,273,1994,316]],
 ['ribbon-10','水上神女肩後衣帶',5,[762,343,890,385]],
 ['ribbon-11','坐榻前神女衣帶',5,[1755,460,1905,520]],
 ['ribbon-12','俯身者腰側衣帶',5,[1065,682,1165,735]],
 ['ribbon-13','低身神女下方衣帶',4,[-20,758,200,792]],
];
export const luoshenCollectibles=[
 ...luoshenNewCollectionSites.map(([id,name,tile,box])=>({...luoshenActor(id,name,fromTile(tile,box),'object'),category:id.startsWith('bird-')?'bird':'ribbon'})),
 ...[[17240,260,17620,480],fromTile(2,[1560,420,1670,500]),fromTile(2,[1620,475,1740,555]),fromTile(2,[1705,515,1820,595]),fromTile(2,[1780,550,1895,635]),fromTile(2,[1845,595,1950,680]),fromTile(2,[1910,640,2025,730])].map((b,i)=>({...luoshenActor(`dragon-${i}`,'龍形',b as unknown as Box,'object'),category:'dragon'})),
 {...luoshenActor('boat-0','樓船',[3900,250,5150,1030],'object'),category:'boat'},
 ...[[18100,310,18580,480],[8700,450,9070,580],[3040,440,3340,560],[6400,250,6640,415],[900,430,1160,570]].map((b,i)=>({...luoshenActor(`canopy-${i}`,'華蓋',b as unknown as Box,'object'),category:'canopy'})),
];
export const luoshenSources=[{label:'館方影像授權與使用條件',href:'https://www.dpm.org.cn/bottom/apply_image'},{label:'故宮藏品介紹：指定宋摹本',href:'https://www.dpm.org.cn/collection/paint/234597.html'},{label:'館方原畫看圖器',href:'https://www.dpm.org.cn/bigimg/737/0'},{label:'故宮：龍在蒼穹',href:'https://minghuaji.dpm.org.cn/specialTopic/view/7'},{label:'《洛神賦》錄文：另一件書法作品的館方介紹',href:'https://www.dpm.org.cn/subject_zhaomengfu/achievement/245842.html'}];
/** Short fictional speech grounded in each figure's visible role or position. */
const luoshenReplies:Record<string,readonly string[]>={
 "held-object-goddess": ["我在上方持物而立。", "長長的衣帶繞在身旁。", "同卷上下，各有相伴的身影。"],
 "cloud-spirit-right": ["我隨雲車出現在水上。", "身形與雲氣交錯在一起。", "看看車旁還有哪些神靈。"],
 "C1": [
  "我剛在岸上停下腳步。",
  "同行的人還在我身後。",
  "先看我展開的衣袖吧。"
 ],
 "C2": [
  "這一刻，我已坐在榻上。",
  "面前又有神女的身影。",
  "坐下來，目光仍向著她。"
 ],
 "C3": [
  "我在岸上與她相對。",
  "身後的隊伍仍在這裡。",
  "看看我與她之間的水岸。"
 ],
 "C4": [
  "我站在樓船的上層。",
  "下面的人正在操船。",
  "離開水岸，我仍在尋望。"
 ],
 "C5": [
  "我又在岸邊坐下了。",
  "認得我的冠與鬚髮嗎？",
  "船上之後，畫中又有我。"
 ],
 "C6": [
  "這一刻，我在車中。",
  "車輪與隊伍將一同上路。",
  "人已啟程，心還在洛水。"
 ],
 "L1": [
  "這是水邊初見的一刻。",
  "留意我身旁延展的衣帶。",
  "上方還有飛鳥與龍形。"
 ],
 "L2": [
  "看看這裡回轉的姿態。",
  "衣帶隨著身形轉向。",
  "和初見時的站姿比一比。"
 ],
 "L3": [
  "這裡的神女不止一位。",
  "先認髮式，再比衣帶。",
  "不要只靠人物的站位。"
 ],
 "L4": [
  "上方也有相伴的身影。",
  "兩人的姿勢並不相同。",
  "留意髮式與衣帶的輪廓。"
 ],
 "L5": [
  "柳旁還藏著回身的一刻。",
  "看看頭與衣帶朝向哪裡。",
  "同卷的姿態正在改變。"
 ],
 "L6": [
  "相近的身影站在一起。",
  "認人時，別只看一件衣服。",
  "把髮式與場面一起比對。"
 ],
 "L7": [
  "我在坐榻前又現身了。",
  "和初見時的姿態比一比。",
  "岸上的人也仍在這裡。"
 ],
 "L8": [
  "這一次，我低下身來。",
  "身旁有長頸的鳥形。",
  "再看看與我相對的岸上人。"
 ],
 "L9": [
  "這是雲車中的一刻。",
  "同行者就在我的身旁。",
  "車前的龍形帶著行列前進。"
 ],
 "attendant-opening-left": [
  "我在展袖的人身旁。",
  "我們的衣袖姿態不同。",
  "沿著人群找找這個分別。"
 ],
 "attendant-opening-rear": [
  "看看頭頂那片傘蓋。",
  "長柄就在隊伍之中。",
  "抬頭看，也能發現線索。"
 ],
 "attendant-opening-beard": [
  "先看我的長鬚與收袖。",
  "我的姿態與展袖者不同。",
  "不只面孔，動作也能認人。"
 ],
 "attendant-opening-middle": [
  "我站在同行的人群裡。",
  "前後的人物互相遮擋。",
  "慢慢分清各人的輪廓。"
 ],
 "attendant-opening-green": [
  "綠色衣袍也是一條線索。",
  "別漏看衣襟與袖口。",
  "同一隊人，衣色各有不同。"
 ],
 "attendant-opening-box": [
  "先看看我捧在身前的物件。",
  "它和衣袖的輪廓不同。",
  "隊伍裡不只有空手的人。"
 ],
 "horse-keeper": [
  "馬匹就在我的身旁。",
  "人與馬也佔著岸上一角。",
  "離開主角，畫面還很熱鬧。"
 ],
 "sitting-keeper": [
  "這裡有人蹲坐在岸邊。",
  "高低不同，輪廓便不同。",
  "別只找站著的人。"
 ],
 "companion-L3": [
  "我與另一位神女相伴。",
  "看看我們兩人的衣帶。",
  "相似之中，也有差別。"
 ],
 "companion-L4": [
  "這組身影在畫面上方。",
  "和下方的場面分開看。",
  "位置不同，未必是同一刻。"
 ],
 "companion-L6": [
  "旁邊還有相近的身影。",
  "把兩個髮式仔細比一比。",
  "同伴不能直接當成主角。"
 ],
 "attendant-seat-fan": [
  "坐榻旁有一柄扇形儀物。",
  "看看扇面和長柄。",
  "高處的器物也能指路。"
 ],
 "attendant-seat-front": [
  "我在坐榻旁垂著長鬚。",
  "坐著與站著的人相互映襯。",
  "看看我的袖子怎樣收攏。"
 ],
 "attendant-seat-green": [
  "這裡也有一件綠衣。",
  "衣色相近，場面卻變了。",
  "認人還要連著周圍看。"
 ],
 "attendant-farewell-back": [
  "傘蓋隨著岸上的隊伍。",
  "看看它在眾人上方的位置。",
  "和初見時的傘蓋比一比。"
 ],
 "attendant-farewell-beard": [
  "這段隊伍也有長鬚者。",
  "先分清前後幾個人。",
  "髮鬚相似，仍要看姿態。"
 ],
 "attendant-farewell-box": [
  "我在送別隊伍裡捧著物件。",
  "手邊的形狀別漏看。",
  "隊伍前進，器物也相隨。"
 ],
 "cloud-companion": [
  "我是雲車中的同行者。",
  "別把同乘的人混在一起。",
  "再仔細比對我們的面形。"
 ],
 "cloud-driver": [
  "我在龍形與雲車之間。",
  "順著龍身看行列的方向。",
  "雲上的旅程也有前後。"
 ],
 "boat-companion-one": [
  "我也站在樓船的上層。",
  "曹植身旁不止一人。",
  "先比冠髮，再看位置。"
 ],
 "boat-companion-two": [
  "上層靠旁還有我的身影。",
  "人物之間隔著船柱。",
  "別把欄柱看成衣帶。"
 ],
 "boatman-left": [
  "我在船邊握著長桿。",
  "看看長桿怎樣伸向水面。",
  "樓上的人與我各有位置。"
 ],
 "boatman-right": [
  "另一邊也有人操船。",
  "沿著船身找我的動作。",
  "一艘船裡有不同的角色。"
 ],
 "shore-attendant": [
  "我站在岸邊坐榻之後。",
  "人物與傘柄交錯在一起。",
  "先找頭部，再順著衣袍看。"
 ],
 "shore-standing": [
  "坐候的人旁邊也有人站著。",
  "一坐一立，位置便清楚了。",
  "這是岸上另一刻的隊伍。"
 ],
 "carriage-front": [
  "我在車駕前方相伴。",
  "車輪與人群連成歸途。",
  "看看隊伍朝哪一邊延展。"
 ],
 "carriage-horse-left": [
  "馬上的身影在這一側。",
  "人與坐騎要一起看。",
  "車駕旁還有騎行的人。"
 ],
 "carriage-horse-right": [
  "另一側也有騎者相隨。",
  "看看坐騎與車駕的距離。",
  "歸途不只有車中的一人。"
 ],
 "carriage-driver": [
  "我在車馬之間。",
  "長柄、車輪與馬身交錯。",
  "分清器物，再看人的動作。"
 ],
 "carriage-rear": [
  "車後還有相伴的身影。",
  "別只盯著車中的面孔。",
  "隊伍一直延伸到這裡。"
 ],
 "drummer": [
  "大鼓就在我的身旁。",
  "先看鼓面，再看奏樂的人。",
  "水上的行列也有樂聲想像。"
 ],
 "wind-spirit": [
  "我的身影出現在雲上。",
  "看看雲氣怎樣圍著身形。",
  "這段畫面充滿神話想像。"
 ],
 "water-attendant": [
  "我在水畔俯下身來。",
  "姿態與站立的人不同。",
  "看看手與水面的距離。"
 ],
 "floating-woman": [
  "水上還有隨行的神女。",
  "衣帶在身旁伸展。",
  "主角以外，行列仍在繼續。"
 ]
};
export function luoshenReply(id:string,visit:number){
 const lines=luoshenReplies[id];
 return lines?.[Math.min(visit,lines.length-1)]??"再看看這一處的姿態。";
}
