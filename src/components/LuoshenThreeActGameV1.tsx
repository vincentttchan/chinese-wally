import {LuoshenThreeActEntryV1} from './LuoshenThreeActEntryV1.tsx';
import {LuoshenOpeningSleeveAnimation} from './LuoshenOpeningSleeveAnimation.tsx';
import {openingCaoActor,openingSleevePairActor} from '../game/luoshenOpeningSleeveRenderer.ts';
import {luoshenDetailLayout,luoshenDetailReplies} from '../game/luoshenDetail.ts';
import {LuoshenCloudCarAnimation} from './LuoshenCloudCarAnimation.tsx';
import {luoshenCloudCarLayout} from '../game/luoshenCloudCarLayout.ts';
import {useCallback,useEffect,useReducer,useRef,useState} from 'react';
import {preload} from 'react-dom';
import {luoshenFarewellLayout} from '../game/luoshenFarewellLayout.ts';
import {LuoshenFarewellAnimation,LuoshenFarewellPairAnimation} from './LuoshenFarewellAnimation.tsx';
import {LuoshenFarewellDiscovery,farewellStudies} from './LuoshenFarewellDiscovery.tsx';
import {luoshenHairLayout} from '../game/luoshenHairLayout.ts';
import {luoshenRelationshipLayout} from '../game/luoshenRelationshipLayout.ts';
import {LuoshenHairStudies,hairstyleStudies} from './LuoshenHairDiscovery.tsx';
import {LuoshenPoemBook} from './LuoshenPoemBook.tsx';
import {luoshenReading} from '../game/luoshenReading.ts';
import '../qingming.css';
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
import {resolveLuoshenHit,luoshenFacePoints} from '../game/luoshenHit.ts';
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
import {figureBounds,luoshenFigureLayout} from '../game/luoshenFigureLayout.ts';
type Overlay='hint'|'menu'|'sources'|'journal'|'poem'|null;
const zoomStops=[1,1.25,1.6,2,2.6,3.4];
export function LuoshenThreeActGameV1({birdTrial=false,ribbonTrial=false,dragonTrial=false,dragonTapTrial=false,artTapTrial,hairstyleTrial=false,farewellTrial=false,cloudCarTrial=false,sleeveTrial=false}:{birdTrial?:boolean;ribbonTrial?:boolean;dragonTrial?:boolean;dragonTapTrial?:boolean;artTapTrial?:'bird'|'figure'|'reading';hairstyleTrial?:boolean;farewellTrial?:boolean;cloudCarTrial?:boolean;sleeveTrial?:boolean}={}){
 const isolatedTrial=Boolean(birdTrial||ribbonTrial||dragonTrial||dragonTapTrial||artTapTrial||hairstyleTrial||farewellTrial||cloudCarTrial||sleeveTrial);
 const [state,dispatch]=useReducer(luoshenReducer,undefined,()=>sleeveTrial?{phase:'observe' as const,index:0,observation:0,ending:0,endingSeen:false,focusPreference:false,origins:{}}:cloudCarTrial?{phase:'observe' as const,index:4,observation:0,ending:0,endingSeen:false,focusPreference:false,origins:{}}:farewellTrial?{phase:'observe' as const,index:3,observation:0,ending:0,endingSeen:false,focusPreference:false,origins:{}}:hairstyleTrial?{phase:'observe' as const,index:2,observation:0,ending:0,endingSeen:false,focusPreference:false,origins:{}}:artTapTrial?{phase:artTapTrial==='reading'?'interpret' as const:'observe' as const,index:1,observation:0,ending:0,endingSeen:false,focusPreference:false,origins:{}}:dragonTapTrial?{phase:'observe' as const,index:1,observation:1,ending:0,endingSeen:false,focusPreference:false,origins:{}}:isolatedTrial?{phase:'intro' as const,index:1,observation:0,ending:0,endingSeen:false,focusPreference:true,origins:{}}:initialLuoshen());
 const [ready,setReady]=useState(false),[entering,setEntering]=useState(false),[reset,setReset]=useState(0),[focus,setFocus]=useState(state.focusPreference??true);
 const [entryStarted,setEntryStarted]=useState(false),[coverVisible,setCoverVisible]=useState(true),[coverLeaving,setCoverLeaving]=useState(false);
 const prepareEntry=useCallback(()=>setCoverLeaving(true),[]),revealEntry=useCallback(()=>setCoverVisible(false),[]);
 const entryTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(entryTimer.current)clearTimeout(entryTimer.current);},[]);
 const resumePending=useRef(Boolean(state.resumePhase)),artTapBoot=useRef(artTapTrial);
 useEffect(()=>{if(!ready||!artTapBoot.current)return;const kind=artTapBoot.current;artTapBoot.current=undefined;if(kind==='bird')panBirds();else if(kind==='figure')openRibbons('ribbon-0');},[ready]);
 const [storageAvailable,setStorageAvailable]=useState(true);
 const hud=useRef<HTMLElement>(null),returnToBook=useRef<HTMLButtonElement>(null);
 function toggleFocus(){const value=!focus;const change=()=>{setFocus(value);dispatch({type:'focus',value});};if(birdScreen){birdAfterReturn.current=change;setBirdReturning(true);}else change();}
 const [noteBounds,setNoteBounds]=useState<LuoshenPanelRect|null>(null);
 const [poemReturned,setPoemReturned]=useState<Record<number,boolean>>({});
 const [poemRead,setPoemRead]=useState<Record<number,number[]>>({}),[poemSelection,setPoemSelection]=useState<number|null>(null);
 const poemFrame=useRef<{width:number;height:number}|null>(null);
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
 // ScrollScene's inactive introduction defaults to the left edge; compose only this version's cover.
 useEffect(()=>{
  if(!ready||state.phase!=='intro'||entryStarted)return;
  setStudy({region:{x:state.index===0?.885:state.index<6?person(step.id).x:.08,y:.5},scaleRatio:1,transition:'instant',token:performance.now()});
 },[ready,state.phase,entryStarted,viewport.frame.width,viewport.frame.height]);
 const observation=state.phase==='observe'?step.observations[state.observation]:state.phase==='ending'&&!state.endingSeen?ending?.observation:undefined;
 const cloudCarContext=state.index===4&&state.phase==='observe'&&state.observation===0;
 const cloudCarLayout=luoshenCloudCarLayout(viewport.frame);
 const cloudCarGuideFrame=useRef('');
 const farewellContext=state.index===3&&state.phase==='observe';
 const farewellFeedback=farewellContext&&Boolean(state.farewellSeen);
 const [farewellReplay,setFarewellReplay]=useState(0);
 const farewellGuideFrame=useRef('');
 const farewellLayout=luoshenFarewellLayout(viewport.frame,state.phase==='interpret'?'pair':state.observation===1?'cao':'goddess');
 useEffect(()=>{if(state.index===3&&state.phase!=='intro')farewellStudies.forEach(study=>preload(assetPath('art/luoshen/'+study.file),{as:'image'}));},[state.index,state.phase==='intro']);
 const hairContext=state.index===2&&state.phase==='observe';
 const hairLayout=luoshenHairLayout(viewport.frame,state.observation);
 useEffect(()=>{if(state.index===2&&state.phase!=='intro')hairstyleStudies.forEach(study=>preload(assetPath('art/luoshen/'+study.file),{as:'image'}));},[state.index,state.phase==='intro']);
 const hairStage=state.index===2&&state.phase==='observe'&&state.observation<2;
 const hairFeedback=hairStage&&Boolean(state.hairSeen);
 const [hairReplay,setHairReplay]=useState(0);
 const hairGuideFrame=useRef('');
 const readingComplete=Boolean(poemReturned[state.index]);
 const readingActors=readingView?.index===state.index?readingView.actors:step.reading;
 const farewellPairContext=state.index===3&&state.phase==='interpret'&&readingActors.join()==='L8,C3';
 const farewellPairRequested=useRef(false);
 const scope=`${state.phase}:${state.index}:${state.observation}:${state.ending}:${state.endingSeen}`;
 const [birdDrawing,setBirdDrawing]=useState(false),[birdReturning,setBirdReturning]=useState(false);
 const birdAfterReturn=useRef<(()=>void)|null>(null);
 const [ribbonRequest,setRibbonRequest]=useState<{id:string;scope:string}|null>(null),[ribbonOrigin,setRibbonOrigin]=useState('ribbon-0');
 const ribbonReturn=useRef<{viewport:SceneViewport;focus:boolean;folded:boolean;bird:boolean}|null>(null),ribbonViewed=useRef(false),ribbonExitFocus=useRef(false);
 const birdContext=state.index===1?(state.phase==='observe'&&observation?.id==='bird'?'observation':state.phase==='interpret'?'interpretation':null):null;
 const dragonContext=state.index===1?(state.phase==='observe'&&observation?.id==='dragon-first'?'observation':state.phase==='interpret'?'interpretation':null):null;
 const ordinaryDetail=state.phase==='observe'&&!hairStage&&!farewellContext&&!birdContext&&!dragonContext&&!cloudCarContext;
 const detailFramed=!looking&&(ordinaryDetail||state.phase==='ending');
 const openingSleeveContext=ordinaryDetail&&state.index===0;
 const [openingReplay,setOpeningReplay]=useState<{scope:string;figure:'cao'|'companion'}|null>(null);
 const openingSleeveFigure=openingReplay?.scope===scope?openingReplay.figure:state.observation===1?'companion':'cao',openingSleeveName=openingSleeveFigure==='cao'?'曹植':'同行者';
 const detailActor=openingSleeveContext?(state.observation===0?openingCaoActor:openingSleevePairActor):observation?.actor??ending?.observation.actor??step.observations[0].actor;
 const detailLayout=luoshenDetailLayout(viewport.frame,detailActor);
 const detailFeedback=ordinaryDetail&&state.detailSeen===observation?.id;
 const [detailReplay,setDetailReplay]=useState(0),[sleeveSettled,setSleeveSettled]=useState('');
 const sleeveTicket=`${scope}:${detailReplay}`,sleeveReady=!openingSleeveContext||detailFeedback&&detailReplay===0||sleeveSettled===sleeveTicket;
 const detailGuideFrame=useRef('');
 const playback=useLuoshenAnimationPlayback(scope,busy,collectionFeedback.pendingCount);
 const openingSleeveActive=openingSleeveContext&&playback.kind==='opening-sleeve',openingSleeveMoving=openingSleeveActive&&(playback.mode==='preparing'||playback.mode==='playing');
 const birds={...playback,play:()=>playback.play('bird')};
 const cloudCarFramed=!looking&&(cloudCarContext||state.index===4&&state.phase==='interpret'&&readingActors.includes('cloud-car'));
 const cloudCarActive=playback.kind==='cloudcar'&&cloudCarFramed;
 const cloudCarMoving=cloudCarActive&&(playback.mode==='playing'||playback.mode==='preparing');
 const farewellActive=playback.kind==='farewell'&&(farewellContext||farewellPairContext);
 const farewellMoving=farewellActive&&(playback.mode==='preparing'||playback.mode==='playing');
 const birdActive=playback.kind==='bird'&&Boolean(birdContext),birdMoving=birdActive&&(playback.mode==='preparing'||playback.mode==='playing');
 const birdScreen=birdActive&&birdDrawing&&(playback.mode==='playing'||playback.mode==='still')&&!overlay&&!looking;
 useEffect(()=>{if(!birdActive||playback.mode==='failed'){setBirdDrawing(false);setBirdReturning(false);birdAfterReturn.current=null;}},[birdActive,playback.mode]);
 const ribbonActive=playback.kind==='ribbon',ribbonMoving=ribbonActive&&(playback.mode==='preparing'||playback.mode==='playing');
 const dragonActive=playback.kind==='dragon'&&Boolean(dragonContext),dragonMoving=dragonActive&&(playback.mode==='preparing'||playback.mode==='playing');
 const dragonFramed=!looking&&!ribbonActive&&(dragonActive||dragonContext==='observation');
 const relationshipFramed=state.index===2&&state.phase==='interpret'&&readingActors.join()==='L7,C2'&&!looking&&!ribbonActive;
 const farewellPairFramed=farewellPairContext&&!looking&&!ribbonActive;
 useEffect(()=>{if(!farewellPairRequested.current)return;if(!farewellPairContext){if(!farewellContext)farewellPairRequested.current=false;return;}if(!ready||overlay||looking)return;farewellPairRequested.current=false;playback.play('farewell');},[scope,ready,overlay,looking]);
 const farewellVisible=(farewellContext||farewellPairFramed)&&!looking&&!ribbonActive;
 const relationshipLayout=luoshenRelationshipLayout(viewport.frame);
 const animationLayout=farewellPairFramed?farewellLayout:relationshipFramed?relationshipLayout:dragonFramed?luoshenDragonLayout(viewport.frame):luoshenFigureLayout(viewport.frame);
 useEffect(()=>{if(dragonContext==='observation')panDragons();},[scope]);
 useEffect(()=>{if(playback.mode==='playing')setNoticeState(null);},[playback.mode]);
 useEffect(()=>{setRibbonRequest(null);ribbonReturn.current=null;},[scope]);
 useEffect(()=>{if(!ribbonRequest)return;if(ribbonRequest.scope!==scope||overlay||looking){setRibbonRequest(null);return;}if(!busy&&!birdMoving&&!birdReturning&&!collectionFeedback.pendingCount&&ready){openRibbons(ribbonRequest.id,true);setRibbonRequest(null);}},[ribbonRequest,scope,overlay,looking,busy,birdMoving,birdReturning,collectionFeedback.pendingCount,ready]);
 useEffect(()=>{if(ribbonExitFocus.current&&!ribbonActive&&!busy&&!overlay){ribbonExitFocus.current=false;hud.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({preventScroll:true});}},[ribbonActive,busy,overlay]);
 const blocked=openingSleeveMoving||cloudCarMoving||farewellMoving||ribbonMoving||dragonMoving||birdMoving||birdReturning||state.phase==='intro'||state.phase==='found'||Boolean(overlay)||busy||!ready;
 const sound=useAmbience(blocked||state.phase==='observe'||state.phase==='interpret'||state.phase==='ending',chapterMusicTracks.luoshen);
 const dragonStudyActor=luoshenSteps[1].observations[1].actor;
 const birdStudyActor=luoshenSteps[1].observations[0].actor;
 const figureStudyActor:SceneActor={id:'figure-L1',name:'洛神，點看身姿演繹',kind:'observation',x:(figureBounds.left+figureBounds.right)/2/luoshenSize.width,y:(figureBounds.top+figureBounds.bottom)/2/luoshenSize.height,width:(figureBounds.right-figureBounds.left)/luoshenSize.width,height:(figureBounds.bottom-figureBounds.top)/luoshenSize.height};
 const cloudCarStudyActor=luoshenSteps[4].observations[0].actor;
 const allActors=ribbonActive?[figureStudyActor]:dragonActive?[{...dragonStudyActor,name:'龍形，點看回轉演繹'}]:[...luoshenPeople.filter(a=>observation?.id!==`observe-${a.id}`),...luoshenCollectibles,...(observation?[observation.actor]:[]),...(cloudCarFramed&&observation?.id!=='cloud-car'?[cloudCarStudyActor]:[]),...(birdActive&&observation?.id!=='bird'?[{...birdStudyActor,name:'飛鳥，點看振翅演繹'}]:[])];
 useEffect(()=>{if(!isolatedTrial)setStorageAvailable(saveLuoshen(state));},[state,isolatedTrial]);
 useEffect(()=>{if(!resumePending.current||state.phase==='intro'||!ready)return;resumePending.current=false;if(state.phase==='observe'||state.phase==='ending'){setFocus(false);if(dragonFramed)panDragons();else if(farewellContext)pan(farewellLayout.region,farewellLayout.scaleRatio,farewellLayout.screenAnchor);else if(hairContext)pan(hairLayout.region,hairLayout.scaleRatio,hairLayout.screenAnchor);else if(observation)pan(observation.actor,1.5);}else if(state.phase==='interpret'||state.phase==='complete')setFocus(false);},[state.phase,ready]);

 useEffect(()=>{const old=document.title;document.title='洛水之間 · 三幕入場 1.0.0 本機版';return()=>{document.title=old;};},[]);
 useEffect(()=>{setHintDepth(0);setFolded(false);setReply(null);},[state.index,state.phase,state.observation,state.ending]);
 useEffect(()=>{if(!reply)return;const t=setTimeout(()=>setReply(null),3500);return()=>clearTimeout(t);},[reply]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNoticeState(null),3600);return()=>clearTimeout(t);},[notice]);
 useEffect(()=>()=>{if(panTimer.current)clearTimeout(panTimer.current);},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.defaultPrevented||overlay||state.phase==='intro')return;if(openingSleeveMoving){if(e.key==='Escape'){e.preventDefault();playback.original();setSleeveSettled(sleeveTicket);}return;}if(cloudCarMoving||farewellMoving){if(e.key==='Escape'){e.preventDefault();playback.original();document.querySelector<HTMLElement>('.luoshen-note-compact')?.focus({preventScroll:true});}return;}if(dragonActive){if(e.key==='Escape'){e.preventDefault();if(dragonMoving)playback.original();else closeDragons();document.querySelector<HTMLElement>('.luoshen-note-compact')?.focus({preventScroll:true});}return;}if(ribbonActive){if(e.key==='Escape'){e.preventDefault();if(ribbonMoving)playback.original();else closeRibbons();}return;}if(birdMoving||birdReturning||(birdScreen&&e.key==='Escape')){if(e.key==='Escape'){e.preventDefault();birdOriginal();document.querySelector<HTMLElement>('.luoshen-note-compact')?.focus({preventScroll:true});}return;}if(e.key.toLowerCase()==='f'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();toggleFocus();}if(e.key==='Escape'){setReply(null);if(looking){setLooking(false);setOverlay('journal');}else{const note=document.querySelector<HTMLElement>('.luoshen-note-compact:not([inert])');if(note)note.focus({preventScroll:true});else hud.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();}}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[overlay,state.phase,focus,looking,openingSleeveMoving,sleeveTicket,cloudCarMoving,farewellMoving,birdMoving,birdScreen,birdReturning,ribbonActive,ribbonMoving,dragonActive,dragonMoving]);
 function beginEntry(opening:SceneViewport){
  if(entering||!ready)return;setEntering(true);
  setStudy({region:{x:(opening.frame.width/2-opening.view.x)/(luoshenSize.width*opening.view.scale),y:(opening.frame.height/2-opening.view.y)/(luoshenSize.height*opening.view.scale)},scaleRatio:opening.view.scale/coverView(opening.frame,luoshenSize).scale,transition:'instant',token:performance.now(),onSettled:()=>{
   if(entryTimer.current)clearTimeout(entryTimer.current);
   entryTimer.current=setTimeout(()=>{setStudy(null);dispatch({type:'begin'});setEntering(false);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100);
  }});
 }
 useEffect(()=>{if(openingSleeveMoving){playback.original();setSleeveSettled(sleeveTicket);}if(cloudCarMoving||farewellMoving)playback.original();if(ribbonActive){if(ribbonMoving)playback.original();if(ribbonViewed.current)panRibbons();}else if(dragonFramed){if(dragonMoving)playback.original();panDragons();}else if(birdActive){if(birdMoving)birdOriginal(true);panBirds();}},[viewport.frame.width,viewport.frame.height]);
 // On entry the figure command wins over the initial observation/ResizeObserver frame.
 useEffect(()=>{if(ribbonActive&&ribbonViewed.current)panRibbons();},[ribbonActive]);
 // Rotation keeps the current observation clear of the newly positioned note.
 useEffect(()=>{if(ready&&!overlay&&!looking&&!ribbonActive&&!dragonFramed&&!birdActive&&observation){if(!hairContext&&!farewellContext&&!cloudCarContext&&!detailFramed)pan(observation.actor,state.phase==='ending'?1.4:1.5);}},[viewport.frame.width,viewport.frame.height]);
 // Only explicit continuation changes hair stages; discovery feedback stays at the tapped detail.
 useEffect(()=>{if(!hairContext||ordinaryDetail){hairGuideFrame.current='';return;}if(!ready||looking||overlay||ribbonActive)return;const key=`${scope}:${viewport.frame.width}:${viewport.frame.height}`;if(hairGuideFrame.current===key)return;hairGuideFrame.current=key;setFocus(false);pan(hairLayout.region,hairLayout.scaleRatio,hairLayout.screenAnchor);},[ready,scope,viewport.frame.width,viewport.frame.height,overlay,looking,ribbonActive]);
 useEffect(()=>{if(!cloudCarContext){cloudCarGuideFrame.current='';return;}if(!ready||looking||overlay||ribbonActive)return;const key=`${scope}:${viewport.frame.width}:${viewport.frame.height}`;if(cloudCarGuideFrame.current===key)return;cloudCarGuideFrame.current=key;setFocus(false);pan(cloudCarLayout.region,cloudCarLayout.scaleRatio,cloudCarLayout.screenAnchor);},[ready,scope,viewport.frame.width,viewport.frame.height,overlay,looking,ribbonActive]);
 useEffect(()=>{if(!detailFramed){detailGuideFrame.current='';return;}if(!ready||overlay||looking||ribbonActive)return;const key=`${scope}:${viewport.frame.width}:${viewport.frame.height}`;if(detailGuideFrame.current===key)return;detailGuideFrame.current=key;setFocus(false);pan(detailLayout.region,detailLayout.scaleRatio,detailLayout.screenAnchor);},[ready,scope,viewport.frame.width,viewport.frame.height,overlay,looking,ribbonActive]);
 // Both farewell discoveries stay put until their sole continuation is activated.
 useEffect(()=>{if(!farewellContext){farewellGuideFrame.current='';return;}if(!ready||looking||overlay||ribbonActive)return;const key=`${scope}:${viewport.frame.width}:${viewport.frame.height}`;if(farewellGuideFrame.current===key)return;farewellGuideFrame.current=key;setFocus(false);pan(farewellLayout.region,farewellLayout.scaleRatio,farewellLayout.screenAnchor);},[ready,scope,viewport.frame.width,viewport.frame.height,overlay,looking,ribbonActive]);
 // Reframe on entering a reading step or resizing; opening and closing a book keeps the player's view.
 useEffect(()=>{if(!overlay&&!looking&&!ribbonActive&&!dragonActive&&!birdActive&&(state.phase==='interpret'||state.phase==='complete'))frameReading(state.phase==='complete'?['C6']:readingActors);},[state.phase,state.index,readingView,viewport.frame.width,viewport.frame.height]);
 function pan(actor:Pick<SceneActor,'x'|'y'>,ratio=1.4,anchor?:{x:number;y:number}){
  const token=++panToken.current;setBusy(true);setReply(null);if(panTimer.current)clearTimeout(panTimer.current);
  const done=()=>{if(token===panToken.current)setBusy(false);};panTimer.current=setTimeout(done,1400);
  setStudy({allowVerticalMargin:cloudCarFramed||detailFramed,region:{x:actor.x,y:actor.y},scaleRatio:ratio,screenAnchor:anchor??(viewport.frame.height<500?{x:Math.max(.2,(viewport.frame.width-336)/2/viewport.frame.width),y:.48}:viewport.frame.width<700?{x:.5,y:.3}:{x:.34,y:.48}),transition:'pan',token:performance.now(),onSettled:done});
 }
 function frameReading(ids:string[]){
  if(state.index===4&&ids.includes('cloud-car')){const l=luoshenCloudCarLayout(viewport.frame);pan(l.region,l.scaleRatio,l.screenAnchor);return;}
  if(state.index===3&&ids.join()==='L8,C3'){const l=luoshenFarewellLayout(viewport.frame,'pair');pan(l.region,l.scaleRatio,l.screenAnchor);return;}
  if(state.index===2&&ids.join()==='L7,C2'){const l=luoshenRelationshipLayout(viewport.frame);pan(l.region,l.scaleRatio,l.screenAnchor);return;}
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
  const center={x:(box.left+box.right)/2,y:(box.top+box.bottom)/2},face=luoshenFacePoints[ids[0]];
  // The closed mobile book occupies x=16..80. Keep the visible face, rather
  // than the broad costume bounds, clear of it with 32px of head space.
  const anchorX=compact?Math.max(ids[0]==='bird'?.6:.5,face?(112-(face.x-center.x*luoshenSize.width)*scale)/width:0):(24+availableWidth/2)/width;
  pan(center,scale/base,{x:anchorX,y:(90+availableHeight/2)/height});
 }
 function collect(actorId:string){
  const a=luoshenCollectibles.find(a=>a.id===actorId);if(!a)return;const found=luoshenFindings.find(f=>f.id===a.category)!;
  if(a.id==='ribbon-0')setRibbonRequest({id:a.id,scope});
  if(claimed.current.has(a.category)){setNotice(`已記在冊中：${found.name}`);return;}
  claimed.current.add(a.category);dispatch({type:'collect',category:a.category,actorId:a.id});
  collectionFeedback.enqueue(a.category,found.name,a.x,a.y);
 }
 function inspect(id:string){
  if(blocked)return;
  const sleeveTarget=['sleeve-C1','C1'].includes(id)?'cao':['sleeve-attendant','attendant-opening-beard'].includes(id)?'companion':null;
  if(openingSleeveContext&&sleeveTarget&&(state.observation===1||sleeveTarget==='cao')){setOpeningReplay({scope,figure:sleeveTarget});setRibbonRequest(null);setReply(null);setFolded(false);setDetailReplay(v=>v+1);if((state.observation===0?sleeveTarget==='cao':sleeveTarget==='companion'))dispatch({type:'notice-detail',id:observation!.id,step:0,observation:state.observation});if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){playback.showOriginal('opening-sleeve');setSleeveSettled(`${scope}:${detailReplay+1}`);}else playback.play('opening-sleeve');return;}
  if(cloudCarFramed&&['cloud-car','L9','cloud-companion','cloud-driver'].includes(id)){setReply(null);setFolded(false);if(cloudCarContext)dispatch({type:'notice-cloudcar',id:'cloud-car',step:4,observation:0});playback.play('cloudcar');return;}
  if(farewellPairFramed&&(['L8','C3','attendant-farewell-back','attendant-farewell-beard','attendant-farewell-box','bird-2'].includes(id))){if(id==='bird-2')collect(id);setReply(null);playback.play('farewell');return;}
  if(ribbonActive){if(id==='figure-L1')playRibbons();return;}
  if(birdContext&&(id==='bird'||id==='bird-0'||id==='bird-1')){if(!claimed.current.has('bird'))collect(id==='bird-1'?'bird-1':'bird-0');if(!birdActive&&birdContext==='interpretation')panBirds();playBirds();return;}
  if(id==='L1'&&(state.index>1||state.index===1&&state.phase!=='search')){openRibbons('ribbon-0',true);return;}
  if(dragonContext&&(id==='dragon-first'||id==='dragon-0')){if(!dragonFramed)panDragons();playDragons();return;}
  if(observation&&id===observation.id){
   if(state.phase==='observe'){if(hairStage){setReply(null);setFolded(false);setHairReplay(v=>v+1);dispatch({type:'notice-hair',id,step:state.index,observation:state.observation});}else if(farewellContext){setReply(null);setFolded(false);setFarewellReplay(v=>v+1);dispatch({type:'notice-farewell',id,step:state.index,observation:state.observation});playback.play('farewell');}else {setReply(null);setFolded(false);setDetailReplay(v=>v+1);dispatch({type:'notice-detail',id,step:state.index,observation:state.observation});}}
   else {setDetailReplay(v=>v+1);dispatch({type:'end-observe',id,step:state.ending});}
   return;
  }
  if(state.phase==='search'&&id===step.id){dispatch({type:'find',id});return;}
  collect(id);
  if(person(id)){const visit=visits.current[id]??0;visits.current[id]=visit+1;setReply({id,text:luoshenReply(id,visit),token:performance.now()});}
 }
 const resolve:SceneHitResolver=(world,scale,size,actors)=>{
  return resolveLuoshenHit(world,scale,size,actors,ribbonActive?figureStudyActor:dragonActive?dragonStudyActor:birdActive?birdStudyActor:cloudCarFramed?cloudCarStudyActor:observation?.actor);
 };
 function openRibbons(id:string,playImmediately=false){
  ribbonReturn.current={viewport,focus,folded,bird:birdActive};ribbonViewed.current=true;setRibbonOrigin(id);setFocus(false);setFolded(false);setReply(null);panRibbons();if(playImmediately)playback.play('ribbon');else playback.offer('ribbon');
 }
 function panRibbons(){const layout=luoshenFigureLayout(viewport.frame);pan(layout.region,layout.scaleRatio,layout.screenAnchor);}
 function playRibbons(){setFocus(false);setFolded(false);setNoticeState(null);playback.play('ribbon');}
 function closeRibbons(){
  const prior=ribbonReturn.current;ribbonReturn.current=null;
  if(state.phase==='search'&&!looking)ribbonExitFocus.current=true;
  if(prior?.bird&&birdContext)playback.showOriginal('bird');else playback.close();
  if(prior){setFocus(prior.focus);setFolded(prior.folded);if(ribbonViewed.current){const v=prior.viewport;if(prior.bird&&birdContext&&(v.frame.width!==viewport.frame.width||v.frame.height!==viewport.frame.height))panBirds();else pan({x:(v.frame.width/2-v.view.x)/(luoshenSize.width*v.view.scale),y:(v.frame.height/2-v.view.y)/(luoshenSize.height*v.view.scale)},v.view.scale/coverView(v.frame,luoshenSize).scale,{x:.5,y:.5});}}
  ribbonViewed.current=false;
 }
 function panDragons(){const layout=luoshenDragonLayout(viewport.frame);pan(layout.region,layout.scaleRatio,layout.screenAnchor);}
 function openDragons(){setRibbonRequest(null);setFocus(false);setFolded(false);setReply(null);panDragons();playback.offer('dragon');}
 function playDragons(){setRibbonRequest(null);setFocus(false);setFolded(false);setReply(null);setNoticeState(null);playback.play('dragon');}
 function closeDragons(){playback.close();if(dragonContext==='interpretation')frameReading(readingActors);}
 function leaveDragons(){playback.close();if(dragonContext==='observation')dispatch({type:'observe',id:'dragon-first',step:state.index,observation:state.observation});else frameReading(readingActors);}
 function panBirds(){pan({x:(8*1995+1220)/luoshenSize.width,y:105/943},viewport.frame.width<700?1.35:2.3);}
 function openBirds(){setRibbonRequest(null);setBirdDrawing(false);setBirdReturning(false);birdAfterReturn.current=null;setFocus(false);setFolded(false);panBirds();playback.offer('bird');}
 function playBirds(){setRibbonRequest(null);setBirdReturning(false);birdAfterReturn.current=null;setFocus(false);setFolded(false);setNoticeState(null);if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setBirdDrawing(false);playback.showOriginal('bird');}else{setBirdDrawing(true);birds.play();}}
 function finishBirdReturn(){const after=birdAfterReturn.current;birdAfterReturn.current=null;setBirdReturning(false);setBirdDrawing(false);birds.original();after?.();}
 function birdOriginal(immediate=false){birdAfterReturn.current=null;if(birdScreen&&!immediate){setBirdReturning(true);return;}setBirdReturning(false);setBirdDrawing(false);birds.original();}
 function leaveBirds(){const leave=()=>{birds.close();if(state.phase==='observe')dispatch({type:'observe',id:'bird',step:state.index,observation:state.observation});else frameReading(readingActors);};if(birdScreen){birdAfterReturn.current=leave;setBirdReturning(true);}else leave();}
 function observe(){dispatch({type:'look'});setFocus(false);if(state.index===1)panBirds();else pan(step.observations[0].actor);}
 function next(){if(!readingComplete)return;dispatch({type:'next'});setFocus(state.index===luoshenSteps.length-1?false:state.focusPreference??true);setStudy(null);setNotice(step.lead);}
 function openJournal(){if(openingSleeveMoving){playback.original();setSleeveSettled(sleeveTicket);}if(birdActive)birdOriginal(true);collectionFeedback.settle();if(!savedView.current)savedView.current={viewport,focus};setOverlay('journal');setFocus(false);}
 function closeJournal(){setOverlay(null);setLooking(false);const prior=savedView.current;if(prior){const v=prior.viewport;setStudy({allowVerticalMargin:true,region:{x:(v.frame.width/2-v.view.x)/(luoshenSize.width*v.view.scale),y:(v.frame.height/2-v.view.y)/(luoshenSize.height*v.view.scale)},scaleRatio:v.view.scale/coverView(v.frame,luoshenSize).scale,screenAnchor:{x:.5,y:.5},transition:'pan',token:performance.now()});setFocus(prior.focus);}savedView.current=null;}
 function lookFromJournal(id:string,stops:LuoshenLookStop[]=[]){const a=luoshenJournalActor(id);if(a){const items=stops.some(s=>s.id===id)?stops:[{id,label:a.name,text:'比對冠髮、姿態與周圍的場面。'},...stops];setJournalLook({id,stops:items});setLookFolded(false);setOverlay(null);setLooking(true);pan(a,1.5);}}
 function closePoem(){
  if(luoshenReading[state.index]?.phrases.every((_,i)=>(poemRead[state.index]??[]).includes(i)))setPoemReturned(old=>({...old,[state.index]:true}));
  setOverlay(null);
  const phrase=poemSelection!==null?luoshenReading[state.index]?.phrases[poemSelection]:undefined;
  const opened=poemFrame.current,rotated=opened&&(opened.width!==viewport.frame.width||opened.height!==viewport.frame.height);
  // Keep an unmodified camera on a simple reread, but reframe after book-time rotation.
  if(phrase||rotated)setReadingView({index:state.index,actors:phrase?.actors??readingActors});
  poemFrame.current=null;
 }
 function restart(){collectionFeedback.settle();setReadingView(null);setPoemReturned({});setPoemRead({});dispatch({type:'restart'});setEntryStarted(false);setCoverVisible(true);setCoverLeaving(false);setEntering(false);resumePending.current=false;setOverlay(null);setStudy(null);setLooking(false);savedView.current=null;setReset(v=>v+1);setFocus(state.focusPreference??true);visits.current={};}
 const lookIndex=journalLook?.stops.findIndex(s=>s.id===journalLook.id)??-1;
 const lookStop=journalLook?.stops[lookIndex],lookActor=journalLook?luoshenJournalActor(journalLook.id):undefined;
 const noticePlacement=luoshenNoticePlacement(viewport.frame,noteBounds);
 const speechReserved=noteBounds?[noteBounds]:[];
 const noteVisible=['observe','interpret','ending','complete'].includes(state.phase)&&!overlay&&!looking&&!ribbonActive&&!dragonFramed;
 useEffect(()=>{if(overlay||!noteVisible&&!looking&&!ribbonActive&&!dragonFramed)setNoteBounds(null);},[overlay,noteVisible,looking,ribbonActive,dragonFramed]);
 return <main className={`immersive-game lantern-game luoshen-game ${ready?'scene-loaded':''} ${farewellVisible&&noteVisible?'is-farewell-context':''} ${detailFramed?'is-detail-context':''}  ${cloudCarFramed?'is-cloudcar-context':''} ${farewellPairFramed?'is-farewell-pair-context':''} ${hairContext&&noteVisible?'is-hair-context':''} ${hairFeedback&&noteVisible?'is-hair-feedback':''} ${birdScreen?'is-redrawn':''} ${!looking&&!ribbonActive&&!dragonFramed&&(birdActive||birdContext==='observation'||state.phase==='interpret'&&readingActors[0]==='bird')?'is-bird-context':''} ${ribbonActive||dragonFramed||relationshipFramed?'is-figure-context':''} ${relationshipFramed?'is-relation-context':''} ${dragonFramed?'is-dragon-context':''} ${(ribbonActive||dragonFramed||relationshipFramed)&&animationLayout.stacked?'is-figure-stacked':''} ${state.phase==='intro'?'is-cover':''} ${overlay==='journal'||looking?'is-journal-open':''} ${(noteVisible||ribbonActive||dragonFramed)&&!folded?'has-observation-note':''}`} aria-label="洛神賦圖 · 洛水之間" style={{'--cloudcar-note-height':`${cloudCarLayout.note.height}px`,'--farewell-note-right':`${farewellLayout.right}px`,'--farewell-note-height':`${farewellLayout.noteMaxHeight}px`,'--farewell-art-height':`${farewellLayout.artHeight}px`,'--hair-note-top':hairLayout.stacked?'auto':'78px','--hair-note-bottom':hairLayout.stacked?'90px':'auto','--hair-note-right':`${hairLayout.right}px`,'--hair-note-height':`${hairLayout.noteMaxHeight}px`,'--figure-note-height':`${animationLayout.noteMaxHeight}px`} as import('react').CSSProperties}>
 {state.phase!=='intro'&&!overlay&&!looking&&!ribbonActive&&!dragonFramed&&!openingSleeveMoving&&!birdMoving&&!birdReturning&&!farewellMoving&&!cloudCarMoving&&<button className="luoshen-skip-controls" onClick={()=>relationshipFramed||farewellPairFramed?document.querySelector<HTMLElement>('.luoshen-note-compact')?.focus({preventScroll:true}):hud.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()}>略過人物，前往操作</button>}
 <ScrollScene showBackdrop={false} keyboardNavigation image={luoshenImage} tiles={luoshenTiles} requireTiles artworkSize={luoshenSize} actors={allActors} active={state.phase!=='intro'&&ready} blocked={blocked} resetKey={reset} initialRegion={{x:state.phase==='intro'&&state.index===0?.885:state.index<6?person(step.id).x:.08,y:.5}} focusing={state.phase==='intro'?false:focus} onReady={setReady} onInspect={inspect} hitResolver={resolve} onMiss={()=>setReply(null)} onExplore={()=>setReply(null)} motion={false} steam={null} title="洛神賦圖" description="北京故宮藏洛神賦圖宋摹本完整畫心，由右往左追尋曹植與洛神的相遇、流連、離別與追懷" studyCommand={study} command={command} minimumScaleRatio={detailFramed?detailLayout.minimumScaleRatio:cloudCarFramed?cloudCarLayout.minimumScaleRatio:farewellPairFramed?farewellLayout.minimumScaleRatio:relationshipFramed?relationshipLayout.minimumScaleRatio:1} zoomStops={farewellPairFramed&&farewellLayout.minimumScaleRatio<1?[farewellLayout.minimumScaleRatio,...zoomStops]:relationshipFramed&&relationshipLayout.minimumScaleRatio<1?[relationshipLayout.minimumScaleRatio,...zoomStops]:zoomStops} hint={null} onViewportChange={setViewport} onViewChange={setScrollWindow}/>
 {state.phase==='intro'?<>
  {entryStarted&&<LuoshenThreeActEntryV1 ready={ready} leaving={entering} onBegin={beginEntry} onPrepared={prepareEntry} onRevealed={revealEntry} targetId={step.id} targetName={step.name} appearance={step.appearance} continuing={Boolean(state.index||state.resumePhase&&state.resumePhase!=='search')} initialCenterX={state.index===0?.885:state.index<6?person(step.id).x:.08}/>}
  {coverVisible&&<section className={`introduction lantern-introduction luoshen-entry-cover-v1 ${coverLeaving?'is-opening-scroll':''}`} inert={entryStarted} aria-label="洛水之間封面"><div className="intro-brand"><span/>畫中尋人</div><div className="intro-content"><div className="intro-copy"><div className="intro-narrative"><div className="intro-lines"><p className="intro-chapter">北京故宮博物院藏 · 宋摹本 · 文學故事畫</p><p className="intro-story">{'故事裡，曹植行經洛水，\n遇見神女洛神。\n人與神的相遇，卻不能長留。'}</p></div></div><button className="intro-enter" disabled={entryStarted} onClick={()=>setEntryStarted(true)}><span>{entryStarted&&!coverLeaving?'正在展卷':'走進這一卷'}</span><ArrowRight size={23}/></button></div><div className="intro-title"><h1>洛水之間</h1><span className="intro-seal" aria-hidden>尋人</span></div></div><div className="intro-footer"><p>循著曹植與洛神的身影 · 圖文對讀</p><ChapterLinks current="luoshen"/></div></section>}
 </>:<>
 <header ref={hud} id="luoshen-controls" className="lantern-hud" inert={Boolean(overlay)||openingSleeveMoving||state.phase==='found'||birdMoving||birdReturning||ribbonActive||dragonFramed||relationshipFramed||farewellPairFramed||farewellMoving||cloudCarMoving}>{state.phase==='search'&&!ribbonActive&&<section className="lantern-target" aria-label="本次人物提示"><button className="lantern-face-reference" aria-label="放大人物樣貌" onClick={()=>setOverlay('hint')}><LuoshenPortrait id={step.id} label={`${step.name}的去背樣貌摹繪`}/></button><div><p className="lantern-eyebrow">尋人 · {state.index+1}／6</p><h1>尋找{step.name}的身影</h1><p className="lantern-progress">已尋得 {state.index}／6 處</p></div></section>}<div className="lantern-tools"><button className="lantern-mode" aria-pressed={focus} onClick={toggleFocus}>{focus?'轉回彩色':'凝神觀察'}</button><button className="round-control" aria-busy={sound.state==='loading'} aria-label={sound.state==='loading'?'取消載入音樂':sound.state==='on'?'關閉音樂':'開啟本章音樂'} aria-pressed={sound.state==='on'} onClick={()=>void sound.toggle()}>{sound.state==='on'?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="round-control" aria-label="切換全螢幕" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen?.();else void document.documentElement.requestFullscreen?.().catch(()=>setNotice('此環境暫不支援全螢幕。'));}}><Maximize size={18}/></button><button className="round-control" aria-label="畫卷操作" onClick={()=>setOverlay('menu')}><MoreHorizontal size={20}/></button></div></header>
 <footer className="lantern-footer" inert={Boolean(overlay)||openingSleeveMoving||state.phase==='found'||birdMoving||birdReturning||ribbonActive||dragonFramed||relationshipFramed||farewellPairFramed||farewellMoving||cloudCarMoving}><button ref={book} className={`lantern-quiet-button lantern-journal-button ${receiving?'is-spark-arriving':''}`} onClick={openJournal}><BookOpen size={18}/>見聞冊 <span>{journalCount}／{luoshenFindings.length}</span></button><LanternNavigator image={luoshenImage} window={scrollWindow} stops={[{x:.88,label:'相遇'},{x:.60,label:'流連'},{x:.31,label:'離別'},{x:.12,label:'追懷'}]} onNavigate={x=>pan({x,y:.5},1)}/>{state.phase==='search'?<button className="lantern-quiet-button" onClick={()=>setOverlay('hint')}><CircleHelp size={18}/>給我提示</button>:<button className="lantern-quiet-button" onClick={()=>setOverlay('sources')}>畫作小記</button>}</footer>
 {notice&&!overlay&&<div className="luoshen-notice" style={{'--notice-left':`${noticePlacement.left}px`,'--notice-top':noticePlacement.top===null?'auto':`${noticePlacement.top}px`,'--notice-bottom':noticePlacement.bottom===null?'auto':`${noticePlacement.bottom}px`,'--notice-width':`${noticePlacement.width}px`} as import('react').CSSProperties}><LanternNotice key={notice.token} text={notice.text} quiet duration={3600}/></div>}{sound.state==='error'&&<div className="lantern-status" role="status">音樂暫未載入，再次按音樂開關可重試。</div>}
 </>}
 {detailFramed&&detailReplay>0&&(detailFeedback||state.phase==='ending'&&state.endingSeen)&&!overlay&&<div key={`${scope}:${detailReplay}`} className="luoshen-detail-feedback" aria-hidden style={{background:`radial-gradient(ellipse ${Math.max(40,detailActor.width*luoshenSize.width*viewport.view.scale*.7)}px ${Math.max(40,detailActor.height*luoshenSize.height*viewport.view.scale*.7)}px at ${viewport.view.x+detailActor.x*luoshenSize.width*viewport.view.scale}px ${viewport.view.y+detailActor.y*luoshenSize.height*viewport.view.scale}px,transparent 68%,#28332226 100%)`}}/>}
 {openingSleeveActive&&playback.mode==='playing'&&!overlay&&!looking&&<LuoshenOpeningSleeveAnimation key={playback.ticket} figure={openingSleeveFigure} viewport={viewport} onDone={()=>{playback.finish(playback.ticket);setSleeveSettled(sleeveTicket);}} onError={()=>{playback.fail(playback.ticket);setSleeveSettled(sleeveTicket);}} onOriginal={()=>{playback.original();setSleeveSettled(sleeveTicket);}}/>}
 {cloudCarActive&&playback.mode==='playing'&&!overlay&&!looking&&<LuoshenCloudCarAnimation key={playback.ticket} viewport={viewport} onDone={()=>playback.finish(playback.ticket)} onError={()=>playback.fail(playback.ticket)} onOriginal={()=>{playback.original();document.querySelector<HTMLElement>('.luoshen-note-compact,.luoshen-note-reopen')?.focus({preventScroll:true});}}/>}
 {farewellActive&&playback.mode==='playing'&&!overlay&&!looking&&(farewellPairFramed?<LuoshenFarewellPairAnimation key={playback.ticket} viewport={viewport} onDone={()=>playback.finish(playback.ticket)} onError={()=>playback.fail(playback.ticket)} onOriginal={()=>{playback.original();document.querySelector<HTMLElement>('.luoshen-note-compact,.luoshen-note-reopen')?.focus({preventScroll:true});}}/>:<LuoshenFarewellAnimation key={playback.ticket} figure={state.observation===0?'goddess':'cao'} viewport={viewport} onDone={()=>playback.finish(playback.ticket)} onError={()=>playback.fail(playback.ticket)} onOriginal={()=>{playback.original();document.querySelector<HTMLElement>('.luoshen-note-compact,.luoshen-note-reopen')?.focus({preventScroll:true});}}/>)}
 {birdScreen&&<LuoshenRedrawnBird viewport={viewport} playing={playback.mode==='playing'&&!birdReturning} show={!birdReturning} onHidden={finishBirdReturn} ticket={playback.ticket} onDone={()=>{playback.finish(playback.ticket);birdOriginal();}} onError={()=>{setBirdDrawing(false);playback.fail(playback.ticket);}}/>}
 {dragonActive&&playback.mode==='playing'&&!overlay&&<LuoshenDragonAnimation key={playback.ticket} viewport={viewport} onDone={()=>playback.finish(playback.ticket)} onError={()=>playback.fail(playback.ticket)}/>}
 {dragonFramed&&!overlay&&<LuoshenNote compact onBounds={setNoteBounds} viewport={viewport} label={dragonContext==='observation'?'飛鳥與龍形 · 2／2':'龍形 · 原畫回看'} title="婉若游龍" folded={folded} onFold={()=>setFolded(v=>!v)} busy={busy} primaryAction={dragonActive?<>{!dragonMoving&&<button className="lantern-note-next" onClick={leaveDragons}>{dragonContext==='observation'?'圖文對讀':'回到圖文對讀'} <span>→</span></button>}{dragonMoving&&<button className="lantern-note-secondary" onClick={playback.original}>返回原畫</button>}</>:undefined}>
 <p className="lantern-note-body" aria-live="polite">{dragonMoving?(playback.mode==='playing'?'頸首輕轉，前肢與尾端隨後。':'先看原畫中的龍形。'):!dragonActive||playback.mode==='offered'?'點看龍形，看看回轉的姿態。':'龍形的回轉，與神女的身姿對看。'}</p>
 <p className="lantern-note-caption" role={playback.mode==='failed'?'status':undefined}>{playback.mode==='failed'?'演繹暫未載入，可再點龍形重試。':dragonActive&&playback.mode==='still'?(window.matchMedia('(prefers-reduced-motion: reduce)').matches?'減少動態已啟用，保留原畫。':'再點龍形可重播 · 重繪演繹。'):'重繪演繹；播完回到原畫。'}</p>
 </LuoshenNote>}
 {ribbonActive&&playback.mode==='playing'&&!overlay&&<LuoshenRibbonAnimation key={playback.ticket} viewport={viewport} onDone={()=>playback.finish(playback.ticket)} onError={()=>playback.fail(playback.ticket)}/>}
 {ribbonActive&&!overlay&&<LuoshenNote compact onBounds={setNoteBounds} viewport={viewport} label="洛神 · 原畫觀察" title="洛神的身姿" folded={folded} onFold={()=>setFolded(v=>!v)} busy={busy} primaryAction={<>{!ribbonMoving&&<button className="lantern-note-next" onClick={closeRibbons}>{looking?'回到原畫對照':'繼續探索'} <span>→</span></button>}{ribbonMoving&&<button className="lantern-note-secondary" onClick={playback.original}>返回原畫</button>}</>}>
 <p className="lantern-note-body" aria-live="polite">{playback.mode==='offered'?'點看洛神，看看身姿與衣帶。':playback.mode==='playing'?'洛神輕傾回轉，手勢與衣帶隨後。':'連著衣帶，看神女回轉的姿態。'}</p>
 <p className="lantern-note-caption" role={playback.mode==='failed'?'status':undefined}>{playback.mode==='failed'?'演繹暫未載入，可再點洛神重試。':playback.mode==='still'?(window.matchMedia('(prefers-reduced-motion: reduce)').matches?'減少動態已啟用，保留原畫。':'再點洛神可重播 · 重繪演繹。'):'重繪演繹；播完回到原畫。'}</p>
 </LuoshenNote>}
 {state.phase==='found'&&!overlay&&<LuoshenSpeech actor={person(step.id)} viewport={viewport} text={step.speech} action="近看原畫" onAction={observe}/>}
 {reply&&!blocked&&<LuoshenSpeech actor={person(reply.id)} viewport={viewport} text={reply.text} reserved={speechReserved}/>}
 {noteVisible&&<LuoshenNote compact onBounds={setNoteBounds} reading={state.phase==='interpret'||state.phase==='complete'} primaryAction={detailFeedback&&sleeveReady?<button className="lantern-note-next" onClick={()=>dispatch({type:'continue-detail',id:observation!.id,step:state.index,observation:state.observation})}>{state.observation===step.observations.length-1?'圖文對讀':'下一處'} <span>→</span></button>:cloudCarContext&&state.cloudCarSeen&&!cloudCarMoving?<button className="lantern-note-next" disabled={cloudCarMoving} onClick={()=>dispatch({type:'continue-cloudcar',id:'cloud-car',step:4,observation:0})}>再看牽引 <span>→</span></button>:farewellFeedback&&!farewellMoving?<button className="lantern-note-next" disabled={farewellMoving} onClick={()=>{if(state.observation===1)farewellPairRequested.current=true;dispatch({type:'continue-farewell',id:observation!.id,step:state.index,observation:state.observation});}}>{state.observation===0?'再看曹植':'同看兩人'} <span>→</span></button>:hairFeedback?<button className="lantern-note-next" onClick={()=>dispatch({type:'continue-hair',id:observation!.id,step:state.index,observation:state.observation})}>接著比較 <span>→</span></button>:birdActive&&!birdMoving&&!birdReturning?<button className="lantern-note-next" disabled={birdMoving||birdReturning} onClick={leaveBirds}>{state.phase==='observe'?'再看龍形':'回到圖文對讀'} <span>→</span></button>:state.phase==='complete'?<button className="lantern-note-next" onClick={()=>setFolded(true)}>自由探索 <span>→</span></button>:state.phase==='interpret'&&readingComplete&&!farewellMoving&&!cloudCarMoving?<button className="lantern-note-next" onClick={next}>繼續故事 <span>→</span></button>:state.phase==='ending'&&state.endingSeen?<button className="lantern-note-next" onClick={()=>{dispatch({type:'end-next'});setStudy(null);}}>繼續 <span>→</span></button>:undefined} anchor={state.phase==='interpret'&&!birdActive?(person(readingActors[0])??step.observations.find(o=>o.actor.id===readingActors[0])?.actor):(birdActive?birdStudyActor:observation?.actor??(state.phase==='ending'?ending?.observation.actor:person(step.id)))} viewport={viewport} folded={folded} onFold={()=>setFolded(v=>!v)} busy={busy} label={state.phase==='complete'?'足往心留':state.phase==='ending'?`${ending?.title} · ${state.ending+1}／${luoshenEnding.length}`:state.phase==='observe'?`${step.noteTitle} · ${state.observation+1}／${step.observations.length}`:`${step.noteTitle} · ${state.index===2||state.index===3?'發現':'回看'}`}  title={state.phase==='complete'?'不同時刻的身影':state.phase==='ending'?ending?.title??'洛水之間':step.title}>
 {birdActive?<><p className="lantern-note-body" aria-live="polite">{birds.mode==='preparing'?'先看原畫中的雙鳥。':birds.mode==='playing'?'兩翼起落，羽尖隨後。':birds.mode==='offered'?'點看飛鳥，看看兩翼怎樣起落。':'雙鳥展翼，可與「翩若驚鴻」對讀。'}</p><p className="lantern-note-caption" role={birds.mode==='failed'?'status':undefined}>{birds.mode==='failed'?'演繹暫未載入，可再點飛鳥重試。':birds.mode==='still'?(window.matchMedia('(prefers-reduced-motion: reduce)').matches?'減少動態已啟用，保留原畫。':'再點飛鳥可重播 · 重繪演繹。'):'重繪演繹；播完回到原畫。'}</p>{(birdMoving||birdReturning)&&<button className="lantern-note-secondary" onClick={()=>birdOriginal()}>返回原畫</button>}</>:state.phase==='observe'&&<><p className="lantern-note-body" aria-live="polite">{openingSleeveMoving?`先看畫中${openingSleeveName}的動作。`:openingSleeveContext&&detailFeedback&&playback.mode==='failed'?`演繹暫未載入，再點${openingSleeveName}可重試。`:detailFeedback&&!sleeveReady?'先看畫中衣袖的動作。':detailFeedback?(luoshenDetailReplies[observation!.id]??step.noteResult):cloudCarContext?(cloudCarMoving?'流蘇、衣帶輕動，車體仍穩。':cloudCarActive&&playback.mode==='failed'?'未能播放，點雲車重試。':state.cloudCarSeen?'兩位乘坐者，同在華蓋之下。':'點看雲車，留意乘坐者與衣帶。'):farewellFeedback?(state.observation===0?(farewellMoving?'神女輕轉，再點可看原畫。':farewellActive&&playback.mode==='failed'?'未能播放，點神女重試。':'神女低身，舉起一臂。'):farewellMoving?'曹植微微低首，再點可看原畫。':farewellActive&&playback.mode==='failed'?'未能播放，點曹植重試。':'曹植在岸上，面向神女。'):hairFeedback?(state.observation===0?'兩個環髻，交疊相連。':'兩處都有雙環髻。'):birdContext==='observation'?'點看飛鳥，看看兩翼怎樣起落。':observation?.question}</p>{openingSleeveContext&&detailFeedback&&<p className="lantern-note-caption">{openingSleeveMoving?`摹繪演繹 · 點${openingSleeveName}可回原畫。`:`再點${openingSleeveName}可重播 · 原畫已恢復。`}</p>} {farewellFeedback&&<LuoshenFarewellDiscovery key={`${state.observation}:${farewellReplay}`} comparison={state.observation===1}/>} {hairFeedback&&<LuoshenHairStudies key={`${state.observation}:${hairReplay}`} comparison={state.observation===1}/>}{cloudCarContext&&state.cloudCarSeen&&<p className="lantern-note-caption">{window.matchMedia('(prefers-reduced-motion: reduce)').matches?'減少動態已啟用，保留原畫。':'摹繪演繹 · 再點可重播。'}</p>}</>}
 {state.phase==='interpret'&&!birdActive&&<>{cloudCarFramed&&cloudCarActive&&playback.mode==='failed'&&<p className="lantern-note-caption" role="status">演繹暫未載入，點雲車重試。</p>}{farewellPairFramed&&farewellActive&&playback.mode==='failed'&&<p className="lantern-note-caption" role="status">演繹暫未載入，點人物重試。</p>}<p className="lantern-note-body">{readingComplete?(state.index===3?'賦文寫人神殊途，終須離別。':state.index===2&&readingActors[0]==='L1'?'初見的髮式，與剛才榻前的身影相似。':step.noteResult):farewellMoving?'兩岸的身影，先連在一起看。':cloudCarMoving?'先看雲車與乘坐者的動作。':'翻開《洛神賦》，讀一段與眼前線索相關的文字。'}</p></>}
 {state.phase==='ending'&&ending&&<><p className="lantern-note-body">{state.endingSeen?ending.result:ending.question}</p>{state.endingSeen?<><details className="luoshen-reading-supplement"><summary>圖文小記</summary><p>{'supplement' in ending?ending.supplement:'這段解讀連同《洛神賦》閱讀；人物身分依本卷冠髮與場景比對。'}</p></details></>:<></>}</>}
 {state.phase==='complete'&&<><p className="lantern-note-body">反覆的身影，串起相遇與離別。人已上路，心仍留在洛水。</p></>}
 {state.phase==='complete'&&<button className="lantern-note-secondary" onClick={returnToChapterCover}>回到本章封面</button>}</LuoshenNote>}
 {flight&&<div key={flight.token} className="lantern-spark-discovery" aria-hidden><div className="lantern-spark-source" style={{left:flight.x,top:flight.y}}><img className="lantern-firelight-token luoshen-flight-image" src={assetPath(`art/luoshen/collection-${flight.category}-cutout.png`)} alt="" style={{'--token-x':`${flight.dx}px`,'--token-y':`${flight.dy}px`,'--arc-x':`${flight.dx*.48}px`,'--arc-y':`${flight.dy*.48-85}px`} as import('react').CSSProperties}/></div></div>}
 {looking&&!ribbonActive&&journalLook&&lookStop&&lookActor&&<LuoshenNote compact onBounds={setNoteBounds} viewport={viewport} anchor={lookActor} folded={lookFolded} onFold={()=>setLookFolded(v=>!v)} busy={busy} label={`原畫對照 · ${lookIndex+1}／${journalLook.stops.length}`} title={lookStop.label}><p className="lantern-note-body">{lookStop.label}：{lookStop.text}</p>{journalLook.id==='ribbon-0'&&<button className="lantern-note-secondary" onClick={()=>openRibbons('ribbon-0')}>回看洛神</button>}<div className="lantern-note-tabs">{lookIndex>0&&<button onClick={()=>lookFromJournal(journalLook.stops[lookIndex-1].id,journalLook.stops)}>上一處</button>}{lookIndex<journalLook.stops.length-1&&<button onClick={()=>lookFromJournal(journalLook.stops[lookIndex+1].id,journalLook.stops)}>下一處</button>}</div></LuoshenNote>}
 {looking&&!ribbonActive&&<button ref={returnToBook} className="collection-return" onClick={()=>{setLooking(false);setOverlay('journal');}}>回到見聞冊 →</button>}
 {state.phase==='interpret'&&!birdActive&&!ribbonActive&&!dragonActive&&!farewellMoving&&!cloudCarMoving&&(!overlay||overlay==='poem')&&<LuoshenPoemBook key={state.index} frame={viewport.frame} index={state.index} open={overlay==='poem'} read={poemRead[state.index]??[]} onOpen={()=>{if(farewellMoving||cloudCarMoving)playback.original();collectionFeedback.settle();setReply(null);setPoemSelection(null);poemFrame.current={...viewport.frame};setOverlay('poem');}} onRead={phrase=>{setPoemSelection(phrase);setPoemRead(old=>({...old,[state.index]:Array.from(new Set([...(old[state.index]??[]),phrase]))}));}} onClose={closePoem}/>}
 {overlay==='hint'&&<ChapterDialog className="lantern-appearance-help" label="可曾見過此人" onClose={()=>setOverlay(null)}><p className="lantern-eyebrow">尋人 · 提示 {hintDepth+1}／3</p><h2>尋找{step.name}</h2><div className="lantern-appearance-body"><figure className="lantern-appearance-figure"><LuoshenPortrait id={step.id} label={`${step.name}去背樣貌摹繪`}/><figcaption>去背樣貌摹繪 · 原畫為準</figcaption></figure><div className="lantern-appearance-copy"><p>{hintDepth===0?step.appearance:hintDepth===1?step.hint:step.region}</p><button className="lantern-return-link" onClick={()=>setOverlay(null)}>回畫中尋人 <ArrowRight size={18}/></button></div></div><div className="lantern-appearance-footer"><button className="lantern-text-button" onClick={()=>setOverlay('menu')}>怎樣移動畫卷</button><button className="lantern-text-button" onClick={()=>{if(hintDepth<2)setHintDepth(v=>v+1);else{setOverlay(null);pan({x:Math.round(person(step.id).x*50)/50,y:.5},1);}}}>{hintDepth===0?'看看衣著與姿勢':hintDepth===1?'看看場面線索':'帶我到大致區域'}</button></div></ChapterDialog>}
 {overlay==='menu'&&<ChapterDialog label="畫卷操作" onClose={()=>setOverlay(null)}><h2>畫卷操作</h2>{!storageAvailable&&<p role="status">存檔暫不可用，本次仍可繼續；關閉頁面前請留意。</p>}<ul className="luoshen-control-help"><li>拖曳移動畫卷，滾輪縮放；手機用雙指移動與縮放。</li><li>凝神時，單指移動光區；按 F 或右上按鈕可切換彩色。</li><li>Tab 選取人物或操作，Enter 點看；彩色時左右鍵移畫，＋／－縮放，F 切換凝神。</li></ul><div className="lantern-menu-controls">{([['in','放大'],['out','縮小'],['overview','回到卷首']] as const).map(([type,label])=><button key={type} className="small-button" onClick={()=>{setOverlay(null);if(type==='overview')pan(person('C1'),1);else setCommand({type,token:performance.now()});}}>{label}</button>)}</div><p><button className="lantern-text-button" onClick={()=>setOverlay('sources')}>畫作小記與資料來源</button></p><div className="lantern-paper-actions"><button className="lantern-text-button" onClick={restart}>再尋一次（保留收藏）</button><button className="lantern-text-button" onClick={returnToChapterCover}>回本章封面</button></div><ChapterLinks current="luoshen"/></ChapterDialog>}
 {overlay==='sources'&&<ChapterDialog label="洛神賦圖小記" onClose={()=>setOverlay(null)}><h2>洛神賦圖小記</h2><p>北京故宮博物院藏 · 宋摹本 · 絹本設色。原本傳為顧愷之作，現存本不當作東晉親筆。</p><p>畫卷依曹植《洛神賦》的文學故事展開。曹植與洛神反覆出現，串起不同時刻。開首相遇與雲車離去有館方文字支持，其他重複身影依冠髮、衣飾與場景比對指認，仍有研究空間。</p><p>人物短對白為遊戲虛構；原畫影像檔案保持原樣。岸上初見的曹植與同行者沿用已完成的完整摹繪人物，分別演繹展袖及收袖，播完恢復原畫。鳥形振翅以 AI 重繪素材在原畫位置分層演繹，局部生成補底暫時遮蓋原有鳥形；並非原畫復原，可隨時返回原畫完整對照。初見洛神改以完整重繪人物及局部生成補底演繹，頭頸、持物手臂、軀幹及兩條衣帶分件微動；周邊山石及絹底不動。龍形依原畫重繪，上下頸、軀幹、前後肢及尾端分件活動，只在演繹時使用局部生成補底；雙鳥與周邊絹底保持固定。三段都是遊戲演繹，不同時播放。兩岸段的神女與曹植以分層摹繪作轉首與手臂演繹，單獨觀察時保留周邊原畫；「同看兩人」時再連同三位隨從及長頸鳥形一起演繹，中央絹底、岸石與樹木不動，播完回原畫。雲車段以完整摹繪演繹衣袖、衣帶與流蘇的微動，兩位乘坐者的臉部與髮髻固定，車體、支柱及牽引連接保持原位；龍形仍以原畫呈現，並非文物復原。提示人像、髮式比較圖樣、兩岸人物小像與收藏圖樣為依原畫製作的摹繪／插畫，原畫對照另存。古文短句與畫面對讀，不將神女故事當成史實，也不將洛神等同甄后的傳聞當成定論。</p><details><summary>來源與素材說明</summary>{luoshenSources.map(s=><p key={s.href}><a href={s.href} target="_blank" rel="noreferrer">{s.label}</a></p>)}<p className="lantern-source-note">原畫影像來源為故宮博物院，遊戲保留完整畫心。人物身分的比對仍有研究空間。影像及衍生圖樣的使用範圍、正式署名尚待確認，目前未有館方授權憑證。</p></details><p className="lantern-source-note">配樂：《洛水微波》· 本專案原創程式合成，無外部採樣。現代背景音樂，不是歷史曲目復原。</p></ChapterDialog>}
 {overlay==='journal'&&<LuoshenJournal state={state} view={journalView} onView={setJournalView} onClose={closeJournal} onLook={lookFromJournal}/>}
 </main>;
}
