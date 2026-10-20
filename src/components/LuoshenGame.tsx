import {useEffect,useReducer,useRef,useState} from 'react';
import {LuoshenRedrawnBird} from './LuoshenRedrawnBird.tsx';
import {LuoshenDragonAnimation} from './LuoshenDragonAnimation.tsx';
import {luoshenDragonLayout} from '../game/luoshenDragonLayout.ts';
import {LuoshenRibbonAnimation} from './LuoshenRibbonAnimation.tsx';
import {useLuoshenAnimationPlayback} from '../hooks/useLuoshenAnimationPlayback.ts';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand,SceneCommand,SceneHitResolver} from './ScrollScene.tsx';
import type {SceneActor} from '../game/level.ts';
import {luoshenImage,luoshenTiles,luoshenSize,luoshenSteps,luoshenPeople,luoshenEnding,luoshenCollectibles,luoshenFindings,luoshenReply,luoshenSources,person} from '../game/luoshen.ts';
import {luoshenJournalActor} from '../game/luoshenJournal.ts';
import type {LuoshenLookStop} from '../game/luoshenJournal.ts';
import {initialLuoshen,luoshenReducer,saveLuoshen} from '../game/luoshenState.ts';
import {LuoshenNote,LuoshenSpeech,LuoshenJournal,LuoshenPortrait} from './LuoshenPanels.tsx';
import type {LuoshenJournalView} from './LuoshenPanels.tsx';
import {ChapterDialog} from './ChapterDialog.tsx';
import {ChapterLinks} from './ChapterLinks.tsx';
import {LanternNavigator} from './LanternNavigator.tsx';
import {LanternNotice} from './LanternNotice.tsx';
import {ArrowRight,BookOpen,CircleHelp,MoreHorizontal,Maximize,Volume2,VolumeX} from './ArtIcons.tsx';
import {assetPath} from '../game/assets.ts';
import {luoshenNoticePlacement} from '../game/luoshenLayout.ts';
import type {LuoshenPanelRect} from '../game/luoshenLayout.ts';
import {coverView} from '../game/geometry.ts';
import {returnToChapterCover} from '../game/chapterCover.ts';
import {useLuoshenCollectionFeedback} from '../hooks/useLuoshenCollectionFeedback.ts';
import {resolveLuoshenHit} from '../game/luoshenHit.ts';
import {useAmbience} from '../audio/useAmbience.ts';
import {chapterMusicTracks} from '../audio/chapterMusicTracks.js';
import '../lantern.css';
import '../lantern-journal.css';
import '../lantern-search-hud.css';
import '../lantern-field-journal.css';
import '../lantern-observation.css';
import '../lantern-spark.css';
import '../luoshen.css';
import '../lantern-market.css';
import '../luoshen-birds.css';
import '../luoshen-ribbon.css';
import {luoshenFigureLayout} from '../game/luoshenFigureLayout.ts';
type Overlay='hint'|'menu'|'sources'|'journal'|null;
const zoomStops=[1,1.25,1.6,2,2.6,3.4];
export function LuoshenGame({birdTrial=false,ribbonTrial=false,dragonTrial=false}:{birdTrial?:boolean;ribbonTrial?:boolean;dragonTrial?:boolean}={}){
 const isolatedTrial=birdTrial||ribbonTrial||dragonTrial;
 const [state,dispatch]=useReducer(luoshenReducer,undefined,()=>isolatedTrial?{phase:'intro' as const,index:1,observation:0,ending:0,endingSeen:false,focusPreference:true,origins:{}}:initialLuoshen());
 const [intro,setIntro]=useState(ribbonTrial||dragonTrial?1:0),[ready,setReady]=useState(false),[entering,setEntering]=useState(false),[reset,setReset]=useState(0),[focus,setFocus]=useState(state.focusPreference??true);
 const resumePending=useRef(Boolean(state.resumePhase));
 const [storageAvailable,setStorageAvailable]=useState(true);
 const hud=useRef<HTMLElement>(null),returnToBook=useRef<HTMLButtonElement>(null);
 const keyboardDetail=useRef<string|null>(null);
 function toggleFocus(){const value=!focus;const change=()=>{setFocus(value);dispatch({type:'focus',value});};if(birdScreen){birdAfterReturn.current=change;setBirdReturning(true);}else change();}
 const [noteBounds,setNoteBounds]=useState<LuoshenPanelRect|null>(null);
 const [readingView,setReadingView]=useState<{index:number;actors:string[]}|null>(null);
 const [journalLook,setJournalLook]=useState<{id:string;stops:LuoshenLookStop[]}|null>(null),[lookFolded,setLookFolded]=useState(false);
 const [journalView,setJournalView]=useState<LuoshenJournalView>({page:'collection',selected:null});
 const [overlay,setOverlay]=useState<Overlay>(null),[hintDepth,setHintDepth]=useState(0),[folded,setFolded]=useState(false),[busy,setBusy]=useState(false);
 const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
 const [scrollWindow,setScrollWindow]=useState({left:.9,width:.08}),[study,setStudy]=useState<StudyCommand|null>(null),[command,setCommand]=useState<SceneCommand|null>(null);
 const [reply,setReply]=useState<{id:string;text:string;token:number}|null>(null),[notice,setNoticeState]=useState<{text:string;token:number}|null>(null),[looking,setLooking]=useState(false);
 function setNotice(text:string){setNoticeState({text,token:performance.now()});}
 const book=useRef<HTMLButtonElement>(null),claimed=useRef(new Set(Object.keys(state.origins)));
 const collectionFeedback=useLuoshenCollectionFeedback(Object.keys(state.origins).length,viewport,book,setNotice);
 const {flight,count:journalCount,receiving}=collectionFeedback;
 const visits=useRef<Record<string,number>>({}),panTimer=useRef<ReturnType<typeof setTimeout>|null>(null),panToken=useRef(0),savedView=useRef<{viewport:SceneViewport;focus:boolean}|null>(null);
 const step=luoshenSteps[Math.min(state.index,5)],ending=luoshenEnding[state.ending];
 const observation=state.phase==='observe'?step.observations[state.observation]:state.phase==='ending'&&!state.endingSeen?ending?.observation:undefined;
 const readingActors=readingView?.index===state.index?readingView.actors:step.reading;
 const scope=`${state.phase}:${state.index}:${state.observation}:${state.ending}:${state.endingSeen}`;
 const [birdDrawing,setBirdDrawing]=useState(false),[birdReturning,setBirdReturning]=useState(false);
 const birdAfterReturn=useRef<(()=>void)|null>(null);
 const [ribbonRequest,setRibbonRequest]=useState<{id:string;scope:string}|null>(null),[ribbonOrigin,setRibbonOrigin]=useState('ribbon-0');
 const ribbonReturn=useRef<{viewport:SceneViewport;focus:boolean;folded:boolean;bird:boolean}|null>(null),ribbonViewed=useRef(false),ribbonExitFocus=useRef(false);
 const birdContext=state.index===1?(state.phase==='observe'&&observation?.id==='bird'?'observation':state.phase==='interpret'?'interpretation':null):null;
 const dragonContext=state.index===1?(state.phase==='observe'&&observation?.id==='dragon-first'?'observation':state.phase==='interpret'?'interpretation':null):null;
 const playback=useLuoshenAnimationPlayback(scope,busy,collectionFeedback.pendingCount);
 const birds={...playback,play:()=>playback.play('bird')};
 const birdActive=playback.kind==='bird'&&Boolean(birdContext),birdMoving=birdActive&&(playback.mode==='preparing'||playback.mode==='playing');
 const birdScreen=birdActive&&birdDrawing&&(playback.mode==='playing'||playback.mode==='still')&&!overlay&&!looking;
 useEffect(()=>{if(!birdActive||playback.mode==='failed'){setBirdDrawing(false);setBirdReturning(false);birdAfterReturn.current=null;}},[birdActive,playback.mode]);
 const ribbonActive=playback.kind==='ribbon',ribbonMoving=ribbonActive&&(playback.mode==='preparing'||playback.mode==='playing');
 const dragonActive=playback.kind==='dragon'&&Boolean(dragonContext),dragonMoving=dragonActive&&(playback.mode==='preparing'||playback.mode==='playing');
 const dragonFramed=!ribbonActive&&(dragonActive||dragonContext==='observation');
 const animationLayout=dragonFramed?luoshenDragonLayout(viewport.frame):luoshenFigureLayout(viewport.frame);
 useEffect(()=>{if(dragonContext==='observation')panDragons();},[scope]);
 useEffect(()=>{if(playback.mode==='playing')setNoticeState(null);},[playback.mode]);
 useEffect(()=>{setRibbonRequest(null);ribbonReturn.current=null;},[scope]);
 useEffect(()=>{if(!ribbonRequest)return;if(ribbonRequest.scope!==scope||overlay||looking){setRibbonRequest(null);return;}if(!busy&&!birdMoving&&!collectionFeedback.pendingCount&&ready){openRibbons(ribbonRequest.id);setRibbonRequest(null);}},[ribbonRequest,scope,overlay,looking,busy,birdMoving,collectionFeedback.pendingCount,ready]);
 useEffect(()=>{if(ribbonExitFocus.current&&!ribbonActive&&!busy&&!overlay){ribbonExitFocus.current=false;hud.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({preventScroll:true});}},[ribbonActive,busy,overlay]);
 const blocked=ribbonActive||dragonActive||birdMoving||birdReturning||state.phase==='intro'||state.phase==='found'||Boolean(overlay)||busy||!ready;
 const sound=useAmbience(blocked||state.phase==='observe'||state.phase==='interpret'||state.phase==='ending',chapterMusicTracks.luoshen);
 const allActors=[...luoshenPeople.filter(a=>observation?.id!==`observe-${a.id}`),...luoshenCollectibles,...(observation?[observation.actor]:[])];
 useEffect(()=>{if(!isolatedTrial)setStorageAvailable(saveLuoshen(state));},[state,isolatedTrial]);
 useEffect(()=>{if(!resumePending.current||state.phase==='intro'||!ready)return;resumePending.current=false;if(state.phase==='observe'||state.phase==='ending'){setFocus(false);if(observation)pan(observation.actor,1.5);}else if(state.phase==='interpret'||state.phase==='complete')setFocus(false);},[state.phase,ready]);

 useEffect(()=>{const old=document.title;document.title='洛水之間 · 洛神賦圖';return()=>{document.title=old;};},[]);
 useEffect(()=>{setHintDepth(0);setFolded(false);setReply(null);},[state.index,state.phase,state.observation,state.ending]);
 useEffect(()=>{if(!reply)return;const t=setTimeout(()=>setReply(null),3500);return()=>clearTimeout(t);},[reply]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNoticeState(null),3600);return()=>clearTimeout(t);},[notice]);
 useEffect(()=>()=>{if(panTimer.current)clearTimeout(panTimer.current);},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.defaultPrevented||overlay||state.phase==='intro')return;if(dragonActive){if(e.key==='Escape'){e.preventDefault();if(dragonMoving)playback.original();else closeDragons();document.querySelector<HTMLElement>('.luoshen-note-compact')?.focus({preventScroll:true});}return;}if(ribbonActive){if(e.key==='Escape'){e.preventDefault();if(ribbonMoving)playback.original();else closeRibbons();}return;}if(birdMoving||birdReturning||(birdScreen&&e.key==='Escape')){if(e.key==='Escape'){e.preventDefault();birdOriginal();document.querySelector<HTMLElement>('.luoshen-note-compact')?.focus({preventScroll:true});}return;}if(e.key.toLowerCase()==='f'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();toggleFocus();}if(e.key==='Escape'){setReply(null);if(looking){setLooking(false);setOverlay('journal');}else{const note=document.querySelector<HTMLElement>('.luoshen-note-compact:not([inert])');if(note)note.focus({preventScroll:true});else hud.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();}}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[overlay,state.phase,focus,looking,birdMoving,birdScreen,birdReturning,ribbonActive,ribbonMoving,dragonActive,dragonMoving]);
 useEffect(()=>{if(!entering)return;const t=setTimeout(()=>{dispatch({type:'begin'});setReset(v=>v+1);setEntering(false);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);return()=>clearTimeout(t);},[entering]);
 useEffect(()=>{if(ribbonActive){if(ribbonMoving)playback.original();if(ribbonViewed.current)panRibbons();}else if(dragonFramed){if(dragonMoving)playback.original();panDragons();}else if(birdMoving)birdOriginal(true);},[viewport.frame.width,viewport.frame.height]);
 // Rotation keeps the current observation clear of the newly positioned note.
 useEffect(()=>{if(ready&&!overlay&&!looking&&!ribbonActive&&!dragonFramed&&observation)pan(observation.actor,state.phase==='ending'?1.4:1.5);},[viewport.frame.width,viewport.frame.height]);
 // Reframe on entering a reading step or resizing; opening and closing a book keeps the player's view.
 useEffect(()=>{if(!overlay&&!looking&&!ribbonActive&&!dragonActive&&(state.phase==='interpret'||state.phase==='complete'))frameReading(state.phase==='complete'?['C6']:readingActors);},[state.phase,state.index,readingView,viewport.frame.width,viewport.frame.height]);
 function pan(actor:Pick<SceneActor,'x'|'y'>,ratio=1.4,anchor?:{x:number;y:number}){
  const token=++panToken.current;setBusy(true);setReply(null);if(panTimer.current)clearTimeout(panTimer.current);
  const done=()=>{if(token===panToken.current)setBusy(false);};panTimer.current=setTimeout(done,1400);
  setStudy({region:{x:actor.x,y:actor.y},scaleRatio:ratio,screenAnchor:anchor??(viewport.frame.height<500?{x:Math.max(.2,(viewport.frame.width-336)/2/viewport.frame.width),y:.48}:viewport.frame.width<700?{x:.5,y:.3}:{x:.34,y:.48}),transition:'pan',token:performance.now(),onSettled:done});
 }
 useEffect(()=>{if(busy||overlay||!keyboardDetail.current)return;const target=document.querySelector<HTMLButtonElement>(`[data-actor="${keyboardDetail.current}"]`);if(target&&!target.disabled){keyboardDetail.current=null;target.focus({preventScroll:true});}},[busy,overlay]);
 function nearDetail(actor:SceneActor,ratio:number,keyboard:boolean){if(keyboard)keyboardDetail.current=actor.id;setFocus(false);pan(actor,ratio);}
 function frameReading(ids:string[]){
  const actors=ids.map(id=>person(id)??step.observations.find(o=>o.actor.id===id)?.actor).filter((a):a is SceneActor=>Boolean(a));
  if(!actors.length)return;
  const {width,height}=viewport.frame,compact=width<700&&height>=500,base=coverView(viewport.frame,luoshenSize).scale;
  const availableWidth=compact?width-32:width-Math.min(288,width-32)-72;
  const availableHeight=compact?height*.5-100:height-210;
  const bounds=(items:SceneActor[])=>({left:Math.min(...items.map(a=>a.x-a.width/2)),right:Math.max(...items.map(a=>a.x+a.width/2)),top:Math.min(...items.map(a=>a.y-a.height/2)),bottom:Math.max(...items.map(a=>a.y+a.height/2))});
  let box=bounds(actors);
  // On small viewports keep the first subject legible; the paired-view buttons retain the comparison.
  if(actors.length>1&&((box.right-box.left)*luoshenSize.width*base>availableWidth||(box.bottom-box.top)*luoshenSize.height*base>availableHeight))box=bounds([actors[0]]);
  // At cover scale the scroll cannot pan vertically. On a tall narrow frame,
  // keep the close reading view so lower sleeves/bodies stay above the note.
  const scale=Math.max(base*(compact?1.5:1),Math.min(base*1.3,(availableWidth-32)/((box.right-box.left)*luoshenSize.width),(availableHeight-24)/((box.bottom-box.top)*luoshenSize.height)));
  pan({x:(box.left+box.right)/2,y:(box.top+box.bottom)/2},scale/base,{x:compact?.5:(24+availableWidth/2)/width,y:(90+availableHeight/2)/height});
 }
 function collect(actorId:string){
  const a=luoshenCollectibles.find(a=>a.id===actorId);if(!a)return;const found=luoshenFindings.find(f=>f.id===a.category)!;
  if(a.category==='ribbon')setRibbonRequest({id:a.id,scope});
  if(claimed.current.has(a.category)){setNotice(`已記在冊中：${found.name}`);return;}
  claimed.current.add(a.category);dispatch({type:'collect',category:a.category,actorId:a.id});
  collectionFeedback.enqueue(a.category,found.name,a.x,a.y);
 }
 function inspect(id:string){
  if(blocked)return;
  if(birdContext==='observation'&&(id==='bird'||id==='bird-0'||id==='bird-1')){collect(id==='bird-1'?'bird-1':'bird-0');playBirds();return;}
  if(dragonContext==='observation'&&(id==='dragon-first'||id==='dragon-0')){collect('dragon-0');openDragons();return;}
  if(observation&&id===observation.id){
   if(state.phase==='observe')dispatch({type:'observe',id,step:state.index,observation:state.observation});
   else dispatch({type:'end-observe',id,step:state.ending});
   return;
  }
  if(state.phase==='search'&&id===step.id){dispatch({type:'find',id});return;}
  collect(id);
  if(person(id)){const visit=visits.current[id]??0;visits.current[id]=visit+1;setReply({id,text:luoshenReply(id,visit),token:performance.now()});}
 }
 const resolve:SceneHitResolver=(world,scale,size,actors)=>{
  return resolveLuoshenHit(world,scale,size,actors,observation?.actor);
 };
 function openRibbons(id:string){
  ribbonReturn.current={viewport,focus,folded,bird:birdActive};ribbonViewed.current=false;setRibbonOrigin(id);setFolded(false);setReply(null);playback.offer('ribbon');
 }
 function panRibbons(){const layout=luoshenFigureLayout(viewport.frame);pan(layout.region,layout.scaleRatio,layout.screenAnchor);}
 function playRibbons(){ribbonViewed.current=true;setFocus(false);setFolded(false);setNoticeState(null);panRibbons();playback.play('ribbon');}
 function closeRibbons(){
  const prior=ribbonReturn.current;ribbonReturn.current=null;
  if(state.phase==='search'&&!looking)ribbonExitFocus.current=true;
  if(prior?.bird&&birdContext)playback.showOriginal('bird');else playback.close();
  if(prior){setFocus(prior.focus);setFolded(prior.folded);if(ribbonViewed.current){const v=prior.viewport;pan({x:(v.frame.width/2-v.view.x)/(luoshenSize.width*v.view.scale),y:(v.frame.height/2-v.view.y)/(luoshenSize.height*v.view.scale)},v.view.scale/coverView(v.frame,luoshenSize).scale,{x:.5,y:.5});}}
  ribbonViewed.current=false;
 }
 function panDragons(){const layout=luoshenDragonLayout(viewport.frame);pan(layout.region,layout.scaleRatio,layout.screenAnchor);}
 function openDragons(){setFocus(false);setFolded(false);setReply(null);panDragons();playback.offer('dragon');}
 function playDragons(){setNoticeState(null);panDragons();playback.play('dragon');}
 function closeDragons(){playback.close();if(dragonContext==='interpretation')frameReading(readingActors);}
 function leaveDragons(){playback.close();if(dragonContext==='observation')dispatch({type:'observe',id:'dragon-first',step:state.index,observation:state.observation});else frameReading(readingActors);}
 function panBirds(){pan({x:(8*1995+1220)/luoshenSize.width,y:105/943},viewport.frame.width<700?1.35:2.3);}
 function playBirds(){setBirdReturning(false);birdAfterReturn.current=null;setBirdDrawing(true);setFocus(false);setFolded(false);setNoticeState(null);panBirds();birds.play();}
 function finishBirdReturn(){const after=birdAfterReturn.current;birdAfterReturn.current=null;setBirdReturning(false);setBirdDrawing(false);birds.original();after?.();}
 function birdOriginal(immediate=false){birdAfterReturn.current=null;if(birdScreen&&!immediate){setBirdReturning(true);return;}setBirdReturning(false);setBirdDrawing(false);birds.original();}
 function leaveBirds(){const leave=()=>{birds.close();if(state.phase==='observe')dispatch({type:'observe',id:'bird',step:state.index,observation:state.observation});else frameReading(readingActors);};if(birdScreen){birdAfterReturn.current=leave;setBirdReturning(true);}else leave();}
 function observe(){dispatch({type:'look'});setFocus(false);if(state.index===1)panBirds();else pan(step.observations[0].actor);}
 function next(){dispatch({type:'next'});setFocus(state.index===luoshenSteps.length-1?false:state.focusPreference??true);setStudy(null);setNotice(step.lead);}
 function openJournal(){if(birdActive)birdOriginal(true);collectionFeedback.settle();if(!savedView.current)savedView.current={viewport,focus};setOverlay('journal');setFocus(false);}
 function closeJournal(){setOverlay(null);setLooking(false);const prior=savedView.current;if(prior){const v=prior.viewport;setStudy({region:{x:(v.frame.width/2-v.view.x)/(luoshenSize.width*v.view.scale),y:(v.frame.height/2-v.view.y)/(luoshenSize.height*v.view.scale)},scaleRatio:v.view.scale/coverView(v.frame,luoshenSize).scale,screenAnchor:{x:.5,y:.5},transition:'pan',token:performance.now()});setFocus(prior.focus);}savedView.current=null;}
 function lookFromJournal(id:string,stops:LuoshenLookStop[]=[]){const a=luoshenJournalActor(id);if(a){const items=stops.some(s=>s.id===id)?stops:[{id,label:a.name,text:'比對冠髮、姿態與周圍的場面。'},...stops];setJournalLook({id,stops:items});setLookFolded(false);setOverlay(null);setLooking(true);pan(a,1.5);}}
 function restart(){collectionFeedback.settle();setReadingView(null);dispatch({type:'restart'});setIntro(1);setOverlay(null);setStudy(null);setLooking(false);savedView.current=null;setReset(v=>v+1);setFocus(state.focusPreference??true);visits.current={};}
 const lookIndex=journalLook?.stops.findIndex(s=>s.id===journalLook.id)??-1;
 const lookStop=journalLook?.stops[lookIndex],lookActor=journalLook?luoshenJournalActor(journalLook.id):undefined;
 const noticePlacement=luoshenNoticePlacement(viewport.frame,noteBounds);
 const speechReserved=noteBounds?[noteBounds]:[];
 const noteVisible=['observe','interpret','ending','complete'].includes(state.phase)&&!overlay&&!looking&&!ribbonActive&&!dragonActive;
 useEffect(()=>{if(overlay||!noteVisible&&!looking&&!ribbonActive&&!dragonActive)setNoteBounds(null);},[overlay,noteVisible,looking,ribbonActive,dragonActive]);
 return <main className={`immersive-game lantern-game luoshen-game ${ready?'scene-loaded':''} ${birdScreen?'is-redrawn':''} ${ribbonActive||dragonFramed?'is-figure-context':''} ${dragonFramed?'is-dragon-context':''} ${(ribbonActive||dragonFramed)&&animationLayout.stacked?'is-figure-stacked':''} ${state.phase==='intro'?'is-cover':''} ${overlay==='journal'||looking?'is-journal-open':''} ${(noteVisible||ribbonActive||dragonActive)&&!folded?'has-observation-note':''}`} aria-label="洛神賦圖 · 洛水之間" style={{'--figure-note-height':`${animationLayout.noteMaxHeight}px`} as import('react').CSSProperties}>
 {state.phase!=='intro'&&!overlay&&!looking&&!ribbonActive&&!dragonFramed&&!birdMoving&&!birdReturning&&<button className="luoshen-skip-controls" onClick={()=>hud.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()}>略過人物，前往操作</button>}
 <ScrollScene keyboardNavigation image={luoshenImage} tiles={luoshenTiles} requireTiles artworkSize={luoshenSize} actors={allActors} active={state.phase!=='intro'&&ready} blocked={blocked} resetKey={reset} initialRegion={{x:state.index<6?person(step.id).x:.08,y:.5}} focusing={focus} onReady={setReady} onInspect={inspect} hitResolver={resolve} onMiss={()=>setReply(null)} onExplore={()=>setReply(null)} motion={false} steam={null} title="洛神賦圖" description="北京故宮藏洛神賦圖宋摹本完整畫心，由右往左追尋曹植與洛神的相遇、流連、離別與追懷" studyCommand={study} command={command} zoomStops={zoomStops} hint={null} onViewportChange={setViewport} onViewChange={setScrollWindow}/>
 {state.phase==='intro'?<section className={`introduction lantern-introduction ${entering?'is-entering':''}`} inert={entering} aria-label="洛水之間引言"><div className="intro-brand"><span/>畫中尋人</div><div className="intro-content"><div className="intro-copy"><div className="intro-narrative" aria-live="polite"><div className="intro-lines" key={intro}><p className="intro-chapter">{dragonTrial?'雙鳥與龍形觀察 · 試玩':ribbonTrial?'衣帶收藏與雙鳥 · 試玩':birdTrial?'重繪鳥形觀察 · 試玩':'宋摹本 · 洛神賦圖'}</p><p className="intro-story">{intro===0?'故事裡，曹植行經洛水，\n遇見神女洛神。\n人與神的相遇，卻不能長留。':'為何同一個人，\n在畫中反覆出現？\n尋找六處身影，讀懂這場相遇。'}</p>{intro===1&&<p className="luoshen-intro-help">{dragonTrial?'找到洛神，再看雙鳥與龍形；試玩不改動原有進度。':ribbonTrial?'從初見場面探索衣帶與雙鳥；試玩不改動原有進度。':birdTrial?'由第二次尋找洛神開始；試玩不改動原有進度。':'拖動畫卷，點人物；需要時再看提示。'}</p>}{intro===1&&<figure className="luoshen-intro-face"><LuoshenPortrait id={step.id} label={`本次要找的${step.name}去背樣貌摹繪`}/><figcaption>樣貌摹繪 · {step.name}</figcaption></figure>}</div></div><button className="intro-enter" disabled={entering||(intro===1&&!ready)} onClick={()=>intro===0?setIntro(1):setEntering(true)}><span>{intro===0?'展開這一卷':ready?(state.index||state.resumePhase&&state.resumePhase!=='search')?'繼續這一卷':'入畫尋人':'正在展卷'}</span><ArrowRight size={23}/></button><div className="intro-sequence"><button className="intro-back" style={{visibility:intro?'visible':'hidden'}} onClick={()=>setIntro(0)}>前一幕</button><div className="intro-progress" role="img" aria-label={`引言第${intro+1}幕，共兩幕`}><span className="is-read"/><span className={intro?'is-read':''}/></div></div></div><div className="intro-title"><h1>洛水之間</h1><span className="intro-seal" aria-hidden>尋人</span></div></div><div className="intro-footer"><p>北京故宮博物院藏 · 宋摹本 · 文學故事畫</p><ChapterLinks current="luoshen"/></div></section>:<>
 <header ref={hud} id="luoshen-controls" className="lantern-hud" inert={Boolean(overlay)||state.phase==='found'||birdMoving||birdReturning||ribbonActive||dragonFramed}>{state.phase==='search'&&!ribbonActive&&<section className="lantern-target" aria-label="本次人物提示"><button className="lantern-face-reference" aria-label="放大人物樣貌" onClick={()=>setOverlay('hint')}><LuoshenPortrait id={step.id} label={`${step.name}的去背樣貌摹繪`}/></button><div><p className="lantern-eyebrow">尋人 · {state.index+1}／6</p><h1>尋找{step.name}的身影</h1><p className="lantern-progress">已尋得 {state.index}／6 處</p></div></section>}<div className="lantern-tools"><button className="lantern-mode" aria-pressed={focus} onClick={toggleFocus}>{focus?'轉回彩色':'凝神觀察'}</button><button className="round-control" aria-busy={sound.state==='loading'} aria-label={sound.state==='loading'?'取消載入音樂':sound.state==='on'?'關閉音樂':'開啟本章音樂'} aria-pressed={sound.state==='on'} onClick={()=>void sound.toggle()}>{sound.state==='on'?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="round-control" aria-label="切換全螢幕" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen?.();else void document.documentElement.requestFullscreen?.().catch(()=>setNotice('此環境暫不支援全螢幕。'));}}><Maximize size={18}/></button><button className="round-control" aria-label="畫卷操作" onClick={()=>setOverlay('menu')}><MoreHorizontal size={20}/></button></div></header>
 <footer className="lantern-footer" inert={Boolean(overlay)||state.phase==='found'||birdMoving||birdReturning||ribbonActive||dragonFramed}><button ref={book} className={`lantern-quiet-button lantern-journal-button ${receiving?'is-spark-arriving':''}`} onClick={openJournal}><BookOpen size={18}/>見聞冊 <span>{journalCount}／{luoshenFindings.length}</span></button><LanternNavigator image={luoshenImage} window={scrollWindow} stops={[{x:.88,label:'相遇'},{x:.60,label:'流連'},{x:.31,label:'離別'},{x:.12,label:'追懷'}]} onNavigate={x=>pan({x,y:.5},1)}/>{state.phase==='search'?<button className="lantern-quiet-button" onClick={()=>setOverlay('hint')}><CircleHelp size={18}/>給我提示</button>:<button className="lantern-quiet-button" onClick={()=>setOverlay('sources')}>畫作小記</button>}</footer>
 {notice&&!overlay&&<div className="luoshen-notice" style={{'--notice-left':`${noticePlacement.left}px`,'--notice-top':noticePlacement.top===null?'auto':`${noticePlacement.top}px`,'--notice-bottom':noticePlacement.bottom===null?'auto':`${noticePlacement.bottom}px`,'--notice-width':`${noticePlacement.width}px`} as import('react').CSSProperties}><LanternNotice key={notice.token} text={notice.text} quiet duration={3600}/></div>}{sound.state==='error'&&<div className="lantern-status" role="status">音樂暫未載入，再次按音樂開關可重試。</div>}
 </>}
 {birdScreen&&<LuoshenRedrawnBird viewport={viewport} playing={playback.mode==='playing'&&!birdReturning} show={!birdReturning} onHidden={finishBirdReturn} ticket={playback.ticket} onDone={()=>playback.finish(playback.ticket)} onError={()=>{setBirdDrawing(false);playback.fail(playback.ticket);}}/>}
 {dragonActive&&playback.mode==='playing'&&!overlay&&<LuoshenDragonAnimation key={playback.ticket} viewport={viewport} onDone={()=>playback.finish(playback.ticket)} onError={()=>playback.fail(playback.ticket)}/>}
 {dragonActive&&!overlay&&<LuoshenNote compact onBounds={setNoteBounds} viewport={viewport} label="飛鳥與龍形 · 原畫對照" title="婉若游龍" folded={folded} onFold={()=>setFolded(v=>!v)} busy={busy} primaryAction={<><button className="lantern-note-next" disabled={dragonMoving} onClick={playDragons}>{playback.mode==='offered'?'看龍形演繹':dragonMoving?'龍形回轉中…':'再看一次'} <span>→</span></button><div className="lantern-note-tabs"><button onClick={playback.original}>返回原畫</button><button disabled={dragonMoving} onClick={leaveDragons}>{dragonContext==='observation'?'圖文對讀':'回到圖文對讀'}</button></div></>}>
 <p className="lantern-note-body" aria-live="polite">{playback.mode==='playing'?'頸首輕轉，前肢與尾端隨後。':'龍形的回轉，與神女的身姿對看。'}</p>
 <p className="lantern-note-caption" role={playback.mode==='failed'?'status':undefined}>{playback.mode==='failed'?'演繹暫未載入；可重試或繼續看原畫。':'重繪演繹；播完回到原畫。'}</p>
 </LuoshenNote>}
 {ribbonActive&&playback.mode==='playing'&&!overlay&&<LuoshenRibbonAnimation key={playback.ticket} viewport={viewport} onDone={()=>playback.finish(playback.ticket)} onError={()=>playback.fail(playback.ticket)}/>}
 {ribbonActive&&!overlay&&<LuoshenNote compact onBounds={setNoteBounds} viewport={viewport} anchor={luoshenCollectibles.find(a=>a.id===(ribbonViewed.current?'ribbon-0':ribbonOrigin))} label="衣帶收藏 · 初見衣帶" title="洛神的身姿" folded={folded} onFold={()=>setFolded(v=>!v)} busy={busy} primaryAction={<><button className="lantern-note-next" disabled={ribbonMoving} onClick={playRibbons}>{playback.mode==='offered'?(ribbonOrigin==='ribbon-0'?'看洛神身姿':'回看初見衣帶輕擺'):ribbonMoving?'身姿演繹中…':'再看一次'} <span>→</span></button><div className="lantern-note-tabs">{playback.mode!=='offered'&&<button onClick={playback.original}>返回原畫</button>}<button onClick={closeRibbons}>{looking?'回到原畫對照':'繼續探索'}</button></div></>}>
 <p className="lantern-note-body" aria-live="polite">{playback.mode==='offered'?(ribbonOrigin==='ribbon-0'?'衣帶在身旁延展，襯出姿態的輕盈。':'衣帶已記在冊中。回看初見洛神身旁的衣帶。'):playback.mode==='playing'?'洛神輕傾回轉，手勢與衣帶隨後。':'衣帶回轉，連著神女的姿態來看。'}</p>
 <p className="lantern-note-caption">{playback.mode==='failed'?'演繹暫未載入，可重試或繼續探索。':'重繪演繹；播完回到原畫。'}</p>
 </LuoshenNote>}
 {state.phase==='found'&&!overlay&&<LuoshenSpeech actor={person(step.id)} viewport={viewport} text={step.speech} action="近看原畫" onAction={observe}/>}
 {reply&&!blocked&&<LuoshenSpeech actor={person(reply.id)} viewport={viewport} text={reply.text} reserved={speechReserved}/>}
 {noteVisible&&<LuoshenNote compact onBounds={setNoteBounds} reading={state.phase==='interpret'||state.phase==='complete'} primaryAction={birdActive?<button className="lantern-note-next" disabled={birdMoving||birdReturning} onClick={leaveBirds}>{state.phase==='observe'?'再看龍形':'回到圖文對讀'} <span>→</span></button>:state.phase==='complete'?<button className="lantern-note-next" onClick={()=>setFolded(true)}>自由探索 <span>→</span></button>:state.phase==='interpret'?<button className="lantern-note-next" onClick={next}>繼續故事 <span>→</span></button>:state.phase==='ending'&&state.endingSeen?<button className="lantern-note-next" onClick={()=>{dispatch({type:'end-next'});setStudy(null);}}>繼續 <span>→</span></button>:undefined} anchor={observation?.actor??(state.phase==='ending'?ending?.observation.actor:person(step.id))} viewport={viewport} folded={folded} onFold={()=>setFolded(v=>!v)} busy={busy} label={state.phase==='complete'?'足往心留':state.phase==='ending'?`${ending?.title} · ${state.ending+1}／${luoshenEnding.length}`:state.phase==='observe'?`${step.noteTitle} · ${state.observation+1}／${step.observations.length}`:`${step.noteTitle} · 回看`}  title={state.phase==='complete'?'不同時刻的身影':state.phase==='ending'?ending?.title??'洛水之間':step.title}>
 {birdActive?<><p className="lantern-note-body" aria-live="polite">{birds.mode==='preparing'?'先看原畫中的雙鳥。':birds.mode==='playing'?'兩翼起落，羽尖隨後。':birdScreen?'可移動畫卷，或返回原畫對照。':'雙鳥展翼，可與「翩若驚鴻」對讀。'}</p><p className="lantern-note-caption">{birds.mode==='failed'?'演繹暫未載入，可重試或繼續看原畫。':'鳥形依原畫重繪 · 遊戲演繹。'}</p><div className="lantern-note-tabs"><button disabled={birdMoving||birdReturning} onClick={playBirds}>再看一次</button><button onClick={()=>birdOriginal()}>返回原畫</button></div></>:state.phase==='observe'&&<><p className="lantern-note-body" aria-live="polite">{observation?.question}</p><button className="lantern-note-secondary" onClick={event=>{if(observation)nearDetail(observation.actor,1.5,event.detail===0);}}>靠近看</button></>} 
 {state.phase==='interpret'&&!birdActive&&<><p className="lantern-note-body">{step.noteResult}</p><div className="lantern-note-tabs" aria-label="對照原畫">{step.comparisons.map(item=><button key={item.label} aria-pressed={readingActors.join()===item.actors.join()} onClick={()=>setReadingView({index:state.index,actors:item.actors})}>{item.label}</button>)}</div>{state.index===1&&<div className="lantern-note-tabs"><button onClick={playBirds}>重看鳥形演繹</button><button onClick={openDragons}>重看龍形演繹</button></div>}<details key={step.id} className="luoshen-reading-supplement"><summary>圖文小記</summary><p>{step.result}</p><p>{step.supplement}</p></details></>}
 {state.phase==='ending'&&ending&&<><p className="lantern-note-body">{state.endingSeen?ending.result:ending.question}</p>{state.endingSeen?<><details className="luoshen-reading-supplement"><summary>圖文小記</summary><p>{'supplement' in ending?ending.supplement:'這段解讀連同《洛神賦》閱讀；人物身分依本卷冠髮與場景比對。'}</p></details></>:<><button className="lantern-note-secondary" onClick={event=>nearDetail(ending.observation.actor,1.4,event.detail===0)}>靠近看</button></>}</>}
 {state.phase==='complete'&&<><p className="lantern-note-body">反覆的身影，串起相遇與離別。人已上路，心仍留在洛水。</p><div className="lantern-note-tabs"><button onClick={()=>pan(person('C1'),1.3)}>回看初遇</button><button onClick={()=>pan(person('L9'),1.3)}>回看雲車</button></div><button className="lantern-note-secondary" onClick={openJournal}>回看見聞冊</button><button className="lantern-note-secondary" onClick={restart}>再尋一次（保留收藏）</button></>}
 </LuoshenNote>}
 {flight&&<div key={flight.token} className="lantern-spark-discovery" aria-hidden><div className="lantern-spark-source" style={{left:flight.x,top:flight.y}}><img className="lantern-firelight-token luoshen-flight-image" src={assetPath(`art/luoshen/collection-${flight.category}-cutout.png`)} alt="" style={{'--token-x':`${flight.dx}px`,'--token-y':`${flight.dy}px`,'--arc-x':`${flight.dx*.48}px`,'--arc-y':`${flight.dy*.48-85}px`} as import('react').CSSProperties}/></div></div>}
 {looking&&!ribbonActive&&journalLook&&lookStop&&lookActor&&<LuoshenNote compact onBounds={setNoteBounds} viewport={viewport} anchor={lookActor} folded={lookFolded} onFold={()=>setLookFolded(v=>!v)} busy={busy} label={`原畫對照 · ${lookIndex+1}／${journalLook.stops.length}`} title={lookStop.label}><p className="lantern-note-body">{lookStop.label}：{lookStop.text}</p>{journalLook.id==='ribbon-0'&&<button className="lantern-note-secondary" onClick={()=>openRibbons('ribbon-0')}>看洛神身姿</button>}<div className="lantern-note-tabs">{lookIndex>0&&<button onClick={()=>lookFromJournal(journalLook.stops[lookIndex-1].id,journalLook.stops)}>上一處</button>}{lookIndex<journalLook.stops.length-1&&<button onClick={()=>lookFromJournal(journalLook.stops[lookIndex+1].id,journalLook.stops)}>下一處</button>}</div></LuoshenNote>}
 {looking&&!ribbonActive&&<button ref={returnToBook} className="collection-return" onClick={()=>{setLooking(false);setOverlay('journal');}}>回到見聞冊 →</button>}
 {overlay==='hint'&&<ChapterDialog className="lantern-appearance-help" label="可曾見過此人" onClose={()=>setOverlay(null)}><p className="lantern-eyebrow">尋人 · 提示 {hintDepth+1}／3</p><h2>尋找{step.name}</h2><div className="lantern-appearance-body"><figure className="lantern-appearance-figure"><LuoshenPortrait id={step.id} label={`${step.name}去背樣貌摹繪`}/><figcaption>去背樣貌摹繪 · 原畫為準</figcaption></figure><div className="lantern-appearance-copy"><p>{hintDepth===0?step.appearance:hintDepth===1?step.hint:step.region}</p><button className="lantern-return-link" onClick={()=>setOverlay(null)}>回畫中尋人 <ArrowRight size={18}/></button></div></div><div className="lantern-appearance-footer"><button className="lantern-text-button" onClick={()=>setOverlay('menu')}>怎樣移動畫卷</button><button className="lantern-text-button" onClick={()=>{if(hintDepth<2)setHintDepth(v=>v+1);else{setOverlay(null);pan({x:Math.round(person(step.id).x*50)/50,y:.5},1);}}}>{hintDepth===0?'看看衣著與姿勢':hintDepth===1?'看看場面線索':'帶我到大致區域'}</button></div></ChapterDialog>}
 {overlay==='menu'&&<ChapterDialog label="畫卷操作" onClose={()=>setOverlay(null)}><h2>畫卷操作</h2>{!storageAvailable&&<p role="status">存檔暫不可用，本次仍可繼續；關閉頁面前請留意。</p>}<ul className="luoshen-control-help"><li>拖曳移動畫卷，滾輪縮放；手機用雙指移動與縮放。</li><li>凝神時，單指移動光區；按 F 或右上按鈕可切換彩色。</li><li>Tab 選取人物或操作，Enter 點看；彩色時左右鍵移畫，＋／－縮放，F 切換凝神。</li></ul><div className="lantern-menu-controls">{([['in','放大'],['out','縮小'],['overview','回到卷首']] as const).map(([type,label])=><button key={type} className="small-button" onClick={()=>{setOverlay(null);if(type==='overview')pan(person('C1'),1);else setCommand({type,token:performance.now()});}}>{label}</button>)}</div><p><button className="lantern-text-button" onClick={()=>setOverlay('sources')}>畫作小記與資料來源</button></p><div className="lantern-paper-actions"><button className="lantern-text-button" onClick={restart}>再尋一次（保留收藏）</button><button className="lantern-text-button" onClick={returnToChapterCover}>回本章封面</button></div><ChapterLinks current="luoshen"/></ChapterDialog>}
 {overlay==='sources'&&<ChapterDialog label="洛神賦圖小記" onClose={()=>setOverlay(null)}><h2>洛神賦圖小記</h2><p>北京故宮博物院藏 · 宋摹本 · 絹本設色。原本傳為顧愷之作，現存本不當作東晉親筆。</p><p>畫卷依曹植《洛神賦》的文學故事展開。曹植與洛神反覆出現，串起不同時刻。開首相遇與雲車離去有館方文字支持，其他重複身影依冠髮、衣飾與場景比對指認，仍有研究空間。</p><p>人物短對白為遊戲虛構；場景原畫沒有補畫或生成。鳥形振翅以 AI 重繪素材在原畫位置分層演繹，局部生成補底暫時遮蓋原有鳥形；並非原畫復原，可隨時返回原畫完整對照。初見洛神改以完整重繪人物及局部生成補底演繹，頭頸、持物手臂、軀幹及兩條衣帶分件微動；周邊山石及絹底不動。龍形依原畫重繪，上下頸、軀幹、前後肢及尾端分件活動，只在演繹時使用局部生成補底；雙鳥與周邊絹底保持固定。三段都是遊戲演繹，不同時播放。提示人像與收藏圖樣為依原畫製作的摹繪／插畫，原畫對照另存。古文短句與畫面對讀，不將神女故事當成史實，也不將洛神等同甄后的傳聞當成定論。</p><details><summary>來源與素材說明</summary>{luoshenSources.map(s=><p key={s.href}><a href={s.href} target="_blank" rel="noreferrer">{s.label}</a></p>)}<p className="lantern-source-note">原畫影像來源為故宮博物院，遊戲保留完整畫心。人物身分的比對仍有研究空間。影像及衍生圖樣的使用範圍、正式署名尚待確認，目前未有館方授權憑證。</p></details><p className="lantern-source-note">配樂：《洛水微波》· 本專案原創程式合成，無外部採樣。現代背景音樂，不是歷史曲目復原。</p></ChapterDialog>}
 {overlay==='journal'&&<LuoshenJournal state={state} view={journalView} onView={setJournalView} onClose={closeJournal} onLook={lookFromJournal}/>}
 </main>;
}
