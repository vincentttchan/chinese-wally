// The final observation stays in the painting; one chosen piece of evidence is enough.
async function reopenReview(){
 if(state.busy||state.completed!==chapter.rounds.length||!state.reviewComplete)return;
 state.reviewReturn={view:{...state.view},sceneSize:frame(),source:state.source,focus:state.focus,focusPoint:[...state.focusPoint]};
 if(state.source!=='native'&&!await setSource('native'))return;
 state.reviewStage='summary';setMode('ending');await moveTo([2250,1950],minScale());
}
async function leaveReview(){
 if(state.busy)return;const saved=state.reviewReturn;state.reviewReturn=null;setMode('free');
 if(saved){if(saved.source!==state.source&&!await setSource(saved.source))return;state.view=KangquGeometry.restoreView(saved.view,saved.sceneSize,frame());state.focus=saved.focus;state.focusPoint=[...saved.focusPoint];render();}
 scene.focus({preventScroll:true});
}
function reviewRegion(){return chapter.review[state.reviewIndex||0];}
function reviewHitBoxes(){return chapter.review.map(r=>r.box);}
async function reviewTap(index=0){
 if(state.busy||state.mode!=='ending')return;
 state.reviewIndex=index;state.reviewSeen=[index];state.reviewComplete=true;state.reviewStage='summary';state.noteHidden=false;quietInquiryNotice();drawPanel();drawPoints();
 await moveTo(chapter.review[index].center,.85);
}
function drawEpilogue(){
 if(state.reviewStage==='arrival'){
  panel.innerHTML='<p class="lantern-observation-eyebrow">把發現放回街道</p><h2>甚麼讓你看出這是一場慶典？</h2><p class="lantern-note-body">在原畫點選一處你想用作證據的場景：樂隊、旗列或戲班。</p><p class="lantern-note-caption">可以自行拖曳與放大，選一處再看看它與街道的關係。</p>';
  return;
 }
 const item=chapter.review[state.reviewIndex||0];
 panel.innerHTML='<p class="lantern-observation-eyebrow">從你選的原畫證據出發</p><h2>街道上的皇家慶典</h2><p class="lantern-note-body">'+item.text+'</p><p class="lantern-note-body">樂隊、儀仗與戲班，共同呈現為皇太后祝壽的街衢場面。</p>'+action('free','留在畫中，自由探索')+'<button id="ending-book" class="lantern-note-secondary">回看街衢見聞冊</button><details class="collection-source"><summary>再讀慶典背景與「駢慶」</summary>'+chapter.history.map(h=>'<p>'+h.text+'</p>').join('')+'<a href="'+chapter.sources.procession.url+'" target="_blank" rel="noopener noreferrer">'+chapter.sources.procession.label+'</a></details><details class="collection-source"><summary>回看其他發現</summary>'+chapter.review.map((r,i)=>'<button class="lantern-note-secondary" data-review="'+i+'">'+r.label+'</button>').join('')+'<button id="review-replay" class="lantern-note-secondary">重播三人合奏</button></details><button id="replay" class="lantern-note-secondary">再尋一次</button>';
 panel.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>reviewTap(Number(b.dataset.review)));
 bind('free',leaveReview);bind('ending-book',openJournal);bind('review-replay',()=>playEnsemble());bind('replay',replay);
}
const ensembleAsset=name=>'../../../../public/art/animations/kangqu-ensemble-master-v7/'+name+'.png';
let ensembleRAF=0,ensembleToken=0,ensembleReturn=null;
async function stopEnsemble(completed=false){
 ensembleToken++;cancelAnimationFrame(ensembleRAF);$('ensemble-animation')?.remove();$('ensemble-controls')?.remove();
 const previous=ensembleReturn;ensembleReturn=null;
 await restoreInquiryPlayback(previous);
 if(completed&&!state.collections.ensemble){state.collections.ensemble={instance:'pavilion-ensemble',point:[1000,2410]};save();receiveCollection('已收藏：亭內合奏');}
 if(previous&&freeEnsembleObservation()&&state.step===2&&!state.animationIssue)offerInquiryHandoff();
}
async function playEnsemble(fromJournal=false){
 if(!fromJournal&&!inquiryCanAnimate('ensemble')){announce('先完成樂器的原畫觀察，再看合奏。');return;}
 if(state.busy)return;
 const previous=await prepareInquiryPlayback();if(!previous)return;ensembleReturn=previous;state.animationIssue=false;
 const token=++ensembleToken;
 await moveTo([1000,2410],1);if(token!==ensembleToken)return;
 quietInquiryNotice();
 state.busy=true;state.noteHidden=true;$('layout').classList.add('is-ensemble-playing');drawPanel();drawPoints();render();
 const controls=document.createElement('p');controls.id='ensemble-controls';controls.className='ensemble-controls';controls.setAttribute('role','status');
 controls.append('清晰摹繪 · 合奏演繹 ');const skip=document.createElement('button');skip.className='lantern-text-button';skip.textContent='返回原畫';skip.onclick=()=>stopEnsemble();controls.append(skip);document.body.append(controls);
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
  const density=Math.min(4,Math.max(1,state.view.scale*window.devicePixelRatio)),w=Math.ceil(crop.width*density),h=Math.ceil(crop.height*density);
  if(layer.width!==w||layer.height!==h){layer.width=plate.width=w;layer.height=plate.height=h;}
  context.setTransform(w/crop.width,0,0,h/crop.height,0,0);paint.setTransform(w/crop.width,0,0,h/crop.height,0,0);context.imageSmoothingQuality=paint.imageSmoothingQuality='high';
  context.globalAlpha=1;context.clearRect(0,0,crop.width,crop.height);context.drawImage(images[0],0,0,crop.width,crop.height);
  let frame=8,end=lead;for(let i=0;i<durations.length;i++){end+=durations[i];if(t<end){frame=i;break;}}
  if(frame>0)clearHitFeedback();
  if(!reduced.matches){
   paint.clearRect(0,0,crop.width,crop.height);paint.drawImage(images[1],0,0,crop.width,crop.height);
   const group=images[frame+2];paint.drawImage(group,placement.x,placement.y,group.width*placement.scale,group.height*placement.scale);
   context.globalAlpha=Math.max(0,Math.min(1,t/lead,(lead+motion+fade-t)/fade));context.drawImage(plate,0,0,crop.width,crop.height);context.globalAlpha=1;
  }
  layer.dataset.groupFrame=String(frame+1);ensembleRAF=requestAnimationFrame(tick);
 };ensembleRAF=requestAnimationFrame(tick);
}
