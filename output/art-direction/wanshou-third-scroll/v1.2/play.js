'use strict';
const $=id=>document.getElementById(id),scene=$('scene'),world=$('world'),panel=$('panel');
const key='chinese-wally:kangqu-listening:journal:v1';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const state={mode:'intro',intro:0,round:0,step:0,hint:0,ending:0,ready:false,source:'native',focus:true,focusPoint:[2250,1700],view:{x:0,y:0,scale:.32},busy:false,reviewComplete:false,reviewReturn:null,reviewStage:"arrival",reviewIndex:0,reviewSeen:[],historyIndex:0,connectionHint:false,noteHidden:false,noteManual:false,animationIssue:false,details:{},collections:{},pending:{},visits:{},journalReturn:null,entry:null,journalLooking:false,speaker:null,completed:0,hintOpen:false,menuOpen:false};
let noticeTimer,drag=null,pinched=false,pinch=null,cameraToken=0,displayCount=0;
const pointers=new Map(),flights=new Set();
const current=()=>chapter.rounds[state.round];
const dimensions=()=>state.source==='native'?[chapter.width,chapter.height]:[chapter.fullWidth,chapter.fullHeight];
const bounds=()=>state.source==='native'?chapterViewport.nativeBounds:chapterViewport.fullBounds;
const frame=()=>[scene.clientWidth,scene.clientHeight];
const startScale=()=>minScale()*chapterViewport.initialZoomRatio;
const midpoint=b=>[(b[0]+b[2])/2,(b[1]+b[3])/2];
function objectBox(o){if(o.box)return o.box;return [Math.min(...o.polygon.map(p=>p[0])),Math.min(...o.polygon.map(p=>p[1])),Math.max(...o.polygon.map(p=>p[0])),Math.max(...o.polygon.map(p=>p[1]))];}
function inside(p,b){return p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3];}
function inPolygon(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function minScale(){return KangquViewport.coverScale(bounds(),frame(),chapterViewport.gutter);}
function maxScale(){return KangquViewport.maxScale(bounds(),frame(),chapterViewport);}
function clamp(){state.view=KangquViewport.constrain(state.view,bounds(),frame(),chapterViewport);}
function eventPoint(e){const r=scene.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
function nativeAt(p){return [(p[0]-state.view.x)/state.view.scale,(p[1]-state.view.y)/state.view.scale];}
function observationTapBox(point){
 const b=point.box,size=(point.tapSize||0)/state.view.scale;
 const dx=Math.max(0,(size-(b[2]-b[0]))/2),dy=Math.max(0,(size-(b[3]-b[1]))/2);
 return [b[0]-dx,b[1]-dy,b[2]+dx,b[3]+dy];
}
function screenAt(p){return [p[0]*state.view.scale+state.view.x,p[1]*state.view.scale+state.view.y];}
function focusAt(p){state.focusPoint=nativeAt(p);applyFocus();}
function applyFocus(){const p=screenAt(state.focusPoint),light=$('focus-light');light.hidden=!state.focus||state.mode==='ending';light.style.setProperty('--focus-x',p[0]+'px');light.style.setProperty('--focus-y',p[1]+'px');light.style.setProperty('--focus-radius','160px');}
function announce(text){clearTimeout(noticeTimer);$('notice-text').textContent=text;$('notice').hidden=false;noticeTimer=setTimeout(()=>{$('notice').hidden=true;$('notice-text').textContent='';},3600);}
function bind(id,fn){const b=$(id);if(b)b.onclick=fn;}
function save(){try{localStorage.setItem(key,JSON.stringify({version:1,chapter:chapter.id,items:state.collections,pending:state.pending,details:state.details}));}catch{$('storage-note').textContent='目前無法保存；本次收藏仍可繼續。';}}
function load(){try{const data=JSON.parse(localStorage.getItem(key)||'null');if(!data||data.version!==1||data.chapter!==chapter.id)return;for(const motif of chapter.motifs){const record=data.details?.[motif.id],object=chapter.objects.find(o=>o.id===motif.object);if(object&&record?.instance===object.id&&Array.isArray(record.point)&&record.point.length===2&&record.point.every(Number.isFinite)&&inside(record.point,objectBox(object)))state.details[motif.id]={instance:object.id,point:[...motif.anchor]};}for(const c of chapter.collections){const record=data.items?.[c.id],o=chapter.objects.find(o=>o.category===c.id&&o.id===record?.instance);if(c.id==='audience'&&record?.instance==='street-audience'){state.collections.audience={instance:'street-audience',point:[512.5,2557.5]};}else if(c.id==='ensemble'&&record?.instance==='pavilion-ensemble'){state.collections.ensemble={instance:'pavilion-ensemble',point:[1000,2410]};}else if(o){const point=record.point;state.collections[c.id]={instance:o.id,point:Array.isArray(point)&&point.length===2&&point.every(Number.isFinite)&&inside(point,objectBox(o))?point:midpoint(objectBox(o))};}else if(c.id==='discs'&&record?.instance==='discs-grotto'){state.pending.discs={instance:'discs-grotto',point:[3699.5,1090]};}}const wall=state.collections['painted-wall'],known=chapter.motifs.find(m=>m.object===wall?.instance);if(known&&!state.details[known.id])state.details[known.id]={instance:wall.instance,point:[...known.anchor]};if(data.pending?.discs?.instance==='discs-grotto')state.pending.discs={instance:'discs-grotto',point:[3699.5,1090]};if(state.pending.discs)$('storage-note').textContent='小亭的原有圓片紀錄已保留待核，暫不計入成對圓盤收藏。';}catch{$('storage-note').textContent='收藏將在本次遊玩中記錄。';}displayCount=Object.keys(state.collections).length;}
function count(){ $('book-count').textContent=`${displayCount}／${chapter.collections.length}`;}
function render(){
 updateChapterSound();
 clamp();const v=state.view,[w,h]=dimensions();world.style.width=w+'px';world.style.height=h+'px';world.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.scale})`;
 const b=bounds();world.style.clipPath=`inset(${b[1]}px ${w-b[2]}px ${h-b[3]}px ${b[0]}px)`;
 $('painting').style.width=w+'px';$('painting').style.height=h+'px';
 $('zoom').textContent=Math.round(v.scale*100)+'%';$('zoom-in').disabled=!state.ready||state.busy||v.scale>=maxScale()-.001;$('zoom-out').disabled=!state.ready||state.busy||v.scale<=minScale()+.001;
 scene.classList.toggle('focused',state.focus);$('colour').textContent=state.focus?'轉回彩色':'凝神觀察';$('colour').setAttribute('aria-pressed',String(state.focus));applyFocus();placeSpeech();placeFieldNote();
 drawMap();
 for(const b of $('points').children){const p=screenAt(midpoint(b.hitbox));b.tabIndex=state.ready&&!state.busy&&state.source==='native'&&p[0]>0&&p[0]<scene.clientWidth&&p[1]>0&&p[1]<scene.clientHeight?0:-1;}
 $('book').disabled=!state.ready||state.mode==='intro'||state.busy;
 for(const id of ['journal-resume','close-book','journal-return'])if($(id))$(id).disabled=state.busy;
 if($('face-help'))$('face-help').disabled=!state.ready||state.mode!=='seek'||state.busy;
 $('hint-toggle').disabled=!state.ready||!['seek','free','observe','ending'].includes(state.mode)||state.busy;
 $('full-view').textContent=state.source==='native'?'展開全卷':'回到清晰段落';
}
function centerAt(p,scale=.9,anchor=[.5,.56]){state.view={scale,x:scene.clientWidth*anchor[0]-p[0]*scale,y:scene.clientHeight*anchor[1]-p[1]*scale};render();focusAt(screenAt(p));}
function zoomBy(factor,at=[scene.clientWidth/2,scene.clientHeight/2]){if(!state.ready||state.busy)return;const p=nativeAt(at),scale=Math.min(maxScale(),Math.max(minScale(),state.view.scale*factor));state.view={scale,x:at[0]-p[0]*scale,y:at[1]-p[1]*scale};render();focusAt(at);}
async function moveTo(p,scale=.95){
 if(state.busy)return;state.busy=true;const token=++cameraToken;panel.classList.add('moving');render();
 const anchor=state.mode==='observe'?[scene.clientWidth<700?.5:.72,.46]:[.5,.56];
 const start={...state.view},end={scale,x:scene.clientWidth*anchor[0]-p[0]*scale,y:scene.clientHeight*anchor[1]-p[1]*scale};
 await new Promise(resolve=>{let first;const tick=now=>{if(token!==cameraToken){resolve();return;}first??=now;const t=reduced.matches?1:Math.min(1,(now-first)/500),q=t*t*(3-2*t);state.view={scale:start.scale+(end.scale-start.scale)*q,x:start.x+(end.x-start.x)*q,y:start.y+(end.y-start.y)*q};render();if(t<1)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});
 state.busy=false;panel.classList.remove('moving');focusAt(screenAt(p));render();
}
function setMode(mode){state.mode=mode;state.noteHidden=false;state.noteManual=false;state.speaker=null;state.hintOpen=false;state.menuOpen=false;state.journalLooking=false;$('layout').classList.toggle('book-open',mode==='journal');drawPanel();drawPoints();render();}
function placeChapterSpeech(params){
 const {anchor,view,viewport,frame,protectedBoxes,subjectBox}=params,[width,height]=frame,[vw,vh]=viewport;
 const x=anchor[0]*view.scale+view.x,y=anchor[1]*view.scale+view.y;
 const subjectLeft=subjectBox[0]*view.scale+view.x,subjectRight=subjectBox[2]*view.scale+view.x;
 if(x<12||x>vw-12||y<12||y>vh-12)return null;
 // Canonical speech tries the actor's sides first, then the existing above/
 // below candidates. All candidates obey the same face and object exclusions.
 for(const side of ['left','right']){
  const left=side==='left'?subjectRight+16:subjectLeft-16-width,top=Math.max(16,Math.min(vh-height-16,y-height/2));
  if(left<16||left+width>vw-16||top<16||top+height>vh-16)continue;
  const box=[(left-6-view.x)/view.scale,(top-6-view.y)/view.scale,(left+width+6-view.x)/view.scale,(top+height+6-view.y)/view.scale];
  if(protectedBoxes.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]))continue;
  return {left,top,side,pointerX:Math.max(12,Math.min(width-12,x-left)),pointerY:Math.max(10,Math.min(height-10,y-top))};
 }
 const fallback=KangquGeometry.speechPlacement(params);
 return fallback?{...fallback,side:fallback.pointer==='up'?'top':'bottom',pointerY:height/2}:null;
}
function placeSpeech(){
 const s=$('speech');s.hidden=true;if(!state.speaker||state.source!=='native'||state.busy||state.mode==='journal'||state.hintOpen||state.menuOpen)return;
 const person=chapter.people.find(p=>p.id===state.speaker.id),r=chapter.rounds.find(r=>r.id===person.id),head=midpoint(person.head||r?.head||[person.box[0],person.box[1],person.box[2],person.box[1]+40]);
 s.hidden=false;
 // Same 18px speech text as LanternEmperorSpeech; allow one desktop line and
 // natural wrapping when the available viewport is narrower.
 s.style.width=Math.min(scene.clientWidth-32,Math.max(140,[...state.speaker.text].length*18+32))+'px';
 const boxes=[person.box,...chapter.people.map(p=>p.head),...chapter.objects.map(objectBox),...(r?.comparison||[]).map(p=>p.box),...(r?.recognitionFeatures||[])];
 const sceneRect=scene.getBoundingClientRect();
 for(const id of ['mission','colour','fullscreen','menu-toggle','book','navigator','hint-toggle']){
  const element=$(id);if(!element||!element.getClientRects().length)continue;
  const b=element.getBoundingClientRect();boxes.push([(b.left-sceneRect.left-state.view.x)/state.view.scale,(b.top-sceneRect.top-state.view.y)/state.view.scale,(b.right-sceneRect.left-state.view.x)/state.view.scale,(b.bottom-sceneRect.top-state.view.y)/state.view.scale]);
 }
 const placement=placeChapterSpeech({anchor:head,subjectBox:person.box,safeBottom:r?.safeY||person.box[1]-56,view:state.view,viewport:[scene.clientWidth,scene.clientHeight],frame:[s.offsetWidth,s.offsetHeight],protectedBoxes:boxes});
 if(state.mode==='found')$('panel-layer').hidden=!!placement;
 if(!placement){s.hidden=true;return;}
 s.style.left=placement.left+'px';s.style.top=placement.top+'px';
 $('speech-bubble').className='lantern-character-reply has-finding emperor-speech-bubble tail-'+placement.side;
 $('speech-bubble').style.setProperty('--reply-tail-x',placement.pointerX+'px');
 $('speech-bubble').style.setProperty('--reply-tail-y',placement.pointerY+'px');
}
function speak(person,text,found=false){state.speaker={id:person.id,text};$('speech-text').textContent=text;$('look').innerHTML=(found?'近看原畫':'繼續看畫')+'<span aria-hidden="true"> →</span>';$('look').onclick=found?beginObservation:()=>{state.speaker=null;render();};render();if(found)announce(`尋得第 ${state.round+1} 位畫中人`);else if($('speech').hidden)announce(text);}
function openJournal(){if(state.busy||state.mode==='intro'||state.mode==='journal')return;state.journalReturn={mode:state.mode,view:{...state.view},sceneSize:[scene.clientWidth,scene.clientHeight],source:state.source,focus:state.focus,focusPoint:[...state.focusPoint]};state.entry=null;setMode('journal');$('journal').focus({preventScroll:true});}
async function closeJournal(){
 if(state.busy)return;
 const saved=state.journalReturn;if(!saved)return;
 // Keep the original snapshot until its painting has been restored successfully.
 if(saved.source!==state.source&&!await setSource(saved.source)){announce('原來的畫面暫未載入，見聞冊仍保留，可稍後再合冊。');return;}
 state.journalReturn=null;setMode(saved.mode);size=frame();
 state.view=KangquGeometry.restoreView(saved.view,saved.sceneSize,size);
 state.focus=saved.focus;state.focusPoint=[...saved.focusPoint];render();$('book').focus({preventScroll:true});
}

async function beginObservation(){if(state.busy||state.mode!=='found')return;state.step=0;setMode('observe');const p=current().comparison[0];await moveTo(p.center||current().center,p.scale||1);}
async function replay(){if(state.busy)return;if(state.source!=='native'&&!await setSource('native'))return;state.round=0;state.completed=0;state.hint=0;state.step=0;state.ending=0;state.reviewComplete=false;state.reviewReturn=null;state.reviewStage="arrival";state.reviewIndex=0;state.reviewSeen=[];state.visits={};setMode('seek');centerAt(chapterViewport.initialPoint,startScale(),[.5,.5]);announce('重新尋人，見聞冊收藏已保留。');}
function inspectPerson(p){
 if(state.mode==='seek'&&p.id===current().id){setMode('found');speak(p,current().greeting,true);return;}
 if(audiencePeople.includes(p.id)){void playAudience();return;}
 if(ensemblePeople.includes(p.id)){void playEnsemble();return;}
 const visits=state.visits[p.id]||0;state.visits[p.id]=visits+1;speak(p,p.lines[Math.min(visits,2)]);
}
async function observePoint(){
 if(state.mode!=='observe'||state.step>=2||state.busy)return;
 if(state.view.scale<.65){announce('請先放大，再點眼前的細節。');return;}
 state.step++;state.noteHidden=false;state.noteManual=false;drawPanel();drawPoints();render();
 if(state.step===1){const p=current().comparison[1];if(p.center)await moveTo(p.center,p.scale||1);announce(p.label);}
 else announce('已完成兩處原畫比較。');
}
function receiveCollection(message){
 displayCount=Object.keys(state.collections).length;count();
 const book=$('book');book.classList.remove('is-spark-arriving');
 if(!reduced.matches){requestAnimationFrame(()=>book.classList.add('is-spark-arriving'));setTimeout(()=>book.classList.remove('is-spark-arriving'),700);}
 announce(message);
}
function collect(o,point=midpoint(objectBox(o))){
 const motif=chapter.motifs.find(m=>m.object===o.id);if(motif)point=[...motif.anchor];let newDetail=false;
 if(motif&&!state.details[motif.id]){state.details[motif.id]={instance:o.id,point:[...point]};newDetail=true;}
 const c=chapter.collections.find(c=>c.id===o.category),fresh=!state.collections[c.id];
 if(fresh)state.collections[c.id]={instance:o.id,point:[...point]};
 // Commit category and individual motif together before visual feedback.
 if(fresh||newDetail)save();
 const message=fresh?'已收藏：'+c.name:newDetail?`見聞冊添上：${motif.name}。${motif.meaning}`:`這裡也有${c.name}，已記在冊中。`;
 if(reduced.matches||typeof requestAnimationFrame!=='function'){receiveCollection(message);return;}
 const rect=scene.getBoundingClientRect(),start=screenAt(point),art=document.createElement('img');art.src=c.art;art.alt='';art.className='collection-flight';document.body.append(art);flights.add(art);
 let first;const finish=()=>{if(!flights.has(art))return;flights.delete(art);art.remove();receiveCollection(message);};
 art.onerror=finish;
 const tick=now=>{if(!flights.has(art))return;first??=now;const t=Math.min(1,(now-first)/(fresh?1350:900)),q=t*t*(3-2*t),target=$('book').getBoundingClientRect(),size=(fresh?84:52)- (fresh?56:24)*q;
  art.style.width=size+'px';art.style.height=size+'px';art.style.left=(rect.left+start[0]+(target.left+target.width/2-rect.left-start[0])*q-size/2)+'px';art.style.top=(rect.top+start[1]+(target.top+target.height/2-rect.top-start[1])*q-Math.sin(Math.PI*q)*65-size/2)+'px';art.style.opacity=String(t>.85?1-(t-.85)/.15:1);
  if(t<1)requestAnimationFrame(tick);else finish();};requestAnimationFrame(tick);
}

function interact(p){
 if(!state.ready||state.busy||['intro','journal','found'].includes(state.mode))return;
 if(state.source!=='native'){announce('全卷用於看構圖；按「回到清晰段落」再點人物與細節。');return;}
 const at=nativeAt(p);
 if(state.mode==='ending'){
  if(['review','performance'].includes(state.reviewStage)&&reviewHitBoxes().some(box=>inside(at,box)))reviewTap();
  else announce(['review','performance'].includes(state.reviewStage)?'輕點題箋所說的原畫活動。':'按題箋繼續回看長卷。');
  return;
 }
 if(state.mode==='observe'&&state.step<2){if(state.view.scale<.65){announce('請先放大，再點眼前的細節。');return;}const point=current().comparison[state.step];if(KangquGeometry.observationContains(at,{...point,box:observationTapBox(point)}))observePoint();else announce(point.label);return;}
 if(state.mode==='observe'){announce('看完解讀後，按題箋中的按鈕繼續。');return;}
 if(state.view.scale<.45){announce('請先放大，再點人物或細節。');return;}
 const hit=resolveTap(at);
 if(hit?.kind==='person')inspectPerson(chapter.people.find(p=>p.id===hit.id));
 else if(hit?.kind==='object')collect(chapter.objects.find(o=>o.id===hit.id));
}
function resolveTap(at){
 // Exact artwork wins. A nearby object may override a body hit, never a face.
 const exact=KangquGeometry.resolveExplore(at,chapter.people,chapter.objects);
 if(exact?.kind==='object'||chapter.people.some(p=>inside(at,p.head)))return exact;
 const distanceToSegment=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
 const candidates=chapter.objects.filter(o=>!o.backdrop).map(o=>{
  const b=objectBox(o),poly=o.polygon||[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]];
  const distance=Math.min(...poly.map((p,i)=>distanceToSegment(at,p,poly[(i+1)%poly.length])))*state.view.scale;
  // A thin pipe has a large diagonal bounding box: use its visible shaft
  // thickness when supplied, while still measuring distance to the polygon.
  const shortSide=(o.tapWidth||Math.min(b[2]-b[0],b[3]-b[1]))*state.view.scale;
  const tolerance=Math.min(18,Math.max(0,(44-shortSide)/2));
  return {o,distance,tolerance};
 }).filter(c=>c.distance<=c.tolerance).sort((a,b)=>a.distance-b.distance);
 return candidates.length?{kind:'object',id:candidates[0].o.id}:exact;
}
function addPoint(label,box,action){const b=document.createElement('button');b.type='button';b.className='hotspot';b.hitbox=box;b.setAttribute('aria-label',label);b.style.cssText=`left:${box[0]}px;top:${box[1]}px;width:${box[2]-box[0]}px;height:${box[3]-box[1]}px`;b.onclick=e=>{if(e.detail===0&&state.ready&&!state.busy)action();};$('points').append(b);}
function drawPoints(){
 $('points').replaceChildren();if(state.source!=='native'||['intro','journal','found'].includes(state.mode))return;
 if(state.mode==='ending'){
  if(['review','performance'].includes(state.reviewStage))for(const box of reviewHitBoxes())addPoint(state.reviewStage==='performance'?'觀看這位樂手的演繹':'觀察'+reviewRegion().label,box,reviewTap);
  return;
 }
 if(state.mode==='observe'){if(state.step<2){const c=current().comparison[state.step];addPoint(c.label,c.box,observePoint);}return;}
 // Keyboard access follows visible figures/objects, never a target-only answer list.
 for(const p of chapter.people)addPoint(audiencePeople.includes(p.id)&&!(state.mode==='seek'&&p.id===current().id)?'觀看表演與觀看七人群像：'+p.name:ensemblePeople.includes(p.id)&&!(state.mode==='seek'&&p.id===current().id)?'觀看亭內三人合奏：'+p.name:'聽聽'+p.name+'的話',p.box,()=>inspectPerson(p));
 for(const o of chapter.objects)addPoint('看看'+chapter.collections.find(c=>c.id===o.category).name,objectBox(o),()=>collect(o));
}
const imageCache=new Map();
function preload(src){if(imageCache.has(src))return imageCache.get(src);const promise=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{imageCache.delete(src);reject(new Error('load'));};im.src=src;});imageCache.set(src,promise);return promise;}
async function setSource(source){
 if(state.busy)return false;state.busy=true;render();const src=source==='native'?chapter.native:chapter.full;
 try{await preload(src);state.source=source;$('painting').src=src;$('source-note').textContent=source==='native'?'官方原生清晰段落':'第三卷完整公開構圖 · 人物細節請回到清晰段落';const center=source==='native'?chapterViewport.initialPoint:[chapter.registration[0][2]+2250*.28555,400];centerAt(center,source==='native'?startScale():minScale(),[.5,.5]);drawPoints();return true;}
 catch{announce('這幅原畫未能載入，仍可繼續觀看目前畫面。');return false;}
 finally{state.busy=false;render();}
}
bind('full-view',()=>{if(!state.busy&&state.mode!=='journal')setSource(state.source==='native'?'full':'native');});
bind('hint-toggle',toggleHint);bind('menu-toggle',()=>toggleMenu());bind('menu-close',()=>toggleMenu(false));
bind('fullscreen',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{announce('目前無法切換全螢幕，可繼續看畫。');}});
bind('book',openJournal);bind('colour',()=>{state.focus=!state.focus;render();});bind('zoom-in',()=>{toggleMenu(false);zoomBy(1.25);});bind('zoom-out',()=>{toggleMenu(false);zoomBy(.8);});bind('overview',()=>{if(!state.busy){toggleMenu(false);const b=bounds();centerAt([(b[0]+b[2])/2,(b[1]+b[3])/2],minScale(),[.5,.5]);}});
bind('menu-replay',()=>{toggleMenu(false);replay();});
bind('menu-cover',()=>{if(state.busy)return;window.dispatchEvent(new CustomEvent('chapter-cover-request',{detail:async()=>{await replay();if(state.source!=='native')return;state.intro=0;state.journalReturn=null;state.entry=null;setMode('intro');$('intro-next').focus({preventScroll:true});}}));});
bind('clear-collections',()=>{$('clear-confirm').innerHTML='<button id="confirm-clear" class="lantern-text-button">確認清空</button>';bind('confirm-clear',()=>{state.collections={};state.pending={};state.details={};$('storage-note').textContent='';displayCount=0;save();count();$('clear-confirm').replaceChildren();announce('本章收藏已清空。');});});
installMap();
for(const index of [1,2,3]){const region=chapter.regions[index],button=document.createElement('button');button.textContent=region.name;button.onclick=async()=>{if(state.busy)return;if(state.source!=='native'&&!await setSource('native'))return;await moveTo(region.center,region.scale);};$('navigator-regions').append(button);}
$('menu-layer').onclick=e=>{if(e.target===$('menu-layer'))toggleMenu(false);};
$('panel-layer').onclick=e=>{if(e.target===$('panel-layer')&&state.hintOpen)closeHint();};
chapter.regions.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=i===0?'回到入畫視角':r.name;$('regions').append(o);});
$('regions').onchange=async e=>{if(state.busy)return;const index=Number(e.target.value),r=chapter.regions[index];toggleMenu(false);if(state.source!=='native'&&!await setSource('native'))return;if(index===0)centerAt(chapterViewport.initialPoint,startScale(),[.5,.5]);else await moveTo(r.center,r.scale);};
scene.addEventListener('wheel',e=>{e.preventDefault();zoomBy(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.003),eventPoint(e));},{passive:false});
scene.addEventListener('pointerdown',e=>{if(!state.ready||state.busy||e.button>0||e.target.closest('.lantern-emperor-speech'))return;e.preventDefault();const p=eventPoint(e);pointers.set(e.pointerId,p);scene.setPointerCapture(e.pointerId);focusAt(p);if(pointers.size===1){pinched=false;drag={id:e.pointerId,start:p,last:p,moved:false};scene.classList.add('dragging');}else{pinched=true;const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a[0]-b[0],a[1]-b[1]),center:[(a[0]+b[0])/2,(a[1]+b[1])/2]};}});
scene.addEventListener('pointermove',e=>{const p=eventPoint(e);if(state.ready&&!state.busy&&!e.target.closest('.lantern-emperor-speech'))focusAt(p);if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,p);if(pointers.size>=2){const [a,b]=[...pointers.values()],distance=Math.hypot(a[0]-b[0],a[1]-b[1]),center=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(pinch){zoomBy(distance/Math.max(1,pinch.distance),pinch.center);state.view.x+=center[0]-pinch.center[0];state.view.y+=center[1]-pinch.center[1];render();}pinch={distance,center};return;}if(drag?.id!==e.pointerId||state.busy)return;if(Math.hypot(p[0]-drag.start[0],p[1]-drag.start[1])>7)drag.moved=true;if(drag.moved){state.view.x+=p[0]-drag.last[0];state.view.y+=p[1]-drag.last[1];render();}drag.last=p;});
function release(e,cancelled=false){if(!pointers.has(e.pointerId))return;const click=!cancelled&&!pinched&&drag?.id===e.pointerId&&!drag.moved;pointers.delete(e.pointerId);if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId);drag=null;pinch=null;if(pointers.size===0)scene.classList.remove('dragging');if(click)interact(eventPoint(e));}
scene.addEventListener('pointerup',e=>release(e));scene.addEventListener('pointercancel',e=>release(e,true));
scene.addEventListener('keydown',e=>{if(state.busy||!state.ready||e.target!==scene)return;const d=e.shiftKey?160:70,arrows={ArrowLeft:[d,0],ArrowRight:[-d,0],ArrowUp:[0,d],ArrowDown:[0,-d]};if(arrows[e.key]){e.preventDefault();state.view.x+=arrows[e.key][0];state.view.y+=arrows[e.key][1];render();}else if(['+','='].includes(e.key)){e.preventDefault();zoomBy(1.25);}else if(e.key==='-'){e.preventDefault();zoomBy(.8);}});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&audienceReturn){e.preventDefault();stopAudience();return;}
 if(e.key==='Escape'&&state.reviewStage==='playing'){e.preventDefault();stopEnsemble();return;}
 if(e.key==='Escape'){if(state.mode==='journal'){if(state.journalLooking)resumeJournal();else closeJournal();}else if(state.menuOpen)toggleMenu(false);else if(state.hintOpen)closeHint();else if(state.mode!=='found'){state.speaker=null;render();}return;}
 if(e.key!=='Tab')return;
 const overlay=state.menuOpen?$('chapter-menu'):state.hintOpen?panel:state.mode==='journal'?$('journal'):null;
 if(!overlay)return;
 const controls=[...overlay.querySelectorAll('button:not(:disabled),a[href],summary,select')].filter(node=>!node.closest('[inert]')&&node.getClientRects().length>0),first=controls[0],last=controls[controls.length-1];
 if(!first){e.preventDefault();return;}
 if(!overlay.contains(document.activeElement)||document.activeElement===overlay){e.preventDefault();(e.shiftKey?last:first).focus();}
 else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
let size=[scene.clientWidth,scene.clientHeight];new ResizeObserver(()=>{const center=[(size[0]/2-state.view.x)/state.view.scale,(size[1]/2-state.view.y)/state.view.scale];size=[scene.clientWidth,scene.clientHeight];state.view.x=size[0]/2-center[0]*state.view.scale;state.view.y=size[1]/2-center[1]*state.view.scale;render();}).observe(scene);
function ready(){if(state.ready)return;state.ready=true;$('loading').hidden=true;$('painting').classList.add('is-decoded');drawPanel();drawPoints();render();}
function failed(){state.ready=false;$('introduction').hidden=true;$('loading').hidden=false;$('loading').innerHTML='<p>原畫未能載入。</p><button id="retry" class="small-button">重新載入原畫</button>';bind('retry',()=>{imageCache.delete(chapter.native);$('painting').src=chapter.native+'?retry='+Date.now();});render();}
async function nativeLoaded(){try{await $('painting').decode();}catch{}ready();}
$('painting').onload=nativeLoaded;$('painting').onerror=()=>{if(chapter.native!==chapter.nativeFallback){chapter.native=chapter.nativeFallback;$('painting').src=chapter.native;return;}failed();};load();count();centerAt(chapterViewport.initialPoint,startScale(),[.5,.5]);drawPanel();if($('painting').complete&&$('painting').naturalWidth)void nativeLoaded();
if(document.fonts)document.fonts.ready.then(render);
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const art of flights)art.remove();flights.clear();displayCount=Object.keys(state.collections).length;count();}});
