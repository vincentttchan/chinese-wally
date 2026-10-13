// Native source classification review. Stable retained IDs preserve first discoveries.
chapter.version='0.3.1';
chapter.objects=chapter.objects.filter(o=>o.id!=='discs-grotto');
const wallBoxes=[
 [0,2417,64,2500],[115,2398,284,2490],[333,2394,488,2493],[546,2398,713,2490],
 [1340,2405,1565,2476],[1594,2405,1668,2476],[1723,2365,1764,2480],
 [1815,2327,1984,2418],[2030,2330,2180,2418],[2235,2327,2338,2417],
 [2805,2325,2970,2411],[3060,2320,3120,2375],[3410,2306,3577,2390],[3620,2308,3778,2420]
];
chapter.objects.forEach(o=>{if(o.category==='painted-wall'){const i=Number(o.id.split('-')[1])-1;o.box=wallBoxes[i];o.backdrop=true;}});
chapter.ending[1].ids=['watcher-blue'];
const objectReview={date:'2026-10-12',scope:'native segment only',retained:{drum:2,discs:3,flag:25,'painted-wall':14},pendingOrExcluded:[
 {id:'discs-grotto',box:[3688,1080,3711,1100],status:'withdrawn',reason:'僅能確定圓形持物；未能可靠分辨兩片是否同屬一人的成對持物。原生裁切 grotto-instruments.png 已查看。'},
 {id:'grey-single-disc',box:[1024,2387,1090,2440],status:'excluded',reason:'可見圓盤與持桿／懸掛結構，未確認為雙手各持一片的成對圓盤；不只憑圓形收進該類。'},
 {id:'right-single-disc',box:[1230,2390,1285,2470],status:'excluded',reason:'亭右淡衣人物面前是一個大圓形物，未見同一人手中另一片，未作成對分類。'},
 {id:'grotto-left-single-round',box:[3668,1070,3710,1115],status:'pending',reason:'另一持圓物者位於小亭左側，持法太小；不把相鄰兩人的單片混作同一人一對。'},
 {id:'unflagged-standard-poles',box:[0,1850,1400,2200],status:'excluded',reason:'下方左段長桿只有頂飾，沒有可見旗面；按桿頂金色裝飾不能解鎖旗幟。'},
 {id:'inscriptions-and-fittings',box:null,status:'excluded',reason:'題字、匾額、柱間欄板、屏面、門窗與檐口裝飾不當作彩繪院牆。'},
 {id:'full-scroll-other-regions',box:null,status:'pending',reason:'完整第三卷其他區域未有本輪原生高清盤點，不宣稱全卷同類位置已完成。'}
]};
