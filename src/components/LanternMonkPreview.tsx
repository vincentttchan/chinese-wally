import {useEffect,useMemo,useRef,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {lanternFullScroll,lanternSize,lanternTiles} from '../game/lanternFestival.ts';
import {LanternMonkAnimation} from './LanternMonkAnimation.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import {LanternJournal} from './LanternJournal.tsx';
import {LanternSparkDiscovery} from './LanternSparkDiscovery.tsx';
import type {SparkDiscovery} from './LanternSparkDiscovery.tsx';
import {LanternNotice} from './LanternNotice.tsx';
import {lanternZhongKuiFinding} from '../game/lanternZhongKui.ts';
import {lanternStoveFinding} from '../game/lanternStove.ts';
import {lanternMonkFocus,lanternMonkRegions} from '../game/lanternMonk.ts';
import {lanternFindings} from '../game/lanternCollection.ts';
import {BookOpen} from './ArtIcons.tsx';
import '../lantern.css';
import '../lantern-observation.css';
import '../lantern-journal.css';

const sampleFindings=[...new Map(([...lanternFindings,lanternStoveFinding,lanternZhongKuiFinding]).map(item=>[item.id,item])).values()];

/** Session-only sample: demonstrates playback then the existing collection flow. */
export function LanternMonkPreview(){
  const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false);
  const [collected,setCollected]=useState<string[]>([]),[count,setCount]=useState(0),[journal,setJournal]=useState(false);
  const [spark,setSpark]=useState<SparkDiscovery|null>(null),[receiving,setReceiving]=useState(false),[notice,setNotice]=useState('');
  const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
  const button=useRef<HTMLButtonElement>(null),busy=useRef(false),timers=useRef<number[]>([]);
  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
  const compact=viewport.frame.width<700;
  const initial=useMemo<StudyCommand>(()=>({region:lanternMonkFocus,scaleRatio:compact?1.2:1.7,screenAnchor:compact?{x:.5,y:.35}:{x:.62,y:.53},transition:'pan',token:compact?2:1}),[compact]);
  const [look,setLook]=useState<StudyCommand|null>(null);
  const play=()=>{if(!ready||busy.current||journal)return;busy.current=true;setFailed(false);setNotice('');setSpark(null);setPlaying(true);};
  const finish=()=>{
    setPlaying(false);setSeen(true);
    const fresh=!collected.includes('costume');
    if(fresh)setCollected(['costume']);
    const bounds=button.current?.getBoundingClientRect();
    const source={x:viewport.view.x+lanternMonkFocus.x*lanternSize.width*viewport.view.scale,y:viewport.view.y+lanternMonkFocus.y*lanternSize.height*viewport.view.scale};
    const destination=bounds?{x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2}:{x:viewport.frame.width-90,y:45};
    setSpark({token:performance.now(),newlyCollected:fresh,findingId:'costume',source,destination,frame:viewport.frame});
    timers.current.push(window.setTimeout(()=>{setCount(1);setReceiving(true);setNotice(fresh?'已收藏：和尚戲裝':'已記在冊中：和尚戲裝');},fresh?1500:500));
    timers.current.push(window.setTimeout(()=>{setReceiving(false);busy.current=false;},fresh?2300:1000));
    timers.current.push(window.setTimeout(()=>setNotice(''),fresh?5100:3000));
  };
  return <main className="immersive-game lantern-game is-near-view is-reviewing">
    <ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} actors={[]} active blocked resetKey={0} hint={null}
      initialRegion={lanternMonkFocus} requireTiles onInspect={()=>{}} onReady={setReady} motion={false} focusing={false} studyCommand={look??initial} onViewportChange={setViewport}
      title="和尚戲裝動畫樣段" description="原畫中黃袍和尚的笑臉與舉手姿勢"/>
    {!journal&&<>
      <header className="lantern-acrobat-preview-header">和尚戲裝 · 動畫樣段 <a href="#lantern-festival">回到遊戲</a></header>
      <div className="lantern-acrobat-preview-header" style={{left:'auto',right:24,top:compact?68:24}}>
        <button ref={button} className={`lantern-quiet-button lantern-journal-button ${receiving?'is-spark-arriving':''}`} disabled={playing||Boolean(spark)} onClick={()=>setJournal(true)}><BookOpen size={18}/>見聞冊 <span>{count}／{sampleFindings.length}</span></button>
      </div>
      {ready&&!playing&&!spark&&lanternMonkRegions.map((region,index)=><LanternPaintingTarget key={index} region={region} viewport={viewport} label={`播放和尚戲裝：${['黃袍和尚'][index]}`} hint={index===0?'輕點黃袍和尚':undefined} onClick={play}/>)}
      {playing&&<LanternMonkAnimation viewport={viewport} onDone={finish} onError={()=>{setPlaying(false);setFailed(true);busy.current=false;}}/>}
      <LanternPaintingNote index={2} viewport={viewport} label="畫中情景演繹 · 樣段" title={seen?'笑臉舉手，招呼一聲':'看看和尚的招呼動作'} busy={playing||Boolean(spark)}>
        <p className="lantern-note-body">{seen?'和尚轉頭、舉手招呼，\n寬袍隨着身勢輕動。':'輕點畫中的黃袍和尚，\n留意他的笑臉與舉手姿勢。'}</p>
        <p className="lantern-note-caption">{seen?'動作為情景演繹，原畫為觀察依據。':'播放後，收入「和尚戲裝」。'}</p>
        {failed&&<p role="status" className="lantern-note-caption">素材暫未載入，請再點一次重試。</p>}
        <button className="lantern-note-next" disabled={!ready||playing||Boolean(spark)} onClick={play}>{seen?'再看一次':'播放樣段'} <span aria-hidden="true">→</span></button>
      </LanternPaintingNote>
      {spark&&<LanternSparkDiscovery key={spark.token} discovery={spark} onDone={()=>setSpark(null)}/>}
      {notice&&<LanternNotice key={notice} findingId="costume" text={notice}/>}
    </>}
    {journal&&<LanternJournal sessionOnly findings={sampleFindings} collected={collected} compact={compact} onClose={()=>{setJournal(false);setLook({...initial,token:performance.now()});}} onLook={(finding,onSettled)=>setLook({region:{x:finding.actor.x,y:finding.actor.y},scaleRatio:compact?1.2:1.7,screenAnchor:compact?{x:.5,y:.23}:{x:.33,y:.49},transition:'pan',token:performance.now(),onSettled})}/>}
  </main>;
}
