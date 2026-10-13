import {useMemo,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {lanternFullScroll,lanternSize,lanternTiles} from '../game/lanternFestival.ts';
import {LanternMarketAnimation,lanternMarketFocus,lanternMarketRegion} from './LanternMarketAnimation.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import '../lantern.css';
import '../lantern-observation.css';

export function LanternMarketPreview(){
  const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false);
  const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
  const compact=viewport.frame.width<700;
  const command=useMemo<StudyCommand>(()=>({region:lanternMarketFocus,scaleRatio:compact?1.1:1.55,screenAnchor:compact?{x:.5,y:.23}:{x:.72,y:.48},transition:'pan',token:compact?2:1}),[compact]);
  const play=()=>{if(!ready||playing)return;setFailed(false);setPlaying(true);};
  const finish=()=>{setPlaying(false);setSeen(true);};
  return <main className="immersive-game lantern-game is-near-view is-reviewing">
    <ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} actors={[]} active blocked resetKey={0} hint={null}
      initialRegion={lanternMarketFocus} requireTiles onInspect={()=>{}} onReady={setReady} motion={false} focusing={false} studyCommand={command} onViewportChange={setViewport}
      title="貨郎擔情景試作" description="貨郎向童子展示小物，擔子上的掛飾隨動作輕晃"/>
    <header className="lantern-market-preview-header">貨郎擔動畫試作 <a href="#lantern-festival">回到遊戲</a></header>
    {ready&&!playing&&<LanternPaintingTarget region={lanternMarketRegion} viewport={viewport} label="播放貨郎與童子的情景演繹" hint="點擊貨郎或童子" onClick={play}/>}
    {playing&&<LanternMarketAnimation viewport={viewport} onDone={finish} onError={()=>{setFailed(true);finish();}}/>}
    <LanternPaintingNote index={1} viewport={viewport} label="畫中情景演繹 · 試作" title={seen?'宮苑裡的一副擔子':'看看貨郎與童子的互動'} busy={playing}>
      <p className="lantern-note-body">{seen?'貨郎展示小物，掛飾隨之輕晃。\n這樣的街市景象，為甚麼出現在皇宮？':'輕點畫中的貨郎或童子，\n留意小物與掛飾的動作。'}</p>
      {failed&&<p className="lantern-note-caption" role="status">動畫暫未載入，可再次點擊重試。</p>}
      <button className="lantern-note-next" disabled={!ready||playing} onClick={play}>{seen?'再看一次':'播放試作'} <span aria-hidden="true">→</span></button>
    </LanternPaintingNote>
  </main>;
}
