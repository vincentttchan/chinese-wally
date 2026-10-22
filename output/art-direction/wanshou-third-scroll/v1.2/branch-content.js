// Players explore the native painting; the approved animations supply clear interpretation art.
chapter.rounds=chapter.rounds.slice(0,3);
const inquiryStationInfo={
 ensemble:{title:'亭內樂隊',round:0,question:'不同樂器怎樣配合？',handoff:'樂聲傳到人群中，替我找找這張面孔。'},
 flags:{title:'儀仗隊列',round:1,question:'旗面怎樣連成一列？',handoff:'街上還有人忙着準備，認得這張面孔嗎？'},
 audience:{title:'戲班準備',round:2,question:'裝束與持物透露甚麼？'}
};
chapter.rounds.forEach((r,i)=>Object.assign(r,{station:['ensemble','flags','audience'][i]}));
Object.assign(chapter.rounds[0],{observationTitle:'看看樂手的雙手與持物',answer:'樂手的持物與手勢，讓無聲的畫卷留下合奏的線索。',greeting:'也聽聽身旁樂手怎麼說。'});
Object.assign(chapter.rounds[0].comparison[0],{aid:'drum',collection:'drum'});
Object.assign(chapter.rounds[1],{answer:'相似旗面沿街反覆出現，長桿與持旗者排成隊列，讓我們看出有組織的儀仗。'});
chapter.rounds[1].comparison.forEach((p,i)=>Object.assign(p,{aid:i?'flag-right':'flag-left',collection:'flag'}));
Object.assign(chapter.rounds[2],{observationTitle:'從裝束與持物，看見準備',greeting:'看看我的裝束，也留意手邊的物件。',answer:'冠飾、彩衣與持物，讓這組人物和旁人有所區別；演繹呈現他們準備表演的一刻。',comparison:[{label:'先點彩衣人物的裝束。',box:[621,2487,700,2675],center:[660,2550],scale:1.65,aid:'costume'},{label:'再點彩衣人物手邊的持物。',box:[654,2525,713,2575],center:[675,2555],scale:1.8,aid:'props'}]});
chapter.people.find(p=>p.id==='watcher-blue').lines=['亭裏有樂手，亭前也有人準備活動。','先看清他們手中拿着甚麼。','樂聲和旗列，會帶你找到不同的場景。'];
const flagStudy={src:'../../../../public/art/animations/kangqu-flags-v2-detail/frames/group-01.png',width:1311,height:1366};
// Journal and observation use the same black-flag study; older saves keep their discovery location.
Object.assign(chapter.collections.find(c=>c.id==='flag'),{art:flagStudy.src,artSize:[flagStudy.width,flagStudy.height],artCrop:[165,110,550,475]});
chapter.review[2]={label:'戲班與準備',box:[621,2468,749,2675],center:[660,2550],text:'冠飾、彩衣與持物，讓這組人物和周圍人群有所區別。'};

chapter.review[0].box=[875,2275,1115,2570];
chapter.review[1].box=[3300,1270,3770,1760];
chapter.review[1].center=[3535,1515];
chapter.review[2].box=[240,2420,785,2695];
chapter.review[0].text='鼓手與旁邊樂手同在亭內演奏，亭前另有人群停留。';
chapter.review[1].text='相似旗面與持旗隊列沿街排列，顯示有組織的儀仗。';
