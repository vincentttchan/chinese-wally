import {zanhuaMountingSeals,zanhuaPlayerSeal,zanhuaCollectorSeals,resolveZanhuaCollectorSeal} from '../game/zanhuaSeal.ts';
import {ZanhuaThreeActEntryV1} from './ZanhuaThreeActEntryV1.tsx';
import {ChapterLinks} from './ChapterLinks.tsx';
import {useAmbience} from '../audio/useAmbience.ts';
import {chapterMusicTracks} from '../audio/chapterMusicTracks.js';
import {ZanhuaPlayerSeal,ZanhuaSealRitual} from './ZanhuaSealRitual.tsx';
import {ZanhuaInPaintingStudy} from './ZanhuaInPaintingStudy.tsx';
import {resolveZanhuaStudyHit} from '../game/zanhuaStudyInteraction.ts';
import {ZanhuaMaidAnimation} from './ZanhuaMaidAnimation.tsx';
import {ZanhuaLifeSummary} from './ZanhuaLifeSummary.tsx';
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneCommand,SceneHint,SceneViewport,StudyCommand} from './ScrollScene.tsx';
import type {SceneActor} from '../game/level.ts';
import {LanternEmperorSpeech} from './LanternEmperorSpeech.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternNavigator} from './LanternNavigator.tsx';
import {LanternNotice} from './LanternNotice.tsx';
import {ChapterDialog} from './ChapterDialog.tsx';
import {LanternJournal} from './LanternJournal.tsx';
import {LanternSparkDiscovery} from './LanternSparkDiscovery.tsx';
import {ZanhuaFigureAnimation,zanhuaMotionLabels,zanhuaFigureContour} from './ZanhuaFigureAnimation.tsx';
import {useLuoshenCollectionFeedback} from '../hooks/useLuoshenCollectionFeedback.ts';
import {zanhuaEnding,zanhuaRecollections} from '../game/zanhuaEnding.ts';
import {zanhuaContext,zanhuaHistorySources,zanhuaContextDialogue,zanhuaInterpretDialogue} from '../game/zanhuaContext.ts';
import {zanhuaDetailContours} from '../game/zanhuaDetailContours.ts';
import {ZanhuaDetailOverlay} from './ZanhuaDetailOverlay.tsx';
import type {ZanhuaConfirmation} from './ZanhuaDetailOverlay.tsx';
import {zanhuaAnnotations,zanhuaDressComparison,zanhuaEarlierSealNote} from '../game/zanhuaAnnotations.ts';
import type {ZanhuaAnnotation} from '../game/zanhuaAnnotations.ts';
import type {PaintingRegion} from '../game/lanternStudy.ts';
import {coverView} from '../game/geometry.ts';
import {loadZanhuaOrigins,saveZanhuaOrigins,zanhuaSpots,zanhuaSpot,zanhuaFindings,zanhuaCollectionItems,zanhuaJournalEdition,resolveZanhuaHit} from '../game/zanhuaCollection.ts';
import {ArrowRight,BookOpen,CircleHelp,Maximize,MoreHorizontal,Volume2,VolumeX} from './ArtIcons.tsx';
import {zanhuaHeads,zanhuaImage,zanhuaMouths,zanhuaPeople,zanhuaReplies,zanhuaSize,zanhuaSource,zanhuaSteps} from '../game/zanhuaPreview.ts';
import '../lantern.css';
import '../lantern-journal.css';
import '../lantern-search-hud.css';
import '../lantern-observation.css';
import '../zanhua-preview.css';

type Phase='intro'|'search'|'found'|'observe'|'animate'|'interpret'|'context'|'compare'|'clue'|'ending'|'recall'|'complete'|'seal'|'free';
type Overlay='hint'|'about'|'menu'|'journal'|null;
const query=new URLSearchParams(window.location.search);
const requested=query.get('scene');
const collectorEntry=requested==='seal-detail'||requested==='collector-seals';
const initialPhase:Phase=collectorEntry?'context':['intro','search','found','observe','interpret','complete'].includes(requested??'')?requested as Phase:'intro';
const initialIndex=collectorEntry?2:Math.max(0,Math.min(2,Number(query.get('person'))||0));
const stops=[{x:.24,label:'卷左'},{x:.50,label:'卷中'},{x:.76,label:'卷右'}];

/** The same approved chapter runtime serves the formal route and the development preview. */
export function ZanhuaThreeActGameV1(){
 const [phase,setPhase]=useState<Phase>(initialPhase),[index,setIndex]=useState(initialIndex);
 const [entryStarted,setEntryStarted]=useState(false),[coverVisible,setCoverVisible]=useState(true),[coverLeaving,setCoverLeaving]=useState(false);
 const prepareEntry=useCallback(()=>setCoverLeaving(true),[]),revealEntry=useCallback(()=>setCoverVisible(false),[]);
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[reset,setReset]=useState(0),[entering,setEntering]=useState(false);
 const [focusing,setFocusing]=useState(initialPhase==='intro'||initialPhase==='search'),[overlay,setOverlay]=useState<Overlay>(null),[depth,setDepth]=useState(0);
 const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1440,height:900}});
 const [scrollWindow,setScrollWindow]=useState({left:.55,width:.35}),[study,setStudy]=useState<StudyCommand|null>(null);
 const [hint,setHint]=useState<SceneHint|null>(null),[command,setCommand]=useState<SceneCommand|null>(null);
 const [reply,setReply]=useState<{id:string;text:string;token:number}|null>(null),[notice,setNotice]=useState('');
 const [remembered,setRemembered]=useState(0);
 const [contextStep,setContextStep]=useState(collectorEntry?1:0),[contextSeen,setContextSeen]=useState(false);
 const [contextLooking,setContextLooking]=useState(collectorEntry),[contextTurn,setContextTurn]=useState(0);
 const [collectorSealId,setCollectorSealId]=useState(zanhuaCollectorSeals[0].id);
 const [confirmation,setConfirmation]=useState<ZanhuaConfirmation|null>(null),[detail,setDetail]=useState<ZanhuaAnnotation|null>(null);
 const confirmationToken=useRef(0);
 const [motionToken,setMotionToken]=useState(0);
 const [studyAnchor,setStudyAnchor]=useState<SceneViewport|null>(null);
 const studyComparing=useRef(false);
 const [figureStudy,setFigureStudy]=useState(false),[studyPart,setStudyPart]=useState<string|null>(null),[maidPlaying,setMaidPlaying]=useState(false);
 const [retainedStudy,setRetainedStudy]=useState(false);
 const [playerSeal,setPlayerSeal]=useState<string|null>(null);
 const [origins,setOrigins]=useState(loadZanhuaOrigins),[storageAvailable,setStorageAvailable]=useState(true);
 const book=useRef<HTMLButtonElement>(null),claimed=useRef(origins),journalView=useRef<{viewport:SceneViewport;focus:boolean;horizontalMargin:boolean;verticalMargin:boolean}|null>(null);
 const collection=useLuoshenCollectionFeedback(Object.keys(origins).length,viewport,book,setNotice,zanhuaSize);
 const findings=zanhuaFindings(origins);
 const [noteBounds,setNoteBounds]=useState<{left:number;top:number;width:number;height:number}|null>(null);
 const noteRef=useRef<HTMLElement>(null),actionRef=useRef<HTMLButtonElement>(null),visits=useRef<Record<string,number>>({});
 const token=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|null>(null),snapshot=useRef(false),savedFocus=useRef(true);
 const step=zanhuaSteps[index],actor=zanhuaPeople.find(p=>p.id===step.id)!;
 const context=zanhuaContext[index][contextStep]??zanhuaContext[index][0];
 const studyScope=phase==='context'&&index===1?(contextStep===0?'dress':contextStep===1?'scarf':'all'):'all';
 const showRetainedStudy=retainedStudy&&phase==='context'&&index===1&&contextStep<2;
 const conversation=zanhuaContextDialogue[index][contextStep]??zanhuaContextDialogue[index][0];
 const contextSpeaker=zanhuaPeople.find(person=>person.id===conversation.speaker)!;
 const historicalTurn=contextSeen&&contextTurn>=conversation.reply.length;
 const collectorContext=phase==='context'&&index===2&&contextStep===1;
 const collectionDetail=detail?.id==='seal'||detail?.id.startsWith('collector-');
 const dialogueText=contextSeen?[...conversation.reply,...conversation.history][contextTurn]:conversation.invite;
 const observing=phase==='observe'||phase==='interpret'||phase==='context'||phase==='compare'||phase==='animate'||phase==='ending'||phase==='recall'||phase==='complete';
 const blocked=!ready||busy||phase==='intro'||phase==='found'||phase==='clue'||phase==='compare'||phase==='animate'||Boolean(overlay)||maidPlaying||phase==='complete'||phase==='seal';
 const sound=useAmbience(blocked||observing||figureStudy,chapterMusicTracks.zanhua);
 const soundLabel=sound.state==='loading'?'音樂載入中，點擊取消':sound.state==='on'?'關閉音樂':sound.state==='error'?'重試本章音樂':'開啟本章音樂';
 const observationAnchor:SceneActor={...actor,...(phase==='context'?context.focus:step.focus),width:.045,height:.12};
 const closeOverlay=()=>{if(overlay==='journal')closeJournal();else setOverlay(null);};
 useEffect(()=>{const previous=document.title;document.title='簪花仕女圖 · 畫中尋人';return()=>{document.title=previous;};},[]);
 useLayoutEffect(()=>{
  const note=noteRef.current??((phase==='context'||phase==='interpret')?document.querySelector<HTMLElement>('.zanhua-preview .lantern-emperor-speech'):null);
  if(!note||busy){setNoteBounds(null);return;}
  const measure=()=>{const {left,top,width,height}=note.getBoundingClientRect();setNoteBounds(old=>old?.left===left&&old?.top===top&&old?.width===width&&old?.height===height?old:{left,top,width,height});};
  measure();const observer=new ResizeObserver(measure);observer.observe(note);const positionObserver=new MutationObserver(measure);positionObserver.observe(note,{attributes:true,attributeFilter:['style']});return()=>{observer.disconnect();positionObserver.disconnect();};
 },[phase,busy,index,contextStep,contextTurn,contextSeen,detail?.id,viewport.view.x,viewport.view.y,viewport.view.scale,viewport.frame.width,viewport.frame.height]);
 useEffect(()=>{if(figureStudy&&studyAnchor&&(studyAnchor.frame.width!==viewport.frame.width||studyAnchor.frame.height!==viewport.frame.height))setStudyAnchor(viewport);},[figureStudy,viewport.frame.width,viewport.frame.height,studyAnchor]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{if(!reply)return;const id=setTimeout(()=>setReply(null),5500);return()=>clearTimeout(id);},[reply]);
 useEffect(()=>{if(!notice)return;const id=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(id);},[notice]);
 useEffect(()=>{if((phase==='observe'||phase==='context'&&contextLooking&&!contextSeen)&&!busy)actionRef.current?.focus({preventScroll:true});else if(observing&&!busy)noteRef.current?.focus({preventScroll:true});},[phase,busy,contextSeen,contextStep]);
 useEffect(()=>{const handle=(event:KeyboardEvent)=>{if(overlay||phase==='intro'||phase==='animate'||phase==='seal'||event.ctrlKey||event.metaKey||event.altKey)return;if(event.key.toLowerCase()==='f'){event.preventDefault();setFocusing(v=>!v);}if(event.key==='Escape')setReply(null);};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);},[overlay,phase]);
 useEffect(()=>{if(!ready||snapshot.current)return;snapshot.current=true;if(collectorEntry){setFocusing(false);frameContext(1);}else if(initialPhase==='observe'||initialPhase==='interpret'){setFocusing(false);if(initialPhase==='interpret')frameSpeaker();else frameObservation();}},[ready]);

 function pan(region:{x:number;y:number},_near=false,onSettled?:()=>void,anchor?:{x:number;y:number},ratio?:number,allowHorizontalMargin=false,allowVerticalMargin=false){
  if(!ratio){
   const w=zanhuaSize.width*viewport.view.scale,h=zanhuaSize.height*viewport.view.scale;
   const x=Math.max(Math.min(0,viewport.frame.width-w),Math.min(0,viewport.frame.width/2-region.x*w));
   const y=(viewport.frame.height-h)/2;
   if(Math.abs(viewport.view.x-x)<.5&&Math.abs(viewport.view.y-y)<.5){onSettled?.();return;}
  }
  const current=++token.current;setBusy(true);setReply(null);if(timer.current)clearTimeout(timer.current);
  let settled=false;
  const done=()=>{if(!settled&&current===token.current){settled=true;if(timer.current)clearTimeout(timer.current);timer.current=null;setBusy(false);onSettled?.();}};
  timer.current=setTimeout(done,1800);
  setStudy({region:ratio?region:{x:region.x,y:.5},allowHorizontalMargin,allowVerticalMargin:ratio?allowVerticalMargin:false,...(ratio?{scaleRatio:ratio}:{}),screenAnchor:ratio?anchor:{x:.5,y:.5},transition:'pan',token:current,onSettled:done});
 }
 function confirmRegion(region:PaintingRegion,label:string){const item=(zanhuaAnnotations[index][contextStep]??[]).find(item=>item.label===label);const traced=item?zanhuaDetailContours[item.id]:index===2&&label===step.label?zanhuaDetailContours['hair-flower']:undefined;setConfirmation({...traced,region,label,token:++confirmationToken.current});setNotice(`已找到：${label}`);}
 function selectAnnotation(item:ZanhuaAnnotation){
  setDetail(item);setNotice('');
  const collectorSeal=zanhuaCollectorSeals.find(seal=>seal.id===item.id);
  if(collectorSeal){setCollectorSealId(collectorSeal.id);setConfirmation({region:collectorSeal.region,path:collectorSeal.path,origin:0,label:collectorSeal.label,token:++confirmationToken.current});return;}
  const regions:Record<string,PaintingRegion>={'gauze':zanhuaSteps[1].region,'waist':zanhuaContext[1][0].region,'scarf':zanhuaContext[1][1].region,'red-skirt':zanhuaContext[0][0].region,'high-hair':zanhuaContext[2][0].region,'hair-flower':zanhuaSteps[2].region,'fan':zanhuaContext[1][2].region,'seal':zanhuaContext[2][1].region};
  const radius=item.id==='skirt'?70:item.id==='dark-gauze'?120:32;
  const region=regions[item.id]??{points:Array.from({length:16},(_,n)=>({x:(item.at[0]+Math.cos(n*Math.PI/8)*radius)/6455,y:(item.at[1]+Math.sin(n*Math.PI/8)*radius)/1378}))};
  setConfirmation({...zanhuaDetailContours[item.id],region,label:item.label,token:++confirmationToken.current});
 }
 function mouthVisible(id:string){const p=zanhuaMouths[id],x=viewport.view.x+p.x*6455*viewport.view.scale,y=viewport.view.y+p.y*1378*viewport.view.scale;return x>24&&x<viewport.frame.width-24&&y>24&&y<viewport.frame.height-80;}
 function speakingAnchor(id:string){return mouthVisible(id)?zanhuaMouths[id]:context.focus;}
 function collect(id:string){
  const location=zanhuaSpot(id);if(!location)return;
  confirmRegion({points:location.polygon.map(([x,y])=>({x:x/6455,y:y/1378}))},location.actor.name);
  const category=location.category,title=zanhuaCollectionItems[category].title;
  if(claimed.current[category]){setNotice(`已記在冊中：${title}`);return;}
  const next={...claimed.current,[category]:id};claimed.current=next;setOrigins(next);setStorageAvailable(saveZanhuaOrigins(next));
  collection.enqueue(category,title,location.actor.x,location.actor.y);
 }
 function openJournal(){collection.settle();setReply(null);journalView.current={viewport:{view:{...viewport.view},frame:{...viewport.frame}},focus:focusing,horizontalMargin:Boolean(study?.allowHorizontalMargin),verticalMargin:Boolean(study?.allowVerticalMargin)};setFocusing(false);setOverlay('journal');}
 function lookAtFinding(finding:(typeof findings)[number],done:()=>void){
  const {width,height}=viewport.frame,compact=width<760;
  // Fit the complete original detail into the clear area beside/above the shared paper.
  const availableWidth=compact?width-48:width*.32-32;
  const availableHeight=compact?height*.21-24:height*.65;
  const scale=Math.min(coverView(viewport.frame,zanhuaSize).scale*1.15,availableWidth/finding.crop.rect[2],availableHeight/finding.crop.rect[3]);
  pan(finding.actor,false,done,compact?{x:.5,y:.12}:{x:.16,y:.43},scale/coverView(viewport.frame,zanhuaSize).scale,true,true);
 }
 function closeJournal(){
  setOverlay(null);const saved=journalView.current;journalView.current=null;if(!saved)return;
  const region={x:(saved.viewport.frame.width/2-saved.viewport.view.x)/(zanhuaSize.width*saved.viewport.view.scale),y:(saved.viewport.frame.height/2-saved.viewport.view.y)/(zanhuaSize.height*saved.viewport.view.scale)};
  pan(region,false,()=>setFocusing(saved.focus),{x:.5,y:.5},saved.viewport.view.scale/coverView(saved.viewport.frame,zanhuaSize).scale,saved.horizontalMargin,saved.verticalMargin);
 }
 // Physical observation taps share ScrollScene's drag/pinch threshold and coordinates.
 function activateObservation(world:{x:number;y:number}){
  if(blocked)return false;
  if(figureStudy){if(studyComparing.current)return true;const part=resolveZanhuaStudyHit(index,world,viewport,studyAnchor??viewport,studyScope);if(part)setStudyPart(part);return true;}
  if(phase==='free'){
   for(const which of [0,1,2])if(resolveZanhuaStudyHit(which,world)){setIndex(which);setStudy(null);setStudyAnchor(viewport);studyComparing.current=false;setStudyPart(null);setFigureStudy(true);setReply(null);setFocusing(false);return true;}
  }
  if(collectorContext&&contextLooking){
   const seal=resolveZanhuaCollectorSeal(world,viewport.view.scale);
   if(!seal)return false;
   if(contextSeen)selectAnnotation(zanhuaAnnotations[2][1].find(item=>item.id===seal.id)!);else revealContext(seal.id);
   return true;
  }
  const region=phase==='observe'?step.region:phase==='context'&&contextLooking&&!contextSeen?context.region:null;
  if(!region)return false;
  const p={x:world.x/zanhuaSize.width,y:world.y/zanhuaSize.height};
  let inside=false;
  for(let i=0,j=region.points.length-1;i<region.points.length;j=i++){
   const a=region.points[i],b=region.points[j];
   if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }
  if(!inside)return false;
  if(phase==='observe')observe();else revealContext();
  return true;
 }
 function inspect(id:string){
  if(blocked||figureStudy)return;
  if(phase==='interpret'||phase==='context'&&(!contextLooking||contextSeen))return;
  if(phase==='context'&&contextLooking&&!contextSeen&&id===context.collect){revealContext();return;}
  if(zanhuaSpot(id)){collect(id);return;}
  if(phase==='search'&&id===step.id){savedFocus.current=focusing;setFocusing(false);setReply(null);setConfirmation({...zanhuaFigureContour(id as 'P1'|'P4'|'P6'),label:zanhuaPeople.find(person=>person.id===id)!.name,token:++confirmationToken.current});setPhase('found');return;}
  const person=zanhuaPeople.find(p=>p.id===id);if(!person)return;
  const count=visits.current[id]??0;visits.current[id]=count+1;
  const show=()=>setReply({id,text:zanhuaReplies[id][count%3],token:++token.current});
  show();
 }
 function begin(opening:SceneViewport){
  if(entering||!ready)return;setEntering(true);
  if(timer.current)clearTimeout(timer.current);
  setStudy({region:{
   x:(opening.frame.width/2-opening.view.x)/(zanhuaSize.width*opening.view.scale),
   y:(opening.frame.height/2-opening.view.y)/(zanhuaSize.height*opening.view.scale),
  },scaleRatio:opening.view.scale/coverView(opening.frame,zanhuaSize).scale,transition:'instant',token:++token.current,onSettled:()=>{
   if(timer.current)clearTimeout(timer.current);
   timer.current=setTimeout(()=>{setPhase('search');setEntering(false);setStudy(null);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100);
  }});
 }

 function frameObservation(which=index){
  pan(zanhuaSteps[which].focus);
 }
 function near(){if(busy||phase!=='found')return;setConfirmation(null);setFocusing(false);setPhase('observe');frameObservation();}
 function continueStory(){if(busy||phase!=='context'||!contextSeen)return;setDetail(null);setConfirmation(null);setPhase('clue');}
 function frameContext(which:number){
  const current=zanhuaContext[index][which];
  if(index===2&&which===1){
   const compact=viewport.frame.width<760;
   const scale=Math.min(1.35,viewport.frame.width/240,(viewport.frame.height*(compact?.46:.70)-40)/333);
   pan(current.focus,false,undefined,compact?{x:.5,y:.24}:{x:.62,y:.50},scale/coverView(viewport.frame,zanhuaSize).scale,true,true);return;
  }
  pan(current.focus);
 }
 function dialogueSpace(){
  const {view}=viewport;
  const originalRects=[...zanhuaPeople,...zanhuaSpots.map(spot=>spot.actor)].map(person=>({x:(person.x-person.width/2)*6455,y:(person.y-person.height/2)*1378,width:person.width*6455,height:person.height*1378}));
  // P6 leans over open silk: reserve her actual head separately (speechGeometry.heads),
  // rather than letting the empty upper-left corner of her body box push speech away.
  if(index===2){Object.assign(originalRects[5],{x:1160,y:460,width:450,height:900});originalRects.push({x:950,y:850,width:730,height:510});}
  // The same exclusions cover people, collected details and historical evidence.
  for(const stops of zanhuaContext)for(const stop of stops){const xs=stop.region.points.map(p=>p.x*6455),ys=stop.region.points.map(p=>p.y*1378);originalRects.push({x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)});}
  originalRects.push({x:2800,y:230,width:180,height:190});
  if(index===2)originalRects.push({x:600,y:850,width:420,height:480},...zanhuaMountingSeals);
  if(index===0)originalRects.push({x:4860,y:980,width:300,height:190},{x:5130,y:550,width:450,height:480});
  return originalRects.map(rect=>({left:view.x+rect.x*view.scale,top:view.y+rect.y*view.scale,width:rect.width*view.scale,height:rect.height*view.scale}));
 }
 function frameSpeaker(id=step.id,onSettled?:()=>void){pan(zanhuaMouths[id],false,onSettled);}
 function startContext(){if(busy||phase!=='interpret')return;setDetail(null);setConfirmation(null);setContextStep(0);setContextSeen(false);setContextLooking(false);setContextTurn(0);setPhase('context');}
 function lookContext(){if(busy||phase!=='context')return;setDetail(null);setConfirmation(null);setContextLooking(true);frameContext(contextStep);}
 function openFigureStudy(){setStudy(null);setStudyAnchor(viewport);studyComparing.current=false;setStudyPart(null);setFigureStudy(true);if(phase==='context'&&index===1&&contextStep<2)setRetainedStudy(true);setReply(null);setFocusing(false);}
 function closeFigureStudy(){setFigureStudy(false);setStudyPart(null);studyComparing.current=false;if(index!==1||phase!=='context'||contextStep!==0)setRetainedStudy(false);}
 function revealContext(sealId?:string){
  if(busy||phase!=='context'||contextSeen||!contextLooking)return;
  setContextSeen(true);setContextTurn(0);setDetail(null);
  if(context.collect)collect(context.collect);
  if(collectorContext){const seal=zanhuaCollectorSeals.find(item=>item.id===sealId)??zanhuaCollectorSeals[0];setCollectorSealId(seal.id);confirmRegion(seal.region,seal.label);}
  else confirmRegion(context.region,context.collect?'長柄扇':zanhuaAnnotations[index][contextStep][0].label);
  if(context.collect==='fan-maid')setMaidPlaying(true);
  else if(index<2||contextStep===0)openFigureStudy();
 }
 function nextContext(){
  if(busy||phase!=='context'||!contextSeen)return;
  if(detail){setDetail(null);return;}
  if(contextTurn+1<conversation.reply.length+conversation.history.length){setContextTurn(value=>value+1);return;}
  if(contextStep+1===zanhuaContext[index].length){continueStory();return;}
  const next=contextStep+1;setDetail(null);setConfirmation(null);setContextStep(next);setContextSeen(false);setContextLooking(false);setContextTurn(0);frameContext(next);
 }
 function finishMotion(){setPhase('interpret');}

 function advance(){
  if(busy||phase!=='clue')return;setConfirmation(null);setDetail(null);
  if(index===2){setPhase('complete');setFocusing(false);return;}
  setFigureStudy(false);setIndex(v=>v+1);setContextStep(0);setContextSeen(false);setDepth(0);setReply(null);setHint(null);setStudy(null);setFocusing(savedFocus.current);setPhase('search');
 }
 function restart(){setPlayerSeal(null);setFigureStudy(false);setRetainedStudy(false);setMaidPlaying(false);setConfirmation(null);setDetail(null);collection.settle();if(timer.current)clearTimeout(timer.current);token.current++;setBusy(false);setStudy(null);setReply(null);setOverlay(null);setIndex(0);setContextStep(0);setContextSeen(false);setDepth(0);setPhase('intro');setEntryStarted(false);setCoverVisible(true);setCoverLeaving(false);setEntering(false);setReset(v=>v+1);setFocusing(true);}
 function returnToCover(){window.dispatchEvent(new CustomEvent('chapter-cover-request',{detail:()=>{const url=new URL(window.location.href);url.searchParams.delete('scene');url.searchParams.delete('person');window.history.replaceState(null,'',url);restart();}}));}
 function help(){setDepth(0);setOverlay('hint');}
 function playMotion(){
  if(busy)return;setFigureStudy(false);setReply(null);setMotionToken(v=>v+1);setFocusing(false);setPhase('animate');
 }
 function observe(){if(busy||phase!=='observe')return;if(index===0)collect('dog-right');if(index===2)collect('blossom-P6');confirmRegion(step.region,step.label);setBusy(true);timer.current=setTimeout(()=>{setBusy(false);playMotion();},700);}

 function openEnding(){if(busy)return;setReply(null);setFocusing(false);setIndex(2);setPhase('ending');frameObservation(2);}
 function recall(which:number){if(busy||phase!=='ending')return;setRemembered(which);setIndex(which);setPhase('recall');frameObservation(which);}
 function finishRecollection(){if(busy||phase!=='recall')return;setPhase('complete');}
 function beginSeal(){
  if(phase!=='complete')return;
  setPhase('seal');setFocusing(false);setReply(null);setConfirmation(null);setDetail(null);setNotice('');collection.settle();
  const compact=viewport.frame.width<700;
  const scale=Math.max(.85,Math.min(1.35,viewport.frame.width/620,viewport.frame.height/580));
  pan({x:505/zanhuaSize.width,y:zanhuaPlayerSeal.y/zanhuaSize.height},false,undefined,compact?{x:.43,y:.30}:{x:.30,y:.58},scale/coverView(viewport.frame,zanhuaSize).scale,true,true);
 }
 function fullScreen(){if(document.fullscreenElement)void document.exitFullscreen?.();else void document.documentElement.requestFullscreen?.().catch(()=>setNotice('可在目前視窗繼續觀畫。'));}
 const dogNoteWidth=Math.min(260,Math.max(220,520*viewport.view.scale-48));
 const dogNoteLeft=Math.max(16,Math.min(viewport.frame.width-dogNoteWidth-16,viewport.view.x+5330*viewport.view.scale-dogNoteWidth-24));
 const heading=phase==='recall'?zanhuaRecollections[remembered].title:phase==='context'?context.title:step.title;
 return <main style={{'--zanhua-dog-note-left':`${dogNoteLeft}px`,'--zanhua-dog-note-width':`${dogNoteWidth}px`,'--zanhua-fan-note-left':`${Math.max(16,Math.min(viewport.frame.width-326,viewport.view.x+3715*viewport.view.scale-155))}px`} as CSSProperties} className={`immersive-game lantern-game zanhua-preview ${ready?'scene-loaded':''} ${phase==='found'||phase==='clue'||observing?'is-near-view':''} ${overlay==='journal'?'is-journal-open':''} ${index===0&&(observing||phase==='clue')?'is-dog-study':''} ${observing&&phase!=='animate'&&phase!=='compare'?'is-story-reading':''} ${phase==='context'?'is-context-reading':''} ${(phase==='context'||phase==='clue')&&contextLooking&&context.collect==='fan-maid'?'is-fan-reading':''} ${phase==='context'||phase==='clue'?'is-stable-reading':''} ${phase==='ending'||phase==='recall'||phase==='complete'?'is-ending':''} ${phase==='animate'?'is-figure-motion':''}`} aria-label="簪花仕女圖 · 畫中尋人">
  <ScrollScene image={zanhuaImage} artworkSize={zanhuaSize} actors={figureStudy?[]:[...zanhuaPeople,...zanhuaSpots.map(s=>s.actor)]} hitResolver={resolveZanhuaHit} active={phase!=='intro'} blocked={blocked}
   resetKey={reset} hint={hint} command={command} studyCommand={study} onInspect={inspect} onReady={setReady}
   onExplore={()=>setReply(null)} onMiss={()=>{setReply(null);if(phase==='observe')setNotice(step.prompt.replace('\n',''));else if(phase==='context'&&!contextSeen)setNotice(context.action);}}
   initialRegion={{x:initialPhase==='intro'||initialPhase==='search'?0:actor.x,y:.5}} initialFocus={{x:.5,y:.5}}
   focusing={phase==='intro'?false:focusing} motion={false} steam={null} minimumScaleRatio={overlay==='journal'?.1:.7} zoomStops={[.7,.85,1,1.3,1.6,2.1,2.6,3.2,4]}
   onViewportChange={setViewport} onViewChange={setScrollWindow} keyboardNavigation smoothNavigation onPaintingTap={activateObservation}
   title="簪花仕女圖" description="遼寧省博物館藏《簪花仕女圖》完整畫面，五位簪花女子與一位執扇侍女，人物間有兩隻小犬與一隻鶴。"/>
  {phase==='intro'?<>
   {entryStarted&&<ZanhuaThreeActEntryV1 ready={ready} leaving={entering} onBegin={begin} onPrepared={prepareEntry} onRevealed={revealEntry}/>}
   {coverVisible&&<section className={`introduction lantern-introduction zanhua-entry-cover-v1 ${coverLeaving?'is-opening-scroll':''}`} aria-label="簪花仕女圖封面" inert={entryStarted}>
    <div className="intro-brand"><span/>畫中尋人</div>
    <div className="intro-content"><div className="intro-copy"><div className="intro-narrative"><div className="intro-lines">
     <p className="intro-chapter">遼寧省博物館藏 · 絹本設色 · 畫心46×180厘米</p>
     <p className="intro-story">{'這卷絹畫傳為唐代周昉所作，\n留下貴族女子遊賞、盛裝的身影。\n從面孔，找到她們各自的故事。'}</p>
    </div></div><button className="intro-enter" disabled={entryStarted} onClick={()=>setEntryStarted(true)}><span>{entryStarted&&!coverLeaving?'正在展卷':'走進這一卷'}</span><ArrowRight size={23}/></button>
    </div><div className="intro-title"><h1>簪花仕女圖</h1><span className="intro-seal" aria-hidden="true">尋人</span></div></div>
    <div className="intro-footer"><p>在原畫中尋找三位女子 · 動作與表情為遊戲演繹</p><ChapterLinks current="zanhua"/></div>
   </section>}
  </>:<>

   <header className="lantern-hud" inert={blocked} hidden={phase==='seal'}>
    {phase!=='free'&&<section className="lantern-target" aria-label="本次人物提示"><button className="lantern-face-reference" aria-label="放大人物樣貌" onClick={help}><img className="lantern-face-illustration" src={step.portrait} alt={`${step.appearance}（樣貌摹繪，原畫為準）`}/></button>
     <div><p className="lantern-eyebrow">尋人 · {String(index+1).padStart(2,'0')} / 03</p><h1>尋找這張面孔</h1><p className="lantern-trail">{step.appearance}</p><p className="lantern-progress">已尋得 {index} / 3 位</p></div>
    </section>}
    <div className="lantern-tools"><button className="lantern-mode" aria-pressed={focusing} onClick={()=>setFocusing(v=>!v)}>{focusing?'轉回彩色':'凝神觀察'}</button><button className="round-control" aria-busy={sound.state==='loading'} aria-label={soundLabel} aria-pressed={sound.state==='on'} onClick={()=>void sound.toggle()}>{sound.state==='on'?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="round-control" aria-label="切換全螢幕" onClick={fullScreen}><Maximize size={18}/></button><button className="round-control" aria-label="畫卷操作" onClick={()=>setOverlay('menu')}><MoreHorizontal size={20}/></button></div>
   </header>
   <footer className="lantern-footer" inert={blocked} hidden={phase==='seal'}>
    <button ref={book} className={`lantern-quiet-button lantern-journal-button ${collection.receiving?'is-spark-arriving':''}`} onClick={openJournal}><BookOpen size={18}/>見聞冊 <span>{collection.count}／4</span></button>
    <LanternNavigator image={zanhuaImage} stops={stops} window={scrollWindow} onNavigate={x=>setHint({region:{x,y:.5},token:++token.current})}/>
    <button className="lantern-quiet-button" onClick={phase==='free'?()=>setPhase('complete'):help}><CircleHelp size={18}/>{phase==='free'?'回看發現':'給我提示'}</button>
   </footer>
  </>}
  {(phase==='found'||phase==='clue')&&!busy&&!overlay&&!figureStudy&&!maidPlaying&&<LanternEmperorSpeech stablePlacement trapFocus={false} actor={actor} people={zanhuaPeople} artworkSize={zanhuaSize} viewport={viewport} speakerLabel="畫中女子的遊戲虛構對白" extraWidth={28}
   speechGeometry={{openSpaceCandidates:true,maxWidth:310,reservedRects:dialogueSpace(),anchor:phase==='clue'?speakingAnchor(step.id):zanhuaMouths[step.id],faces:Object.values(zanhuaMouths),heads:zanhuaHeads}}
   narration={phase==='clue'&&!mouthVisible(step.id)} caption={phase==='clue'?`${actor.name} · 遊戲對白`:undefined} text={phase==='found'?step.found:step.clue} progress={phase==='found'?index+1:undefined} progressText={`尋得第${['一','二','三'][index]}位女子`} actionLabel={phase==='found'?step.near:index===2?'看看她們的生活':'循線索找下一位'} onContinue={phase==='found'?near:advance}/>}
  {phase==='interpret'&&!busy&&!overlay&&!figureStudy&&!maidPlaying&&<LanternEmperorSpeech stablePlacement trapFocus={false} actor={actor} people={zanhuaPeople} artworkSize={zanhuaSize} viewport={viewport}
   speakerLabel="女子回望方才動作的遊戲虛構對白" caption="畫中女子 · 遊戲對白" text={zanhuaInterpretDialogue[index]}
   speechGeometry={{openSpaceCandidates:true,maxWidth:310,reservedRects:dialogueSpace(),anchor:zanhuaMouths[step.id],faces:Object.values(zanhuaMouths),heads:zanhuaHeads}}
   actionLabel="再看她的盛裝" onContinue={startContext}>
    <button className="lantern-text-button zanhua-dialogue-replay" onClick={playMotion}>重看{zanhuaMotionLabels[index]}演繹</button>
  </LanternEmperorSpeech>}
  {phase==='context'&&!busy&&!overlay&&!figureStudy&&!maidPlaying&&(!contextLooking||contextSeen)&&<LanternEmperorSpeech stablePlacement trapFocus={false} actor={contextSpeaker} people={zanhuaPeople} artworkSize={zanhuaSize} viewport={viewport}
   speakerLabel={detail?(collectionDetail?'原畫流傳小注':'衣飾與髮型小注'):historicalTurn?'畫外解說：歷史資料':`${contextSpeaker.id==='P3'?'執扇侍女':'畫中女子'}的遊戲虛構對白`}
   caption={detail?(collectionDetail?'原畫小注 · 流傳線索':index===2&&contextStep===0?'衣飾小注 · 原畫細節':'衣飾小注 · 原畫細看'):historicalTurn?'畫外解說 · 史料':`${contextSpeaker.name} · 遊戲對白`} narration={Boolean(detail)||historicalTurn||!mouthVisible(conversation.speaker)}
   text={detail?.body??dialogueText} speechGeometry={{openSpaceCandidates:true,maxWidth:310,reservedRects:dialogueSpace(),anchor:speakingAnchor(conversation.speaker),faces:Object.values(zanhuaMouths),heads:zanhuaHeads}}
   actionLabel={detail?'返回人物對話':!contextSeen?'讓我看看':contextTurn+1<conversation.reply.length+conversation.history.length?'聽下去':contextStep+1===zanhuaContext[index].length?'循她的線索走':'再看下一處'}
   onContinue={contextSeen?nextContext:lookContext}>
    {!detail&&contextSeen&&index===1&&contextStep===1&&<button className="lantern-text-button zanhua-more-dress" onClick={()=>setDetail(zanhuaDressComparison)}>還有哪些唐代穿搭？</button>}
    {!detail&&contextSeen&&(index===0||(index===1&&contextStep<2))&&<button className="lantern-text-button zanhua-more-dress" onClick={openFigureStudy}>再看衣飾圖解</button>}
    {!detail&&contextSeen&&index===2&&contextStep===0&&<button className="lantern-text-button zanhua-more-dress" onClick={openFigureStudy}>再看髮型圖解</button>}
    {!detail&&contextSeen&&index===1&&contextStep===2&&<button className="lantern-text-button zanhua-more-dress" onClick={()=>setMaidPlaying(true)}>重看執扇演繹</button>}
    {!detail&&contextSeen&&collectorContext&&<button className="lantern-text-button zanhua-more-dress" onClick={()=>setDetail(zanhuaEarlierSealNote)}>更早的收藏線索</button>}
    {detail&&<div className="zanhua-detail-links"><a href={zanhuaHistorySources[detail.source].url} target="_blank" rel="noreferrer">資料依據 ↗</a></div>}
    {!detail&&contextSeen&&contextTurn+1===conversation.reply.length+conversation.history.length&&<details className="zanhua-dialogue-source"><summary>這段的資料依據</summary><a href={zanhuaHistorySources[context.source].url} target="_blank" rel="noreferrer">{zanhuaHistorySources[context.source].label} ↗</a></details>}
  </LanternEmperorSpeech>}
  {phase==='compare'&&!busy&&!overlay&&!figureStudy&&!maidPlaying&&<LanternEmperorSpeech stablePlacement trapFocus={false} actor={zanhuaPeople[2]} people={zanhuaPeople} artworkSize={zanhuaSize} viewport={viewport} speakerLabel="執扇侍女的遊戲虛構對白" speechGeometry={{openSpaceCandidates:true,maxWidth:310,reservedRects:dialogueSpace(),anchor:zanhuaMouths.P3,faces:Object.values(zanhuaMouths),heads:zanhuaHeads}} text="她們逗犬賞花，我手裡還有扇呢。" actionLabel="回看女子的薄衣" onContinue={()=>{setPhase('interpret');frameObservation();}}/>}
  {observing&&!figureStudy&&!maidPlaying&&phase!=='complete'&&<>
   {phase==='observe'&&!busy&&<LanternPaintingTarget pointerThrough region={step.region} artworkSize={zanhuaSize} viewport={viewport} label={step.action} buttonRef={actionRef} onClick={observe}/>}
   {phase==='context'&&contextLooking&&!busy&&!contextSeen&&!collectorContext&&<LanternPaintingTarget pointerThrough region={context.region} artworkSize={zanhuaSize} viewport={viewport} label={context.action} buttonRef={actionRef} onClick={()=>revealContext()}/>}
   {collectorContext&&contextLooking&&!busy&&zanhuaCollectorSeals.map((seal,n)=><LanternPaintingTarget key={seal.id} pointerThrough region={seal.region} artworkSize={zanhuaSize} viewport={viewport} label={`${contextSeen?'細看':'點擊'}${seal.label}`} buttonRef={n===0?actionRef:undefined} onClick={()=>{if(contextSeen)selectAnnotation(zanhuaAnnotations[2][1].find(item=>item.id===seal.id)!);else revealContext(seal.id);}}/>)}
   {phase!=='animate'&&phase!=='compare'&&phase!=='interpret'&&(phase!=='context'||contextLooking&&!contextSeen)&&<LanternPaintingNote index={index} anchor={observationAnchor} artworkSize={zanhuaSize} viewport={viewport} label={phase==='ending'||phase==='recall'?'畫中回望':phase==='context'?`循着細節讀畫 · ${contextStep+1} / ${zanhuaContext[index].length}`:`原畫觀察 · ${index+1} / 3`} title={phase==='ending'?zanhuaEnding.title:heading} busy={busy} noteRef={noteRef}>
    {phase==='observe'?<p className="lantern-note-body">{step.prompt}</p>:phase==='context'?<p className="lantern-note-body">{context.prompt}</p>:phase==='ending'?<>
     <p className="lantern-note-body">{zanhuaEnding.body}</p><p className="lantern-note-caption">{zanhuaEnding.invitation}</p>
     <div className="lantern-note-choices">{zanhuaRecollections.map((s,n)=><button key={zanhuaSteps[n].id} onClick={()=>recall(n)}>{s.choice} →</button>)}</div>
    </>:phase==='recall'?<>
     <p className="lantern-note-body">{zanhuaRecollections[remembered].body}</p>
     <button className="lantern-note-next" onClick={finishRecollection}>把這一刻留在畫中<span aria-hidden="true">→</span></button>
     <button className="lantern-text-button" disabled={busy} onClick={openEnding}>再回望另一位</button>
    </>:<>
     <p className="lantern-note-body">{zanhuaEnding.complete}</p>
     <button className="lantern-note-next" onClick={()=>{setPhase('free');setFocusing(savedFocus.current);}}>自由探索<span aria-hidden="true">→</span></button><button className="lantern-text-button" onClick={restart}>再尋一次</button>
    </>}
   </LanternPaintingNote>}
  </>}
  {reply&&!blocked&&<LanternEmperorSpeech stablePlacement trapFocus={false} key={reply.token} actor={zanhuaPeople.find(p=>p.id===reply.id)!} people={zanhuaPeople} artworkSize={zanhuaSize} viewport={viewport} text={reply.text} speakerLabel="畫中人物的遊戲虛構對白" speechGeometry={{openSpaceCandidates:true,maxWidth:310,anchor:zanhuaMouths[reply.id],faces:Object.values(zanhuaMouths),heads:zanhuaHeads,reservedRects:[...dialogueSpace(),...(observing?(noteBounds?[noteBounds]:[]):[{left:0,top:0,width:355,height:150},{left:viewport.frame.width-270,top:0,width:270,height:95}])]}}/>}
  {phase==='animate'&&!busy&&<><ZanhuaFigureAnimation key={motionToken} kind={index===0?'P1':index===1?'P4':'P6'} viewport={viewport} onDone={finishMotion} onError={()=>{setNotice('演繹暫未載入，可繼續看原畫或重播。');finishMotion();}}/><button className="lantern-quiet-button zanhua-skip-animation" onClick={finishMotion}>略過演繹 →</button></>}
  {!overlay&&!figureStudy&&!maidPlaying&&phase!=='animate'&&confirmation&&<ZanhuaDetailOverlay viewport={viewport} confirmation={confirmation} annotations={phase==='context'&&contextSeen&&!(index===2&&contextStep===0)&&!(index===0||(index===1&&contextStep<2))?(zanhuaAnnotations[index][contextStep]??[]).filter(item=>!collectorContext||item.id===collectorSealId):[]} selected={detail?.id} onSelect={selectAnnotation} reserved={dialogueSpace()} paper={noteBounds??undefined}/>}
  {(figureStudy||showRetainedStudy)&&<ZanhuaInPaintingStudy key={index} active={figureStudy} scope={studyScope} requireCompletion={phase!=='free'} anchorViewport={studyAnchor??viewport} onCompareChange={value=>{studyComparing.current=value;}} returnLabel={phase==='free'?'回到原畫':undefined} person={index} viewport={viewport} selected={studyPart} onSelect={setStudyPart} onClose={closeFigureStudy}/>}
  {maidPlaying&&<><ZanhuaMaidAnimation viewport={viewport} onDone={()=>setMaidPlaying(false)}/><button className="lantern-quiet-button zanhua-skip-animation" onClick={()=>setMaidPlaying(false)}>略過演繹 →</button></>}
  {phase==='complete'&&<ZanhuaLifeSummary collected={Object.keys(origins).length} onSeal={beginSeal}/>}
  {playerSeal&&<ZanhuaPlayerSeal viewport={viewport} text={playerSeal}/>}
  {phase==='seal'&&<ZanhuaSealRitual viewport={viewport} busy={busy} seal={playerSeal} onStamp={setPlayerSeal} onCover={returnToCover} onExplore={()=>{setPhase('free');setFocusing(false);}}/>}
  {collection.flight&&<LanternSparkDiscovery key={collection.flight.token} artwork={zanhuaCollectionItems[collection.flight.category]} discovery={{token:collection.flight.token,newlyCollected:true,findingId:collection.flight.category,source:{x:collection.flight.x,y:collection.flight.y},destination:{x:collection.flight.x+collection.flight.dx,y:collection.flight.y+collection.flight.dy},frame:viewport.frame}} onDone={collection.settle}/>}
  {(notice||sound.state==='error')&&!overlay&&<LanternNotice key={notice||sound.state} quiet text={notice||'音樂未能載入，可再次點擊音樂開關重試。'}/>}
  {overlay==='journal'&&<LanternJournal findings={findings} edition={zanhuaJournalEdition} collected={Object.keys(origins)} sessionOnly={!storageAvailable} compact={viewport.frame.width<760} onClose={closeJournal}
   onLook={lookAtFinding}/>}
  {overlay==='hint'&&<ChapterDialog label="人物樣貌" className="lantern-appearance-help" onClose={closeOverlay}>
   <p className="lantern-eyebrow">先看樣貌，再入畫尋找</p><h2>{depth===0?'可曾見過這張面孔？':'再看一個細節'}</h2><div className="lantern-appearance-body"><figure className="lantern-appearance-figure"><img className="lantern-face-illustration" src={step.portrait} alt={step.appearance}/><figcaption>樣貌摹繪，原畫為準</figcaption></figure><div className="lantern-appearance-copy"><p>{depth===0?step.appearance:step.hints[depth-1]}</p><button className="lantern-return-link" onClick={closeOverlay}>回畫中找找<ArrowRight size={17}/></button></div></div>
   <div className="lantern-appearance-footer"><span>拖曳移動，滾輪或雙指縮放</span>{depth<2?<button className="lantern-text-button" onClick={()=>setDepth(v=>v+1)}>再給些方向</button>:<button className="lantern-text-button" onClick={()=>{setOverlay(null);setHint({region:{x:step.district,y:.5},token:++token.current});}}>看看這一帶</button>}</div>
  </ChapterDialog>}
  {overlay==='about'&&<ChapterDialog label="畫作小記" onClose={closeOverlay}><h2>簪花仕女圖</h2>
   <p>遼寧省博物館藏，絹本設色，畫心46×180厘米，傳為唐代周昉作。仕女畫以社會上層女性生活為題材；本幅繪五位簪花女子、一位執扇侍女及庭園動植物。</p>
   <p>寬袖紗衣、高束長裙與肩臂間的披帛，配合高髻和花飾，提供了觀看貴族女性服飾的線索。這份遊賞生活，不能代替所有唐代婦女的日常。</p>
   <p>本幅沒有作者落款。鑑藏印與後世著錄幫助追查流傳，作者及成畫年代仍有討論；原本可能為屏風畫的說法也屬研究推測。</p>
   <p>人物短對白、動作與表情為遊戲演繹，觀看證據時均回到原畫。</p>
   <details><summary>原畫與資料來源</summary><p><a href={zanhuaSource} target="_blank" rel="noreferrer">完整畫面複製圖 · Wikimedia Commons</a></p>{zanhuaHistorySources.map(source=><p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></p>)}</details>
   <p className="lantern-source-note">配樂：<a href={chapterMusicTracks.zanhua.source} target="_blank" rel="noreferrer">{chapterMusicTracks.zanhua.title} · {chapterMusicTracks.zanhua.author}</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>。現代背景配樂，不是唐代曲目復原。</p>
  </ChapterDialog>}
  {overlay==='menu'&&<ChapterDialog label="畫卷操作" onClose={closeOverlay}><h2>畫卷操作</h2><p>拖曳移動畫卷；滾輪、雙指或鍵盤＋／－縮放。按 F 切換凝神與彩色。</p><div className="lantern-menu-controls">{(['in','out','overview'] as const).map((type,n)=><button className="small-button" key={type} onClick={()=>{setOverlay(null);setCommand({type,token:++token.current});}}>{['放大','縮小','回到卷左'][n]}</button>)}</div><div className="lantern-paper-actions"><button className="lantern-text-button" onClick={()=>setOverlay('about')}>畫作小記</button><button className="lantern-text-button" onClick={restart}>再尋一次</button><button className="lantern-text-button" onClick={returnToCover}>回到本章封面</button></div></ChapterDialog>}
 </main>;
}
