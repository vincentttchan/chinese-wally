function quietInquiryNotice(){clearTimeout(noticeTimer);$('notice').hidden=true;$('notice-text').textContent='';}
function freeEnsembleObservation(){return state.mode==='observe'&&current().station==='ensemble';}
function isEnsemblePlayer(person){return person.id==='seated-drum'||person.id.startsWith('ensemble-');}
function noteEnsemblePlayer(person){
 if(!freeEnsembleObservation()||!isEnsemblePlayer(person))return;
 if(!state.observedPlayers.includes(person.id))state.observedPlayers.push(person.id);
 state.step=2;state.noteHidden=false;state.noteManual=false;drawPanel();drawPoints();
}
function inspectEnsembleObject(object){
 collect(object);
 if(!freeEnsembleObservation()||!['drum','discs','gong','horn'].includes(object.category))return;
 // The object must belong to this pavilion; other instruments remain side discoveries.
 const point=midpoint(objectBox(object));if(!inside(point,[875,2250,1300,2580]))return;
 const ids={drum:'seated-drum',discs:point[0]<1050?'ensemble-discs-left':'ensemble-discs-right',gong:point[0]<1150?'ensemble-grey':'ensemble-standing-right',horn:'ensemble-horn'};
 inspectPerson(chapter.people.find(person=>person.id===ids[object.category]));
}
function offerInquiryHandoff(){
 if(state.busy||state.mode!=='observe'||state.step!==2)return;
 const r=current(),station=inquiryStationInfo[r.station];
 state.noteHidden=true;drawChrome();
 speak(chapter.people.find(person=>person.id===r.id),station.handoff||'再回到街上，看看剛才的發現。',false,'handoff');
 ($('speech').hidden?$('return-speaker'):$('look'))?.focus({preventScroll:true});
}
function inquiryCanAnimate(station){return state.mode==='free'||state.completedStations.includes(station)||(state.mode==='observe'&&current().station===station&&state.step===2);}
function collectInquiryDetail(detail){
 if(!detail.collection||state.collections[detail.collection])return;
 const b=detail.box,objects=chapter.objects.filter(o=>o.category===detail.collection);
 const overlaps=objects.filter(o=>{const c=objectBox(o);return c[0]<=b[2]&&c[2]>=b[0]&&c[1]<=b[3]&&c[3]>=b[1];});
 const center=midpoint(b),nearest=overlaps.sort((a,z)=>{const p=midpoint(objectBox(a)),q=midpoint(objectBox(z));return Math.hypot(p[0]-center[0],p[1]-center[1])-Math.hypot(q[0]-center[0],q[1]-center[1]);})[0];
 if(nearest)collect(nearest);
}
function drawInquiryObservation(){
 const r=current(),station=inquiryStationInfo[r.station],done=state.step===2;
 if(freeEnsembleObservation()){
  panel.innerHTML='<p class="lantern-observation-eyebrow">亭內樂隊</p><h2>看看樂手的雙手與持物</h2><p class="lantern-note-body">'+(done?'可以繼續點看其他樂手，也可以看看他們怎樣配合。':'點看亭內任何一位樂手，聽聽他的話。')+'</p>';
  if(done){panel.insertAdjacentHTML('beforeend',action('inquiry-play','看看樂手怎樣配合'));bind('inquiry-play',()=>playEnsemble());}
  if(done){panel.insertAdjacentHTML('beforeend','<button id="inquiry-next" class="lantern-note-secondary">繼續尋人</button>');bind('inquiry-next',offerInquiryHandoff);}
  return;
 }
 const body=done?r.answer:r.comparison[state.step].label;
 panel.innerHTML='<p class="lantern-observation-eyebrow">'+station.title+' · '+(done?'已完成比較':(state.step+1)+'／2 處原畫觀察')+'</p><h2>'+(done?r.observationTitle:station.question)+'</h2><p class="lantern-note-body">'+body+'</p>';
 if(done){
  const label=r.station==='ensemble'?'看看樂手怎樣配合':r.station==='flags'?'看看持旗者與旗面怎樣呼應':'看看戲班怎樣準備';
  panel.insertAdjacentHTML('beforeend',action('inquiry-play',label));
  panel.insertAdjacentHTML('beforeend','<button id="inquiry-next" class="lantern-note-secondary">'+(state.completedStations.length===2?'回到街道，連起發現':'繼續尋人')+'</button>');
  bind('inquiry-play',()=>r.station==='ensemble'?playEnsemble():r.station==='flags'?playFlags():playAudience());bind('inquiry-next',offerInquiryHandoff);
 }
}
async function finishInquiryStation(){
 if(state.busy||state.mode!=='observe'||state.step!==2)return;
 const id=current().station;if(!state.completedStations.includes(id))state.completedStations.push(id);state.completed=state.completedStations.length;
 state.lastDetail=null;quietInquiryNotice();clearHitFeedback();
 if(state.completed===3){state.reviewStage='arrival';state.reviewSeen=[];state.reviewIndex=0;setMode('ending');await moveTo([2250,1950],minScale());return;}
 const next=chapter.rounds.findIndex(r=>!state.completedStations.includes(r.station));
 state.round=next;state.step=0;state.hint=0;setMode('seek');state.hintOpen=true;drawPanel();drawPoints();render();panel.focus({preventScroll:true});
}
