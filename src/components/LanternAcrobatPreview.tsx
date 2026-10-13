import {useMemo,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {lanternFullScroll,lanternSize,lanternTiles} from '../game/lanternFestival.ts';
import {LanternAcrobatAnimation,lanternAcrobatFocus,lanternAcrobatRegion} from './LanternAcrobatAnimation.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import '../lantern.css';
import '../lantern-observation.css';

export function LanternAcrobatPreview(){
  const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false);
  const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
  const compact=viewport.frame.width<700;
  const command=useMemo<StudyCommand>(()=>({region:lanternAcrobatFocus,scaleRatio:compact?1.05:1.35,screenAnchor:compact?{x:.5,y:.23}:{x:.72,y:.48},transition:'pan',token:compact?2:1}),[compact]);
  const play=()=>{if(!ready||playing)return;setFailed(false);setPlaying(true);};
  const finish=()=>{setPlaying(false);setSeen(true);};
  return <main className="immersive-game lantern-game is-near-view is-reviewing">
    <ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} actors={[]} active blocked resetKey={0} hint={null}
      initialRegion={lanternAcrobatFocus} requireTiles onInspect={()=>{}} onReady={setReady} motion={false} focusing={false} studyCommand={command} onViewportChange={setViewport}
      title="雜技情景試作" description="原畫輪上童子與下方托輪者的雜技局部"/>
    <header className="lantern-acrobat-preview-header">雜技動畫試作 <a href="#lantern-festival">回到遊戲</a></header>
    {ready&&!playing&&<LanternPaintingTarget region={lanternAcrobatRegion} viewport={viewport} label="播放原畫位置的雜技演繹" hint="點擊雜技人物" onClick={play}/>}
    {playing&&<LanternAcrobatAnimation viewport={viewport} onDone={finish} onError={()=>{setFailed(true);finish();}}/>}
    <LanternPaintingNote index={2} viewport={viewport} label="畫中情景演繹 · 試作" title={seen?'輪上與輪下':'讓這一處雜技動起來'} busy={playing}>
      <p className="lantern-note-body">{seen?'下方藝人用腳托輪，\n上方童子站在輪上吹奏。':'輕點畫中的雜技人物，\n看看上下兩人的配合。'}</p>
      {seen&&<p className="lantern-note-caption">他們怎樣一起保持平衡？</p>}
      {failed&&<p className="lantern-note-caption" role="status">動畫暫未載入，可再次點擊重試。</p>}
      <button className="lantern-note-next" disabled={!ready||playing} onClick={play}>{seen?'再看一次':'播放試作'} <span aria-hidden="true">→</span></button>
    </LanternPaintingNote>
  </main>;
}
