// Same sequence as LanternEpilogue: original detail -> interpretation -> replay -> original.
async function reopenReview(){
 if(state.busy||state.completed!==chapter.rounds.length||!state.reviewComplete)return;
 const saved={view:{...state.view},sceneSize:frame(),source:state.source,focus:state.focus,focusPoint:[...state.focusPoint]};
 if(state.source!=='native'&&!await setSource('native'))return;
 state.reviewReturn=saved;state.reviewStage='summary';state.reviewIndex=0;setMode('ending');
 await moveTo([2250,1950],minScale());panel.focus({preventScroll:true});
}
async function leaveReview(){
 if(state.busy)return;
 const saved=state.reviewReturn;state.reviewReturn=null;setMode('free');
 if(saved){
  if(saved.source!==state.source&&!await setSource(saved.source)){scene.focus({preventScroll:true});return;}
  state.view=KangquGeometry.restoreView(saved.view,saved.sceneSize,frame());state.focus=saved.focus;state.focusPoint=[...saved.focusPoint];render();
 }
 scene.focus({preventScroll:true});
}
function reviewRegion(){
 if(state.reviewStage==='history')return {box:chapter.review[state.historyIndex===0?0:1].box,...chapter.history[state.historyIndex]};
 if(state.reviewStage==='connection'||state.reviewStage==='summary')return {box:[274,1366,3728,2650],center:[2250,1950]};
 return ['performance','playing','reveal'].includes(state.reviewStage)?chapter.review[0]:chapter.review[state.reviewIndex];
}
function reviewHitBoxes(){
 return state.reviewStage==='performance'?['seated-drum','ensemble-discs-left'].map(id=>chapter.people.find(person=>person.id===id).box):[reviewRegion().box];
}
function ensembleMotionMask(){
 // White exposes only the moving hands/instruments; original faces are protected.
 const exclusions=chapter.people.map(person=>person.head).filter(b=>b[0]<1085&&b[2]>880&&b[1]<2560&&b[3]>2290);
 const holes=exclusions.map(b=>`<rect x="${b[0]-880-3}" y="${b[1]-2290-3}" width="${b[2]-b[0]+6}" height="${b[3]-b[1]+6}" rx="3" fill="black"/>`).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="205" height="270" viewBox="0 0 205 270"><defs><filter id="edge"><feGaussianBlur stdDeviation="1.5"/></filter></defs><g fill="white" filter="url(#edge)"><ellipse cx="44" cy="78" rx="34" ry="39"/><ellipse cx="120" cy="164" rx="52" ry="30"/></g>'+holes+'</svg>';
 return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}
async function reviewLook(index){
 if(state.busy)return;
 state.reviewIndex=index;state.reviewStage='review';state.noteHidden=false;state.noteManual=false;drawPanel();drawPoints();
 if(state.source!=='native'&&!await setSource('native'))return;
 await moveTo(chapter.review[index].center,.9);
}
function reviewTap(){
 if(state.busy)return;
 if(state.reviewStage==='performance'){void playEnsemble();return;}
 if(state.reviewStage!=='review')return;
 if(!state.reviewSeen.includes(state.reviewIndex))state.reviewSeen.push(state.reviewIndex);
 state.noteHidden=false;state.noteManual=false;
 drawPanel();drawPoints();render();announce(chapter.review[state.reviewIndex].text);
}
function drawEpilogue(){
 const stage=state.reviewStage,seen=state.reviewSeen.includes(state.reviewIndex),item=chapter.review[state.reviewIndex];
 let title,body,buttons='';
 if(stage==='arrival'){
  title='這些活動，為甚麼在同一條街？';body='從人物退後一步，看看演奏空間、沿街隊列和祝壽布景怎樣配合。';buttons=action('review-begin','連起三處發現');
 }else if(stage==='review'){
  title=item.label;body=seen?item.text:'輕點畫中的'+item.label+'，把這處活動放回周邊街道。';
  buttons='<nav class="lantern-note-tabs" aria-label="回看慶典活動">'+chapter.review.map((r,i)=>`<button data-review="${i}" aria-pressed="${i===state.reviewIndex}">${r.label}${state.reviewSeen.includes(i)?' ✓':''}</button>`).join('')+'</nav><p class="lantern-note-caption">已觀察 '+state.reviewSeen.length+'／3 處</p>';
  if(state.reviewSeen.length===3)buttons+=action('review-connect','把三處連起來看');
  else if(seen)buttons+=action('review-next','回看下一處');
 }else if(stage==='connection'){
  title='街衢被怎樣安排？';body='樂隊供人觀看，儀仗沿路排列，彩牆傳達祝意。把三處放在一起，哪個解讀更有依據？';
  buttons=action('connection-organised','沿街安排的一場慶典')+'<button id="connection-random" class="lantern-note-secondary">只是偶然聚在一起的人群</button>'+(state.connectionHint?'<p class="lantern-note-caption">再想想重複排列的旗列，以及帶吉祥圖案的彩牆。兩者都顯示有意安排。</p>':'');
 }else if(stage==='history'){
  title=chapter.history[state.historyIndex].title;body=chapter.history[state.historyIndex].text;
  buttons=action('history-next',state.historyIndex===0?'再看「駢慶」的意思':'看看樂手怎樣配合')+'<details class="collection-source"><summary>歷史解讀的來源</summary><p>慶典背景、路線與雙慶解讀依據劉潞的卷名研究；1751 是所述事件年份。</p><a href="'+chapter.sources.procession.url+'" target="_blank" rel="noopener noreferrer">'+chapter.sources.procession.label+'</a></details>';
 }else if(stage==='performance'){
  title='讓亭內的合奏動起來';body='輕點亭內鼓手或持鈸的人，觀看一段合奏演繹。';
 }else if(stage==='reveal'){
  title='樂聲，也構成慶典';body='手部的小幅動作示意鼓、鈸的配合。這是遊戲演繹；原畫沒有記錄實際旋律或演奏時序。';
  buttons='<button id="review-replay" class="lantern-note-secondary">再看一次演繹</button>'+action('review-summary','收下這條街的發現');
 }else if(stage==='summary'){
  title='從街道，讀出皇家慶典';body='樂隊、隊列與吉祥彩牆，把沿途街道安排成皇太后的祝壽場景。研究再從儀仗讀出南巡禮成的雙慶意涵。這幅畫讓我們看見皇家如何呈現慶典。';
  buttons=action('free','留在畫中，自由探索')+'<button id="ending-book" class="lantern-note-secondary">回看街衢見聞冊</button><button id="replay" class="lantern-note-secondary">再尋一次</button><details class="collection-source"><summary>回看活動與演繹</summary><button id="review-again" class="lantern-note-secondary">回看三處活動</button><button id="review-replay" class="lantern-note-secondary">重播鼓鈸演繹</button></details>';
 }else{title='畫中情景演繹';body='正在播放鼓與鈸的配合。';buttons='<button id="animation-skip" class="lantern-note-secondary">略過演繹，回到原畫</button>';}
 panel.innerHTML='<p class="lantern-observation-eyebrow">長卷中的最後探索</p><h2>'+title+'</h2><p class="lantern-note-body">'+body+'</p>'+buttons+(state.animationIssue?'<p class="lantern-note-caption">演繹素材暫未載入，可重試或繼續觀察原畫。</p>':'');
 bind('review-begin',()=>reviewLook(0));
 panel.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>reviewLook(Number(b.dataset.review)));
 bind('review-next',()=>reviewLook([0,1,2].find(i=>!state.reviewSeen.includes(i))));
 bind('review-connect',async()=>{if(state.busy)return;state.reviewStage='connection';state.connectionHint=false;drawPanel();drawPoints();await moveTo([2250,1950],minScale());});
 bind('connection-random',()=>{state.connectionHint=true;drawPanel();});
 bind('connection-organised',()=>showHistory(0));
 bind('history-next',async()=>{if(state.busy)return;if(state.historyIndex===0){await showHistory(1);return;}state.reviewIndex=0;state.reviewStage='performance';drawPanel();drawPoints();await moveTo(chapter.review[0].center,1);});
 bind('review-replay',()=>playEnsemble());bind('review-again',()=>reviewLook(0));bind('review-summary',async()=>{if(state.busy)return;state.reviewComplete=true;state.reviewStage='summary';drawPanel();drawPoints();await moveTo([2250,1950],minScale());panel.focus({preventScroll:true});});
 bind('free',leaveReview);bind('ending-book',openJournal);bind('replay',replay);bind('animation-skip',stopEnsemble);
}
async function showHistory(index){
 if(state.busy)return;if(state.source!=='native'&&!await setSource('native'))return;
 state.historyIndex=index;state.reviewStage='history';state.noteHidden=false;state.noteManual=false;drawPanel();drawPoints();
 await moveTo(chapter.history[index].center,chapter.history[index].scale);panel.focus({preventScroll:true});
}
let ensembleRAF=0,ensembleToken=0;
function stopEnsemble(){ensembleToken++;cancelAnimationFrame(ensembleRAF);$('ensemble-animation')?.remove();state.busy=false;state.reviewStage='reveal';state.noteHidden=false;state.noteManual=false;drawPanel();drawPoints();render();}
async function playEnsemble(){
 if(state.busy)return;
 if(state.source!=='native'&&!await setSource('native'))return;
 state.animationIssue=false;state.reviewIndex=0;await moveTo(chapter.review[0].center,1);
 const token=++ensembleToken;
 state.busy=true;state.reviewStage='playing';drawPanel();drawPoints();render();
 // Animate native pixels in small feathered patches; the original faces,
 // drum, pavilion and background stay fixed. No generated repair plate.
 try{await Promise.race([preload(chapter.native),new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),8000))]);}
 catch{if(token!==ensembleToken)return;state.animationIssue=true;stopEnsemble();return;}
 if(token!==ensembleToken)return;
 const layer=document.createElement('div');layer.id='ensemble-animation';layer.className='ensemble-animation';layer.setAttribute('aria-label','畫中情景演繹：鼓手與持鈸者的局部手部動作');
 const mask=ensembleMotionMask();layer.style.maskImage=mask;layer.style.webkitMaskImage=mask;
 const patches=[
  {id:'cymbal',x:45,y:80,rx:32,ry:36,origin:'45px 80px'},
  {id:'drum',x:120,y:164,rx:50,ry:28,origin:'120px 164px'}
 ];
 const moving=patches.map(p=>{const node=document.createElement('div');node.className='ensemble-native-motion';node.style.backgroundImage=`url("${chapter.native}")`;node.style.transformOrigin=p.origin;const m=`radial-gradient(ellipse ${p.rx}px ${p.ry}px at ${p.x}px ${p.y}px, #000 65%, transparent 100%)`;node.style.maskImage=m;node.style.webkitMaskImage=m;layer.append(node);return node;});world.append(layer);
 let start;
 const tick=now=>{start??=now;const elapsed=now-start,duration=reduced.matches?1200:4200;
  if(elapsed>=duration){stopEnsemble();return;}
  layer.style.opacity=String(Math.min(1,elapsed/220,(duration-elapsed)/220));
  const envelope=Math.min(1,elapsed/450,(duration-elapsed)/450),beat=Math.sin(elapsed/420*Math.PI);
  moving[0].style.transform=reduced.matches?'none':`translateX(${beat*1.8*envelope}px) rotate(${beat*2.5*envelope}deg)`;
  moving[1].style.transform=reduced.matches?'none':`translateY(${-Math.abs(beat)*2.2*envelope}px) rotate(${beat*1.2*envelope}deg)`;
  ensembleRAF=requestAnimationFrame(tick);
 };ensembleRAF=requestAnimationFrame(tick);
}
