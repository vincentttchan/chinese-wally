import {useEffect,useMemo,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {LuoshenNote} from './LuoshenPanels.tsx';
import {ArrowRight} from './ArtIcons.tsx';
import {LuoshenDragonAnimation} from './LuoshenDragonAnimation.tsx';
import {luoshenImage,luoshenTiles,luoshenSize} from '../game/luoshen.ts';
import {luoshenDragonLayout} from '../game/luoshenDragonLayout.ts';
import '../lantern.css';
import '../lantern-journal.css';
import '../lantern-field-journal.css';
import '../lantern-observation.css';
import '../lantern-market.css';
import '../luoshen.css';
import '../luoshen-ribbon.css';
const focus={x:(8*1995+1215)/19950,y:245/943};
export function LuoshenDragonPreview(){
 const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false),[folded,setFolded]=useState(false),[settledFrame,setSettledFrame]=useState('');
 const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:720}});
 const layout=luoshenDragonLayout(viewport.frame),frameKey=`${viewport.frame.width}x${viewport.frame.height}`,settled=settledFrame===frameKey;
 useEffect(()=>{const old=document.title;document.title='龍形回轉試看 · 洛水之間';return()=>{document.title=old;};},[]);
 useEffect(()=>{setPlaying(false);},[viewport.frame.width,viewport.frame.height]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setPlaying(false);document.querySelector<HTMLElement>('.luoshen-dragon-preview .lantern-observation-note')?.focus({preventScroll:true});}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const command=useMemo<StudyCommand>(()=>({...luoshenDragonLayout(viewport.frame),transition:'pan',token:performance.now(),onSettled:()=>setSettledFrame(frameKey)}),[viewport.frame.width,viewport.frame.height]);
 const play=()=>{if(!ready||playing||!settled)return;setFailed(false);setPlaying(true);};
 const finish=()=>{setPlaying(false);setSeen(true);};
 return <main data-chapter-preview className={`immersive-game lantern-game luoshen-game luoshen-dragon-preview is-figure-context ${layout.stacked?'is-figure-stacked':''} ${ready?'scene-loaded':''}`} aria-label="洛水之間龍形原位動畫試看" style={{'--figure-note-height':`${layout.noteMaxHeight}px`} as React.CSSProperties}>
  <ScrollScene image={luoshenImage} tiles={luoshenTiles} requireTiles artworkSize={luoshenSize} actors={[]} active blocked resetKey={0} hint={null} onInspect={()=>{}} onReady={setReady} focusing={false} motion={false} initialRegion={focus} studyCommand={command} zoomStops={[1,1.6,2.6,3.4]} onViewportChange={setViewport} title="洛神賦圖" description="雙鳥下方的完整龍形；重繪頸首、前肢與尾端原位微動，絹底保持固定。"/>
  <nav className="luoshen-dragon-preview-nav" aria-label="試看導覽"><a className="round-control" href="#luoshen" aria-label="回到洛水之間" title="回到洛水之間"><ArrowRight size={20}/></a></nav>
  {playing&&<LuoshenDragonAnimation viewport={viewport} onDone={finish} onError={()=>{setFailed(true);setPlaying(false);}}/>}
  <LuoshenNote compact viewport={viewport} label={playing?'原位演繹 · 龍形':'龍形回轉 · 試看'} title="婉若游龍" folded={folded} onFold={()=>setFolded(v=>!v)} busy={false} primaryAction={<div className="luoshen-figure-action-row"><button className="lantern-note-next" disabled={!ready||!settled||playing} onClick={play}>{playing?'龍形回轉中…':seen?'再看一次':'播放演繹'} <span aria-hidden>→</span></button><button className="lantern-note-secondary" onClick={()=>{setPlaying(false);setSeen(false);}}>返回原畫</button></div>}>
   <p className="lantern-note-body">{playing?'頸首輕轉，前肢與尾端隨後。':seen?'回看龍形的曲線，再想神女的姿態。':'看看雙鳥下方，龍形怎樣回轉。'}</p>
   <p className="lantern-note-caption">重繪演繹；播完回到原畫。</p>
   {failed&&<p role="status" className="lantern-note-caption">演繹素材暫未載入；原畫保留，可重試。</p>}
   <details className="luoshen-reading-supplement"><summary>這段怎樣製作</summary><p>龍形依原畫重繪，上下頸、軀幹、前後肢與尾端分件微動。補底只在演繹時遮蓋原有龍形；雙鳥及絹底不作變形。這是遊戲演繹，不是原畫復原，也不據此推定神話動物的真實動作。減少動態時保留原畫。</p></details>
  </LuoshenNote>
  {!playing&&ready&&<button className="luoshen-ribbon-hit" aria-label="點看龍形回轉演繹" onClick={play} style={{left:viewport.view.x+(8*1995+1215)*viewport.view.scale,top:viewport.view.y+300*viewport.view.scale,width:290*viewport.view.scale,height:250*viewport.view.scale}}/>}
 </main>;
}
