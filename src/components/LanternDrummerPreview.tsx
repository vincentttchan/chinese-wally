import {useMemo,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {lanternFullScroll,lanternSize,lanternTiles} from '../game/lanternFestival.ts';
import {LanternDrummerAnimation,lanternDrummerFocus,lanternDrummerRegion} from './LanternDrummerAnimation.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import '../lantern.css';
import '../lantern-observation.css';

export function LanternDrummerPreview(){
  const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false);
  const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
  const compact=viewport.frame.width<700;
  const command=useMemo<StudyCommand>(()=>({region:lanternDrummerFocus,scaleRatio:compact?1.05:1.35,screenAnchor:compact?{x:.5,y:.23}:{x:.72,y:.48},transition:'pan',token:compact?2:1}),[compact]);
  const play=()=>{if(!ready||playing)return;setFailed(false);setPlaying(true);};
  const finish=()=>{setPlaying(false);setSeen(true);};
  return <main className="immersive-game lantern-game is-near-view is-reviewing">
    <ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} actors={[]} active blocked resetKey={0} hint={null}
      initialRegion={lanternDrummerFocus} requireTiles onInspect={()=>{}} onReady={setReady} motion={false} focusing={false} studyCommand={command} onViewportChange={setViewport}
      title="鼓手擊鼓情景試作" description="原畫左下藍衣鼓手局部"/>
    <header className="lantern-acrobat-preview-header">鼓手擊鼓動畫試作 <a href="#lantern-festival">回到遊戲</a></header>
    {ready&&!playing&&<LanternPaintingTarget region={lanternDrummerRegion} viewport={viewport} label="播放原畫位置的鼓手擊鼓演繹" hint="點擊藍衣鼓手" onClick={play}/>}
    {playing&&<LanternDrummerAnimation viewport={viewport} onDone={finish} onError={()=>{setFailed(true);finish();}}/>}
    <LanternPaintingNote index={2} viewport={viewport} label="畫中情景演繹 · 試作" title={seen?'鼓槌落下的一刻':'讓這位鼓手動起來'} busy={playing}>
      <p className="lantern-note-body">{seen?'原畫中的鼓手持着兩支鼓槌，\n這段動作是依其姿勢作的情景演繹。':'輕點畫中的藍衣鼓手，\n看看抬槌、擊鼓與回彈。'}</p>
      {seen&&<p className="lantern-note-caption">留意雙手與鼓面的位置。</p>}
      {failed&&<p className="lantern-note-caption" role="status">動畫暫未載入，可再次點擊重試。</p>}
      <button className="lantern-note-next" disabled={!ready||playing} onClick={play}>{seen?'再看一次':'播放試作'} <span aria-hidden="true">→</span></button>
    </LanternPaintingNote>
  </main>;
}
