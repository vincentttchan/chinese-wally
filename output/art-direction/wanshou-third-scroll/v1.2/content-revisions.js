// Research-backed copy revisions for v0.8. Geometry and interaction remain unchanged.
const contentRounds={
 'seated-drum':{
  observationTitle:'鼓與鈸合成樂聲',
  answer:'鼓與鈸並置，亭內人物不是各自持物，而是一組正在配合的樂手。畫家用樂器與擊奏手勢，讓無聲的長卷留下慶典的聲音。',
  next:'同一場慶典，還有整齊的儀仗。'
 },
 'hand-at-hat':{
  observationTitle:'人群其實是儀仗',
  answer:'相同花袍和等距排列，把人物連成儀仗，而非普通街上人群。第三卷以樂隊、旗仗組成簡化的大駕鹵簿，將皇太后萬壽與南巡禮成合為「駢慶」。',
  next:'祝壽之意，也藏在院牆圖案裏。'
 },
 'brown-green-hem':{
  observationTitle:'看見暗八仙',
  greeting:'看看我身後的院牆，圖案並非隨意畫上。',
  comparison:[
   {label:'先點左旁牆上的荷花。',box:[3410,2306,3577,2390]},
   {label:'再點人物身後的花籃。',box:[3620,2308,3778,2420]}
  ],
  answer:'荷花與花籃不是兩幅無名裝飾：它們和沿牆其餘寶物合成「暗八仙」。這組圖案以八件寶物代替八仙，取逢凶化吉之意，也讓院牆本身成為祝壽布景。'
 }
};
chapter.rounds.forEach(round=>Object.assign(round,contentRounds[round.id]||{}));
// Keep the visible hand box precise; allow a usable screen-sized tap nearby.
chapter.rounds[1].comparison[1].tapSize=48;
chapter.rounds[1].comparison[1].exclusions=chapter.people.map(person=>person.head);

const contentCollections={
 drum:{
  observation:'鼓放在人物面前，雙手朝鼓面伸去；旁邊另有人持鈸。',
  explanation:'鼓與鈸同在亭內，構成合奏而非兩件孤立器物。長卷不會發聲，畫家以持物與擊奏手勢提示慶典的樂聲。',
  evidence:'畫面判讀：鼓、鈸與樂手集中在同一亭內。'
 },
 discs:{
  name:'鈸',
  hint:'看看兩手各持一片鈸的人。',
  observation:'人物雙手各持一片圓形鈸片，兩片開合便可相擊發聲。',
  explanation:'這件樂器可判定為鈸，而非泛稱「成對圓盤」。它與鼓並看，說明亭內人物正在合奏。',
  evidence:'名稱依據：故宮研究列出的第三卷樂隊編制包括銅鈸；原畫亦清楚畫出雙手分持兩片。'
 },
 flag:{
  name:'儀仗旗',
  observation:'不同顏色的旗幟由持旗者成列舉起，與樂隊同在街衢。',
  explanation:'這些旗幟屬於畫中的儀仗陳設。故宮研究從樂隊、旗幡與隊列判定第三卷畫有簡化的大駕鹵簿，用來表現萬壽與南巡禮成的「駢慶」。',
  evidence:'研究結論：第三卷的樂隊排列與旗幡陳設，可和大駕鹵簿制度相互對讀。'
 },
 'painted-wall':{
  name:'暗八仙',
  hint:'找找院牆上的荷花、花籃、葫蘆或扇。',
  observation:'院牆分格畫出荷花、花籃、葫蘆、扇、玉板等器物，周圍繫着飄帶。',
  explanation:'葫蘆代表鐵拐李，扇代表漢鍾離，花籃代表藍采和，漁鼓代表張果老，荷花代表何仙姑，寶劍代表呂洞賓，洞簫代表韓湘子，玉板代表曹國舅。以物代仙，所以稱「暗八仙」；整組有逢凶化吉之意，在這幅萬壽圖中亦成為祝壽布景。',
  evidence:'圖案名稱與寓意：故宮將八仙所持八件寶物組成的裝飾紋樣定名為「暗八仙」，並記載其逢凶化吉的吉祥意涵。'
 }
};
chapter.collections.forEach(collection=>Object.assign(collection,contentCollections[collection.id]||{}));

chapter.sources={
 painting:{label:'故宮館藏資料',url:'https://www.dpm.org.cn/collection/paint/232815.html'},
 procession:{label:'故宮：〈「駢慶」卷名考析〉',url:'https://www.dpm.org.cn/journal/247006.html'},
 motif:{label:'故宮：暗八仙',url:'https://www.dpm.org.cn/lemmas/241137.html'}
};
chapter.ending=[
 {label:'先點亭內一位樂手，回看慶典的聲音。',ids:['seated-drum','ensemble-discs-left','ensemble-horn','ensemble-discs-right']},
 {label:'再點亭前朝向舞臺的人，回看表演與觀看。',ids:['watcher-yellow','watcher-blue']}
];
chapter.version='0.8';
// v0.9: people are selected for their visible participation in the celebration.
const previousDrummer=chapter.rounds[0];
const flagBearer=chapter.people.find(person=>person.id==='red-front-east-05');
const costumedFigure=chapter.people.find(person=>person.id==='watcher-pattern');
flagBearer.head=[3370,1565,3420,1625];
costumedFigure.head=[635,2468,690,2538];
chapter.rounds=[
 {...previousDrummer,
  observationTitle:'一座亭子，如何畫出樂聲？',
  greeting:'看看鼓，也看看身旁的樂手。',
  comparison:[previousDrummer.comparison[0],{...previousDrummer.comparison[1],label:'再點旁人雙手持着的鈸。'}],
  answer:'鼓、鈸與吹奏者集中在亭內，手勢和樂器讓我們讀出合奏。這座亭子提供了一處演奏空間，街衢的慶典也有了聲音。',
  next:'接着找找街上持旗的人。'
 },
 {id:flagBearer.id,box:flagBearer.box,head:flagBearer.head,near:[3320,1490],safeY:1535,center:[3440,1480],
  clothes:'紅色花袍，一手握着高高的旗桿。',region:'看看畫面上方、黑色旗列下的人物。',
  greeting:'沿着我手中的長桿，往上看看。',
  observationTitle:'旗列如何組成儀仗？',
  comparison:[
   {label:'先點他持桿上方的黑色旗面。',box:[3386,1366,3538,1464]},
   {label:'再點右旁同一列的另一面黑旗。',box:[3576,1366,3728,1464]}
  ],
  answer:'相同旗形反覆出現，旗桿與持旗者按次序排列：這是一列有組織的儀仗。故宮研究把第三卷的旗仗與樂隊，連到皇家大駕鹵簿的陳設。',
  next:'最後看看表演場景裏的彩衣人物。'
 },
 {id:costumedFigure.id,box:costumedFigure.box,head:costumedFigure.head,near:[600,2400],safeY:2420,center:[570,2460],
  clothes:'戴着特殊冠飾，身穿多種顏色的衣服，手邊有道具。',region:'看看左下方、亭外和彩繪牆前的人物。',
  greeting:'看看我的裝束，再看看旁邊彩牆上的寶物。',
  observationTitle:'祝福如何變成布景？',
  comparison:[
   {label:'先點他身上彩色的裝束。',box:[621,2538,700,2648]},
   {label:'再點左旁牆上的玉板圖案。',box:[333,2394,488,2493]}
  ],
  answer:'彩衣與道具讓表演場景有了人物，彩牆則用「暗八仙」傳達吉祥祝意。玉板代表曹國舅；八件寶物以物代仙，讓祝福成為看得見的布景。',next:''
 }
];
flagBearer.lines=['順着我手中的旗桿往上看。','旁邊還有同一列的旗。','旗面和持旗者，要放在一起看。'];
costumedFigure.lines=['看看我的冠飾和裝束。','我手邊有道具。','旁邊的彩牆，也有吉祥寶物。'];
chapter.question='這條街，怎樣成為一場萬壽慶典？';
chapter.version='0.9';
const watcher=chapter.people.find(person=>person.id==='watcher-blue');
watcher.head=[293,2458,341,2511];
chapter.rounds[2].next='接着找找朝向表演場景的人。';
chapter.rounds.push({id:watcher.id,box:watcher.box,head:watcher.head,near:[520,2380],safeY:2410,center:[530,2480],
 clothes:'藍衣，頭向右上方側傾，站在彩衣人物左旁。',region:'看看左下方表演场景前的人。',
 greeting:'順着我的朝向，看看眼前的活動。',observationTitle:'表演與觀看，怎樣相連？',
 comparison:[{label:'先點他朝向右上方的頭部。',box:watcher.head,tapSize:48},{label:'再點右旁的彩衣持物人物。',box:costumedFigure.box}],
 answer:'藍衣人物的朝向，把觀看者與彩衣人物連在一起。演奏、儀仗、表演與觀看共同占據街衢，讓這場皇家慶典成為可見的活動場面。',next:''});
chapter.motifs=[
 {id:'jade',object:'wall-3',name:'玉板',figure:'曹國舅',meaning:'玉板代表曹國舅，以物代仙；與其餘暗八仙圖案共同寄託逢凶化吉的祝願，在本畫中承載祝壽之意。'},
 {id:'fan',object:'wall-5',name:'扇',figure:'漢鍾離',meaning:'扇代表漢鍾離，以物代仙；與其餘暗八仙圖案共同寄託逢凶化吉的祝願，在本畫中承載祝壽之意。'},
 {id:'lotus',object:'wall-13',name:'荷花',figure:'何仙姑',meaning:'荷花代表何仙姑，以物代仙；與其餘暗八仙圖案共同寄託逢凶化吉的祝願，在本畫中承載祝壽之意。'},
 {id:'basket',object:'wall-14',name:'花籃',figure:'藍采和',meaning:'花籃代表藍采和，以物代仙；與其餘暗八仙圖案共同寄託逢凶化吉的祝願，在本畫中承載祝壽之意。'}
];
chapter.review=[
 {label:'亭內樂隊',box:[907,2310,1248,2545],center:[1070,2420],text:'鼓、鈸與吹奏者同在亭內，這裏是一處演奏空間。'},
 {label:'街上儀仗',box:[3386,1366,3728,1464],center:[3460,1480],text:'重複旗形與持旗隊列，顯示慶典的組織與秩序。'},
 {label:'祝壽布景',box:[333,2394,488,2493],center:[520,2460],text:'暗八仙以寶物代替神仙，彩牆也參與表達吉祥祝意。'}
];
chapter.version='1.0';
chapter.version='1.0.1';
chapter.version='1.0.2';
chapter.collections.push(
 {id:'gong',name:'鑼',art:'collections/gong-illustration-v1.png',hint:'留意亭內由繩懸着、用槌敲擊的圓形樂器。',observation:'亭內可見大小不同的鑼，人物一手提持，一手持槌。',explanation:'鑼由槌敲擊；鈸則由兩片相擊。同是圓形樂器，持法與發聲方式不同，把器物與雙手一起看便能分辨。',evidence:'原畫可見懸持鑼與槌；故宮鑼藏品說明記載一手提鑼、一手以槌擊之。',source:{label:'故宮：鑼的形制與演奏',url:'https://www.dpm.org.cn/collection/music/232801.html?hl=%E5%A4%A7%E9%94%A3'}},
 {id:'horn',name:'號角',art:'collections/horn-illustration-v1.png',hint:'找找亭內由嘴邊向上伸出的長管與張開的管口。',observation:'褐衣人物把長管舉至嘴邊，管的另一端張開。',explanation:'號角屬吹奏樂器，和鼓、鑼、鈸的敲擊動作不同。畫中的嘴部、雙手和管口共同提示發聲方式，讓合奏的聲音多了一種層次。',evidence:'原畫可見吹奏長管與張開的管口；故宮將清代銅角歸入號角與吹奏樂器，這裏採用號角類名。',source:{label:'故宮：號角類樂器',url:'https://digicol.dpm.org.cn/cultural/detail?id=8bab202a5cd345ecaca5f46859306ef8'}}
);
chapter.objects.push(
 {id:'gong-pavilion-small',category:'gong',box:[1052,2392,1078,2428]},
 {id:'gong-pavilion-large',category:'gong',polygon:[[1259,2415],[1278,2425],[1283,2449],[1278,2477],[1261,2487],[1241,2475],[1236,2450],[1242,2426]]},
 {id:'horn-pavilion',category:'horn',tapWidth:12,polygon:[[1038,2280],[1054,2287],[1050,2298],[1147,2325],[1155,2334],[1144,2332],[1043,2302],[1034,2308],[1030,2297]]}
);
chapter.people.find(p=>p.id==='ensemble-grey').lines=['我提着一面小鑼。','另一手的槌，朝着鑼面。','也看看亭右那面較大的鑼。'];
chapter.people.find(p=>p.id==='ensemble-horn').lines=['沿着嘴邊的長管看看。','另一端的管口張開了。','吹奏與敲擊，在亭內合在一起。'];
chapter.version='1.1';
// v1.2: the spectator introduces spatial relationships; the ending explains
// why these organised activities belong to this particular celebration.
Object.assign(chapter.rounds[3],{
 greeting:'亭外有人觀看，亭內有人演奏。',
 observationTitle:'街道怎樣成為表演空間？',
 comparison:[
  {label:'先點藍衣人的頭部，留意他在亭外的位置與朝向。',box:watcher.head,tapSize:48,center:[530,2480],scale:1},
  {label:'再點亭內的樂隊，比較演奏者與亭外人群的位置。',box:[907,2310,1248,2545],center:[1070,2420],scale:.85}
 ],
 answer:'亭內安排樂隊，亭外聚着朝向活動的人。演奏與觀看分占不同位置，亭子連同前方街道構成表演空間；再連上旗列與彩牆，便能看出慶典如何沿街展開。'
});
watcher.lines=['亭內的樂手，和我隔着亭前空間。','看看亭內、亭外，各有人群。','彩牆、樂隊和旗列，要連起來看。'];
chapter.review=[
 {label:'樂隊與街道',box:[907,2310,1248,2545],center:[770,2440],text:'亭內演奏、亭外觀看，慶典需要讓人停留觀看的空間。'},
 {label:'儀仗與路線',box:[3386,1366,3728,1464],center:[3460,1510],text:'旗面、長桿與持旗隊列沿街排列。研究把這種儀仗與皇家出行的禮制相聯繫。'},
 {label:'彩牆與祝意',box:[333,2394,488,2493],center:[570,2460],text:'院牆上的玉板屬暗八仙，以寶物代仙。固定的街邊布景也承載吉祥祝意。'}
];
chapter.history=[
 {title:'沿途為誰祝壽？',text:'這組《萬壽圖》記錄崇慶皇太后的六旬萬壽慶典。她是乾隆皇帝的母親；1751 年的慶典，將沿途街衢安排成祝壽場景。',center:[770,2440],scale:.7},
 {title:'為甚麼叫「駢慶」？',text:'「駢」有雙的意思。劉潞的研究把第三卷儀仗連到乾隆首次南巡禮成，認為卷名將同年南巡與皇太后萬壽合為雙慶。這是結合史料的解讀。',center:[3460,1510],scale:.7}
];
const nextFindings={drum:'看看亭內的鑼：它由槌敲擊，與兩片鈸相擊有甚麼不同？',discs:'沿吹奏者嘴邊的長管，看管口與雙手如何配合。',flag:'轉到院牆，看看吉祥寶物如何與儀仗共同構成慶典。','painted-wall':'沿牆找另一件寶物，比較器物形狀；每種可記下自己的位置。',gong:'同一亭內也有持鈸的人，比較兩種圓形樂器的持法。',horn:'留意身旁鼓手與持鑼的人，合奏包括吹奏和敲擊。'};
chapter.collections.forEach(c=>c.next=nextFindings[c.id]);
const motifHints={jade:'留意兩片並置、繫着飄帶的長板。',fan:'找找展開的扇面與扇柄。',lotus:'沿牆尋找花瓣展開的花朵。',basket:'留意裝着花枝、有提柄的器物。'};
chapter.motifs.forEach(m=>m.hint=motifHints[m.id]);
// Native-pixel position review: fan lower edge extends beyond the former box.
chapter.objects.find(o=>o.id==='wall-5').box=[1340,2405,1565,2503];
const motifAnchors={jade:[410,2446],fan:[1450,2470],lotus:[3495,2350],basket:[3690,2350]};
chapter.motifs.forEach(m=>m.anchor=motifAnchors[m.id]);
chapter.rounds.forEach(r=>r.comparison.forEach(p=>p.tapSize??=44));
chapter.version='1.2';
chapter.native='art/native-segment-lossless.webp';
chapter.nativeFallback='../stage-and-crowd-native.png';
chapter.overview='../stage-and-crowd-overview.jpg';

// Approved whole-group repaint is an interpretation; the native painting remains the evidence.
chapter.collections.push({id:'ensemble',name:'亭內合奏',art:'../../../../public/art/animations/kangqu-ensemble-master-v7/group-master.png',hint:'找到亭內的坐姿鼓手、藍衣持鈸者或灰衣鑼手，點中觀看合奏。',observation:'鼓手、持鈸者與持鑼者聚在亭內，樂器與雙手提示各自的演奏動作。',explanation:'鼓、鈸與鑼以不同方式擊奏，構成亭內樂隊的一部分。動畫以三人為一組摹繪，演示動作呼應；節奏與動作時序為遊戲演繹，並非歷史演奏的復原。',evidence:'原畫可見三位樂手、鼓、鈸與懸持的鑼；動畫摹繪不作額外史料。',source:chapter.sources.painting,next:'再沿亭內樂器看看吹奏的號角，並比較亭外觀看的人群。'});

// Seven-person whole-group interpretation, collected once after playback completes.
chapter.collections.push({id:'audience',name:'表演與觀看',art:'../../../../public/art/animations/kangqu-audience-v2-seven/group-master.png',hint:'在亭前找到彩衣人物、身旁觀看者與後方人群，點中觀看七人呼應。',observation:'彩衣人物手邊有持物，身旁及後方人物的面貌朝向、站位與前後遮擋，把不同人物連在同一場景。',explanation:'動畫以七人為一組摹繪，演繹示意、轉頭、微傾與轉肩的前後呼應。這些動作與先後時序為遊戲演繹，並非原畫記錄的歷史表演。',evidence:'人物、裝束、持物與相對位置以原畫為觀察依據；摹繪及動畫不作新增史料，也不推定彩衣人物的具名角色。',source:chapter.sources.painting,next:'再看亭內樂隊，留意演奏空間與亭外觀看人群的位置。'});
