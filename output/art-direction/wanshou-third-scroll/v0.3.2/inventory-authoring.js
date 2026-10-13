// Authoring coordinates transcribed while viewing original native crops, 2026-10-12.
// Export script writes data only. It does not execute gameplay or run tests.
import fs from 'node:fs';
import vm from 'node:vm';
const folder=new URL('.',import.meta.url);
const previous=JSON.parse(vm.runInNewContext(fs.readFileSync(new URL('../v0.3/chapter-data.js',folder),'utf8')+'\nJSON.stringify(chapter)'));
const groups=[];
function group(id,source,context,rows){groups.push({id,source,context,rows});}
// x/y = center of visible head. Colour and pose come from the original crop.
// Optional final value is the prior stable ID, retained for targets/saved first finds.
group('far-west','upper-2/upper-3',[750,0,2250,1200],[
 [1128,741,'灰綠','side','small'],[1504,797,'褐','back','small'],[1396,1045,'灰褐','front','small'],[1347,1067,'灰褐','back','small']
]);
group('far-center','upper-4',[2250,0,3000,1200],[
 [2795,648,'褐','front','small'],[2825,653,'藍','back','small']
]);
group('far-east','upper-5/upper-6',[3000,0,4500,1200],[
 [3013,996,'灰褐','front','small'],[3039,1015,'藍','back','small'],[3114,997,'褐','front','small'],[3299,1013,'藍','back','small'],[4344,682,'灰','side','small']
]);
group('grotto','upper-5/upper-6',[3550,790,4040,1200],[
 [3674,1062,'粉','side','standing'],[3727,1060,'灰綠','front','round-object'],[3768,1049,'綠','front','standing'],[3804,1033,'淡灰','side','standing'],[3827,1018,'藍','front','standing'],[3825,1069,'藍','side','drum'],[3926,1103,'粉','back','standing'],[3955,1087,'灰','side','standing'],[3989,1060,'綠','side','standing']
]);
group('upper-pavilion','middle-2',[750,1100,1500,1800],[
 [1029,1361,'淡綠','front','standing'],[1124,1326,'淡褐','side','discs'],[1165,1384,'彩','side','standing']
]);
group('crowd-west','middle-1/middle-2',[0,1100,880,1800],[
 [7,1496,'藍','front','edge'],[42,1515,'褐','back','standing'],
 [331,1477,'褐','front','standing'],[390,1452,'藍','front','standing'],[428,1478,'褐','back','standing'],[483,1455,'褐','front','standing'],[504,1475,'藍','back','standing'],[535,1454,'藍','front','standing'],[568,1465,'褐','front','standing'],[620,1456,'藍','front','standing'],[644,1514,'褐','front','standing'],[656,1430,'褐','side','standing'],[713,1417,'藍','front','standing'],[741,1435,'褐','front','standing'],[707,1470,'褐','back','standing'],[757,1466,'藍','back','standing'],[757,1393,'褐','side','standing'],[790,1410,'藍','front','standing'],[819,1432,'褐','front','standing'],[829,1396,'藍','front','standing'],[854,1401,'褐','front','standing']
]);
group('crowd-center','middle-2/middle-3',[1300,1320,1730,1610],[
 [1351,1448,'褐','back','standing'],[1380,1427,'褐','front','standing'],[1395,1433,'藍','back','standing'],[1388,1404,'褐','front','standing'],[1421,1391,'黃','front','standing'],[1458,1418,'藍','front','standing'],[1498,1435,'褐','back','standing'],[1488,1383,'褐','side','standing'],[1518,1375,'藍','side','standing'],[1544,1407,'藍','front','standing'],[1563,1410,'褐','front','standing'],[1589,1383,'褐','side','standing'],[1587,1437,'藍','front','standing'],[1616,1386,'黃','front','standing'],[1653,1399,'藍','front','standing'],[1686,1418,'褐','front','standing'],[1730,1486,'藍','front','standing']
]);
group('crowd-separated','middle-3',[1500,1100,2250,1800],[
 [1784,1382,'褐','side','standing'],[1874,1405,'藍','front','standing'],[1908,1378,'褐','side','standing'],[2177,1471,'褐','front','standing']
]);
group('crowd-building','middle-4',[2250,1100,3000,1800],[
 [2361,1381,'褐','front','standing'],[2404,1408,'藍','back','standing'],[2449,1347,'褐','front','standing'],[2485,1373,'藍','front','standing'],[2524,1348,'藍','front','standing'],[2505,1393,'褐','back','standing'],[2551,1382,'褐','front','standing'],[2613,1388,'藍','front','standing'],[2669,1363,'褐','side','standing'],[2703,1372,'藍','front','standing'],[2684,1439,'褐','front','standing']
]);
group('crowd-black-flags','middle-5',[3000,1100,3750,1800],[
 [3330,1328,'褐','front','standing'],[3381,1371,'藍','back','standing'],[3430,1314,'褐','front','standing'],[3480,1332,'藍','front','standing'],[3515,1309,'褐','front','standing'],[3499,1346,'褐','back','standing'],[3555,1335,'藍','front','standing'],[3740,1430,'褐','back','standing']
]);
group('crowd-white-flags','middle-6',[3970,1290,4500,1510],[
 [4028,1329,'藍','front','standing'],[4065,1355,'褐','back','standing'],[4098,1345,'藍','front','standing'],[4118,1366,'褐','front','standing'],[4182,1351,'褐','front','standing'],[4230,1355,'藍','back','standing'],[4264,1338,'褐','front','standing'],[4298,1432,'藍','front','standing'],[4354,1348,'褐','front','standing'],[4445,1353,'藍','back','standing'],[4479,1339,'褐','front','edge']
]);
group('red-front-west','middle-1/middle-2',[0,1100,1500,1800],[
 [32,1593,'紅','front','standing'],[136,1603,'紅','front','standing'],[218,1592,'紅','side','standing'],[311,1605,'紅','front','standing'],[395,1600,'紅','front','standing'],[499,1599,'紅','front','staff'],[574,1584,'紅','side','standing'],[700,1601,'紅','front','staff'],[765,1596,'紅','front','standing'],[884,1601,'紅','front','standing'],[955,1598,'紅','side','standing'],[1070,1602,'紅','front','standing'],[1145,1597,'紅','back','standing'],[1260,1603,'紅','front','standing'],[1334,1602,'紅','front','standing','red-left'],[1448,1594,'紅','side','raised','hand-at-hat']
]);
group('red-front-center','middle-3/middle-4',[1500,1100,3000,1800],[
 [1524,1595,'紅','side','standing','red-right'],[1645,1605,'紅','side','standing','red-further-right'],[1702,1594,'紅','front','standing'],[1843,1605,'紅','front','staff'],[1944,1603,'紅','side','standing'],[2048,1602,'紅','front','staff'],[2127,1606,'紅','front','standing'],[2240,1598,'紅','front','standing'],[2310,1600,'紅','side','standing'],[2444,1596,'紅','front','staff'],[2510,1592,'紅','front','standing'],[2645,1598,'紅','front','staff'],[2701,1591,'紅','front','standing'],[2759,1600,'藍','front','standing'],[2845,1599,'紅','front','staff'],[2910,1590,'紅','front','standing']
]);
group('red-front-east','middle-5/middle-6',[3000,1100,4500,1800],[
 [3020,1602,'紅','front','staff'],[3098,1601,'紅','side','standing'],[3212,1598,'紅','front','staff'],[3274,1605,'紅','front','standing'],[3395,1602,'紅','front','staff'],[3455,1590,'紅','front','standing'],[3595,1584,'紅','side','staff'],[3658,1586,'紅','front','standing'],[3763,1598,'紅','front','staff'],[3844,1594,'紅','side','standing'],[3953,1592,'紅','front','staff'],[4014,1583,'紅','front','standing'],[4144,1604,'紅','front','staff'],[4210,1593,'紅','front','standing'],[4334,1606,'紅','front','staff'],[4403,1589,'紅','side','standing']
]);
group('red-rear-west','lower-1/lower-2',[0,1750,1500,2780],[
 [51,2122,'紅','side','staff'],[138,2119,'紅','side','standing'],[234,2114,'紅','back','staff'],[303,2110,'紅','back','occluded'],[415,2114,'紅','back','staff'],[497,2124,'紅','back','occluded'],[598,2113,'紅','back','staff'],[678,2127,'紅','back','occluded'],[775,2124,'紅','back','small']
]);
group('red-rear-center','lower-3/lower-4',[1500,1750,3000,2780],[
 [1562,2094,'紅','back','staff'],[1623,2110,'紅','back','standing'],[1726,2094,'紅','back','staff'],[1948,2093,'紅','back','occluded'],[2007,2095,'紅','front','standing'],[2138,2095,'紅','back','occluded'],[2217,2103,'紅','back','occluded'],[2337,2098,'紅','back','occluded'],[2379,2096,'紅','back','small'],[2800,2099,'紅','back','small'],[2918,2098,'紅','back','staff'],[2987,2100,'紅','back','occluded']
]);
group('red-rear-east','lower-5/lower-6',[3000,1750,4500,2780],[
 [3113,2096,'紅','back','occluded'],[3184,2101,'紅','back','occluded'],[3301,2093,'紅','back','staff'],[3383,2095,'紅','back','occluded'],[3498,2086,'紅','back','staff'],[3565,2095,'紅','back','occluded'],[3759,2078,'紅','back','small'],[3842,2097,'紅','back','staff'],[3931,2094,'紅','back','occluded']
]);
group('wall-shoulders','lower-1/lower-2',[0,1750,1500,2780],[
 [14,2288,'藍','back','small'],[193,2254,'褐','back','small'],[260,2297,'藍','side','small'],[304,2294,'褐','back','small'],[390,2289,'褐','back','small'],[541,2287,'褐','back','small'],[574,2291,'藍','back','small'],[760,2272,'褐','back','small'],[1419,2285,'灰','side','small']
]);
group('lower-foreground','lower-1/lower-2',[0,1750,1500,2780],[
 [146,2502,'藍','side','occluded'],[321,2490,'藍','front','standing','watcher-blue'],[411,2521,'粉','back','standing','watcher-pink'],[458,2488,'淡灰','side','standing','watcher-pale'],[526,2505,'淡灰','side','standing','watcher-white'],[561,2534,'褐','back','standing','watcher-brown'],[666,2514,'彩','side','standing','watcher-pattern'],[713,2550,'淡黃','back','standing','watcher-yellow']
]);
group('lower-ensemble','lower-2',[750,1750,1500,2780],[
 [875,2353,'紅','front','standing','ensemble-standing-left'],[966,2337,'藍','front','discs','ensemble-discs-left'],[959,2400,'黃褐','side','drum','seated-drum'],[1015,2370,'灰','front','standing','ensemble-grey'],[1155,2345,'褐','side','raised','ensemble-horn'],[1187,2408,'藍','back','discs','ensemble-discs-right'],[1230,2327,'淡灰','side','standing','ensemble-standing-right']
]);
group('wall-court','lower-3/lower-4',[1500,1750,3000,2780],[
 [2236,2497,'褐','back','small'],[2320,2448,'藍','front','standing'],[2367,2471,'褐','side','standing']
]);
group('wall-east','lower-5/lower-6',[3000,1750,4500,2780],[
 [3680,2401,'藍','back','standing','wall-blue'],[3744,2371,'褐','side','standing','brown-green-hem']
]);
const excluded=[
 {id:'fragment-crowd-west',box:[669,1435,694,1467],source:'crowd-left',reason:'帽與面部只露出狹小片段，身體被相鄰人物遮住，不能可靠分開。'},
 {id:'fragment-crop-east-far',box:[4480,645,4500,751],source:'upper-6',reason:'人物沿右裁切邊界被截斷；只留部分頭身，不把缺失部分設熱區。'},
 {id:'fragment-crop-front-left',box:[0,1576,16,1730],source:'middle-1',reason:'紅衣人物主要部分在左裁切界外；與鄰人的袖邊不能可靠分開。'},
 {id:'fragment-crop-front-right',box:[4485,1580,4500,1735],source:'middle-6',reason:'紅衣人物只留裁切邊緣的部分衣身，面部在裁切界外。'},
 {id:'fragment-roof-red',box:[1410,2170,1461,2250],source:'lower-2',reason:'屋簷後只露出紅色衣身，頭部被屋頂遮住。'},
 {id:'fragment-wall-blue',box:[325,2275,353,2314],source:'lower-1',reason:'枝葉與院牆之間只露出小部分藍衣／帽邊，輪廓與相鄰人物難分。'},
 {id:'fragment-wall-dark-cap',box:[479,2288,516,2318],source:'lower-1',reason:'只露出帽頂，院牆遮住面部及身體，沒有足夠辨認特徵。'},
 {id:'fragment-lower-left-green',box:[0,2560,47,2634],source:'lower-1',reason:'左裁切邊只留部分綠衣身體，頭部在畫幅外。'},
 {id:'fragment-lower-pink',box:[50,2500,105,2602],source:'lower-1',reason:'斜欄後粉衣身體可見，頭部被欄杆和相鄰人物遮住，暫不確定獨立頭部輪廓。'},
 {id:'fragment-rock-rear-center',box:[3662,2037,3711,2073],source:'lower-5',reason:'山石後僅有帽頂片段，沒有可獨立分辨的臉或衣身。'},
 {id:'fragment-rock-rear-east-1',box:[4232,1888,4279,1936],source:'lower-6',reason:'紅帽狀片段大部分在山石／樹木後，只登記可見片段，不補出人物身體。'},
 {id:'fragment-rock-rear-east-2',box:[4435,2014,4474,2050],source:'lower-6',reason:'山石後只露出紅帽狀片段，未能確認可互動的獨立人物輪廓。'}
];
const templates={
 front:['你看得見我的面部。','我的身旁，還有幾位同行的人。'],
 side:['我的面部，朝着旁邊。','沿着帽子，再看看身體的方向。'],
 back:['你看見的是我的背面。','帽子和肩膀，也能幫你認人。']
};
const activity={
 staff:['長桿就立在我身旁。','把手的位置和長桿一起看。'],
 raised:['我的手，抬到了面前。','看看手與臉之間的位置。'],
 discs:['兩片圓盤就在我的手邊。','先看形狀，再比較兩手的持法。'],
 'round-object':['圓形的持物就在我面前。','先看形狀，再看看手放在哪裡。'],
 drum:['我的面前，放着一面鼓。','看看雙手伸向哪一邊。'],
 small:['部分輪廓，被前景遮住了。','看看還露出的帽子與肩膀。'],
 occluded:['眼前的物件，擋住了部分輪廓。','沿着可見輪廓，慢慢分辨。'],
 standing:['看看我身旁的人站在哪裡。','前後位置，讓人物分開來。'],
 edge:['我站在畫幅邊緣。','還留在畫內的輪廓，也值得看。']
};
const people=[];
for(const g of groups)for(let i=0;i<g.rows.length;i++){
 const [x,y,color,pose,kind,stable]=g.rows[i],id=stable||`${g.id}-${String(i+1).padStart(2,'0')}`,old=previous.people.find(p=>p.id===id);
 const half=kind==='small'?12:kind==='edge'?13:16,height=kind==='small'?48:kind==='occluded'?78:kind==='edge'?115:130;
 const head=[Math.max(0,x-half),y-18,Math.min(4500,x+half),y+18];
 const box=old?.box||[Math.max(0,x-25),y-18,Math.min(4500,x+27),Math.min(2780,y+height)];
 const polygon=old?null:[[x-half,y-18],[x+half,y-18],[x+half,y+15],[x+23,y+31],[x+22,y+height],[x-21,y+height],[x-23,y+31],[x-half,y+15]].map(([a,b])=>[Math.min(4500,Math.max(0,a)),b]);
 const greetings=[`${color}色衣服，和旁人比比。`,'從帽沿，往下看看衣領。','也看看我衣袖的輪廓。','你還可以比較我們的姿勢。',`${color}色的衣服，在這裡。`,'先看看帽子，再看看身旁。'];
 const lines=old?.lines||[greetings[i%greetings.length],templates[pose][i%2],activity[kind][i%2]];
 people.push({id,name:old?.name||`${color}衣人物`,box,head,...(polygon?{polygon}:{}),lines,source:g.source,context:g.context,visible:{color,pose,kind},coordinateStatus:'native-source visual registration; touch hit calibration pending'});
}
// Keep original head areas for the three established observation targets.
for(const r of previous.rounds){const p=people.find(p=>p.id===r.id);p.head=r.head;}
const yellow=people.find(p=>p.id==='watcher-yellow');yellow.name='亭前的淡黃衣人';yellow.lines=['我站在彩衣人物旁邊。','看看我們之間的位置。','院牆與屋簷，也在我們身旁。'];
const inventory={date:'2026-10-12',scope:'selected native 4500x2843 segment; full-scroll coverage not claimed',inspection:'18 overlapping native crops plus 3 crowd closeups; individually transcribed head positions',people,excluded,groups:groups.map(g=>({id:g.id,source:g.source,context:g.context,count:g.rows.length}))};
fs.writeFileSync(new URL('people-inventory.json',folder),JSON.stringify(inventory,null,2)+'\n');
fs.writeFileSync(new URL('inventory.js',folder),'const nativeInventory = '+JSON.stringify(inventory,null,2)+';\nchapter.people = nativeInventory.people;\n');
const rows=['id\t名稱\t首次\t再次\t後續\t性質',...people.map(p=>[p.id,p.name,...p.lines,'遊戲虛構對白'].join('\t'))];
fs.writeFileSync(new URL('dialogues.tsv',folder),rows.join('\n')+'\n');
const combined=['chapter-data.js','inventory.js','collection-revisions.js','diagnostic-revisions.js'].map(n=>fs.readFileSync(new URL(n,folder),'utf8')).join('\n');
const bundle=JSON.parse(vm.runInNewContext(combined+'\nJSON.stringify({chapter,objectReview})'));
fs.writeFileSync(new URL('collection-inventory.json',folder),JSON.stringify({...bundle.objectReview,instances:bundle.chapter.objects,categories:bundle.chapter.collections.map(c=>({...c,instances:bundle.chapter.objects.filter(o=>o.category===c.id).map(o=>o.id)}))},null,2)+'\n');
fs.writeFileSync(new URL('hotspots.json',folder),JSON.stringify({version:'0.3.2',coordinateSystem:'native source crop [8000,0,12500,2843]; origin at segment top-left',people,objects:bundle.chapter.objects,observations:bundle.chapter.rounds.map(r=>({target:r.id,points:r.comparison,recognitionFeatures:r.recognitionFeatures||[]})),ending:bundle.chapter.ending},null,2)+'\n');
console.log(JSON.stringify({people:people.length,excluded:excluded.length,groups:groups.length,objects:bundle.chapter.objects.length}));
