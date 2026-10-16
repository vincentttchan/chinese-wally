import {LanternFireworksAnimation,lanternFireworksRegions,lanternFireworksFocus} from './LanternFireworksAnimation.tsx';
import {LanternEmperorAnimation} from './LanternEmperorAnimation.tsx';
import {LanternStoveAnimation} from './LanternStoveAnimation.tsx';
import {LanternTheatreAnimation} from './LanternTheatreAnimation.tsx';
import {LanternMonkAnimation} from './LanternMonkAnimation.tsx';
import {LanternZhongKuiAnimation} from './LanternZhongKuiAnimation.tsx';
import {lanternStoveRegions} from '../game/lanternStove.ts';
import {lanternTheatreRegions} from '../game/lanternTheatre.ts';
import {lanternMonkRegions} from '../game/lanternMonk.ts';
import {lanternZhongKuiRegions} from '../game/lanternZhongKui.ts';
import {assetPath} from '../game/assets.ts';
import type {SceneActor} from '../game/level.ts';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ChapterLinks } from './ChapterLinks.tsx';
import { returnToChapterCover } from '../game/chapterCover.ts';
import type { ReactNode } from 'react';
import { ScrollScene } from './ScrollScene.tsx';
import type { SceneCommand, SceneHint, SceneViewport, StudyCommand } from './ScrollScene.tsx';
import { ArtCrop } from './ArtCrop.tsx';
import { LanternDiscovery } from './LanternDiscovery.tsx';
import { LanternJournal } from './LanternJournal.tsx';
import { lanternFindings, lanternAdditionalFindingActors, lanternFindingAt, lanternFindingFromOrigin, loadLanternFindingOrigins, saveLanternFindingOrigins, loadLanternFindings, saveLanternFindings } from '../game/lanternCollection.ts';
import type { LanternFinding } from '../game/lanternCollection.ts';
import { placeLanternReply } from '../game/lanternReply.ts';
import { lanternReplyFor } from '../game/lanternDialogue.ts';
import {LanternNotice} from './LanternNotice.tsx';
import {lanternJournalItems} from '../game/lanternCollection.ts';
import { LanternSparkDiscovery } from './LanternSparkDiscovery.tsx';
import type { SparkDiscovery } from './LanternSparkDiscovery.tsx';
import { LanternNavigator } from './LanternNavigator.tsx';
import {lanternReviewCommand} from './lanternReviewCommand.ts';
import { LanternEpilogue } from './LanternEpilogue.tsx';
import type { ReviewDetail } from './LanternEpilogue.tsx';
import { ArrowRight, BookOpen, CircleHelp, Maximize, MoreHorizontal, Volume2, VolumeX, X } from './ArtIcons.tsx';
import { useAmbience } from '../audio/useAmbience.ts';
import { lanternActors, lanternAppearanceCard, lanternFaceIllustration, lanternFullScroll, lanternJourneyClues, lanternObservations, lanternSize, lanternSources, lanternTargets, lanternTiles } from '../game/lanternFestival.ts';
import { initialLanternState, lanternReducer } from '../game/lanternState.ts';
import {lanternPlatformFocus,lanternCourtyardFocus} from '../game/lanternStudy.ts';
import '../lantern.css';
import '../lantern-journal.css';
import '../lantern-search-hud.css';

type MotionKind='fireworks'|'stove'|'theatre'|'monk'|'zhongkui'|'emperor';
const motionRegions=[['fireworks',lanternFireworksRegions],['stove',lanternStoveRegions],['theatre',lanternTheatreRegions],['monk',lanternMonkRegions],['zhongkui',lanternZhongKuiRegions]] as const;
const motionActors:SceneActor[]=motionRegions.flatMap(([kind,regions])=>regions.map((region,index)=>{
  const xs=region.points.map(p=>p.x),ys=region.points.map(p=>p.y),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
  return {id:`motion-${kind}-${index}`,kind:'observation',name:{fireworks:'爆竹群像',stove:'爐旁取暖',theatre:'戲班群像',monk:'和尚戲裝',zhongkui:'鍾馗與小鬼'}[kind],x:(left+right)/2,y:(top+bottom)/2,width:right-left,height:bottom-top};
}));
const explorationActors = [...lanternActors, ...lanternFindings.map(item => item.actor), ...lanternAdditionalFindingActors,...motionActors];
function motionFor(id:string):MotionKind|undefined{
  if(id.startsWith('motion-'))return id.split('-')[1] as MotionKind;
  if(id==='finding-stove'||['extra-15-0','extra-15-1'].includes(id))return 'stove';
  if(id==='finding-costume'||id==='extra-7-8')return 'monk';
  if(id==='finding-zhongkui'||[8,9,10,11].some(i=>id===`extra-11-${i}`))return 'zhongkui';
  if([5,6,7,9,11].some(i=>id===`extra-7-${i}`))return 'theatre';
  const actor=lanternActors.find(a=>a.id===id);
  if(actor&&lanternFireworksRegions.some(region=>actor.x>=Math.min(...region.points.map(p=>p.x))&&actor.x<=Math.max(...region.points.map(p=>p.x))&&actor.y>=Math.min(...region.points.map(p=>p.y))&&actor.y<=Math.max(...region.points.map(p=>p.y))))return 'fireworks';
}



function LanternDialog({title, children, onClose, className = ''}: {title: string; children: ReactNode; onClose?: () => void; className?: string}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {event.preventDefault(); event.stopPropagation(); close.current?.();}
      if (event.key !== 'Tab') return;
      const controls = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]') ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) {event.preventDefault(); return;}
      if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) {event.preventDefault(); first.focus();}
    };
    const node = ref.current; node?.addEventListener('keydown', keys);
    return () => {node?.removeEventListener('keydown', keys); if (previous?.isConnected) previous.focus({preventScroll: true});};
  }, []);
  return <div className={`lantern-dialog-layer ${className}`}>
    <div className="lantern-paper" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}>
      {onClose && <button className="paper-close" aria-label="關閉" onClick={onClose}><X size={18}/></button>}
      <h2>{title}</h2>{children}
    </div>
  </div>;
}

export function LanternGame() {
  const [game, dispatch] = useReducer(lanternReducer, initialLanternState);
  const [motion,setMotion]=useState<{kind:MotionKind;index?:number;finding?:LanternFinding;actorId:string;emperor?:boolean}|null>(null);
  const motionBusy=useRef(false);
  const [intro, setIntro] = useState(0);
  const [entering,setEntering] = useState(false);
  const introRef = useRef<HTMLElement>(null);
  const entranceAnimation = useRef<Animation | null>(null);
  const [collected,setCollected] = useState<string[]>(loadLanternFindings);
  const [findingOrigins,setFindingOrigins] = useState(loadLanternFindingOrigins);
  const claimedFindings = useRef(new Set(collected));
  const [journalCount,setJournalCount] = useState(collected.length);
  const [receiving,setReceiving] = useState(false);
  const arrivalTimers = useRef(new Set<number>());
  useEffect(()=>()=>{arrivalTimers.current.forEach(timer=>window.clearTimeout(timer));},[]);
  const [collectionFeedback,setCollectionFeedback]=useState<{findingId:string;count:number;newlyCollected:boolean;token:number}|null>(null);
  useEffect(()=>{
    if(!collectionFeedback)return;
    const timer=window.setTimeout(()=>setCollectionFeedback(null),collectionFeedback.newlyCollected?3600:2000);
    return ()=>window.clearTimeout(timer);
  },[collectionFeedback]);
  const [spark,setSpark] = useState<SparkDiscovery | null>(null);
  const [reply,setReply] = useState<{id:string; text:string; token:number;} | null>(null);
  const visits = useRef<Record<string,number>>({});
  const journalButton = useRef<HTMLButtonElement>(null);
  const journalOrigin = useRef<SceneViewport | null>(null);
  const [ready, setReady] = useState(false);
  const [focusing, setFocusing] = useState(true);
  const [overlay, setOverlay] = useState<'help' | 'about' | 'menu' | 'ending' | 'journal' | null>(null);
  const [reset, setReset] = useState(0);
  const [command, setCommand] = useState<SceneCommand | null>(null);
  const [hint, setHint] = useState<SceneHint | null>(null);
  const [notice, setNotice] = useState('');
  const [viewport, setViewport] = useState<SceneViewport>({view: {x: 0, y: 0, scale: 1}, frame: {width: 1280, height: 800}});
  const [studyCommand, setStudyCommand] = useState<StudyCommand | null>(null);
  const [studyAppearance, setStudyAppearance] = useState<{index:number;monochrome:boolean;region?:{x:number;y:number};height?:number}>({index:0,monochrome:false});
  const [learningComplete, setLearningComplete] = useState(false);
  const [scrollWindow, setScrollWindow] = useState({left: .88, width: .12});
  const target = lanternTargets[game.index];
  useEffect(()=>{saveLanternFindings(collected);},[collected]);
  useEffect(()=>{saveLanternFindingOrigins(findingOrigins);},[findingOrigins]);
  useEffect(()=>()=>entranceAnimation.current?.cancel(),[]);
  useEffect(()=>{
    if(!reply)return;
    const timeout=window.setTimeout(()=>setReply(null),3000);
    return()=>window.clearTimeout(timeout);
  },[reply?.token]);
  const nearView = game.phase === 'found' || overlay === 'ending';
  const studyActor = lanternActors.find(actor => actor.id === lanternTargets[studyAppearance.index].id)!;
  useEffect(() => {if (game.phase === 'found') setStudyAppearance({index: game.index, monochrome: false});}, [game.phase, game.index]);
  const active = game.phase !== 'intro' && ready;
  const blocked = !active || game.phase === 'found' || Boolean(overlay) || Boolean(motion);
  useEffect(()=>{if(blocked)setSpark(null);},[blocked]);
  useEffect(()=>{setSpark(null);},[viewport.frame.width,viewport.frame.height]);
  const sound = useAmbience(blocked);
  useEffect(() => {
    const prior = document.title;
    document.title = '宮中鬧元宵 · 畫中尋人';
    return () => {document.title = prior;};
  }, []);
  useEffect(() => {
    if (!game.wrong) return;
    const timeout = window.setTimeout(() => dispatch({type: 'clear-wrong'}), 2200);
    return () => window.clearTimeout(timeout);
  }, [game.wrong, game.index]);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.target instanceof HTMLInputElement || !active || blocked) return;
      if (e.key.toLowerCase() === 'f') {e.preventDefault(); setFocusing(value => !value);}
      if (e.key === 'Escape') {if(reply)setReply(null);else setFocusing(false);}
    };
    window.addEventListener('keydown', keys); return () => window.removeEventListener('keydown', keys);
  }, [active, blocked, reply]);
  const restart = () => {setMotion(null);motionBusy.current=false;dispatch({type: 'restart'}); visits.current={}; setReset(n => n + 1); setHint(null); setStudyCommand(null); setOverlay(null); setFocusing(true); setLearningComplete(false); setCollectionFeedback(null); setReply(null); setSpark(null);};
  const fullscreen = async () => {
    try {if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen();}
    catch {setNotice('此瀏覽器未能切換全螢幕；畫卷仍會填滿視窗。');}
  };
  const seekHelp = () => {dispatch({type: 'help'}); setOverlay('help');};
  const openJournal = () => {
    journalOrigin.current={view:{...viewport.view},frame:{...viewport.frame}};
    setReply(null);setSpark(null);setOverlay('journal');
  };
  const journalLook = (finding:LanternFinding,onSettled:()=>void) => {
    const compact=viewport.frame.width<760;
    const discovered=lanternFindingFromOrigin(finding,findingOrigins);
    setStudyCommand({region:{x:discovered.actor.x,y:discovered.actor.y},scaleRatio:1.38,
      screenAnchor:compact?{x:.48,y:.22}:{x:.34,y:.49},transition:'crossfade',onSettled,token:performance.now()});
  };
  const closeJournal = () => {
    const origin=journalOrigin.current;
    if(!origin){setOverlay(null);setStudyCommand(null);return;}
    const base=Math.max(origin.frame.width/lanternSize.width,origin.frame.height/lanternSize.height);
    setStudyCommand({region:{x:(origin.frame.width/2-origin.view.x)/(lanternSize.width*origin.view.scale),
      y:(origin.frame.height/2-origin.view.y)/(lanternSize.height*origin.view.scale)},scaleRatio:origin.view.scale/base,
      transition:'crossfade',token:performance.now(),onSettled:()=>{setOverlay(null);setStudyCommand(null);journalOrigin.current=null;}});
  };
  const look = (index: number, near: boolean, onSettled?: () => void) => {
    const actor = lanternActors.find(item => item.id === lanternTargets[index].id)!;
    if(near&&index===1)setStudyAppearance({index:1,monochrome:false,region:lanternTargets[1].region,height:.5});
    setStudyCommand({region: near && index === 1 ? lanternTargets[index].region : {x: actor.x, y: actor.y},
      scaleRatio: near ? index === 1 ? 1.1 : 1.75 : undefined, screenAnchor:viewport.frame.width<700?{x:.5,y:.23}:{x:.68,y:.46},transition:'pan',onSettled,token:performance.now()});
  };
  const reviewLook = (index: number, detail: ReviewDetail, transition: 'pan' | 'crossfade', onSettled: () => void) => {
    setStudyCommand(lanternReviewCommand(index,detail,viewport.frame,transition,onSettled));
  };
  const enterPainting = async () => {
    if(entering || !ready)return;
    setEntering(true);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      setStudyCommand({region:{x:.943,y:.5},scaleRatio:1.03,transition:'pan',token:performance.now(),onSettled:()=>{setStudyCommand(null);dispatch({type:'begin'});setEntering(false);}});
      return;
    }
    setStudyCommand({region:{x:.943,y:.5},scaleRatio:1.03,transition:'crossfade',token:performance.now()});
    if(introRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      entranceAnimation.current=introRef.current.animate([{opacity:1,offset:0},{opacity:1,offset:.2},{opacity:0,offset:1}],{duration:1100,easing:'ease-in-out',fill:'forwards'});
      try{await entranceAnimation.current.finished;}catch{return;}
    }
    setStudyCommand(null); dispatch({type:'begin'}); setEntering(false);
  };
  const discoverFinding = (finding:LanternFinding, actorId:string) => {
    const newlyCollected=!claimedFindings.current.has(finding.id);
    if(newlyCollected){
      claimedFindings.current.add(finding.id);
      setFindingOrigins(previous=>({...previous,[finding.id]:actorId}));
      setCollected(previous=>previous.includes(finding.id)?previous:[...previous,finding.id]);
    }
    const bounds=journalButton.current?.getBoundingClientRect();
    const root=journalButton.current?.closest('main')?.getBoundingClientRect();
    setCollectionFeedback(null);
    const count=claimedFindings.current.size;
    const arrive=window.setTimeout(()=>{
      arrivalTimers.current.delete(arrive);
      setJournalCount(previous=>Math.max(previous,count));
      setReceiving(true);
      setCollectionFeedback({token:performance.now(),newlyCollected,findingId:finding.id,count});
      if(newlyCollected && count===lanternFindings.length)setNotice('八則見聞集齊了，紀念頁已解鎖。');
      const settle=window.setTimeout(()=>{setReceiving(false);arrivalTimers.current.delete(settle);},650);
      arrivalTimers.current.add(settle);
    },newlyCollected?1500:900);
    arrivalTimers.current.add(arrive);
    setSpark({token:performance.now(),newlyCollected,findingId:finding.id,
      source:{x:Math.max(30,Math.min(viewport.frame.width-30,viewport.view.x+finding.actor.x*lanternSize.width*viewport.view.scale)),
        y:Math.max(100,Math.min(viewport.frame.height-95,viewport.view.y+finding.actor.y*lanternSize.height*viewport.view.scale))},
      destination:{x:(bounds?.left??28)-(root?.left??0)+(bounds?.width??120)*.25,
        y:(bounds?.top??viewport.frame.height-70)-(root?.top??0)+(bounds?.height??44)*.5},frame:viewport.frame});

  };
  const finishMotion=(failed=false)=>{
    const current=motion;if(!current)return;
    setMotion(null);motionBusy.current=false;
    if(failed){setNotice('動畫暫未載入，請再點一次重試。');return;}
    if(current.emperor){dispatch({type:'inspect',id:current.actorId});return;}
    if(current.finding)discoverFinding(current.finding,current.actorId);
  };
  const inspect = (id: string) => {
    if(blocked||motionBusy.current)return;
    setReply(null);setSpark(null);
    if(game.phase==='searching'&&id===target.id){
      motionBusy.current=true;setMotion({kind:'emperor',index:game.index,actorId:id,emperor:true});return;
    }
    if(id==='background')return;
    const kind=motionFor(id);
    if(kind){
      const category=kind==='monk'?'costume':kind;
      const base=lanternFindings.find(item=>item.id===category);
      const finding=kind==='fireworks'&&base?{...base,crop:{image:assetPath('art/lantern-festival/detail-17.jpg'),sourceWidth:1231,rect:[160,660,800,430] as const},actor:{...base.actor,id:'finding-fireworks-group',x:lanternFireworksFocus.x,y:lanternFireworksFocus.y}}:base;
      motionBusy.current=true;setMotion({kind,actorId:finding?.actor.id??id,finding});return;
    }
    const finding=lanternFindingAt(id);
    if(finding)discoverFinding(finding,id);
    const visit=visits.current[id]??0;visits.current[id]=visit+1;
    const actor=lanternActors.find(item=>item.id===id);if(!actor)return;
    setReply({id,text:lanternReplyFor(id,visit),token:performance.now()});
    if(!finding&&game.phase==='searching')dispatch({type:'inspect',id});
  };
  const next = () => {
    if (game.index === lanternTargets.length - 1) setOverlay('ending');
    dispatch({type: 'next'}); setHint(null);
  };
  return <main className={`immersive-game lantern-game ${ready ? 'scene-loaded' : ''} ${game.phase === 'found' || overlay === 'ending' ? 'is-near-view' : ''} ${overlay === 'ending' ? 'is-reviewing' : ''} ${overlay === 'journal' ? 'is-journal-open' : ''}`}>
    <ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} requireTiles actors={explorationActors} initialRegion={{x: 1, y: .5}} initialFocus={{x: .5, y: .75}} onViewChange={setScrollWindow} onViewportChange={setViewport}
      study={nearView && overlay !== 'ending' ? {region: studyAppearance.region??{x:studyActor.x,y:studyActor.y}, height:studyAppearance.height??studyActor.height, monochrome: studyAppearance.monochrome} : null} studyCommand={studyCommand}
      active={active} blocked={blocked} resetKey={reset} hint={hint} command={command} onInspect={inspect}
      onExplore={()=>{setReply(null);setSpark(null);}} onMiss={() => {setReply(null);}} onReady={setReady} motion={false} steam={null} focusing={overlay === 'ending' || overlay === 'journal' ? false : focusing}
      title="憲宗元宵行樂圖" description="明代《憲宗元宵行樂圖》完整長卷，從右往左探索燃放爆竹、宮中街市與表演三個庭院"/>

    {game.phase === 'intro' ? <section ref={introRef} inert={entering} className={`introduction lantern-introduction ${entering?'is-entering':''}`} aria-label="宮中鬧元宵引言">
      <div className="intro-brand"><span/>畫中尋人</div>
      <div className="intro-content"><div className="intro-copy">
        <div className="intro-narrative" aria-live="polite" aria-atomic="true"><div className="intro-lines" key={intro}>
          <p className="intro-chapter">{intro === 0 ? '明代 · 憲宗元宵行樂圖' : '尋人，也讀畫'}</p>
          <p className="intro-story">{intro === 0 ? '明憲宗在宮中歡度元宵。\n畫家把這場節慶，\n畫成一幅長卷。' : '認清皇帝的眉眼與鬍鬚，\n在長卷裡找到他。\n也看看旁人怎樣歡度元宵。'}</p>
        </div></div>
        <button className="intro-enter" disabled={entering || (intro === 1 && !ready)} onClick={() => intro === 0 ? setIntro(1) : void enterPainting()}>
          <span>{intro === 0 ? '展開這一卷' : ready ? '入畫尋人' : '正在展卷'}</span><ArrowRight size={23}/>
        </button>
        <div className="intro-sequence"><button className="intro-back" style={{visibility: intro ? 'visible' : 'hidden'}} onClick={() => setIntro(0)}>前一幕</button><div className="intro-progress" role="img" aria-label={`引言第${intro + 1}幕，共兩幕`}><span className="is-read"/><span className={intro ? 'is-read' : ''}/></div></div>
      </div><div className="intro-title"><h1>宮中鬧元宵</h1><span className="intro-seal" aria-hidden="true">尋人</span></div></div>
      <div className="intro-footer"><p>中國國家博物館藏 · 原畫全卷</p><ChapterLinks current="lantern-festival"/></div>
    </section> : <>
      <header className="lantern-hud" inert={blocked}>
        {game.phase !== 'complete' && <section className="lantern-target" aria-label="本次人物提示">
          <button className="lantern-face-reference" aria-label="放大人物樣貌" onClick={()=>{setOverlay('help');}}><img className="lantern-face-illustration" src={lanternFaceIllustration} alt="依原畫繪製的人物樣貌提示：比對眉眼、面形與鬍鬚" draggable={false}/></button>
          <div><p className="lantern-eyebrow">尋人 · {String(game.index + 1).padStart(2, '0')} / 03</p><h1>{game.index === 0 ? '尋找這張面孔' : '再尋他的身影'}</h1>{game.index > 0 && <p className="lantern-trail" aria-label="上一處得到的線索">{lanternJourneyClues[game.index - 1].trail}</p>}<p className="lantern-progress">已尋得 {game.found.length} / 3 處</p></div>
        </section>}
        <div className="lantern-tools">
          <button className="lantern-mode" aria-pressed={focusing} title="切換凝神／彩色（F）" onClick={() => setFocusing(v => !v)}>{focusing ? '轉回彩色' : '凝神觀察'}</button>
          <button className="round-control" aria-label={sound.state === 'on' ? '關閉音樂' : '開啟古風音樂'} aria-pressed={sound.state === 'on'} onClick={() => void sound.toggle()}>{sound.state === 'on' ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button>
          <button className="round-control" aria-label="切換全螢幕" onClick={() => void fullscreen()}><Maximize size={18}/></button>
          <button className="round-control" aria-label="畫卷操作" onClick={() => setOverlay('menu')}><MoreHorizontal size={20}/></button>
        </div>
      </header>
      <footer className="lantern-footer" inert={blocked}>
        <button ref={journalButton} className={`lantern-quiet-button lantern-journal-button ${receiving?'is-spark-arriving':''}`} onClick={openJournal}><BookOpen size={18}/>見聞冊 <span>{journalCount}／{lanternFindings.length}</span></button>
        <LanternNavigator window={scrollWindow} onNavigate={x => setHint({region: {x, y: .5}, token: Date.now()})}/>
        {game.phase === 'complete' ? <button className="lantern-quiet-button" onClick={() => setOverlay('ending')}>長卷的秘密</button> : <button className="lantern-quiet-button" onClick={seekHelp}><CircleHelp size={18}/>給我提示</button>}
      </footer>
      <div className="lantern-status" role="status" aria-live="polite">{notice || (sound.state === 'error' ? '音樂未能載入，可再次點擊重試。' : '')}</div>
    </>}

    {motion&&<div className={`lantern-scene-motion ${focusing?'is-monochrome':''}`} style={{display:'contents'}}>
      {motion.kind==='emperor'?<LanternEmperorAnimation index={motion.index!} viewport={viewport} onDone={()=>finishMotion()} onError={()=>finishMotion(true)}/>:
      motion.kind==='fireworks'?<LanternFireworksAnimation viewport={viewport} onDone={()=>finishMotion()} onError={()=>finishMotion(true)}/>:
      motion.kind==='stove'?<LanternStoveAnimation viewport={viewport} onDone={()=>finishMotion()} onError={()=>finishMotion(true)}/>:
      motion.kind==='theatre'?<LanternTheatreAnimation viewport={viewport} onDone={()=>finishMotion()} onError={()=>finishMotion(true)}/>:
      motion.kind==='monk'?<LanternMonkAnimation viewport={viewport} onDone={()=>finishMotion()} onError={()=>finishMotion(true)}/>:
      <LanternZhongKuiAnimation viewport={viewport} onDone={()=>finishMotion()} onError={()=>finishMotion(true)}/>}
    </div>}
    {collectionFeedback && !blocked && <LanternNotice key={collectionFeedback.token} findingId={collectionFeedback.findingId} quiet={!collectionFeedback.newlyCollected}
      text={`${collectionFeedback.newlyCollected?'已收集':'已收藏'}：${lanternJournalItems[collectionFeedback.findingId].title}`}
      detail={collectionFeedback.newlyCollected?`元宵見聞 ${collectionFeedback.count}／${lanternFindings.length}`:undefined}/>}
    {spark && !blocked && <LanternSparkDiscovery key={spark.token} discovery={spark} onDone={()=>setSpark(null)}/>}
    {reply && !blocked && (()=>{
      const actor=lanternActors.find(item=>item.id===reply.id)!;
      const x=viewport.view.x+actor.x*lanternSize.width*viewport.view.scale,y=viewport.view.y+actor.y*lanternSize.height*viewport.view.scale;
      if(x<0||x>viewport.frame.width||y<0||y>viewport.frame.height)return null;
      const placement=placeLanternReply(actor,lanternActors,viewport.view,viewport.frame,reply.text);
      return <aside key={reply.token} className={`lantern-character-reply tail-${placement.tailSide}`} aria-label="畫中人物的遊戲虛構對白" style={{left:placement.left,top:placement.top,width:placement.width,'--reply-tail-x':`${placement.tailX}px`,'--reply-tail-y':`${placement.tailY}px`} as import('react').CSSProperties}>
        <p role="status">{reply.text}</p>

      </aside>;
    })()}
    {overlay==='journal' && <LanternJournal collected={collected} onLook={journalLook} compact={viewport.frame.width<760} onClose={closeJournal}/>}
    {game.phase === 'found' && <LanternDiscovery key={target.id} target={target} number={game.found.length} viewport={viewport}
      onNext={next} onLook={look} onAppearance={(index, monochrome) => setStudyAppearance({index, monochrome})}
      onPlaceLook={(place,onSettled)=>{
        if(place==='compare'){setStudyAppearance({index:1,monochrome:false,region:lanternTargets[1].region,height:.5});look(1,true,onSettled);return;}
        const region=place==='platform'?lanternPlatformFocus:lanternCourtyardFocus;
        setStudyAppearance({index:1,monochrome:false,region,height:.32});
        setStudyCommand({region,scaleRatio:1.4,screenAnchor:viewport.frame.width<700?{x:.5,y:.23}:{x:.72,y:.46},transition:'pan',onSettled,token:performance.now()});
      }}/>
}
    {overlay === 'help' && <LanternDialog key={`${game.index}-${game.help}`} className={game.help===0?'lantern-appearance-art':'lantern-appearance-help'} title={game.help===0?'可曾見過此人？':'再看一個細節'} onClose={() => setOverlay(null)}>
      {game.help===0 ? <>
        <img className="lantern-art-card-image" src={lanternAppearanceCard} alt="尋人：可曾見過此人？認清眉眼，留意鬍鬚。頭像為依原畫製作的辨認用摹繪。" draggable={false}/>
        <button className="lantern-art-card-action art-card-return" aria-label="回畫中找找" onClick={()=>setOverlay(null)}><span className="sr-only">回畫中找找</span></button>
        <button className="lantern-art-card-action art-card-more" aria-label="再給提示" onClick={()=>dispatch({type:'help'})}><span className="sr-only">再給提示</span></button>
      </> : <>
      <p className="lantern-eyebrow">{`尋人 · 提示 ${game.help} / 3`}</p>
      <div className="lantern-appearance-body">
        <figure className="lantern-appearance-figure">
          <ArtCrop crop={game.help===1?target.head:target.portrait} label={game.help===1?'原畫頭部提示':'原畫衣着與姿勢提示'}/>
          <figcaption>原畫局部</figcaption>
        </figure>
        <div className="lantern-appearance-copy">
          <p>{game.help===1?'看看頭部的輪廓，\n再回畫中比對。':target.action}</p>
          <button className="lantern-return-link" onClick={() => setOverlay(null)}>回畫中尋人 <ArrowRight size={18}/></button>
        </div>
      </div>
      <div className="lantern-appearance-footer">
        <span>需要時才打開下一個提示</span>
        {game.help < 3 ? <button className="lantern-text-button" onClick={() => {dispatch({type: 'help'}); if (game.help === 2) {setOverlay(null); setHint({region: target.region, token: Date.now()});}}}>{game.help===1?'看看衣着與姿勢':'帶我到大致位置'}</button>
          : <button className="lantern-text-button" onClick={() => {setOverlay(null); setHint({region: target.region, token: Date.now()});}}>看看大致位置</button>}
      </div>
      </>}
    </LanternDialog>}
    {overlay === 'about' && <LanternDialog title="畫作小記" onClose={() => setOverlay(null)}>
      <p className="lantern-eyebrow">憲宗元宵行樂圖 · 明代 · 佚名 · 絹本設色<br/>中國國家博物館藏</p>
      <p>這幅長卷描繪明憲宗在宮中慶祝元宵的情景。由右往左，穿過燃放爆竹、宮中街市與表演三個庭院，尋找同一位皇帝的三次出現。</p>
      <p>「絹本設色」指在絹上用顏色作畫。細線勾勒與仔細設色，呈現工筆式的細緻表現；凝神灰階是遊戲的觀察工具。</p>
      <p>皇帝在不同庭院先後出現，串起不同時空的活動。這種連續敘事，國博稱為「連環畫式構圖」。</p>
      <p>畫中也有宮廷仿設的街市。它讓我們看見宮廷如何呈現節慶生活；研究民間元宵時，仍要結合其他史料。</p>
      <p className="lantern-source-note">尋人途中明憲宗提供的對白為遊戲虛構，用來串起三段行蹤。探索時人物的短回覆亦為遊戲虛構；畫作觀察與宮廷背景另依原畫及館方資料介紹。</p>
      <details className="lantern-study-notes"><summary>三次觀察筆記</summary>{lanternTargets.map((item, index) => <section key={item.id}>
        <h3>{index + 1} · {lanternObservations[item.id].artTitle}</h3><p>{lanternObservations[item.id].artText}</p>
        <h4>{lanternObservations[item.id].historyTitle}</h4><p>{lanternObservations[item.id].historyText}</p>
      </section>)}</details>
      <details><summary>畫作與圖像來源</summary><ul>{lanternSources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul><p className="lantern-source-note">完整原卷作底圖，Commons 原畫局部依相同位置疊放，補充近看細節。畫卷與觀察證據保留原圖檔，沒有生成或補畫人物；辨認用頭像則依原畫生成樣貌摹繪，並非高清原畫掃描。不同掃描間仍有輕微色調及接縫差異。檔案頁標示公共領域原作的忠實複製。</p><p className="lantern-source-note">音樂：<a href="https://ende.app/en/song/12393-chinese-restaurant-background-4" target="_blank" rel="noreferrer">Chinese Restaurant Background 4 · Sascha Ende</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>，低音量循環播放。</p></details>
    </LanternDialog>}
    {overlay === 'menu' && <LanternDialog title="畫卷操作" onClose={() => setOverlay(null)}>
      <p>凝神模式下，滑鼠移動彩色觀察範圍，拖曳可左右探卷。觸控時以一指凝神，兩指移動畫卷及縮放。</p>
      <p>鍵盤：F 切換模式，＋／－縮放；凝神時方向鍵移動觀察範圍。Tab 可選取畫中人物，Enter 點選。</p>
      <div className="lantern-menu-controls">{([['in', '放大'], ['out', '縮小'], ['overview', '回到卷首']] as const).map(([type, label]) => <button className="small-button" key={type} onClick={() => {setOverlay(null); setCommand({type, token: Date.now()});}}>{label}</button>)}</div>
      <p><button className="lantern-text-button" onClick={()=>setOverlay('about')}>畫作小記與資料來源</button></p>
      <p><a href="#dialogue-preview">比較兩種對白版式</a></p>
      <p><a href="#journal-preview">比較兩種見聞冊版式</a></p>
      <div className="lantern-paper-actions"><button className="lantern-text-button" onClick={restart}>重新尋人</button><button className="lantern-text-button" onClick={returnToChapterCover}>回到本章封面</button></div>
    </LanternDialog>}
    {overlay === 'ending' && <LanternEpilogue completed={learningComplete} collected={collected.length} onJournal={openJournal} initialScene={studyAppearance.index} viewport={viewport} onComplete={() => setLearningComplete(true)}
      onLook={reviewLook} onClose={() => {setStudyCommand(null); setOverlay(null); if(collected.length<lanternFindings.length)setNotice(`尋得皇帝，畫中仍有 ${lanternFindings.length-collected.length} 則見聞等待發現。`);}} onRestart={restart}/>}
  </main>;
}
