import {useEffect,useMemo,useState} from 'react';
import {ScrollScene} from './ScrollScene.tsx';
import type {SceneViewport,StudyCommand} from './ScrollScene.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {KangquAudienceAnimation} from './KangquAudienceAnimation.tsx';
import {kangquAudienceSize as size,kangquAudiencePainting as painting,kangquAudienceFocus as focus} from '../game/kangquAudience.ts';
import {KangquAudienceMasterReview} from './KangquAudienceMasterReview.tsx';
import '../lantern.css';
import '../lantern-observation.css';
import '../lantern-acrobat.css';
import '../kangqu-ensemble.css';

const zooms=[1,2,3,4,5,6,7];
const anchor={id:'audience',kind:'observation' as const,name:'表演與觀看',...focus,width:.04,height:.11};
const region={points:[[275,2470],[470,2445],[685,2465],[765,2520],[775,2650],[650,2690],[520,2660],[290,2650]].map(([x,y])=>({x:x/size.width,y:y/size.height}))};
/** An isolated sample; it never changes chapter progress or collection saves. */
export function KangquAudiencePreview(){
 const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[seen,setSeen]=useState(false),[failed,setFailed]=useState(false);
 const [showMaster,setShowMaster]=useState(false);
 const [playbackRate,setPlaybackRate]=useState(1);
 const [viewport,setViewport]=useState<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:720}});
 useEffect(()=>{const title=document.title;document.title='表演與觀看 · 整組摹繪樣段';return()=>{document.title=title;};},[]);
 const compact=viewport.frame.width<700;
 const look=useMemo<StudyCommand>(()=>{
  const {width,height}=viewport.frame;
  const ratio=compact?2.7:3.8,scale=Math.max(width/size.width,height/size.height)*ratio;
  // Align to the same painted lower bound as the formal chapter, excluding the photograph border.
  return {region:focus,scaleRatio:ratio,screenAnchor:{x:compact?.5:.55,y:compact?.30:1-(2708-2557.5)*scale/height},allowVerticalMargin:compact,transition:'pan',token:width*10000+height};
 },[compact,viewport.frame.width,viewport.frame.height]);
 const play=(rate=1)=>{if(!ready||playing)return;setPlaybackRate(rate);setFailed(false);setPlaying(true);};
 const finish=()=>{setPlaying(false);setSeen(true);};
 if(showMaster)return <KangquAudienceMasterReview onBack={()=>setShowMaster(false)}/>;
 return <main className="immersive-game lantern-game kangqu-ensemble-preview kangqu-audience-preview is-near-view is-reviewing">
  <ScrollScene image={painting} artworkSize={size} actors={[]} active blocked resetKey={0} hint={null} onInspect={()=>{}} onReady={setReady} motion={false} focusing={false} studyCommand={look} onViewportChange={setViewport} zoomStops={zooms} title="七人表演與觀看樣段" description="康衢駢慶原畫：彩衣人物、身旁觀看者及後方四人"/>
  <header data-chapter-preview className="lantern-acrobat-preview-header">表演與觀看 · 整組摹繪樣段 <a className="chapter-back" href="#kangqu-listening">回到章節</a></header>
  {ready&&!playing&&<LanternPaintingTarget region={region} viewport={viewport} artworkSize={size} label="播放表演與觀看" onClick={()=>play()} hint="輕點彩衣人物與觀看者"/>}
  {playing&&<KangquAudienceAnimation playbackRate={playbackRate} viewport={viewport} onDone={finish} onError={()=>{setPlaying(false);setFailed(true);}}/>}
  <LanternPaintingNote index={0} anchor={anchor} artworkSize={size} viewport={viewport} label="群像摹繪 · 動畫樣段" title={seen?'一人示意，旁人回應':'看表演與觀看如何相連'} busy={playing}>
   <p className="lantern-note-body">{seen?'前方示意與轉身，\n後方四人依次轉頭、微傾回應。':'輕點七人群像，\n看前後人物如何依次呼應。'}</p>
   {!compact&&<p className="lantern-note-caption">動作為遊戲演繹，原畫為觀察依據。</p>}
   {failed&&<p className="lantern-note-caption" role="status">素材暫未載入，請再試一次。</p>}
   <button className="lantern-note-material" onClick={()=>setShowMaster(true)}>看整組摹繪稿與原畫對照</button>
   <button className="lantern-note-next" disabled={!ready||playing} onClick={()=>play()}>{ready?seen?'再看一次':'播放樣段':'正在展卷'} <span aria-hidden="true">→</span></button>
   <button className="lantern-note-material" disabled={!ready||playing} onClick={()=>play(.5)}>慢速細看</button>
  </LanternPaintingNote>
  {playing&&<p className="lantern-acrobat-caption" role="status">戲班正在準備表演 <button className="lantern-text-button" onClick={finish}>略過</button></p>}
 </main>;
}
