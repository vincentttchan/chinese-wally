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
 return state.reviewStage==='performance'?['seated-drum','ensemble-discs-left','ensemble-grey'].map(id=>chapter.people.find(person=>person.id===id).box):[reviewRegion().box];
}
async function reviewLook(index){
 if(state.busy)return;
 state.reviewIndex=index;state.reviewStage='review';state.noteHidden=false;state.noteManual=false;drawPanel();drawPoints();
 if(state.source!=='native'&&!await setSource('native'))return;
 await moveTo(chapter.review[index].center,.9);
}
function reviewTap(){
 if(state.busy)return;
 if(state.reviewStage==='performance')showHitFeedback(hitShapeForPerson(chapter.people.find(p=>p.id==='seated-drum')));
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
  title='讓亭內的合奏動起來';body='輕點亭內鼓手、持鈸者或鑼手，觀看三人合奏；播完收入見聞冊。';
 }else if(stage==='reveal'){
  title='樂聲，也構成慶典';body='鼓手領拍，持鈸者與鑼手相應。動作是依原畫摹繪的遊戲演繹；原畫沒有記錄實際旋律或演奏時序。';
  buttons='<button id="review-replay" class="lantern-note-secondary">再看一次演繹</button>'+action('review-summary','收下這條街的發現');
 }else if(stage==='summary'){
  title='從街道，讀出皇家慶典';body='樂隊、隊列與吉祥彩牆，把沿途街道安排成皇太后的祝壽場景。研究再從儀仗讀出南巡禮成的雙慶意涵。這幅畫讓我們看見皇家如何呈現慶典。';
  buttons=action('free','留在畫中，自由探索')+'<button id="ending-book" class="lantern-note-secondary">回看街衢見聞冊</button><button id="replay" class="lantern-note-secondary">再尋一次</button><details class="collection-source"><summary>回看活動與演繹</summary><button id="review-again" class="lantern-note-secondary">回看三處活動</button><button id="review-replay" class="lantern-note-secondary">重播三人合奏</button></details>';
 }else{title='畫中情景演繹';body='正在播放鼓、鈸與鑼的配合。';buttons='<button id="animation-skip" class="lantern-note-secondary">略過演繹，回到原畫</button>';}
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
const ensembleAsset=name=>'../../../../public/art/animations/kangqu-ensemble-master-v7/'+name+'.png';
const ensemblePeople=['seated-drum','ensemble-discs-left','ensemble-grey'];
let ensembleRAF=0,ensembleToken=0,ensembleReturn=null;
function stopEnsemble(completed=false){
 ensembleToken++;cancelAnimationFrame(ensembleRAF);$('ensemble-animation')?.remove();$('ensemble-controls')?.remove();$('layout').classList.remove('is-ensemble-playing');
 const previous=ensembleReturn;ensembleReturn=null;state.busy=false;
 if(previous){state.reviewStage=previous.stage==='playing'?'performance':previous.stage;state.noteHidden=previous.noteHidden;state.speaker=previous.speaker;}
 if(state.mode==='ending')state.reviewStage=completed?'reveal':state.animationIssue?'performance':previous?.stage==='summary'?'summary':'performance';
 drawPanel();drawPoints();render();
 if(completed&&!state.collections.ensemble){state.collections.ensemble={instance:'pavilion-ensemble',point:[1000,2410]};save();receiveCollection('已收藏：亭內合奏');}
 scene.focus({preventScroll:true});
}
async function playEnsemble(){
 if(state.busy)return;
 if(state.source!=='native'&&!await setSource('native'))return;
 ensembleReturn={stage:state.reviewStage,noteHidden:state.noteHidden,speaker:state.speaker};
 state.animationIssue=false;state.speaker=null;state.reviewIndex=0;
 await moveTo([1000,2410],1);
 const token=++ensembleToken;
 state.busy=true;state.reviewStage='playing';state.noteHidden=true;$('layout').classList.add('is-ensemble-playing');drawPanel();drawPoints();render();
 const controls=document.createElement('p');controls.id='ensemble-controls';controls.className='ensemble-controls';controls.setAttribute('role','status');
 controls.append('鼓手領拍，鈸、鑼相應 ');const skip=document.createElement('button');skip.className='lantern-text-button';skip.textContent='略過';skip.onclick=()=>stopEnsemble();controls.append(skip);document.body.append(controls);
 const names=['original-reference','fixed-background',...Array.from({length:9},(_,i)=>'frames/group-'+String(i+1).padStart(2,'0'))];
 let images,timeout;
 try{images=await Promise.race([Promise.all(names.map(name=>preload(ensembleAsset(name)))),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('timeout')),8000);})]);}
 catch{if(token!==ensembleToken)return;state.animationIssue=true;stopEnsemble();announce('演繹素材暫未載入，請再點樂隊重試。');return;}
 finally{clearTimeout(timeout);}
 if(token!==ensembleToken)return;
 const {crop,placement,lead,fade,durations,tail}=ensemblePlayback,motion=durations.reduce((n,t)=>n+t,0),duration=lead+motion+fade+tail;
 const layer=document.createElement('canvas');layer.id='ensemble-animation';layer.className='ensemble-animation';layer.width=crop.width;layer.height=crop.height;
 layer.setAttribute('aria-label','畫中情景演繹：整組摹繪的鼓手、持鈸者與鑼手，背景固定');
 const context=layer.getContext('2d'),plate=document.createElement('canvas');plate.width=crop.width;plate.height=crop.height;const paint=plate.getContext('2d');
 if(!context||!paint){state.animationIssue=true;stopEnsemble();return;}
 world.append(layer);let start;
 const tick=now=>{
  if(token!==ensembleToken)return;start??=now;const t=now-start;
  if(t>=(reduced.matches?850:duration)){stopEnsemble(true);return;}
  context.globalAlpha=1;context.drawImage(images[0],0,0);
  let frame=8,end=lead;for(let i=0;i<durations.length;i++){end+=durations[i];if(t<end){frame=i;break;}}
  if(frame>0)clearHitFeedback();
  if(!reduced.matches){
   paint.clearRect(0,0,crop.width,crop.height);paint.drawImage(images[1],0,0);
   const group=images[frame+2];paint.drawImage(group,placement.x,placement.y,group.width*placement.scale,group.height*placement.scale);
   context.globalAlpha=Math.max(0,Math.min(1,t/lead,(lead+motion+fade-t)/fade));context.drawImage(plate,0,0);context.globalAlpha=1;
  }
  layer.dataset.groupFrame=String(frame+1);ensembleRAF=requestAnimationFrame(tick);
 };ensembleRAF=requestAnimationFrame(tick);
}
