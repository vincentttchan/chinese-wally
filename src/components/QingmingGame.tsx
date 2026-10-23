import {useEffect,useReducer,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneCommand,SceneHint,SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {ChapterLinks} from './ChapterLinks.tsx';
import {ChapterDialog} from './ChapterDialog.tsx';
import {LanternNavigator} from './LanternNavigator.tsx';
import {LanternNotice} from './LanternNotice.tsx';
import {QingmingNote,QingmingSpeech} from './QingmingPanels.tsx';
import {QingmingJournal} from './QingmingJournal.tsx';
import {QingmingFocus} from './QingmingFocus.tsx';
import {sourceReadingKey} from '../game/qingmingReading.ts';
import {QingmingSourceReading} from './QingmingSourceReading.tsx';
import {ArrowRight,BookOpen,CircleHelp,Maximize,MoreHorizontal,Volume2,VolumeX,ZoomIn,ZoomOut} from './ArtIcons.tsx';
import {useAmbience} from '../audio/useAmbience.ts';
import {chapterMusicTracks} from '../audio/chapterMusicTracks.js';
import {returnToChapterCover} from '../game/chapterCover.ts';
import {coverView} from '../game/geometry.ts';
import {qingmingImage,qingmingTiles,qingmingSize,qingmingArt,qingmingFindings,qingmingPaintingSources,actorById,findingAt,repliesAt} from '../game/qingming.ts';
import {bridgeIntroduction,qingmingStories,qingmingStoryActors,storyActorById,storyById,storyAt,storyStepAt,storyCenter,cityConnections,qingmingZoomStops,bridgeVesselIds,qingmingDestinationCopy} from '../game/qingmingStories.ts';
import type {PaintingStory} from '../game/qingmingStories.ts';
import {initialQingming,qingmingReducer,saveQingming,emptyQingmingSave,progressAt,stepObserved,completedStories} from '../game/qingmingState.ts';
import {resolveQingmingDetailHit} from '../game/qingmingHit.ts';
import '../lantern.css';
import '../lantern-journal.css';
import '../lantern-search-hud.css';
import '../lantern-field-journal.css';
import '../lantern-observation.css';
import '../lantern-spark.css';
import '../qingming.css';

type Overlay='hint'|'menu'|'sources'|'guide'|'journal'|null;
type Flight={art:string;x:number;y:number;dx:number;dy:number;token:number};
export function QingmingGame({persist=true}:{persist?:boolean}={}){
 const [state,dispatch]=useReducer(qingmingReducer,undefined,()=>initialQingming(persist?undefined:emptyQingmingSave()));
 const stateRef=useRef(state);stateRef.current=state;
 const [ready,setReady]=useState(false),[entering,setEntering]=useState(false),[reset,setReset]=useState(0);
 const [focus,setFocus]=useState(false),[overlay,setOverlay]=useState<Overlay>(null),[journalLooking,setJournalLooking]=useState(false);
 const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
 const viewportRef=useRef(viewport);viewportRef.current=viewport;
 const [scrollWindow,setScrollWindow]=useState({left:.47,width:.08});
 const [study,setStudy]=useState<StudyCommand|null>(null),[command,setCommand]=useState<SceneCommand|null>(null),[hint,setHint]=useState<SceneHint|null>(null);
 const [moving,setMoving]=useState(false),[hintDepth,setHintDepth]=useState(0),[reply,setReply]=useState<{id:string;text:string;token:number}|null>(null);
 const [noteFolded,setNoteFolded]=useState(false),[sourceBookOpen,setSourceBookOpen]=useState(false),[guidedFocusOff,setGuidedFocusOff]=useState(false),[actorFocusLabel,setActorFocusLabel]=useState('');
 const [revealedPrompt,setRevealedPrompt]=useState('');
 const [invitation,setInvitation]=useState<string|null>(null),[destination,setDestination]=useState<string|null>(null),[cityLooked,setCityLooked]=useState(false);
 const [arrival,setArrival]=useState<string|null>(null);
 const lastDestination=useRef<string|null>(null),destinationButton=useRef<HTMLButtonElement>(null);
 const dismissed=useRef(new Set<string>());
 const [feedback,setFeedback]=useState<{text:string;detail?:string;quiet?:boolean}|null>(null);
 const [flight,setFlight]=useState<Flight|null>(null),[receiving,setReceiving]=useState(false),[journalCount,setJournalCount]=useState(()=>Object.keys(state.origins).length);
 const book=useRef<HTMLButtonElement>(null);
 const savedView=useRef<{viewport:SceneViewport;focus:boolean}|null>(null),visits=useRef<Record<string,number>>({});
 const claimed=useRef(new Set(Object.keys(state.origins)));
 const guideViewPlaced=useRef(false);
 const resumeOrderedView=useRef(Boolean(state.activeStory&&storyById(state.activeStory)?.ordered));
 const panGeneration=useRef(0),panTimer=useRef<number|null>(null),flightTimer=useRef<number|null>(null);
 const story=state.activeStory?storyById(state.activeStory):undefined;
 const progress=state.replay??(story?progressAt(state,story.id):undefined);
 const step=story&&progress?storyStepAt(story,progress):undefined;
 const sourceReading=state.mode==='observe'&&step?.kind==='source';
 const guided=story?.id===bridgeIntroduction.id&&!state.tutorialDone;
 const paced=guided||Boolean(story?.ordered);
 const guidedOpening=(guided||story?.quietOpening)&&state.mode==='observe'&&progress?.step===0;
 const guidedProfile=paced&&state.mode==='observe'&&step?.kind==='observe'?step.focus:undefined;
 const promptDelay=paced&&state.mode==='observe'&&step?.kind==='observe'?step.questionDelayMs??0:0;
 const currentSeen=step?.kind==='observe'?step.groups.filter(g=>progress?.seen[g.key]).length:0;
 const promptKey=`${reset}:${state.activeStory}:${progress?.step}:${currentSeen}`;
 const promptVisible=promptDelay===0||revealedPrompt===promptKey;
 const effectiveFocus=guidedProfile?!guidedFocusOff:focus;
 const toggleFocus=()=>guidedProfile?setGuidedFocusOff(value=>!value):setFocus(value=>!value);
 const phraseRead=story&&progress?state.sourcePhrases?.[sourceReadingKey(story.id,progress.step)]??[]:[];
 useEffect(()=>{setNoteFolded(false);},[state.activeStory,progress?.step,state.mode]);
 // This pause reveals copy only. Painting clicks remain active, and time never advances progress.
 useEffect(()=>{
  if(!promptDelay||!ready||moving||overlay)return;
  const timer=setTimeout(()=>setRevealedPrompt(promptKey),promptDelay);
  return()=>clearTimeout(timer);
 },[promptDelay,promptKey,ready,moving,overlay]);
 const mainNote=state.mode==='observe'||state.mode==='conclusion'||state.mode==='city'||Boolean(invitation)||Boolean(destination);
 const sceneBlocked=!ready||state.mode==='intro'||moving||sourceBookOpen||state.mode==='conclusion'||Boolean(overlay&&!(overlay==='journal'&&journalLooking));
 const sound=useAmbience(sceneBlocked||mainNote,chapterMusicTracks.qingming);
 const soundLabel=sound.state==='on'?'關閉音樂':sound.state==='loading'?'音樂載入中，點擊取消':sound.state==='error'?'重試本章音樂':'開啟本章音樂';
 useEffect(()=>{if(persist)saveQingming(state);},[persist,state]);
 useEffect(()=>{const old=document.title;document.title='清明上河圖 · 畫中漫遊';return()=>{document.title=old;};},[]);
 useEffect(()=>()=>{if(panTimer.current!==null)clearTimeout(panTimer.current);if(flightTimer.current!==null)clearTimeout(flightTimer.current);},[]);
 useEffect(()=>{if(!feedback)return;const timer=setTimeout(()=>setFeedback(null),feedback.quiet?2000:3600);return()=>clearTimeout(timer);},[feedback]);
 useEffect(()=>{if(!reply)return;const timer=setTimeout(()=>setReply(null),3600);return()=>clearTimeout(timer);},[reply]);
 useEffect(()=>{if(!receiving)return;const timer=setTimeout(()=>setReceiving(false),650);return()=>clearTimeout(timer);},[receiving]);
 useEffect(()=>{const clear=()=>setFlight(null);window.addEventListener('resize',clear);return()=>window.removeEventListener('resize',clear);},[]);
 useEffect(()=>{if(!entering)return;const timer=setTimeout(()=>{dispatch({type:'begin'});setReset(n=>n+1);setEntering(false);setFocus(false);setGuidedFocusOff(false);guideViewPlaced.current=true;pan({x:19600/38414,y:500/1800},1.8);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);return()=>clearTimeout(timer);},[entering]);
 useEffect(()=>{setCityLooked(false);},[state.cityStep]);
 useEffect(()=>{if(ready&&state.mode!=='intro'&&story?.id===bridgeIntroduction.id&&!guideViewPlaced.current){guideViewPlaced.current=true;pan({x:19600/38414,y:500/1800},1.8);}},[ready,state.mode,story?.id]);
 useEffect(()=>{if(ready&&resumeOrderedView.current&&story?.ordered){resumeOrderedView.current=false;visitStoryArea(story);}},[ready,story?.id]);
 const previousCount=useRef(completedStories(state));
 useEffect(()=>{const count=completedStories(state);if(count===5&&previousCount.current<5)setFeedback({text:'五段見聞已記下，可以把它們連起來看。',quiet:true});previousCount.current=count;},[state]);
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{
   if(e.defaultPrevented||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
   if(e.key==='Escape'&&destination&&!overlay){e.preventDefault();closeDestination();return;}
   if(e.key==='Escape'&&!overlay){if(invitation){setInvitation(null);return;}if(reply){setReply(null);return;}}
   if(e.key==='Escape'&&guidedProfile&&!guidedFocusOff&&!overlay){e.preventDefault();setGuidedFocusOff(true);return;}
   if(e.key.toLowerCase()==='f'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!overlay&&!sceneBlocked){e.preventDefault();toggleFocus();}
  };
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[overlay,sceneBlocked,reply,invitation,destination,guidedProfile,guidedFocusOff]);
 function pan(region:{x:number;y:number},ratio=1.55,onSettled?:()=>void){
  const generation=++panGeneration.current;setMoving(true);setReply(null);
  if(panTimer.current!==null)clearTimeout(panTimer.current);
  let finished=false;
  const done=()=>{if(finished||generation!==panGeneration.current)return;finished=true;setMoving(false);onSettled?.();};
  panTimer.current=window.setTimeout(done,1700);
  const compact=viewportRef.current.frame.width<700;
  setStudy({region,scaleRatio:ratio,screenAnchor:compact?{x:.50,y:.44}:{x:.50,y:.48},transition:'pan',token:performance.now(),onSettled:done});
 }
 function lookAt(id:string){
  const actor=storyActorById(id);if(!actor)return;
  const frame=viewportRef.current.frame,base=coverView(frame,qingmingSize).scale;
  const width=actor.width*qingmingSize.width,height=actor.height*qingmingSize.height;
  const person=actor.kind==='target'||actor.kind==='witness';
  const scale=person?Math.max(100/height,48/width):Math.min(frame.width*.76/width,frame.height*.60/height);
  pan({x:actor.x,y:actor.y},Math.max(1.75,Math.min(5,scale/base)));
 }
 function collect(id:string,anchor?:{x:number;y:number}){
  const finding=findingAt(id);if(!finding)return;
  if(claimed.current.has(finding.id)){setFeedback({text:`已記在冊中：${finding.title}`,quiet:true});return;}
  claimed.current.add(finding.id);dispatch({type:'collect',id:finding.id,actorId:id});
  const count=claimed.current.size,actor=actorById(id),v=viewportRef.current;
  const source=anchor??{x:v.view.x+actor.x*38414*v.view.scale,y:v.view.y+actor.y*1800*v.view.scale};
  const rect=book.current?.getBoundingClientRect(),root=book.current?.closest('main')?.getBoundingClientRect();
  const done=()=>{setFlight(null);setJournalCount(count);setReceiving(true);setFeedback({text:`已收藏：${finding.title}`,detail:`汴京見聞 ${count}／${qingmingFindings.length}`});};
  if(flightTimer.current!==null)clearTimeout(flightTimer.current);
  if(rect&&root&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const destination={x:rect.left-root.left+rect.width/2,y:rect.top-root.top+rect.height/2};
   setFlight({art:finding.art,x:source.x,y:source.y,dx:destination.x-source.x,dy:destination.y-source.y,token:performance.now()});
   flightTimer.current=window.setTimeout(done,1500);
  }else done();
 }
 function inspect(id:string,anchor?:{x:number;y:number}){
  if(sceneBlocked||overlay)return;
  setDestination(null);
  dispatch({type:'inspect',id});
  if(state.mode==='city'&&cityConnections[state.cityStep].ids.includes(id))setCityLooked(true);
  const finding=findingAt(id);
  if(finding&&!(guided&&finding.id==='rainbow-bridge'))collect(id,anchor);
  if(paced&&step?.kind==='observe'&&step.groups.some(group=>group.ids.includes(id))){setFeedback(null);setReply(null);return;}
  if(paced&&!promptVisible){setReply(null);return;}
  if(guided&&step?.kind==='observe'&&progress?.step===2&&id!=='extra-person-river-231'&&bridgeVesselIds.includes(id)){setFeedback({text:'你點到船身或其他細節。留意船左側伸臂前傾的人。',quiet:true});setReply(null);return;}
  const candidate=storyAt(id);
  if(state.mode==='roam'&&candidate&&(candidate.id===arrival||candidate.ordered)&&!progressAt(state,candidate.id).complete){setArrival(null);setInvitation(null);setReply(null);setGuidedFocusOff(false);dispatch({type:'start',id:candidate.id});return;}
  if(step?.kind==='observe'&&progress&&!paced){
   const newlySeen=step.groups.filter(g=>g.ids.includes(id)&&!progress.seen[g.key]);
   if(newlySeen.length){
    const remaining=step.groups.filter(g=>!progress.seen[g.key]&&!g.ids.includes(id));
    setFeedback({text:`已看：${newlySeen.map(g=>g.label).join('、')}`,detail:remaining.length?`還未看：${remaining.map(g=>g.label).join('、')}`:'這一步已看齊，可以展開題箋繼續。',quiet:true});
   }
  }
  const replies=repliesAt(id);
  if(replies){const count=visits.current[id]??0;visits.current[id]=count+1;setReply({id,text:replies[Math.min(count,2)],token:performance.now()});}
  else setReply(null);
  if(state.tutorialDone&&['roam','observe'].includes(state.mode)&&candidate&&candidate.id!==state.activeStory&&!progressAt(state,candidate.id).complete&&!dismissed.current.has(candidate.id))setInvitation(candidate.id);
 }
 const activeActors=overlay==='journal'&&!journalLooking||sourceReading?[]:qingmingStoryActors.filter(a=>{
  const {view,frame}=viewport;
  const x=view.x+a.x*qingmingSize.width*view.scale,y=view.y+a.y*qingmingSize.height*view.scale;
  const hw=a.width*qingmingSize.width*view.scale/2,hh=a.height*qingmingSize.height*view.scale/2;
  return x+hw>=-100&&x-hw<=frame.width+100&&y+hh>=-100&&y-hh<=frame.height+100;
 });
 function openJournal(){
  const v=viewportRef.current;savedView.current={viewport:{view:{...v.view},frame:{...v.frame}},focus};
  if(flightTimer.current!==null)clearTimeout(flightTimer.current);
  setJournalCount(claimed.current.size);setFlight(null);setReply(null);setFocus(false);setJournalLooking(false);setOverlay('journal');
 }
 function closeJournal(){
  setOverlay(null);setJournalLooking(false);
  const saved=savedView.current;if(!saved)return;
  const {view,frame}=saved.viewport;
  const region={x:(frame.width/2-view.x)/view.scale/38414,y:(frame.height/2-view.y)/view.scale/1800};
  const ratio=view.scale/coverView(frame,qingmingSize).scale;
  const generation=++panGeneration.current;setMoving(true);
  if(panTimer.current!==null)clearTimeout(panTimer.current);
  let restored=false;
  const done=()=>{if(restored||generation!==panGeneration.current)return;restored=true;setMoving(false);setFocus(saved.focus);book.current?.focus({preventScroll:true});};
  panTimer.current=window.setTimeout(done,1700);
  setStudy({region,scaleRatio:ratio,screenAnchor:{x:.5,y:.5},token:performance.now(),transition:'pan',onSettled:done});
 }
 const closeOverlay=()=>overlay==='journal'?closeJournal():setOverlay(null);
 function recommendDestination(){
  const unfinished=qingmingStories.filter(s=>!progressAt(state,s.id).complete);
  const pool=unfinished.length?unfinished:qingmingStories;
  const index=pool.findIndex(s=>s.id===(destination??lastDestination.current));
  const next=pool[(index+1)%pool.length];
  lastDestination.current=next.id;setDestination(next.id);setInvitation(null);setReply(null);setFeedback(null);setOverlay(null);
 }
 function closeDestination(){setDestination(null);destinationButton.current?.focus({preventScroll:true});}
 function goToDestination(){
  const target=destination?storyById(destination):undefined;if(!target)return;
  setDestination(null);setInvitation(null);setReply(null);setFocus(false);dispatch({type:'pause'});
  setArrival(progressAt(state,target.id).complete?null:target.id);
  visitStoryArea(target);
 }
 function visitStoryArea(target:PaintingStory){
  const frame=viewportRef.current.frame,base=coverView(frame,qingmingSize).scale;
  const [left,top,right,bottom]=target.region;
  const ratio=Math.min(frame.width*.8/(right-left),frame.height*.65/(bottom-top))/base;
  pan(storyCenter(target),Math.max(1,Math.min(3,ratio)));
 }
 const askHint=()=>{if(state.mode==='roam'){recommendDestination();return;}setHintDepth(0);setDestination(null);setOverlay('hint');};
 const zoom=(type:SceneCommand['type'])=>{setOverlay(null);setCommand({type,token:performance.now()});};
 function startStory(id:string){setDestination(null);setArrival(null);setInvitation(null);setReply(null);setOverlay(null);setGuidedFocusOff(false);dispatch({type:'start',id});}
 function replayStory(id:string){
  const target=storyById(id);if(!target)return;
  setDestination(null);setArrival(null);setInvitation(null);setReply(null);setOverlay(null);setJournalLooking(false);setFocus(false);setGuidedFocusOff(false);setReset(n=>n+1);
  dispatch({type:'replay',id});visitStoryArea(target);
 }
 function roam(){
  if(state.mode==='conclusion'&&story)setFeedback({text:`已記下：${story.title}`,detail:story.id==='intro-bridge'?'自由漫遊已開放':'這段見聞已收入冊中',quiet:true});
  setDestination(null);setArrival(null);setInvitation(null);setReply(null);dispatch({type:'roam'});
 }
 function restart(){guideViewPlaced.current=false;++panGeneration.current;if(panTimer.current!==null)clearTimeout(panTimer.current);setMoving(false);setStudy(null);setHint(null);setReply(null);setInvitation(null);setDestination(null);setArrival(null);setOverlay(null);setFocus(false);setGuidedFocusOff(false);setSourceBookOpen(false);dismissed.current.clear();setReset(n=>n+1);dispatch({type:'restart'});}
 const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setFeedback({text:'全螢幕暫不可用，仍可在這裏探索。',quiet:true});}};
 const invited=invitation?storyById(invitation):undefined;
 function continueStep(){
  setReply(null);if(step?.kind==='observe'&&step.collectOnContinue)collect('landmark-bridge');
  if(story?.finishInPainting&&progress?.step===story.steps.length-1)setFeedback({text:`${state.replay?'已重看':'已記下'}：${story.title}`,quiet:true});
  dispatch({type:'continue'});
 }
 const observed=step?.kind==='observe'&&progress?stepObserved(step,progress):false;
 const currentGroups=step?.kind==='observe'?step.groups:[];
 const seenGroups=progress?currentGroups.filter(g=>progress.seen[g.key]):[];
 const missingGroups=currentGroups.filter(g=>!progress?.seen[g.key]);
 const count=completedStories(state);
 const suggested=destination?storyById(destination):undefined;
 const destinationCopy=destination?qingmingDestinationCopy[destination]:undefined;
 const hintStory=story;
 const hintStep=hintStory&&state.activeStory===hintStory.id?step:undefined;
 return <main onFocusCapture={event=>{const target=event.target;if(target instanceof HTMLElement&&target.classList.contains('actor-hitbox')&&target.matches(':focus-visible'))setActorFocusLabel(target.getAttribute('aria-label')??'');}} onBlurCapture={event=>{if(event.target instanceof HTMLElement&&event.target.classList.contains('actor-hitbox'))setActorFocusLabel('');}} className={`immersive-game lantern-game qingming-game ${ready?'scene-loaded':''} ${overlay==='journal'?'is-journal-open':''} ${sourceReading?'is-reading-source':''} ${guided?'is-guided':''} ${story?.ordered?'is-paced-story':''} ${sourceBookOpen?'has-reading-leaf':''}`}>
  <ScrollScene image={qingmingImage} tiles={qingmingTiles} artworkSize={qingmingSize} zoomStops={qingmingZoomStops} requireTiles actors={activeActors} hitResolver={(world,scale,size,actors)=>resolveQingmingDetailHit(world,scale,size,actors,state.mode==='observe'?currentGroups.flatMap(g=>g.ids):state.mode==='city'?cityConnections[state.cityStep].ids:[])}
   title="清明上河圖" description="張擇端北宋本原畫；在虹橋、船隻、街道與店舖間觀察漫遊" initialRegion={{x:.506,y:.34}} initialFocus={{x:.5,y:.28}}
   active={state.mode!=='intro'&&ready} blocked={sceneBlocked} resetKey={reset} hint={hint} command={command} studyCommand={study}
   focusing={focus&&overlay!=='journal'&&!guidedProfile&&!sourceReading} motion={false} steam={null}
   onInspect={inspect} onExplore={()=>setReply(null)} onMiss={()=>setReply(null)} onReady={setReady} onViewportChange={setViewport} onViewChange={setScrollWindow}/>
  {guidedProfile&&!guidedFocusOff&&!overlay&&!sourceBookOpen&&<QingmingFocus key={guidedProfile} viewport={viewport} profile={guidedProfile}/>}
  {actorFocusLabel&&!overlay&&<p className="qingming-actor-focus" role="status">目前選到：{actorFocusLabel} · 按 Enter 觀看</p>}
  {state.mode==='intro'?<section className={`introduction lantern-introduction ${entering?'is-entering':''}`} inert={entering} aria-label="虹橋觀察引言">
   <div className="intro-brand"><span/>畫中探索</div><div className="intro-content"><div className="intro-copy"><div className="intro-narrative"><div className="intro-lines">
    <p className="intro-chapter">北宋 · 張擇端</p><p className="intro-story">在橋邊停一停。</p>
   </div></div><button className="intro-enter" disabled={entering||!ready} onClick={()=>setEntering(true)}><span>{ready?'開始觀察':'正在展卷'}</span><ArrowRight size={23}/></button>
   </div><div className="intro-title"><h1>清明上河圖</h1><span className="intro-seal" aria-hidden="true">讀城</span></div></div><div className="intro-footer"><p>北京故宮博物院藏 · 原畫全卷</p><ChapterLinks current="qingming-shanghe"/></div>
  </section>:<>
   <header className="lantern-hud" inert={Boolean(overlay)||moving||sourceBookOpen}>
    <section className={`lantern-target ${!promptVisible||destination||story?.ordered&&!guidedOpening?'qingming-prompt-pending':''}`} aria-label="目前的原畫觀察"><button className="lantern-face-reference" aria-label="查看觀察方向" onClick={askHint}><CircleHelp size={30}/></button>
     <div><p className="lantern-eyebrow">{state.tutorialDone?`自由漫遊 · 已記下 ${count}／5 段見聞`:'虹橋引導 · 留步看看'}</p><h1>{state.mode==='city'?'把城市見聞連起來':step?.title??(state.mode==='conclusion'?story?.title:'在畫中留步看看')}</h1><p className="lantern-trail">{guidedOpening?'點看讓你想多看一眼的人物。':state.mode==='roam'?'點看感興趣的人物、船隻、店招或陳列。':step?.kind==='observe'?'按題箋觀察；也可以自行拖曳與近看。':sourceReading?'讀短句，再回到原畫對照。':'記下見聞，再選一處停留。'}</p></div>
    </section>
    <div className="lantern-tools"><button className="lantern-mode" aria-pressed={effectiveFocus} onClick={toggleFocus}>{effectiveFocus?'轉回彩色':'凝神觀察'}</button><button className="round-control" aria-label={soundLabel} aria-pressed={sound.state==='on'} onClick={()=>void sound.toggle()}>{sound.state==='on'?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="round-control" aria-label="切換全螢幕" onClick={()=>void fullscreen()}><Maximize size={18}/></button><button className="round-control" aria-label="畫卷操作" onClick={()=>setOverlay('menu')}><MoreHorizontal size={20}/></button></div>
   </header>
   <footer className="lantern-footer" inert={Boolean(overlay)||moving||sourceBookOpen}><button ref={book} className={`lantern-quiet-button lantern-journal-button ${receiving?'is-spark-arriving':''}`} onClick={openJournal}><BookOpen size={18}/>見聞冊 <span>{journalCount}／{qingmingFindings.length}</span></button>
    <LanternNavigator image={qingmingImage} window={scrollWindow} stops={[{x:.91,label:'城郊'},{x:.71,label:'河岸'},{x:.51,label:'虹橋'},{x:.19,label:'城門'},{x:.09,label:'街市'}]} onNavigate={x=>setHint({region:{x,y:.5},token:performance.now()})}/>
    <button ref={destinationButton} className="lantern-quiet-button" onClick={askHint}><CircleHelp size={18}/>{state.mode==='roam'?'給我一個去處':'給我提示'}</button>
   </footer>
   {sound.state==='error'&&<p className="lantern-status" role="status">音樂未能載入，可點擊右上角重試。</p>}
  </>}
  {suggested&&destinationCopy&&!overlay&&<QingmingNote viewport={viewport} className="qingming-destination-note" showTitle label="隨處走走" title={destinationCopy.title} preview={<img className="qingming-destination-crop" src={qingmingArt(suggested.art)} alt={`${suggested.title} · 原畫局部`}/>}>
   <button className="qingming-destination-close" aria-label="收起去處邀請" onClick={closeDestination}>×</button>
   {destinationCopy.teaser&&<p className="lantern-note-body">{destinationCopy.teaser}</p>}
   <button className="lantern-note-next" onClick={goToDestination}>去看看 <span>→</span></button>
   <button className="lantern-text-button qingming-destination-change" onClick={recommendDestination}>換一處</button>
  </QingmingNote>}
  {invited&&!overlay&&<QingmingNote viewport={viewport} label={story?'暫放下當前故事也會保存進度':'發現一處值得停留的地方'} title="留步看看？"><p className="lantern-note-body">{invited.question}</p><button className="lantern-note-next" onClick={()=>startStory(invited.id)}>留步看看 <span>→</span></button><button className="lantern-text-button" onClick={()=>{dismissed.current.add(invited.id);setInvitation(null);}}>稍後再看</button></QingmingNote>}
  {!invited&&state.mode==='observe'&&story&&step?.kind==='source'&&!overlay&&<QingmingSourceReading key={`${story.id}-${progress?.step}`} source={step.source} title={step.title} read={phraseRead} onRead={index=>dispatch({type:'read-phrase',index})} onOpenChange={setSourceBookOpen} onReturn={()=>dispatch({type:'continue'})} onPause={state.tutorialDone?()=>dispatch({type:'pause'}):undefined}/>}
  {!invited&&state.mode==='observe'&&story&&step?.kind==='observe'&&progress&&!overlay&&!guidedOpening&&promptVisible&&<QingmingNote viewport={viewport} compact busy={moving} folded={noteFolded} onFoldChange={setNoteFolded} foldedLabel={observed?'已看細節 · 展開題箋':`還有 ${missingGroups.length} 處 · 查看題箋`} label={guided?'虹橋':story.noteLabel??`畫中看見 · ${progress.step+1}／${story.steps.length}`} title={step.title}>
    <p className="lantern-note-body">{step.reflection?step.question:observed?seenGroups.map(g=>g.response).join(' '):step.question}</p>
    {!observed&&!paced&&seenGroups.slice(-1).map(g=><p key={g.key} className="lantern-note-caption">{g.response}</p>)}
    {!paced&&!observed&&currentGroups.length>1&&<p className="lantern-note-caption" role="status">已看 {seenGroups.length}／{currentGroups.length} 處</p>}
    {observed&&!step.autoContinue&&<button className="lantern-note-next" onClick={continueStep}>{state.replay&&step.reflection?'繼續漫遊':step.actionLabel??(progress.step===story.steps.length-1?'記下這個發現':'繼續看看')} <span>→</span></button>}

   {state.tutorialDone&&<button className="lantern-text-button" onClick={()=>{setReply(null);dispatch({type:'pause'});}}> 稍後再看</button>}
  </QingmingNote>}
  {state.mode==='conclusion'&&story&&!overlay&&<QingmingNote viewport={viewport} compact label="已記下見聞" title={story.id==='intro-bridge'?'你已讀出一段橋邊見聞':story.title}><p className="lantern-note-body">{story.meaning}</p>{story.id===bridgeIntroduction.id&&<figure className="qingming-collected-study"><img src={qingmingArt('bridge-boat-v55.png')} alt="橋與船的收藏摹繪"/><figcaption>已收下 · 虹橋見聞</figcaption></figure>}<button className="lantern-note-next" onClick={roam}>{story.id==='intro-bridge'?'自行漫遊':'繼續漫遊'} <span>→</span></button><button className="lantern-text-button" onClick={()=>{roam();story.id==='intro-bridge'?recommendDestination():openJournal();}}>{story.id==='intro-bridge'?'給我一個去處':'回看這段見聞'}</button></QingmingNote>}
  {state.mode==='city'&&!overlay&&<QingmingNote viewport={viewport} busy={moving} label={`完整城市聯繫 · ${state.cityStep+1}／4`} title={cityConnections[state.cityStep].title}>
   <p className="lantern-note-body">{cityConnections[state.cityStep].text}</p>
   {cityConnections[state.cityStep].ids.map((id,i)=><button key={id} className="lantern-text-button" onClick={()=>lookAt(id)}>{cityConnections[state.cityStep].labels[i]} ↗</button>)}
   {state.cityStep<3&&!cityLooked&&<p className="lantern-note-caption">選一處近看，再點回原畫細節。</p>}
   {(cityLooked||state.cityStep===3)&&<button className="lantern-note-next" onClick={()=>dispatch({type:'city-next'})}>{state.cityStep===3?'繼續漫遊':'回看下一段聯繫'} <span>→</span></button>}
   <button className="lantern-text-button" onClick={()=>state.cityStep===3?openJournal():dispatch({type:'roam'})}>{state.cityStep===3?'翻看見聞冊':'稍後再看'}</button>
   {state.cityStep===3&&<button className="lantern-text-button" onClick={returnToChapterCover}>回到本章封面</button>}
  </QingmingNote>}
  {state.mode==='roam'&&count===5&&!invited&&!destination&&!overlay&&<div className="qingming-complete"><p className="lantern-operation">五段見聞已記下，可以把它們連起來看。</p><button className="lantern-text-button" onClick={()=>{setCityLooked(false);dispatch({type:'city'});}}>連起來看</button></div>}
  {reply&&!sourceReading&&!overlay&&state.mode!=='conclusion'&&<QingmingSpeech actor={storyActorById(reply.id)} viewport={viewport} text={reply.text} avoidNote={mainNote&&!noteFolded}/>}
  {feedback&&state.mode!=='intro'&&!overlay&&<LanternNotice text={feedback.text} detail={feedback.detail} quiet={feedback.quiet}/>}
  {flight&&<div className="lantern-spark-discovery is-new" aria-hidden="true"><div className="lantern-spark-source" style={{left:flight.x,top:flight.y}}><span key={flight.token} className="lantern-firelight-token lantern-collectible-token qingming-token" style={{'--token-x':`${flight.dx}px`,'--token-y':`${flight.dy}px`,'--arc-x':`${flight.dx*.48}px`,'--arc-y':`${flight.dy*.48-85}px`} as CSSProperties}><img src={qingmingArt(flight.art)} alt=""/></span></div></div>}
  {overlay==='journal'&&<QingmingJournal save={state} onClose={closeJournal} onLookingChange={setJournalLooking} onLook={lookAt} onResume={id=>{const target=storyById(id);if(target?.ordered){startStory(id);setJournalLooking(false);visitStoryArea(target);}else{closeJournal();startStory(id);}}} onReplay={replayStory} onCity={()=>{closeJournal();setCityLooked(false);dispatch({type:'city'});}}/>}
  {overlay&&overlay!=='journal'&&<ChapterDialog label={overlay==='hint'?'觀察方向':overlay==='menu'?'畫卷操作':overlay==='guide'?'遊玩指南':'畫作與史料來源'} onClose={closeOverlay}>
   {overlay==='hint'?<><p className="lantern-eyebrow">方向由你選擇，近看才移動畫卷</p><h2>{hintStory?'看看這一帶':'選一處想停留的地方'}</h2>
    {hintStory?<><p>{hintStep?.kind==='observe'?hintDepth===0?hintStep.question:'留意相鄰的人物與物件，先從它們的姿勢、輪廓或文字看看。':hintStory.question}</p>{hintDepth>0&&hintStep?.kind==='observe'&&hintStep.groups.filter(g=>!progress?.seen[g.key]).map(g=><button key={g.key} className="lantern-text-button" onClick={()=>{setOverlay(null);lookAt(g.focus);}}>近看：{g.label}</button>)}{hintDepth===0&&<button className="lantern-text-button" onClick={()=>setHintDepth(1)}>再給我一個方向</button>}<button className="lantern-return-link" onClick={()=>{setOverlay(null);pan(storyCenter(hintStory),1);}}>帶我到附近 <ArrowRight size={18}/></button></>:<button className="lantern-text-button" onClick={recommendDestination}>給我一個去處</button>}
    {state.tutorialDone&&hintStory&&<button className="lantern-text-button" onClick={()=>{dispatch({type:'pause'});recommendDestination();}}>換一處走走</button>}
   </>:overlay==='menu'?<><h2>畫卷操作</h2><div className="qingming-menu"><button className="lantern-text-button" onClick={()=>zoom('in')}><ZoomIn size={18}/>放大畫卷</button><button className="lantern-text-button" onClick={()=>zoom('out')}><ZoomOut size={18}/>縮小畫卷</button><button className="lantern-text-button" onClick={()=>zoom('overview')}>回到虹橋</button><button className="lantern-text-button" onClick={()=>setOverlay('guide')}>遊玩指南</button><button className="lantern-text-button" onClick={()=>setOverlay('sources')}>畫作、史料與配樂來源</button><button className="lantern-text-button" onClick={restart}>重看虹橋引導 · 保留故事與收藏</button><button className="lantern-text-button" onClick={returnToChapterCover}>回到本章封面</button></div></>:overlay==='guide'?<><h2>留步觀察，再自行漫遊</h2><p>先在虹橋學會觀察朝向、動作與物件關係；讀《東京夢華錄》短句，再回原畫對照。完成後五個故事自由選序，不必尋找指定面孔。</p><p>故事可暫時離開、稍後續看。見聞冊隨時回顧已看細節；五故事完成後，可在畫中把城市聯繫連起來。物件收藏另計，不需要集齊。</p><p>拖曳、滾輪或雙指縮放。F 或右上按鈕控制凝神；手機單指移動光區、雙指移動長卷。Tab 選人物與物件，Enter 點看，＋／－縮放。</p><p>船上人物的身份與工作可以保留疑問；人物對白是遊戲虛構。</p></>:<><h2>畫作與史料</h2><p>北宋張擇端《清明上河圖》，北京故宮博物院藏。原畫是觀察依據。</p>{qingmingPaintingSources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></p>)}<p>《東京夢華錄》由孟元老在南宋追記北宋東京生活。短句配原畫必經對讀，長解說與釋讀限制在冊中選讀。店名、人物與史料地址不逐一等同。</p><details><summary>本章配樂</summary><p>Chinese Restaurant Background 5 · Sascha Ende。現代配樂，非宋代音樂復原，由玩家自行開啟。</p><a href={chapterMusicTracks.qingming.source} target="_blank" rel="noreferrer">曲目與作者</a></details></>}
  </ChapterDialog>}
 </main>;
}
