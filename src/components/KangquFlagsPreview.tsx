import {useEffect,useMemo,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {KangquFlagsAnimation} from './KangquFlagsAnimation.tsx';
import {kangquFlagsSize as size,kangquFlagsPainting as painting,kangquFlagsFocus as focus} from '../game/kangquFlags.ts';
import {KangquFlagsMasterReview} from './KangquFlagsMasterReview.tsx';
import '../lantern.css';
import '../lantern-observation.css';
import '../lantern-acrobat.css';
import '../kangqu-ensemble.css';

const zooms=[1,2,3,4,5,6,7];
const anchor={id:'flags',kind:'observation' as const,name:'持旗群像',...focus,width:.065,height:.15};
const region={points:[[3340,1285],[3590,1285],[3730,1360],[3730,1728],[3340,1728]].map(([x,y])=>({x:x/size.width,y:y/size.height}))};
/** An isolated sample; it never changes chapter progress or collection saves. */
export function KangquFlagsPreview(){
 const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false);
 const [showMaster,setShowMaster]=useState(false);
 const [playbackRate,setPlaybackRate]=useState(1);
 const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:720}});
 useEffect(()=>{const title=document.title;document.title='持旗群像 · 細節修訂樣段';return()=>{document.title=title;};},[]);
 const compact=viewport.frame.width<700;
 const look=useMemo<StudyCommand>(()=>({region:focus,scaleRatio:compact?2.6:3.0,screenAnchor:{x:compact?.5:.70,y:compact?.30:.50},transition:'pan',token:compact?2:1}),[compact]);
 const play=(rate=1)=>{if(!ready||playing)return;setPlaybackRate(rate);setFailed(false);setPlaying(true);};
 const finish=()=>{setPlaying(false);setSeen(true);};
 if(showMaster)return <KangquFlagsMasterReview onBack={()=>setShowMaster(false)}/>;
 return <main className="immersive-game lantern-game kangqu-ensemble-preview kangqu-flags-preview is-near-view is-reviewing">
  <ScrollScene image={painting} artworkSize={size} actors={[]} active blocked resetKey={0} hint={null} onInspect={()=>{}} onReady={setReady} motion={false} focusing={false} studyCommand={look} onViewportChange={setViewport} zoomStops={zooms} title="持旗群像樣段" description="康衢駢慶原畫儀仗：兩位持旗者、身旁隨員與兩面黑旗"/>
  <header data-chapter-preview className="lantern-acrobat-preview-header">持旗群像 · 細節修訂樣段 <a className="chapter-back" href="#kangqu-listening">回到章節</a></header>
  {ready&&!playing&&<LanternPaintingTarget region={region} viewport={viewport} artworkSize={size} label="播放持旗群像" onClick={()=>play()} hint="輕點持旗群像"/>}
  {playing&&<KangquFlagsAnimation playbackRate={playbackRate} viewport={viewport} onDone={finish} onError={()=>{setPlaying(false);setFailed(true);}}/>}
  <LanternPaintingNote index={0} anchor={anchor} artworkSize={size} viewport={viewport} label="群像摹繪 · 細節修訂" title={seen?'旗面輕擺，隊列相應':'看持旗者如何呼應'} busy={playing}>
   <p className="lantern-note-body">{seen?'持旗者先後微調握桿，\n旗面與隨員稍作呼應。':'輕點持旗群像，\n看人物與兩面旗的動作呼應。'}</p>
   {!compact&&<p className="lantern-note-caption">動作為遊戲演繹，原畫為觀察依據。</p>}
   {failed&&<p className="lantern-note-caption" role="status">素材暫未載入，請再試一次。</p>}
   <button className="lantern-note-material" onClick={()=>setShowMaster(true)}>看整組摹繪稿與原畫對照</button>
   <button className="lantern-note-next" disabled={!ready||playing} onClick={()=>play()}>{ready?seen?'再看一次':'播放樣段':'正在展卷'} <span aria-hidden="true">→</span></button>
   <button className="lantern-note-material" disabled={!ready||playing} onClick={()=>play(.5)}>慢速細看</button>
  </LanternPaintingNote>
  {playing&&<p className="lantern-acrobat-caption" role="status">持旗者與旗面相互呼應 <button className="lantern-text-button" onClick={finish}>略過</button></p>}
 </main>;
}
