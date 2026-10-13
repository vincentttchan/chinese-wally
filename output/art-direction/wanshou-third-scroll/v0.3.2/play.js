'use strict';
const $=id=>document.getElementById(id),scene=$('scene'),world=$('world'),panel=$('panel');
const key='chinese-wally:kangqu-listening:journal:v1';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const state={mode:'intro',intro:0,round:0,step:0,hint:0,ending:0,ready:false,source:'native',focus:true,focusPoint:[2250,1700],view:{x:0,y:0,scale:.32},busy:false,collections:{},pending:{},visits:{},journalReturn:null,entry:null,speaker:null,completed:0};
let noticeTimer,drag=null,pinched=false,pinch=null,cameraToken=0,displayCount=0;
const pointers=new Map(),flights=new Set();
const current=()=>chapter.rounds[state.round];
const dimensions=()=>state.source==='native'?[chapter.width,chapter.height]:[chapter.fullWidth,chapter.fullHeight];
const midpoint=b=>[(b[0]+b[2])/2,(b[1]+b[3])/2];
function objectBox(o){if(o.box)return o.box;return [Math.min(...o.polygon.map(p=>p[0])),Math.min(...o.polygon.map(p=>p[1])),Math.max(...o.polygon.map(p=>p[0])),Math.max(...o.polygon.map(p=>p[1]))];}
function inside(p,b){return p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3];}
function inPolygon(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function minScale(){const [w,h]=dimensions();return Math.min(scene.clientWidth/w,scene.clientHeight/h);}
function clamp(){const [w,h]=dimensions(),v=state.view;v.scale=Math.min(1,Math.max(minScale(),v.scale));v.x=w*v.scale<scene.clientWidth?(scene.clientWidth-w*v.scale)/2:Math.min(0,Math.max(scene.clientWidth-w*v.scale,v.x));v.y=h*v.scale<scene.clientHeight?(scene.clientHeight-h*v.scale)/2:Math.min(0,Math.max(scene.clientHeight-h*v.scale,v.y));}
function eventPoint(e){const r=scene.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
function nativeAt(p){return [(p[0]-state.view.x)/state.view.scale,(p[1]-state.view.y)/state.view.scale];}
function screenAt(p){return [p[0]*state.view.scale+state.view.x,p[1]*state.view.scale+state.view.y];}
function focusAt(p){state.focusPoint=nativeAt(p);applyFocus();}
function applyFocus(){world.style.setProperty('--fx',state.focusPoint[0]+'px');world.style.setProperty('--fy',state.focusPoint[1]+'px');world.style.setProperty('--radius',160/state.view.scale+'px');}
function announce(text){clearTimeout(noticeTimer);$('notice').textContent=text;noticeTimer=setTimeout(()=>{$('notice').textContent='';},3500);}
function title(label,text){return `<span class="eyebrow">${label}</span><h2>${text}</h2>`;}
function bind(id,fn){const b=$(id);if(b)b.onclick=fn;}
function portrait(r){return `<img class="head" src="recognition/${r.id}-head-tracing-v2.png" alt="第${state.round+1}位人物的保守樣貌摹繪"><p class="small">樣貌摹繪，原畫為準</p><details class="face-source"><summary>對照原畫樣貌</summary><img src="recognition/${r.id}-head-source.png" alt="原畫頭部原生裁切" width="${r.head[2]-r.head[0]}" height="${r.head[3]-r.head[1]}"><p class="small">原生大小；摹繪的細線與色塊不作額外辨認線索。</p></details>`;}
function save(){try{localStorage.setItem(key,JSON.stringify({version:1,chapter:chapter.id,items:state.collections,pending:state.pending}));}catch{$('storage-note').textContent='目前無法保存；本次收藏仍可繼續。';}}
function load(){try{const data=JSON.parse(localStorage.getItem(key)||'null');if(!data||data.version!==1||data.chapter!==chapter.id)return;for(const c of chapter.collections){const record=data.items?.[c.id],o=chapter.objects.find(o=>o.category===c.id&&o.id===record?.instance);if(o){const point=record.point;state.collections[c.id]={instance:o.id,point:Array.isArray(point)&&point.length===2&&point.every(Number.isFinite)&&inside(point,objectBox(o))?point:midpoint(objectBox(o))};}else if(c.id==='discs'&&record?.instance==='discs-grotto'){state.pending.discs={instance:'discs-grotto',point:[3699.5,1090]};}}if(data.pending?.discs?.instance==='discs-grotto')state.pending.discs={instance:'discs-grotto',point:[3699.5,1090]};if(state.pending.discs)$('storage-note').textContent='小亭的原有圓片紀錄已保留待核，暫不計入成對圓盤收藏。';}catch{$('storage-note').textContent='收藏將在本次遊玩中記錄。';}displayCount=Object.keys(state.collections).length;}
function count(){ $('book').textContent=`見聞冊 ${displayCount}／${chapter.collections.length}`;}
function render(){
 clamp();const v=state.view,[w,h]=dimensions();world.style.width=w+'px';world.style.height=h+'px';world.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.scale})`;
 for(const id of ['painting','colour-layer']){$(id).style.width=w+'px';$(id).style.height=h+'px';}
 $('zoom').textContent=Math.round(v.scale*100)+'%';$('zoom-in').disabled=!state.ready||state.busy||v.scale>=1;$('zoom-out').disabled=!state.ready||state.busy||v.scale<=minScale()+.001;
 scene.classList.toggle('focused',state.focus);$('colour').textContent=state.focus?'轉為彩色':'開啟凝神';$('colour').setAttribute('aria-pressed',String(!state.focus));applyFocus();placeSpeech();
 for(const b of $('points').children){const p=screenAt(midpoint(b.hitbox));b.tabIndex=state.ready&&!state.busy&&state.source==='native'&&p[0]>0&&p[0]<scene.clientWidth&&p[1]>0&&p[1]<scene.clientHeight?0:-1;}
 $('book').disabled=!state.ready||state.mode==='intro'||state.busy;
 $('full-view').textContent=state.source==='native'?'展開全卷':'回到清晰段落';
}
function centerAt(p,scale=.9,anchor=[.5,.56]){state.view={scale,x:scene.clientWidth*anchor[0]-p[0]*scale,y:scene.clientHeight*anchor[1]-p[1]*scale};render();focusAt(screenAt(p));}
function zoomBy(factor,at=[scene.clientWidth/2,scene.clientHeight/2]){if(!state.ready||state.busy)return;const p=nativeAt(at),scale=Math.min(1,Math.max(minScale(),state.view.scale*factor));state.view={scale,x:at[0]-p[0]*scale,y:at[1]-p[1]*scale};render();focusAt(at);}
async function moveTo(p,scale=.95){
 if(state.busy)return;state.busy=true;const token=++cameraToken;panel.classList.add('moving');render();
 const start={...state.view},end={scale,x:scene.clientWidth*.5-p[0]*scale,y:scene.clientHeight*.56-p[1]*scale};
 await new Promise(resolve=>{let first;const tick=now=>{if(token!==cameraToken){resolve();return;}first??=now;const t=reduced.matches?1:Math.min(1,(now-first)/500),q=t*t*(3-2*t);state.view={scale:start.scale+(end.scale-start.scale)*q,x:start.x+(end.x-start.x)*q,y:start.y+(end.y-start.y)*q};render();if(t<1)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});
 state.busy=false;panel.classList.remove('moving');focusAt(screenAt(p));render();
}
function setMode(mode){state.mode=mode;state.speaker=null;$('layout').classList.toggle('book-open',mode==='journal');drawPanel();drawPoints();render();}
function placeSpeech(){
 const s=$('speech');s.hidden=true;if(!state.speaker||state.source!=='native'||state.busy||state.mode==='journal')return;
 const person=chapter.people.find(p=>p.id===state.speaker.id),r=chapter.rounds.find(r=>r.id===person.id),head=midpoint(person.head||r?.head||[person.box[0],person.box[1],person.box[2],person.box[1]+40]);
 s.hidden=false;
 const boxes=[...chapter.people.map(p=>p.head),...chapter.objects.map(objectBox),...(r?.comparison||[]).map(p=>p.box),...(r?.recognitionFeatures||[])];
 const placement=KangquGeometry.speechPlacement({anchor:head,safeBottom:r?.safeY||person.box[1]-56,view:state.view,viewport:[scene.clientWidth,scene.clientHeight],frame:[s.offsetWidth,s.offsetHeight],protectedBoxes:boxes});
 if(!placement){s.hidden=true;return;}
 s.style.left=placement.left+'px';s.style.top=placement.top+'px';s.dataset.pointer=placement.pointer;s.style.setProperty('--pointer-x',placement.pointerX+'px');
}
function speak(person,text,found=false){state.speaker={id:person.id,text};$('speech-text').textContent=text;$('look').textContent=found?'近看原畫':'繼續看畫';$('look').onclick=found?beginObservation:()=>{state.speaker=null;render();};render();announce((found?'尋得畫中人。':'')+text);}
function drawPanel(){
 const r=current();
 if(state.mode==='intro'){
  const steps=[['一段街衢','這是《康衢駢慶》的一段街景。亭內、行列和院牆外，都有人物各自的動作。','看看任務'],['尋人，也看關係','依次找到三位畫中人。每找到一位，再點兩處原畫，比較持物、手勢或朝向。','記住第一位'],['先看他的樣子','先看樣貌；需要時，再要求衣着和區域提示。見聞冊可自由收集，毋須收齊才能完成。','入畫尋人']][state.intro];
  panel.innerHTML=title('在人群中聽樂',steps[0])+(state.intro===2?portrait(r):'')+`<p class="question">${steps[1]}</p><button id="intro-next" class="primary" ${!state.ready?'disabled':''}>${state.ready?steps[2]:'原畫載入中…'}</button>`;
  bind('intro-next',()=>{if(state.intro<2){state.intro++;drawPanel();}else{setMode('seek');scene.focus({preventScroll:true});}});
 }else if(state.mode==='seek'){
  panel.innerHTML=title('尋人',`第 ${state.round+1} 位畫中人`)+portrait(r)+`<p>對照樣貌，在原畫中找他。</p><p class="step-count">已完成 ${state.completed}／3 次觀察</p><div class="actions"><button id="clothes">衣着提示</button><button id="region" ${state.hint<1?'disabled':''}>區域提示</button></div><p class="hint">${state.hint===2?r.region:state.hint===1?r.clothes:'先看帽形與臉部朝向。'}</p>${state.hint===2?'<button id="near">帶我看附近</button>':''}`;
  bind('clothes',()=>{state.hint=Math.max(1,state.hint);drawPanel();});bind('region',()=>{state.hint=2;drawPanel();});bind('near',async()=>{if(state.source!=='native'&&!await setSource('native'))return;await moveTo(r.near,.55);});
 }else if(state.mode==='found'){
  panel.innerHTML=title('尋得畫中人','接着看原畫')+`<p class="question">「${r.greeting}」</p><p class="small">遊戲虛構對白</p><button id="begin-observe" class="primary">近看原畫</button>`;bind('begin-observe',beginObservation);
 }else if(state.mode==='observe'){
  const done=state.step===2;
  panel.innerHTML=title('原畫觀察',done?'兩處都看到了':['看看手與器物','看看兩人的手','看看他們的朝向'][state.round])+`<p class="step-count">${done?'已完成比較':`${state.step+1}／2 處細節`}</p><p class="question">${done?r.answer:r.comparison[state.step].label}</p>`+(done?`<button id="next-round" class="primary">${state.round<2?'尋找下一位':'看看街衢'}</button>`:'<p class="small">在原畫上點選；細節太小時，請先放大。</p>');
  bind('next-round',()=>{state.completed=state.round+1;if(state.round<2){const line=r.next;state.round++;state.hint=0;state.step=0;setMode('seek');announce(line);}else{state.ending=0;setMode('ending');announce('最後，看看亭內與亭前的人。');}});
 }else if(state.mode==='ending'){
  panel.innerHTML=title('畫中的最後探索',state.ending<2?'看看他們的關係':'街衢中的相遇')+`<p class="question">${state.ending<2?chapter.ending[state.ending].label:'亭內的持物動作，與亭前人物的朝向，讓我們看見表演與觀看的關係。'}</p>`+(state.ending<2?'<button id="ending-near">帶我看亭子一帶</button>':'<div class="actions"><button id="free" class="primary">自由探索</button><button id="ending-book">回看見聞冊</button><button id="replay">再尋一次</button></div>');
  bind('ending-near',async()=>{if(state.source!=='native'&&!await setSource('native'))return;await moveTo([960,2445],.8);});bind('free',()=>setMode('free'));bind('ending-book',openJournal);bind('replay',replay);
 }else if(state.mode==='free'){
  panel.innerHTML=title('留在畫中','繼續看這段街衢')+'<p>持物、手勢、朝向，各自幫你看見人物之間的關係。</p><p>還可以點人物聽短句，或將細節收進冊中。</p><div class="actions"><button id="free-book">回看見聞冊</button><button id="replay">再尋一次</button></div>';bind('free-book',openJournal);bind('replay',replay);
 }else if(state.mode==='journal')drawJournal();
}
function drawJournal(){
 const c=chapter.collections.find(c=>c.id===state.entry);
 if(c&&state.collections[c.id]){
  const record=state.collections[c.id],o=chapter.objects.find(o=>o.id===record.instance),box=objectBox(o);
  panel.innerHTML='<button id="journal-back" class="book-back">← 見聞總覽</button>'+title('畫中拾趣',c.name)+`<img class="journal-hero" src="${c.art}" alt="${c.name}的收藏插圖"><p class="question">${c.observation}</p><p>${c.explanation}</p><button id="return-location">回看發現的位置</button><details class="journal-source"><summary>原畫對照與來源</summary><p class="small">首次發現：原畫局部 [${box.join(', ')}]。故宮公開原生影像 0778/img0002；收藏圖樣為原畫衍生插圖，原畫為準。</p><a href="../source-provenance.json">原畫來源記錄</a></details><div class="journal-footer"><button id="close-book" class="primary">合冊回到畫中</button></div>`;
  bind('journal-back',()=>{state.entry=null;drawPanel();});bind('return-location',async()=>{if(state.source!=='native'&&!await setSource('native'))return;await moveTo(record.point,1);});
 }else{
  panel.innerHTML=`<header class="journal-heading"><span class="eyebrow">畫中拾趣</span><div class="journal-title-row"><h2>街衢見聞冊</h2><span class="journal-count">已收下 ${Object.keys(state.collections).length}／4</span></div><p>把街上看見的細節，收進冊中。</p></header><div class="journal-grid">`+chapter.collections.map(c=>{const found=!!state.collections[c.id];return `<button class="journal-item ${found?'collected':'uncollected'}" data-entry="${c.id}" aria-label="${c.name}，${found?'已收下，開啟詳情':'未收下，看看提示'}"><img src="${c.art}" alt="${c.name}的收藏插圖"><span class="journal-name">${c.name}</span><span class="${found?'stamp':'journal-status'}">${found?'已收下':'未收下'}</span></button>`;}).join('')+'</div><p id="journal-hint" class="journal-hint" role="status">點選已收下的圖樣，回看畫中的發現。</p><div class="journal-footer"><button id="close-book" class="primary">合冊回到畫中</button></div><details class="journal-source"><summary>收藏設定</summary><p class="small">再尋一次會保留收藏。清空收藏只影響本章。</p><button id="clear-collections">清空本章收藏</button><span id="clear-confirm"></span></details>';
  panel.querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>{const c=chapter.collections.find(c=>c.id===b.dataset.entry);if(state.collections[c.id]){state.entry=c.id;drawPanel();}else $('journal-hint').textContent=c.hint;});
  bind('clear-collections',()=>{$('clear-confirm').innerHTML='<button id="confirm-clear">確認清空</button>';bind('confirm-clear',()=>{state.collections={};state.pending={};$('storage-note').textContent='';displayCount=0;save();count();drawPanel();announce('本章收藏已清空。');});});
 }
 bind('close-book',closeJournal);
}
function openJournal(){if(state.busy||state.mode==='intro'||state.mode==='journal')return;state.journalReturn={mode:state.mode,view:{...state.view},sceneSize:[scene.clientWidth,scene.clientHeight],source:state.source,focus:state.focus,focusPoint:[...state.focusPoint]};state.entry=null;setMode('journal');}
async function closeJournal(){if(state.busy)return;const saved=state.journalReturn;if(!saved)return;state.journalReturn=null;setMode(saved.mode);if(saved.source!==state.source)await setSource(saved.source);size=[scene.clientWidth,scene.clientHeight];state.view=KangquGeometry.restoreView(saved.view,saved.sceneSize,size);state.focus=saved.focus;state.focusPoint=[...saved.focusPoint];render();$('book').focus({preventScroll:true});}
async function beginObservation(){if(state.busy||state.mode!=='found')return;state.step=0;setMode('observe');await moveTo(current().center,1);}
function replay(){if(state.busy)return;state.round=0;state.completed=0;state.hint=0;state.step=0;state.ending=0;state.visits={};setMode('seek');announce('重新尋人，見聞冊收藏已保留。');}
function inspectPerson(p){
 if(state.mode==='seek'&&p.id===current().id){setMode('found');speak(p,current().greeting,true);return;}
 if(state.mode==='ending'&&state.ending<2&&chapter.ending[state.ending].ids.includes(p.id)){state.ending++;drawPanel();drawPoints();render();announce(state.ending===1?'再看看亭前人物的朝向。':'最後探索完成。可以繼續看畫。');return;}
 const visits=state.visits[p.id]||0;state.visits[p.id]=visits+1;speak(p,p.lines[Math.min(visits,2)]);
}
function observePoint(){if(state.mode!=='observe'||state.step>=2||state.busy)return;if(state.view.scale<.65){announce('請先放大，再點眼前的細節。');return;}state.step++;drawPanel();drawPoints();render();announce(state.step===1?current().comparison[1].label:'已完成兩處原畫比較。');}
function collect(o,point=midpoint(objectBox(o))){
 const c=chapter.collections.find(c=>c.id===o.category);if(state.collections[c.id]){announce(`這裡也有${c.name}，已記在冊中。`);return;}
 state.collections[c.id]={instance:o.id,point:[...point]};save();
 // State is committed before flight; repeated taps cannot duplicate the entry.
 if(reduced.matches||typeof requestAnimationFrame!=='function'){displayCount=Object.keys(state.collections).length;count();announce('已收藏：'+c.name);return;}
 const rect=scene.getBoundingClientRect(),start=screenAt(state.collections[c.id].point),art=document.createElement('img');art.src=c.art;art.alt='';art.className='collection-flight';document.body.append(art);flights.add(art);
 let first;const finish=()=>{flights.delete(art);art.remove();displayCount=Object.keys(state.collections).length;count();announce('已收藏：'+c.name);};
 art.onerror=finish;
 const tick=now=>{if(!flights.has(art))return;first??=now;const t=Math.min(1,(now-first)/1350),q=t*t*(3-2*t),target=$('book').getBoundingClientRect(),size=84-56*q;
  art.style.width=size+'px';art.style.height=size+'px';art.style.left=(rect.left+start[0]+(target.left+target.width/2-rect.left-start[0])*q-size/2)+'px';art.style.top=(rect.top+start[1]+(target.top+target.height/2-rect.top-start[1])*q-Math.sin(Math.PI*q)*65-size/2)+'px';art.style.opacity=String(t>.85?1-(t-.85)/.15:1);
  if(t<1)requestAnimationFrame(tick);else finish();};requestAnimationFrame(tick);
}
function interact(p){
 if(!state.ready||state.busy||['intro','journal','found'].includes(state.mode))return;
 if(state.source!=='native'){announce('全卷用於看構圖；按「回到清晰段落」再點人物與細節。');return;}
 const at=nativeAt(p);
 if(state.mode==='observe'&&state.step<2){if(state.view.scale<.65){announce('請先放大，再點眼前的細節。');return;}if(KangquGeometry.observationContains(at,current().comparison[state.step]))observePoint();else announce(current().comparison[state.step].label);return;}
 if(state.mode==='observe'){announce('看完解讀後，按題箋中的按鈕繼續。');return;}
 if(state.view.scale<.45){announce('請先放大，再點人物或細節。');return;}
 const hit=KangquGeometry.resolveExplore(at,chapter.people,chapter.objects);
 if(hit?.kind==='person')inspectPerson(chapter.people.find(p=>p.id===hit.id));
 else if(hit?.kind==='object')collect(chapter.objects.find(o=>o.id===hit.id),at);
}
function addPoint(label,box,action){const b=document.createElement('button');b.type='button';b.className='hotspot';b.hitbox=box;b.setAttribute('aria-label',label);b.style.cssText=`left:${box[0]}px;top:${box[1]}px;width:${box[2]-box[0]}px;height:${box[3]-box[1]}px`;b.onclick=e=>{if(e.detail===0&&state.ready&&!state.busy)action();};$('points').append(b);}
function drawPoints(){
 $('points').replaceChildren();if(state.source!=='native'||['intro','journal','found'].includes(state.mode))return;
 if(state.mode==='observe'){if(state.step<2){const c=current().comparison[state.step];addPoint(c.label,c.box,observePoint);}return;}
 // Keyboard access follows visible figures/objects, never a target-only answer list.
 for(const p of chapter.people)addPoint('聽聽這位畫中人',p.box,()=>inspectPerson(p));
 for(const o of chapter.objects)addPoint('看看這個原畫細節',objectBox(o),()=>collect(o));
}
const imageCache=new Map();
function preload(src){if(imageCache.has(src))return imageCache.get(src);const promise=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{imageCache.delete(src);reject(new Error('load'));};im.src=src;});imageCache.set(src,promise);return promise;}
async function setSource(source){
 if(state.busy)return false;state.busy=true;render();const src=source==='native'?chapter.native:chapter.full;
 try{await preload(src);state.source=source;for(const id of ['painting','colour-layer'])$(id).src=src;$('source-note').textContent=source==='native'?'官方原生清晰段落':'第三卷完整公開構圖 · 人物細節請回到清晰段落';state.view={x:0,y:0,scale:source==='native'?.32:.6};const center=source==='native'?[2250,1700]:[chapter.registration[0][2]+2250*.28555,400];centerAt(center,state.view.scale);drawPoints();return true;}
 catch{announce('這幅原畫未能載入，仍可繼續觀看目前畫面。');return false;}
 finally{state.busy=false;render();}
}
bind('full-view',()=>{if(!state.busy&&state.mode!=='journal')setSource(state.source==='native'?'full':'native');});
bind('book',openJournal);bind('colour',()=>{state.focus=!state.focus;render();});bind('zoom-in',()=>zoomBy(1.25));bind('zoom-out',()=>zoomBy(.8));bind('overview',()=>{if(!state.busy)centerAt(dimensions().map(n=>n/2),minScale(),[.5,.5]);});
chapter.regions.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.name;$('regions').append(o);});
$('regions').onchange=async e=>{if(state.busy)return;const r=chapter.regions[Number(e.target.value)];if(state.source!=='native'&&!await setSource('native'))return;await moveTo(r.center,r.scale);};
scene.addEventListener('wheel',e=>{e.preventDefault();zoomBy(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.003),eventPoint(e));},{passive:false});
scene.addEventListener('pointerdown',e=>{if(!state.ready||state.busy||e.button>0||e.target.closest('.speech'))return;e.preventDefault();const p=eventPoint(e);pointers.set(e.pointerId,p);scene.setPointerCapture(e.pointerId);focusAt(p);if(pointers.size===1){pinched=false;drag={id:e.pointerId,start:p,last:p,moved:false};scene.classList.add('dragging');}else{pinched=true;const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a[0]-b[0],a[1]-b[1]),center:[(a[0]+b[0])/2,(a[1]+b[1])/2]};}});
scene.addEventListener('pointermove',e=>{const p=eventPoint(e);if(state.ready&&!state.busy&&!e.target.closest('.speech'))focusAt(p);if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,p);if(pointers.size>=2){const [a,b]=[...pointers.values()],distance=Math.hypot(a[0]-b[0],a[1]-b[1]),center=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(pinch){zoomBy(distance/Math.max(1,pinch.distance),pinch.center);state.view.x+=center[0]-pinch.center[0];state.view.y+=center[1]-pinch.center[1];render();}pinch={distance,center};return;}if(drag?.id!==e.pointerId||state.busy)return;if(Math.hypot(p[0]-drag.start[0],p[1]-drag.start[1])>7)drag.moved=true;if(drag.moved){state.view.x+=p[0]-drag.last[0];state.view.y+=p[1]-drag.last[1];render();}drag.last=p;});
function release(e,cancelled=false){if(!pointers.has(e.pointerId))return;const click=!cancelled&&!pinched&&drag?.id===e.pointerId&&!drag.moved;pointers.delete(e.pointerId);if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId);drag=null;pinch=null;if(pointers.size===0)scene.classList.remove('dragging');if(click)interact(eventPoint(e));}
scene.addEventListener('pointerup',e=>release(e));scene.addEventListener('pointercancel',e=>release(e,true));
scene.addEventListener('keydown',e=>{if(state.busy||!state.ready||e.target!==scene)return;const d=e.shiftKey?160:70,arrows={ArrowLeft:[d,0],ArrowRight:[-d,0],ArrowUp:[0,d],ArrowDown:[0,-d]};if(arrows[e.key]){e.preventDefault();state.view.x+=arrows[e.key][0];state.view.y+=arrows[e.key][1];render();}else if(['+','='].includes(e.key)){e.preventDefault();zoomBy(1.25);}else if(e.key==='-'){e.preventDefault();zoomBy(.8);}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.mode==='journal')closeJournal();else{state.speaker=null;render();}}});
let size=[scene.clientWidth,scene.clientHeight];new ResizeObserver(()=>{const center=[(size[0]/2-state.view.x)/state.view.scale,(size[1]/2-state.view.y)/state.view.scale];size=[scene.clientWidth,scene.clientHeight];state.view.x=size[0]/2-center[0]*state.view.scale;state.view.y=size[1]/2-center[1]*state.view.scale;render();}).observe(scene);
function ready(){if(state.ready)return;state.ready=true;$('loading').hidden=true;centerAt([2250,1700],.32);drawPanel();drawPoints();render();}
function failed(){state.ready=false;$('loading').hidden=false;$('loading').innerHTML='<p>原畫未能載入。</p><button id="retry">重新載入原畫</button>';bind('retry',()=>{imageCache.delete(chapter.native);$('painting').src=chapter.native+'?retry='+Date.now();});render();}
$('painting').onload=ready;$('painting').onerror=failed;load();count();drawPanel();if($('painting').complete&&$('painting').naturalWidth)ready();
if(document.fonts)document.fonts.ready.then(render);
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const art of flights)art.remove();flights.clear();displayCount=Object.keys(state.collections).length;count();}});
