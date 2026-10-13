'use strict';
// Native coordinates of official 0778/img0002 crop [8000,0,12500,2843].
// Names describe visible features; dialogue is fictional game writing.
const chapter = {
 id:'kangqu-listening', version:'0.3', width:4500, height:2843,
 native:'../stage-and-crowd-native.png', full:'../v0.2/sources/third-scroll-public-33949x800.jpg',
 fullWidth:33949, fullHeight:800,
 registration:[[.2855545467915332,-.000034478872090163455,16861.890523346945],[.0006649007606286217,.29427333635476266,-17.10673868275267]],
 rounds:[
  {id:'seated-drum',box:[930,2375,1018,2532],head:[935,2375,978,2418],near:[1080,2290],safeY:2275,
   clothes:'穿黃褐色衣服，坐着。',region:'看看下方有粉紅幔帳的亭子。',greeting:'看看我的雙手，再看看旁人。',
   comparison:[{label:'先點他面前的鼓。',box:[974,2453,1068,2544]},{label:'再點旁人手中的成對圓盤。',box:[907,2347,969,2420]}],
   center:[1060,2410],answer:'同在亭內，人物手中的器物各不相同。把雙手和持物一起看，便能分辨各自的動作。',next:'同行的人，姿勢也各有不同。'},
  {id:'hand-at-hat',box:[1405,1560,1488,1749],head:[1427,1555,1467,1620],near:[1580,1490],safeY:1495,
   clothes:'紅色花紋長袍，一手抬到帽邊。',region:'看看上方亭前的紅衣行列。',greeting:'同行的人，姿勢各有不同。',
   comparison:[{label:'先點他抬到帽邊的手。',box:[1409,1568,1434,1601]},{label:'再點右旁人物放在身前的手。',box:[1510,1605,1542,1634]}],
   center:[1480,1620],answer:'相近衣着把人物連成行列；抬手與放手的差別，讓每個人的動作仍然可辨。',next:'院牆外，也有人各有朝向。'},
  {id:'brown-green-hem',box:[3710,2338,3800,2545],head:[3718,2335,3772,2401],near:[3600,2290],safeY:2250,
   clothes:'褐色上衣，綠色條紋下擺。',region:'看看右下方彩繪院牆外。',greeting:'看看我，再看看身旁那位。',
   comparison:[{label:'先點褐衣人物朝向旁人的頭部。',box:[3718,2335,3772,2401]},{label:'再點藍衣人物背向我們的頭部。',box:[3648,2374,3698,2424]}],
   center:[3710,2430],answer:'一人朝向旁人，一人背向我們。面部與身體的朝向，讓我們看見兩人的位置關係。',next:''}
 ],
 collections:[
  {id:'drum',name:'鼓',art:'../v0.2/journal-art/drum-illustration-v1.png',hint:'留意人物面前的鼓。',observation:'鼓放在人物面前，雙手朝鼓面伸去。',explanation:'把器物和人物一起看，觀察持物、動作與位置。具體鼓種和演奏方式尚未判定。'},
  {id:'discs',name:'成對圓盤',art:'../v0.2/journal-art/discs-illustration-v1.png',hint:'看看兩手持着圓片的人。',observation:'人物的雙手，各持一片圓盤。',explanation:'先比較形狀與持法；圖樣依原畫製作，器物的正式名稱仍待查證。'},
  {id:'flag',name:'旗幟',art:'../v0.2/journal-art/flag-illustration-v1.png',hint:'街上有高高舉起的旗。',observation:'旗面顏色不同，沿着街衢排列。',explanation:'留意旗形、顏色與持旗者的位置；不從顏色推定制度功能。'},
  {id:'painted-wall',name:'彩繪牆面',art:'../v0.2/journal-art/painted-wall-illustration-v1.png',hint:'院牆上的圖案，也值得停步。',observation:'院牆各段，都畫着不同圖案。',explanation:'把裝飾和人物所在的院落一起看。圖案的具體名稱與寓意未作判定。'}
 ],
 // Each visible object instance has its own hit shape. No group-wide people boxes.
 objects:[
  {id:'drum-pavilion',category:'drum',box:[974,2453,1068,2544]},
  {id:'drum-grotto',category:'drum',box:[3806,1085,3867,1148]},
  {id:'discs-pavilion-left',category:'discs',box:[908,2341,969,2419]},
  {id:'discs-pavilion-right',category:'discs',box:[1123,2382,1165,2427]},
  {id:'discs-upper-pavilion',category:'discs',box:[1095,1330,1148,1379]},
  {id:'discs-grotto',category:'discs',box:[3688,1080,3711,1100]},
  ...[2823,3013,3193,3383,3573,3765,3944,4129,4319].map((x,i)=>({id:'flag-upper-'+(i+1),category:'flag',polygon:[[x+3,1366],[x+155,1404],[x+86,1438],[x+164,1454],[x+3,1464]]})),
  ...[1542,1735,1926,2115,2310,2889,3083,3273,3469,3660,3848,4040,4235,4430].map((x,i)=>({id:'flag-lower-'+(i+1),category:'flag',polygon:[[x+3,1830],[Math.min(4499,x+146),1870],[Math.min(4499,x+94),1901],[Math.min(4499,x+151),1933],[x+3,1946]]})),
  // Only the visible white cloth above the foreground roof is clickable.
  {id:'flag-lower-roof-left',category:'flag',polygon:[[2508,1824],[2543,1831],[2565,1847],[2510,1847]]},
  {id:'flag-lower-roof-right',category:'flag',polygon:[[2705,1825],[2751,1834],[2799,1859],[2849,1845],[2849,1878],[2770,1880],[2737,1870]]},
  ...[[0,2417,64,2500],[115,2398,280,2490],[330,2395,488,2493],[546,2398,713,2490],[1362,2408,1474,2502],[1501,2410,1654,2500],[1723,2365,1764,2480],[1815,2327,1984,2418],[2030,2330,2180,2418],[2235,2327,2338,2417],[2805,2325,2928,2411],[3072,2325,3180,2410],[3410,2306,3577,2416],[3620,2310,3715,2373]].map((box,i)=>({id:'wall-'+(i+1),category:'painted-wall',box}))
 ],
 // First interaction coverage: selected people in three close-reading groups below.
 people:[
  {id:'seated-drum',name:'坐着的黃衣人',box:[930,2375,1018,2532],lines:['看看我的雙手，再看看旁人。','我的面前，是這面鼓。','身旁的人，拿着不同的器物。']},
  {id:'hand-at-hat',name:'抬手的紅衣人',box:[1405,1560,1488,1749],lines:['同行的人，姿勢各有不同。','我的手，正抬到帽邊。','也看看旁人的手放在哪裡。']},
  {id:'brown-green-hem',name:'牆外的褐衣人',box:[3710,2338,3800,2545],lines:['看看我，再看看身旁那位。','他背向你，我朝着他。','從我們的朝向，再看看位置。']},
  {id:'ensemble-discs-left',name:'持圓盤的藍衣人',box:[917,2309,998,2442],lines:['我兩手拿着不同的圓片。','看看它們一前一後的位置。','亭內的人，持物各有不同。']},
  {id:'ensemble-grey',name:'亭內的灰衣人',box:[997,2327,1060,2460],lines:['我站在坐着的人旁邊。','看看我們雙手放在哪裡。','同在亭內，姿勢也不同。']},
  {id:'ensemble-horn',name:'舉長管的褐衣人',box:[1088,2290,1174,2440],lines:['看看我手中長長的器物。','我的手舉在面前。','沿着持物，再看看朝向。']},
  {id:'ensemble-discs-right',name:'側坐的藍衣人',box:[1108,2377,1207,2535],lines:['我側身坐在這裡。','兩手的持物，靠在身前。','也看看我朝着哪一邊。']},
  {id:'ensemble-standing-right',name:'亭右的淡衣人',box:[1207,2290,1271,2480],lines:['我站在亭子的右邊。','和坐着的人比比身高。','站着、坐着，各有姿勢。']},
  {id:'ensemble-standing-left',name:'柱旁的紅衣人',box:[845,2321,894,2500],lines:['柱子就在我身旁。','我站着，旁人卻坐着。','看看柱子把畫面分成幾段。']},
  {id:'watcher-blue',name:'亭前的藍衣人',box:[274,2461,385,2650],lines:['順着我的朝向，看看亭子。','我身旁還有幾個人。','亭前、亭內，位置不同。']},
  {id:'watcher-pink',name:'亭前的粉衣人',box:[391,2491,450,2641],lines:['我背向着畫外。','看看我朝向哪一邊。','同一位置，可以有不同朝向。']},
  {id:'watcher-pale',name:'亭前的淡衣人',box:[438,2460,509,2637],lines:['我站在粉衣人旁邊。','衣服淺，旁人的衣服深。','也留意我們各自的朝向。']},
  {id:'watcher-white',name:'亭前的白衣人',box:[502,2480,546,2627],lines:['我就在幾個人中間。','看看身旁人的前後位置。','人群裏，也能比較姿勢。']},
  {id:'watcher-brown',name:'背向的褐衣人',box:[522,2520,605,2665],lines:['你看見的是我的背面。','帽子和肩膀，仍可辨認。','順着身體，看看我的朝向。']},
  {id:'watcher-pattern',name:'亭前的彩衣人',box:[621,2487,700,2675],lines:['我的衣服有多種顏色。','我站在淡衣人旁邊。','衣色之外，再看看動作。']},
  {id:'watcher-yellow',name:'朝亭子的淡黃衣人',box:[683,2509,749,2620],lines:['我朝着亭子的方向。','你可以順着我的朝向看。','持物的人，正在亭子裏。']},
  {id:'red-left',name:'行列中的左旁紅衣人',box:[1292,1570,1373,1734],lines:['我們穿着相近的衣服。','看看雙手放在身前。','行列整齊，姿勢仍有不同。']},
  {id:'red-right',name:'行列中的右旁紅衣人',box:[1488,1565,1555,1745],lines:['我的手放在身前。','旁人的手抬得更高。','同樣衣色，也可以比動作。']},
  {id:'red-further-right',name:'再右旁的紅衣人',box:[1606,1574,1673,1740],lines:['我站在這條行列上。','看看身前的雙手。','也留意我們轉身的方向。']},
  {id:'wall-blue',name:'背向的藍衣人',box:[3635,2374,3735,2555],lines:['你看見的是我的背面。','我的帽子，朝向旁人。','院牆就在我們身後。']}
 ],
 regions:[{name:'看整段街衢',center:[2250,1700],scale:.32},{name:'上方亭前',center:[1250,1450],scale:.65},{name:'下方院落',center:[920,2410],scale:.65},{name:'院牆與街面',center:[3400,2190],scale:.55},{name:'山石內的小亭',center:[3780,1015],scale:.75}],
 ending:[{label:'先點亭內一位持器物的人。',ids:['seated-drum','ensemble-discs-left','ensemble-horn','ensemble-discs-right']},{label:'再點亭前一位朝亭子望去的人。',ids:['watcher-yellow','watcher-blue']}]
};
