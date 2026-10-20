import {useEffect,useMemo,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {LuoshenNote} from './LuoshenPanels.tsx';
import {LuoshenRibbonAnimation} from './LuoshenRibbonAnimation.tsx';
import {luoshenImage,luoshenTiles,luoshenSize} from '../game/luoshen.ts';
import {luoshenFigureLayout} from '../game/luoshenFigureLayout.ts';
import '../lantern.css';
import '../lantern-journal.css';
import '../lantern-field-journal.css';
import '../lantern-observation.css';
import '../lantern-market.css';
import '../luoshen.css';
import '../luoshen-ribbon.css';
const focus={x:(8*1995+835)/19950,y:535/943};
export function LuoshenRibbonPreview(){
 const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false),[folded,setFolded]=useState(false),[settledFrame,setSettledFrame]=useState('');
 const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:720}});
 const layout=luoshenFigureLayout(viewport.frame),frameKey=`${viewport.frame.width}x${viewport.frame.height}`,settled=settledFrame===frameKey;
 useEffect(()=>{const old=document.title;document.title='洛神身姿試看 · 洛水之間';return()=>{document.title=old;};},[]);
 useEffect(()=>{setPlaying(false);},[viewport.frame.width,viewport.frame.height]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setPlaying(false);document.querySelector<HTMLElement>('.luoshen-ribbon-preview .lantern-observation-note')?.focus({preventScroll:true});}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const command=useMemo<StudyCommand>(()=>({...luoshenFigureLayout(viewport.frame),transition:'pan',token:performance.now(),onSettled:()=>setSettledFrame(frameKey)}),[viewport.frame.width,viewport.frame.height]);
 const play=()=>{if(!ready||playing||!settled)return;setFailed(false);setPlaying(true);};
 const finish=()=>{setPlaying(false);setSeen(true);};
 return <main data-chapter-preview className={`immersive-game lantern-game luoshen-game luoshen-ribbon-preview is-figure-context ${layout.stacked?'is-figure-stacked':''} ${ready?'scene-loaded':''}`} aria-label="洛水之間洛神全身原位動畫試看" style={{'--figure-note-height':`${layout.noteMaxHeight}px`} as React.CSSProperties}>
  <ScrollScene image={luoshenImage} tiles={luoshenTiles} requireTiles artworkSize={luoshenSize} actors={[]} active blocked resetKey={0} hint={null} onInspect={()=>{}} onReady={setReady} focusing={false} motion={false} initialRegion={focus} studyCommand={command} zoomStops={[1,1.6,2.6,3.4]} onViewportChange={setViewport} title="洛神賦圖" description="初見洛神的完整身影；重繪人物輕傾回轉，山石與絹底保持原位。"/>
  <header className="lantern-market-preview-header">重繪洛神身姿 · 試看 <a href="#luoshen">回到洛水之間</a></header>
  {playing&&<LuoshenRibbonAnimation viewport={viewport} onDone={finish} onError={()=>{setFailed(true);setPlaying(false);}}/>}
  <LuoshenNote compact viewport={viewport} label={playing?'原位演繹 · 試看':'原畫對照 · 試看'} title="洛神的身姿" folded={folded} onFold={()=>setFolded(v=>!v)} busy={false} primaryAction={<div className="luoshen-figure-action-row"><button className="lantern-note-next" disabled={!ready||!settled||playing} onClick={play}>{playing?'身姿演繹中…':seen?'再看一次':'播放演繹'} <span aria-hidden>→</span></button><button className="lantern-note-secondary" onClick={()=>{setPlaying(false);setSeen(false);}}>返回原畫</button></div>}>
   <p className="lantern-note-body">{playing?'洛神輕傾回轉，手勢與衣帶隨後。':seen?'連著身姿與衣帶，再看原畫。':'連著髮式、手勢與衣帶，看洛神的身姿。'}</p>
   <p className="lantern-note-caption">重繪演繹；播完回到原畫。</p>
   {failed&&<p role="status" className="lantern-note-caption">演繹素材暫未載入；原畫保留，可重試。</p>}
   <details className="luoshen-reading-supplement"><summary>這段怎樣製作</summary><p>整位洛神依原畫重繪，加深赭色、朱色與墨線。頭頸、持物手臂、軀幹及兩條衣帶分件製作，以不同節奏微動，局部生成補底只在演繹時遮蓋原身影；周邊山石與絹底不變。這是遊戲演繹，不是古畫復原。減少動態時保留原畫。</p></details>
  </LuoshenNote>
  {!playing&&ready&&<button className="luoshen-ribbon-hit" aria-label="點看洛神身姿演繹" onClick={play} style={{left:viewport.view.x+(8*1995+800)*viewport.view.scale,top:viewport.view.y+535*viewport.view.scale,width:180*viewport.view.scale,height:320*viewport.view.scale}}/>}
 </main>;
}
