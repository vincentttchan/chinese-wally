/* Canonical Lantern DOM classes; chapter data supplies portraits and copy. */
function action(id,label,style='lantern-note-next'){return `<button id="${id}" class="${style}">${label}${icon('ArrowRight')}</button>`;}
function portraitPath(round,suffix){return (round.id==='seated-drum'?'../v0.3.2/recognition/':'recognition/')+round.id+suffix;}
function drawChrome(){
 updateChapterSound();
 const intro=state.mode==='intro',journal=state.mode==='journal',seeking=state.mode==='seek';
 $('layout').dataset.mode=state.mode;
 $('layout').classList.toggle('is-journal-open',journal);
 $('layout').classList.toggle('is-near-view',['observe','ending'].includes(state.mode));
 $('introduction').hidden=!intro;$('hud').hidden=intro;$('controls').hidden=intro;
 $('menu-layer').hidden=!state.menuOpen;
 $('menu-toggle').setAttribute('aria-expanded',String(state.menuOpen));
 $('journal').hidden=!journal;
 const help=seeking&&state.hintOpen,review=state.mode==='free'&&state.hintOpen;
 const blocked=state.menuOpen||help||review;
 $('hud').inert=blocked;$('controls').inert=blocked;
 $('panel-layer').hidden=state.noteHidden||!(help||review||state.mode==='observe'||state.mode==='ending'||(state.mode==='found'&&!state.speaker));
 $('panel-layer').className=help?'lantern-dialog-layer lantern-appearance-help':review?'lantern-dialog-layer':['observe','found'].includes(state.mode)?'lantern-dialog-layer chapter-field-layer':'lantern-dialog-layer chapter-end-layer';
 panel.className=help||review?'lantern-paper':'lantern-observation-note';
 if(!['observe','found'].includes(state.mode)){panel.style.removeProperty('top');panel.style.removeProperty('bottom');panel.style.removeProperty('max-height');}
 panel.setAttribute('role',help||review?'dialog':'region');
 panel.setAttribute('aria-modal',String(help||review));
 scene.inert=intro||state.menuOpen||help||review||(journal&&!state.journalLooking);
 $('hint-toggle').setAttribute('aria-expanded',String(state.hintOpen));
 $('hint-toggle').innerHTML=icon('CircleHelp')+(['observe','ending'].includes(state.mode)?state.noteHidden?'查看題箋':'暫收題箋':seeking?'給我提示':'街衢的發現');
 $('hint-toggle').disabled=!['seek','free','observe','ending'].includes(state.mode)||state.busy;
 $('mission').hidden=!seeking;
 if(seeking){
  const r=current();
  $('mission').innerHTML=`<button id="face-help" class="lantern-face-reference" aria-label="放大人物樣貌" aria-controls="panel-layer" aria-expanded="${state.hintOpen}"><img class="lantern-face-illustration" src="${portraitPath(r,'-head-tracing-v2.png')}" alt="第${state.round+1}位人物的樣貌摹繪，原畫為準" draggable="false"></button><div><p class="lantern-eyebrow">在人群中聽樂</p><h1>尋找第 ${state.round+1} 位畫中人</h1><p class="lantern-trail">比對帽形與臉部朝向。</p><p class="lantern-progress">已完成 ${state.completed}／${chapter.rounds.length} 次觀察</p></div>`;
  bind('face-help',toggleHint);
 }
}
function toggleHint(){if(state.busy)return;if(['observe','ending'].includes(state.mode)){state.noteHidden=!state.noteHidden;state.noteManual=!state.noteHidden;drawPanel();render();if(!state.noteHidden)panel.focus({preventScroll:true});return;}if(!['seek','free'].includes(state.mode))return;state.menuOpen=false;state.hintOpen=!state.hintOpen;drawPanel();if(state.hintOpen)panel.focus({preventScroll:true});else $('hint-toggle').focus({preventScroll:true});}
function closeHint(){state.hintOpen=false;drawPanel();$('hint-toggle').focus({preventScroll:true});}
function toggleMenu(open=!state.menuOpen){state.menuOpen=open;state.hintOpen=false;drawPanel();if(open)$('chapter-menu').focus({preventScroll:true});else $('menu-toggle').focus({preventScroll:true});}
function placeFieldNote(){
 if(state.busy||$('panel-layer').hidden||!['observe','found','ending'].includes(state.mode))return;
 const r=state.mode==='ending'?{head:reviewRegion().box}:current();
 const interactiveEnding=state.mode==='ending'&&['review','performance'].includes(state.reviewStage);
 const detail=state.mode==='observe'&&state.step<2?r.comparison[state.step]:interactiveEnding?reviewRegion():null;
 const b=detail?observationTapBox(detail):state.mode==='ending'?(['connection','summary'].includes(state.reviewStage)?chapter.review[0].box:reviewRegion().box):r.head;
 const a=screenAt([b[0],b[1]]),z=screenAt([b[2],b[3]]),vw=scene.clientWidth,vh=scene.clientHeight;
 const width=Math.min(vw>=1000?400:350,vw-32);
 panel.style.setProperty('--note-width',width+'px');
 panel.style.removeProperty('top');panel.style.removeProperty('bottom');panel.style.removeProperty('max-height');
 const height=panel.offsetHeight,pad=16,gap=24;
 const target=[a[0]-8,a[1]-8,z[0]+8,z[1]+8];
 const overlap=(x,y)=>x[0]<y[2]&&x[2]>y[0]&&x[1]<y[3]&&x[3]>y[1];
 const heads=chapter.people.map(p=>{const a=screenAt([p.head[0],p.head[1]]),b=screenAt([p.head[2],p.head[3]]);return [...a,...b];});
 const clampX=x=>Math.max(pad,Math.min(vw-width-pad,x));
 const clampY=y=>Math.max(pad,Math.min(vh-height-pad,y));
 const positions=[
  [a[0]-gap-width,clampY(a[1]-60)],[z[0]+gap,clampY(a[1]-60)],
  [clampX(a[0]),a[1]-gap-height],[clampX(a[0]),z[1]+gap],
  [pad,pad],[vw-width-pad,pad],[pad,vh-height-pad],[vw-width-pad,vh-height-pad]
 ].filter(([x,y])=>x>=pad&&y>=pad&&x+width<=vw-pad&&y+height<=vh-pad)
  .map(([x,y])=>({x,y,rect:[x,y,x+width,y+height]}))
  .filter(p=>!overlap(p.rect,target)).map(p=>({...p,faces:heads.filter(h=>overlap(p.rect,h)).length})).sort((a,b)=>a.faces-b.faces);
 let x,y;
 if(positions.length){({x,y}=positions[0]);}
 else{
  // Constrain the reading region to the larger empty band. The active detail
  // remains visible; the paper scrolls rather than covering the tap target.
  const above=Math.max(0,Math.min(vh-pad,a[1]-gap)-pad),below=Math.max(0,vh-pad-Math.max(pad,z[1]+gap));
  const useAbove=above>=below,space=useAbove?above:below;
  x=clampX(a[0]);y=useAbove?pad:Math.max(pad,z[1]+gap);
  if(space<96&&!state.noteManual){state.noteHidden=true;drawChrome();announce(detail?.label||'題箋暫收，方便看畫；可按「查看題箋」閱讀。');return;}
  y=Math.min(y,vh-112);panel.style.maxHeight=Math.min(vh-pad*2,Math.max(96,space))+'px';
 }
 panel.style.setProperty('--note-x',x+'px');panel.style.setProperty('--note-y',y+'px');
}

function drawPanel(){
 drawChrome();const r=current();
 if(state.mode==='intro'){
  const steps=[['清代 · 康衢駢慶','1751 年，乾隆的母親崇慶皇太后\n迎來六旬萬壽慶典。\n《康衢駢慶》畫出北京沿途街景。','看看任務'],['尋人，也讀慶典','依次找到四位畫中人。\n連起樂隊、隊列與祝壽布景，\n看看街衢怎樣成為慶典。','記住第一位'],['先看他的樣子','先記住樣貌，再入畫比對。\n需要時才打開下一個提示。','入畫尋人']][state.intro];
  panel.replaceChildren();
  $('intro-narrative').innerHTML=`<p class="intro-chapter">${steps[0]}</p><p class="intro-story">${steps[1]}</p>`+(state.intro===2?`<div class="intro-reference"><img src="${portraitPath(r,'-head-tracing-v2.png')}" alt="第一位人物的樣貌摹繪"><p>記住他的樣子。<br>樣貌摹繪，原畫為準。</p></div>`:'');
  const waiting=state.intro===2&&!state.ready;
  $('intro-next').disabled=waiting;$('intro-next').innerHTML=`<span>${waiting?'正在準備清晰原畫':steps[2]}</span>${icon('ArrowRight',23)}`;
  $('intro-back').disabled=state.intro===0;$('intro-back').style.visibility=state.intro?'visible':'hidden';
  $('intro-progress').innerHTML=[0,1,2].map(i=>`<span class="${i<=state.intro?'is-read':''}"></span>`).join('');$('intro-progress').setAttribute('aria-label',`引言第 ${state.intro+1} 幕，共三幕`);
  bind('intro-back',()=>{state.intro=Math.max(0,state.intro-1);drawPanel();});
  bind('intro-next',()=>{if(state.intro<2){state.intro++;drawPanel();}else if(state.ready){setMode('seek');scene.focus({preventScroll:true});}});
 }else if(state.mode==='seek'){
  panel.innerHTML=`<button id="hint-close" class="paper-close" aria-label="關閉">${icon('X')}</button><p class="lantern-eyebrow">尋人 · 提示 ${state.hint}／2</p><h2>${state.hint?'再看一個細節':'可曾見過此人？'}</h2><div class="lantern-appearance-body"><figure class="lantern-appearance-figure"><img class="chapter-face-art" src="${portraitPath(r,'-head-tracing-v2.png')}" alt="第${state.round+1}位人物的樣貌摹繪"><figcaption>樣貌摹繪，原畫為準</figcaption></figure><div class="lantern-appearance-copy"><p>${state.hint===2?r.region:state.hint===1?r.clothes:'看看帽形與臉部朝向，\n再回畫中比對。'}</p>${action('return-search','回畫中尋人','lantern-return-link')}</div></div><div class="lantern-appearance-footer"><span>需要時才打開下一個提示</span><button id="more-hint" class="lantern-text-button">${state.hint===0?'看看衣着與姿勢':state.hint===1?'看看大致區域':'帶我到大致位置'}</button></div><details class="chapter-face-source"><summary>對照原畫樣貌</summary><img src="${portraitPath(r,'-head-source.png')}" width="${r.head[2]-r.head[0]}" height="${r.head[3]-r.head[1]}" alt="原畫頭部原生裁切"><p>原生大小；摹繪的細線與色塊不作額外辨認線索。</p></details>`;
  bind('hint-close',closeHint);bind('return-search',closeHint);bind('more-hint',async()=>{if(state.hint<2){state.hint++;drawPanel();panel.focus({preventScroll:true});return;}closeHint();if(state.source!=='native'&&!await setSource('native'))return;await moveTo(r.near,.55);});
 }else if(state.mode==='found'){
  // Only shown when no safe on-painting speech placement is available.
  panel.innerHTML=`<p class="lantern-observation-eyebrow">尋得畫中人 · 遊戲虛構對白</p><h2>接着看原畫</h2><p class="lantern-note-body">${r.greeting}</p>${action('begin-observe','近看原畫')}`;bind('begin-observe',beginObservation);
 }else if(state.mode==='observe'){
  const done=state.step===2;
  panel.innerHTML=`<p class="lantern-observation-eyebrow">原畫觀察 · ${done?'已完成比較':`${state.step+1}／2 處細節`}</p><h2>${done?r.observationTitle:['看看合奏的樂器','看看持旗與隊列','看看裝束與彩牆','看看亭內與亭外'][state.round]}</h2><p class="lantern-note-body">${done?r.answer:r.comparison[state.step].label}</p>`+(done?action('next-round',state.round<chapter.rounds.length-1?'尋找下一位':'看看街衢'):'<p class="lantern-note-caption">在原畫上點選；細節太小時，先放大。</p>');
  bind('next-round',()=>{state.completed=state.round+1;if(state.round<chapter.rounds.length-1){const line=r.next;state.round++;state.hint=0;state.step=0;setMode('seek');announce(line);}else{state.ending=0;state.reviewStage='arrival';state.reviewSeen=[];state.reviewIndex=0;setMode('ending');announce('最後，回看慶典的聲音與觀看。');}});
 }else if(state.mode==='ending'){
  drawEpilogue();
 }else if(state.mode==='free'){
  panel.innerHTML=`<button id="hint-close" class="paper-close" aria-label="關閉">${icon('X')}</button><p class="lantern-eyebrow">留在畫中</p><h2>街衢成為慶典</h2><p>樂器、儀仗與祝壽紋樣，把人物放回「駢慶」的歷史場面。</p><p>還可以點人物聽短句，或將細節收進冊中。</p><div class="lantern-paper-actions"><button id="free-review" class="lantern-text-button">回看長卷與演繹</button><button id="free-book" class="lantern-text-button">回看見聞冊</button><button id="replay" class="lantern-text-button">再尋一次</button></div>`;bind('hint-close',closeHint);bind('free-review',reopenReview);bind('free-book',openJournal);bind('replay',replay);
 }else if(state.mode==='journal')drawJournal();
}
function collectionArt(c,locked=false){return `<span class="collection-illustration ${locked?'is-locked':''}"><img class="chapter-collection-art" src="${c.art}" alt="${c.name}的原畫衍生收藏圖樣"></span>`;}
function motifEntries(c){
 if(c.id!=='painted-wall')return '';
 const found=chapter.motifs.filter(m=>state.details[m.id]);
 return '<section class="chapter-motif-entries"><h3>彩牆上的暗八仙</h3><p>已辨認 '+found.length+'／'+chapter.motifs.length+' 種圖案。這四種都記在「暗八仙」這一類見聞中，各自保留發現位置。</p>'+chapter.motifs.map(m=>`<p>${state.details[m.id]?`<button class="collection-look" data-motif="${m.id}">${m.name} · 已發現 · 回看原畫 ↗</button>`:`${m.name} · 尚未發現`}<span>代表人物：${m.figure}</span><span>寓意：以物代仙，與整組暗八仙共同寄託逢凶化吉的祝願；在本畫中承載祝壽之意。</span>${state.details[m.id]?'':`<span>尋找線索：${m.hint}</span>`}</p>`).join('')+'</section>';
}
function collectionSources(c){
 const source=c.source||(c.id==='painted-wall'?chapter.sources.motif:chapter.sources.procession);
 return `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label}</a>`;
}
function motifProgress(){return chapter.motifs.filter(m=>state.details[m.id]).length;}
function motifOverview(){
 return '<section class="chapter-motif-entries"><h3>彩牆上的暗八仙</h3><p>已辨認 '+motifProgress()+'／'+chapter.motifs.length+' 種圖案，同屬「暗八仙」一類見聞。</p>'+chapter.motifs.map(m=>`<p>${m.name} → ${m.figure}<span>${state.details[m.id]?'已發現':'尚未發現 · '+m.hint}</span></p>`).join('')+'<p>四種圖案都以寶物代替神仙，與整組暗八仙共同寄託逢凶化吉的祝願；在這幅萬壽圖中亦傳達祝壽之意。</p></section>';
}
function drawJournal(){
 const journal=$('journal'),c=chapter.collections.find(c=>c.id===state.entry),total=Object.keys(state.collections).length;
 const available=chapter.collections.filter(c=>state.collections[c.id]);
 journal.className='lantern-journal-layer lantern-field-journal '+(c&&state.collections[c.id]?'is-detail':'is-overview')+(state.journalLooking?' is-looking':'');
 let content;
 if(c&&state.collections[c.id]){
  content=`<article class="collection-detail"><button id="journal-back" class="collection-back">← 全部收藏</button><div class="collection-detail-heading"><p>畫中拾趣</p><h2>${c.name}</h2></div><figure class="collection-detail-art">${collectionArt(c)}<figcaption>依原畫創作的收藏圖樣</figcaption></figure><p class="collection-observe">${c.observation}</p><p class="collection-body">${c.explanation}</p>${motifEntries(c)}<button id="return-location" class="collection-look">看看畫中位置 <span aria-hidden="true">↗</span></button><p class="collection-next"><span>再留意一處</span>${c.next}</p><details class="collection-source"><summary>判讀依據</summary><p>${c.evidence}</p><a href="${chapter.sources.painting.url}" target="_blank" rel="noopener noreferrer">${chapter.sources.painting.label}</a> · ${collectionSources(c)} · <a href="../source-provenance.json" target="_blank" rel="noopener noreferrer">原畫影像來源</a></details>${available.length>1?`<nav class="collection-detail-nav" aria-label="已收藏見聞"><button id="entry-prev" aria-label="上一則已收藏見聞">←</button><span>${available.findIndex(a=>a.id===c.id)+1}／${available.length}</span><button id="entry-next" aria-label="下一則已收藏見聞">→</button></nav>`:''}</article>`;
 }else{
  content='<div class="collection-overview"><p class="collection-introduction">把偶然看見的細節，收成自己的街衢見聞。</p><div class="collection-grid">'+chapter.collections.map(c=>{const found=!!state.collections[c.id];return `<button class="collection-item ${found?'is-collected':'is-undiscovered'}" data-entry="${c.id}" aria-label="${c.name}，${found?'已收下，開啟詳情':'未收下，看看提示'}">${collectionArt(c,!found)}<span class="collection-item-name">${c.name}</span><span class="collection-item-state">${found?'已收下':'未收下'}</span></button>`;}).join('')+'</div>'+motifOverview()+'</div>';
 }
 journal.innerHTML=`<div class="collection-paper" aria-hidden="true"></div><div class="collection-reading" ${state.journalLooking?'inert':''}><header class="collection-header"><p class="collection-kicker">畫中拾趣</p><div class="collection-title-row"><h1>街衢見聞冊</h1><span>已收下 ${total}／${chapter.collections.length}</span></div><button id="close-book" class="collection-close" aria-label="合上見聞冊">×</button></header><div class="collection-pages">${content}</div>${!c?'<footer id="journal-hint" class="collection-footer" role="status">點選已收下的圖樣，回看畫中的發現。</footer>':''}</div><button id="journal-return" class="collection-return">← 回到長卷</button>${state.journalLooking?'<button id="journal-resume" class="collection-resume">繼續閱讀 →</button>':''}`;
 bind('close-book',closeJournal);bind('journal-return',closeJournal);
 journal.setAttribute('aria-modal',String(!state.journalLooking));
 const turnPage=delta=>{if(state.busy)return;const i=available.findIndex(a=>a.id===state.entry);state.entry=available[(i+delta+available.length)%available.length].id;drawJournal();journal.querySelector('.collection-pages').scrollTop=0;journal.focus({preventScroll:true});};
 bind('entry-prev',()=>turnPage(-1));bind('entry-next',()=>turnPage(1));
 bind('journal-back',()=>{state.entry=null;drawJournal();journal.focus({preventScroll:true});});
 journal.querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>{const c=chapter.collections.find(c=>c.id===b.dataset.entry);if(state.collections[c.id]){state.entry=c.id;drawJournal();journal.focus({preventScroll:true});}else $('journal-hint').textContent=c.hint;});
 bind('return-location',()=>lookFromJournal(state.collections[c.id]));
 bind('journal-resume',resumeJournal);
 journal.querySelectorAll('[data-motif]').forEach(button=>button.onclick=()=>lookFromJournal(state.details[button.dataset.motif]));
}
async function lookFromJournal(record){
 if(state.busy||state.mode!=='journal'||!record)return;
 state.journalLooking=true;drawChrome();drawJournal();
 if(state.source!=='native'&&!await setSource('native')){resumeJournal();return;}
 await moveTo(record.point,1);
 if(state.mode==='journal'&&state.journalLooking)$('journal-resume')?.focus({preventScroll:true});
}
function resumeJournal(){if(state.busy||state.mode!=='journal')return;state.journalLooking=false;drawChrome();drawJournal();$('journal').focus({preventScroll:true});}
