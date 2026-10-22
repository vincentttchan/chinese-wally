import {assetPath} from './assets.ts';
import type {SceneActor} from './level.ts';
import type {PaintingRegion} from './lanternStudy.ts';

/** All positions refer to the unchanged 6455×1378 reproduction, including mounting. */
export const zanhuaSize={width:6455,height:1378};
export const zanhuaImage=assetPath('art/zanhua/full-scroll.jpg');
export const zanhuaSource='https://commons.wikimedia.org/wiki/File:Zhou_Fang._Court_Ladies_Wearing_Flowered_Headdresses._(46x180)_Liaoning_Provincial_Museum,_Shenyang..jpg';
const person=(id:string,name:string,rect:number[]):SceneActor=>({id,name,kind:'candidate',x:(rect[0]+rect[2])/2/6455,y:(rect[1]+rect[3])/2/1378,width:(rect[2]-rect[0])/6455,height:(rect[3]-rect[1])/1378});
export const zanhuaPeople:SceneActor[]=[
 person('P1','垂首的女子',[5330,95,5910,1255]),
 person('P2','抬手的女子',[4210,70,4850,1350]),
 person('P3','執扇侍女',[3530,390,3915,1360]),
 person('P4','持花的女子',[2820,85,3520,1340]),
 person('P5','紅衣女子',[1645,255,2130,1100]),
 person('P6','斜首的女子',[950,100,1680,1360]),
];
// Mouth positions measured on the unchanged full-scroll reproduction.
export const zanhuaMouths:Record<string,{x:number;y:number}>=Object.fromEntries([
 ['P1',5644,350],['P2',4622,327],['P3',3715,589],['P4',3079,319],['P5',1807,418],['P6',1240,340],
].map(([id,x,y])=>[id,{x:Number(x)/6455,y:Number(y)/1378}]));
export const zanhuaHeads=[[5440,40,5830,450],[4400,30,4810,440],[3590,345,3890,675],[2920,0,3330,440],[1740,145,2000,495],[1080,10,1530,460]].map(([x,y,right,bottom])=>({x:x/6455,y:y/1378,width:(right-x)/6455,height:(bottom-y)/1378}));
export const zanhuaReplies:Record<string,string[]>={
 P1:['你看我的頭花，牠卻只看我的手。','我只動一下，牠便追了過來。','牠張着嘴，像要接住甚麼？'],
 P2:['花要簪得穩，袖子也得理一理。','你先看見花，還是衣上的大紋樣？','同樣是盛裝，細節卻各有不同。'],
 P3:['你們賞花，我手裡還有扇呢。','她們的花髻，和我的髮式可不同。','有人閒遊，也有人在旁侍候。'],
 P4:['薄薄一層，可還藏着不少線條。','我手裡的花，和髻上的可不同。','看見我的盛裝，也看看旁人的忙碌。'],
 P5:['畫得小，就一定站得遠嗎？','我的紅衣，隔着畫卷也看得見吧？','別急着猜我的名字，畫裡沒有寫呢。'],
 P6:['只憑這朵花，你能認出我嗎？','我們都簪花，髮飾卻各不相同。','認得我的樣貌，未必知道我的身世。'],
};
const polygon=(points:number[][]):PaintingRegion=>({points:points.map(([x,y])=>({x:x/6455,y:y/1378}))});
export const zanhuaSteps=[
 {id:'P1',portrait:assetPath('art/zanhua/portraits/P1-head-v2.png'),appearance:'她垂着頭，臉朝左下方。',hints:['她身穿深色外衣，手中拿着一件長柄物。','往畫卷的右半部找找。'],district:.76,
  found:'噓，別讓牠發現我把手停住了。',near:'誰在追着她的手？',title:'一幅靜畫，怎會有動作？',prompt:'她的手伸向何處？\n沿着長柄往下看，輕點抬頭的小犬。',interpretation:'垂首的目光、斜伸的長柄、仰頭的小犬，\n連成一次逗弄。畫面靜止，卻讓人想像下一刻。',insight:'小犬讓盛裝女子有了眼前的牽掛，也把我們的視線從頭飾帶到地面。不過，畫面沒有告訴我們她的姓名，也不能憑這個動作判定她一生快樂或寂寞。',reflection:'牠只顧追我手邊；你可看見我的目光？',clue:'我的紅裙藏在外衣下。拈花的那位，穿戴又有甚麼不同？',label:'人物與小犬',action:'點擊她手邊的小犬',focus:{x:5250/6455,y:760/1378},
  region:polygon([[4900,1115],[4920,1068],[4965,1063],[5002,1031],[5055,1018],[5098,1041],[5124,1024],[5140,1056],[5110,1090],[5125,1126],[5050,1154],[4995,1140],[4930,1143]]),
 },
 {id:'P4',portrait:assetPath('art/zanhua/portraits/P4-head-v2.png'),appearance:'她的臉較直立，稍向左轉。',hints:['她有一隻手伸在身前，拿着一朵花。','看看畫卷中段。'],district:.49,
  found:'看着輕巧，穿戴可不止一層。',near:'薄衣藏着甚麼？',title:'薄衣之下，還看見甚麼？',prompt:'輕點肩臂上的外衣。\n試着分辨外層衣線與裡面的手臂。',interpretation:'外衣之內，仍透出手臂與裡衣。\n看似輕巧的閒遊，也藏着精心安排的盛裝。',insight:'再看執扇侍女：她手持長柄扇，髮式也不同。畫中既有遊賞者，也有侍奉者。這讓我們追問：誰享有閒暇，誰在支撐這份閒暇？這是由人物關係引出的問題，並非每位人物身世的定論。',reflection:'你見我手裡的花，可也見她手裡的扇？',clue:'她的紅帶束髻，和我們不同。找找斜着頭的那位，再看看她的髻上。',label:'輕薄外衣',action:'點擊她肩臂上的外衣',focus:{x:3190/6455,y:475/1378},
  region:polygon([[3150,335],[3215,365],[3255,410],[3265,460],[3230,530],[3160,550],[3105,505],[3130,435]]),
 },
 {id:'P6',portrait:assetPath('art/zanhua/portraits/P6-head-v2.png'),appearance:'她的頭向右傾，頸部也斜着。',hints:['她披着褐色外衣，一隻手抬在肩旁。','往畫卷的左半部找找。'],district:.24,
  found:'認得我的花，就算認得我了嗎？',near:'細看她的盛裝',title:'一朵頭花，能告訴我們多少？',prompt:'輕點高髻上的花。\n花朵之外，還有哪些細小裝飾？',interpretation:'大花、高髻、金色髮飾，把盛裝推到眼前。\n我們看得出她如何被描繪，卻還不能叫出她的名字。',insight:'館藏介紹把畫中人物分為五位簪花女子與一位執扇侍女。盛裝、寵物與侍奉關係，讓這一卷成為觀看貴族女性生活的線索；它不能代表所有女子的日常。作品傳為周昉作，作者與年代亦有討論，遊戲不替她們編造確定身分。',reflection:'花與衣裳留在畫裡，名字卻沒有留下。',clue:'衣裳、髻花，你都留意到了。再看看我們各自的手與目光，可還是三張相似的面孔？',label:'髮髻上的花',action:'點擊她髮髻上方的花朵',focus:{x:1300/6455,y:160/1378},
  region:polygon([[1220,28],[1280,10],[1340,20],[1400,10],[1455,45],[1440,115],[1380,140],[1305,135],[1250,115]]),
 },
];
