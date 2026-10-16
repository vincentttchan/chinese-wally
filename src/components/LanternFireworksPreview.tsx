import {useEffect,useMemo,useRef,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {lanternFullScroll,lanternSize,lanternTiles} from '../game/lanternFestival.ts';
import {LanternFireworksAnimation,lanternFireworksFocus,lanternFireworksRegions} from './LanternFireworksAnimation.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import {LanternJournal} from './LanternJournal.tsx';
import {LanternSparkDiscovery} from './LanternSparkDiscovery.tsx';
import type {SparkDiscovery} from './LanternSparkDiscovery.tsx';
import {LanternNotice} from './LanternNotice.tsx';
import {lanternFindings} from '../game/lanternCollection.ts';
import {assetPath} from '../game/assets.ts';
import {BookOpen} from './ArtIcons.tsx';
import '../lantern.css';
import '../lantern-observation.css';
import '../lantern-journal.css';

const sampleFindings=lanternFindings.map(finding=>finding.id==='fireworks'?{...finding,observe:'留意手持短筒、長竿的人，以及旁邊人物抬手和側身的姿勢。',crop:{image:assetPath('art/lantern-festival/detail-17.jpg'),sourceWidth:1231,rect:[160,660,800,430] as const},actor:{...finding.actor,x:lanternFireworksFocus.x,y:lanternFireworksFocus.y}}:finding);

/** Session-only sample: demonstrates playback then the existing collection flow. */
export function LanternFireworksPreview(){
  const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false);
  const [collected,setCollected]=useState<string[]>([]),[count,setCount]=useState(0),[journal,setJournal]=useState(false);
  const [spark,setSpark]=useState<SparkDiscovery|null>(null),[receiving,setReceiving]=useState(false),[notice,setNotice]=useState('');
  const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
  const button=useRef<HTMLButtonElement>(null),busy=useRef(false),timers=useRef<number[]>([]);
  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
  const compact=viewport.frame.width<700;
  const initial=useMemo<StudyCommand>(()=>({region:lanternFireworksFocus,scaleRatio:compact?.95:1.18,screenAnchor:compact?{x:.5,y:.35}:{x:.63,y:.53},transition:'pan',token:compact?2:1}),[compact]);
  const [look,setLook]=useState<StudyCommand|null>(null);
  const play=()=>{if(!ready||busy.current||journal)return;busy.current=true;setFailed(false);setNotice('');setSpark(null);setPlaying(true);};
  const finish=()=>{
    setPlaying(false);setSeen(true);
    const fresh=!collected.includes('fireworks');
    if(fresh)setCollected(['fireworks']);
    const bounds=button.current?.getBoundingClientRect();
    const source={x:viewport.view.x+lanternFireworksFocus.x*lanternSize.width*viewport.view.scale,y:viewport.view.y+lanternFireworksFocus.y*lanternSize.height*viewport.view.scale};
    const destination=bounds?{x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2}:{x:viewport.frame.width-90,y:45};
    setSpark({token:performance.now(),newlyCollected:fresh,findingId:'fireworks',source,destination,frame:viewport.frame});
    timers.current.push(window.setTimeout(()=>{setCount(1);setReceiving(true);setNotice(fresh?'已收藏：一點元宵火光':'已記在冊中：一點元宵火光');},fresh?1500:500));
    timers.current.push(window.setTimeout(()=>{setReceiving(false);busy.current=false;},fresh?2300:1000));
    timers.current.push(window.setTimeout(()=>setNotice(''),fresh?5100:3000));
  };
  return <main className="immersive-game lantern-game is-near-view is-reviewing">
    <ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} actors={[]} active blocked resetKey={0} hint={null}
      initialRegion={lanternFireworksFocus} requireTiles onInspect={()=>{}} onReady={setReady} motion={false} focusing={false} studyCommand={look??initial} onViewportChange={setViewport}
      title="爆竹群像動畫樣段" description="原畫中手持短筒的紅衣人、藍衣人、背身紅衣人與綠衣人的呼應"/>
    {!journal&&<>
      <header className="lantern-acrobat-preview-header">爆竹群像 · 動畫樣段 <a href="#lantern-festival">回到遊戲</a></header>
      <div className="lantern-acrobat-preview-header" style={{left:'auto',right:24,top:compact?68:24}}>
        <button ref={button} className={`lantern-quiet-button lantern-journal-button ${receiving?'is-spark-arriving':''}`} disabled={playing||Boolean(spark)} onClick={()=>setJournal(true)}><BookOpen size={18}/>見聞冊 <span>{count}／{sampleFindings.length}</span></button>
      </div>
      {ready&&!playing&&!spark&&lanternFireworksRegions.map((region,index)=><LanternPaintingTarget key={index} region={region} viewport={viewport} label={`播放爆竹群像：${['引火紅衣人','抬手藍衣人','背身持竿者','綠衣人'][index]}`} hint={index===0?'輕點引火的人':undefined} onClick={play}/>)}
      {playing&&<LanternFireworksAnimation viewport={viewport} onDone={finish} onError={()=>{setPlaying(false);setFailed(true);busy.current=false;}}/>}
      <LanternPaintingNote index={0} viewport={viewport} label="畫中情景演繹 · 樣段" title={seen?'一點火光，幾種反應':'看看他們怎樣呼應'} busy={playing||Boolean(spark)}>
        <p className="lantern-note-body">{seen?'手中一點火光，\n牽動旁邊人的手勢與身姿。':'輕點手持短筒的紅衣人，\n留意旁邊幾人的反應。'}</p>
        <p className="lantern-note-caption">{seen?'動作為情景演繹，原畫為觀察依據。':'播放後，一點元宵火光收入見聞冊。'}</p>
        {failed&&<p role="status" className="lantern-note-caption">素材暫未載入，請再點一次重試。</p>}
        <button className="lantern-note-next" disabled={!ready||playing||Boolean(spark)} onClick={play}>{seen?'再看一次':'播放樣段'} <span aria-hidden="true">→</span></button>
      </LanternPaintingNote>
      {spark&&<LanternSparkDiscovery key={spark.token} discovery={spark} onDone={()=>setSpark(null)}/>}
      {notice&&<LanternNotice key={notice} findingId="fireworks" text={notice}/>}
    </>}
    {journal&&<LanternJournal sessionOnly findings={sampleFindings} collected={collected} compact={compact} onClose={()=>{setJournal(false);setLook({...initial,token:performance.now()});}} onLook={(_finding,onSettled)=>setLook({region:lanternFireworksFocus,scaleRatio:compact?1:1.18,screenAnchor:compact?{x:.5,y:.23}:{x:.33,y:.49},transition:'pan',token:performance.now(),onSettled})}/>}
  </main>;
}
