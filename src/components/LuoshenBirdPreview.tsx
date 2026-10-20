import {useEffect,useMemo,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {LuoshenNote} from './LuoshenPanels.tsx';
import {LuoshenRedrawnBird} from './LuoshenRedrawnBird.tsx';
import {luoshenImage,luoshenTiles,luoshenSize} from '../game/luoshen.ts';
import '../lantern.css';
import '../lantern-journal.css';
import '../lantern-field-journal.css';
import '../lantern-observation.css';
import '../lantern-market.css';
import '../luoshen.css';
import '../luoshen-birds.css';
const focus={x:(8*1995+1220)/19950,y:115/943};
export function LuoshenBirdPreview(){
 const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false),[folded,setFolded]=useState(false),[settled,setSettled]=useState(false),[showRedrawn,setShowRedrawn]=useState(false),[ticket,setTicket]=useState(0),[returning,setReturning]=useState(false);
 const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:720}});
 const compact=viewport.frame.width<700;
 useEffect(()=>{const old=document.title;document.title='重繪鳥形振翅示範 · 洛水之間';return()=>{document.title=old;};},[]);
 useEffect(()=>{setPlaying(false);setSettled(false);},[viewport.frame.width,viewport.frame.height]);
 const command=useMemo<StudyCommand>(()=>({region:focus,scaleRatio:compact?1.35:2.6,screenAnchor:{x:compact?.5:.40,y:.33},transition:'pan',token:performance.now(),onSettled:()=>setSettled(true)}),[compact,viewport.frame.width,viewport.frame.height]);
 const finishReturn=()=>{setReturning(false);setPlaying(false);setShowRedrawn(false);setFailed(false);setTicket(v=>v+1);};
 const original=()=>{if(showRedrawn){setReturning(true);setPlaying(false);}else finishReturn();};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();if(showRedrawn){setReturning(true);setPlaying(false);}else finishReturn();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[showRedrawn]);
 const play=()=>{if(!ready||playing||returning||!settled)return;setReturning(false);setFailed(false);setShowRedrawn(true);setPlaying(true);setTicket(v=>v+1);};
 const finish=()=>{setPlaying(false);setSeen(true);};
 return <main data-chapter-preview className={`immersive-game lantern-game luoshen-game luoshen-birds-preview ${ready?'scene-loaded':''} ${showRedrawn?'is-redrawn':''}`} aria-label="洛水之間重繪鳥形振翅示範">
  <ScrollScene image={luoshenImage} tiles={luoshenTiles} requireTiles artworkSize={luoshenSize} actors={[]} active blocked resetKey={0} hint={null} onInspect={()=>{}} onReady={setReady} focusing={false} motion={false} initialRegion={focus} studyCommand={command} zoomStops={[1,1.6,2.6,3.4]} onViewportChange={setViewport} title="洛神賦圖" description="原畫中的雙鳥；另以重繪鳥形演繹振翅。"/>
  <header className="lantern-market-preview-header">重繪鳥形 · 振翅示範 <a href="#luoshen">回到洛水之間</a></header>
  {showRedrawn&&<LuoshenRedrawnBird viewport={viewport} playing={playing&&!returning} show={!returning} onHidden={finishReturn} ticket={ticket} onDone={finish} onError={()=>{setFailed(true);setPlaying(false);setShowRedrawn(false);}}/>}
  <LuoshenNote compact viewport={viewport} label={showRedrawn?'重繪演繹 · 示範':'原畫對照'} title="翩若驚鴻" folded={folded} onFold={()=>setFolded(v=>!v)} busy={false} primaryAction={<button className="lantern-note-next" disabled={!ready||!settled||playing||returning} onClick={play}>{playing?'振翅之間…':showRedrawn||seen?'再看一次':'看重繪演繹'} <span aria-hidden>→</span></button>}>
   <p className="lantern-note-body">{playing?'兩翼起落，羽尖隨後。':showRedrawn?'停下來，再與原畫對讀。':'在原畫位置，看雙鳥輕振翅。'}</p>
   <p className="lantern-note-caption">重繪鳥形並非原畫復原。</p>
   {failed&&<p role="status" className="lantern-note-caption">演繹素材暫未載入；原畫保留，可重試。</p>}
   <button className="lantern-note-secondary" onClick={original}>{showRedrawn?'返回原畫':'看原畫'}</button>
   <details className="luoshen-reading-supplement"><summary>這段怎樣製作</summary><p>重繪鳥形在原畫位置分層振翅；局部生成補底只在演繹期間遮蓋原有鳥形。肩部固定，翼尖稍後跟隨；返回原畫即可完整移除演繹圖層。</p></details>
  </LuoshenNote>
  {!showRedrawn&&!playing&&ready&&<button className="luoshen-bird-hit" aria-label="點看重繪鳥形振翅演繹" onClick={play} style={{left:viewport.view.x+(8*1995+1220)*viewport.view.scale,top:viewport.view.y+105*viewport.view.scale,width:220*viewport.view.scale,height:115*viewport.view.scale}}/>}
 </main>;
}
