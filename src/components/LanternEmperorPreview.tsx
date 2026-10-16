import {useMemo,useRef,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {lanternActors,lanternFullScroll,lanternLocation,lanternSize,lanternTargets,lanternTiles} from '../game/lanternFestival.ts';
import {lanternEmperorMotions} from '../game/lanternEmperorMotion.ts';
import {LanternEmperorAnimation} from './LanternEmperorAnimation.tsx';
import {LanternEmperorSpeech} from './LanternEmperorSpeech.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import '../lantern.css';
import '../lantern-observation.css';

export function LanternEmperorPreview(){
  const [index,setIndex]=useState(0),[ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false),[moving,setMoving]=useState(false);
  const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
  const busy=useRef(false),motion=lanternEmperorMotions[index];
  const compact=viewport.frame.width<700;
  const command=useMemo<StudyCommand>(()=>({region:lanternEmperorMotions[index].focus,scaleRatio:compact?1.35:1.9,screenAnchor:compact?{x:.5,y:.48}:{x:.66,y:.52},transition:'pan',token:index*2+Number(compact),onSettled:()=>setMoving(false)}),[index,compact]);
  const actor=lanternActors.find(person=>person.id===lanternTargets[index].id)!;
  const [x,y,w,h]=motion.hit;
  const region={points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([px,py])=>lanternLocation(motion.tile,px,py))};
  const play=()=>{if(!ready||busy.current||moving)return;busy.current=true;setFailed(false);setPlaying(true);};
  const finish=()=>{setPlaying(false);setSeen(true);busy.current=false;};
  const select=(next:number)=>{if(next===index||busy.current||moving)return;setMoving(true);setSeen(false);setFailed(false);setIndex(next);};
  return <main className="immersive-game lantern-game is-near-view is-reviewing">
    <ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} actors={[]} active blocked resetKey={0} hint={null}
      initialRegion={lanternEmperorMotions[0].focus} requireTiles onInspect={()=>{}} onReady={setReady} motion={false} focusing={false} studyCommand={command} onViewportChange={setViewport}
      title="三處皇帝身影的動作樣段" description="找到皇帝後才播放的原位動作，依原畫摹繪連續人物姿態，保留欄杆遮擋"/>
    <header className="lantern-acrobat-preview-header" style={{right:24,flexWrap:'wrap',gap:12}}>
      <span>皇帝身影 · 動作樣段</span>
      {lanternEmperorMotions.map((entry,i)=><button key={entry.id} className="lantern-quiet-button" aria-pressed={i===index} disabled={playing||moving} onClick={()=>select(i)}>{['一','二','三'][i]} · {entry.label}</button>)}
      <a href="#lantern-festival">回到遊戲</a>
    </header>
    {ready&&!playing&&!moving&&<LanternPaintingTarget region={region} viewport={viewport} label={`觀看尋得第${index+1}處皇帝後的動作`} onClick={play}/>}
    {playing&&<LanternEmperorAnimation key={index} index={index} viewport={viewport} onDone={finish} onError={()=>{setPlaying(false);setFailed(true);busy.current=false;}}/>}
    {!seen&&<LanternPaintingNote index={index} viewport={viewport} label="尋獲後的回應 · 樣段" title={motion.label} busy={playing||moving}>
      <p className="lantern-note-body">{motion.action}</p>
      <p className="lantern-note-caption">人物動作摹繪，眉眼、衣飾與姿勢以原畫為準。</p>
      {failed&&<p className="lantern-note-caption" role="status">素材未能載入，原畫仍可觀看；請重試。</p>}
      <button className="lantern-note-next" disabled={!ready||playing||moving} onClick={play}>看看尋獲後的動作 <span aria-hidden="true">→</span></button>
    </LanternPaintingNote>}
    {seen&&!playing&&!moving&&<LanternEmperorSpeech actor={actor} viewport={viewport} progress={index+1} text={motion.speech} actionLabel="重播動作" onContinue={play}/>}
  </main>;
}
