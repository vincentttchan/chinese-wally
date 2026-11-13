import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {guideStep,installGuideInputGuard,zanhuaGuideKey} from '../game/zanhuaGuide.ts';
import type {GuideAction,GuideFlags,GuideStage} from '../game/zanhuaGuide.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../zanhua-guide.css';
type Context={searching:boolean;studying:boolean;hasDog:boolean;found:boolean;blocked:boolean;journalOpen:boolean};
export function useZanhuaPlayGuide(context:Context){
 const [flags,setFlags]=useState<GuideFlags>(()=>{try{const saved=JSON.parse(localStorage.getItem(zanhuaGuideKey)||'null');return saved?.version===1?Object.fromEntries(['drag','focus','find','zoom','journal'].filter(key=>saved.steps?.[key]===true).map(key=>[key,true])):{};}catch{return {};}});
 const [review,setReview]=useState<number|null>(null);
 const complete=useCallback((name:GuideAction)=>setFlags(old=>({...old,[name]:true})),[]);
 useEffect(()=>{try{localStorage.setItem(zanhuaGuideKey,JSON.stringify({version:1,steps:flags}));}catch{}},[flags]);
 useEffect(()=>{if(context.found)complete('find');},[context.found,complete]);
 useEffect(()=>{if(context.journalOpen)complete('journal');},[context.journalOpen,complete]);
 const active:GuideStage=context.blocked?null:review!==null?'review':guideStep(flags,context);
 return {active,review,complete,replay:()=>setReview(0),nextReview:()=>setReview(value=>value===null||value===4?null:value+1),closeReview:()=>setReview(null)};
}
type Props={guide:ReturnType<typeof useZanhuaPlayGuide>;viewport:SceneViewport;setFocusing:(value:boolean)=>void};
const copy={drag:['先試試移動畫卷','按住畫面，慢慢向左拖曳。'],focus:['再試試凝神細看','移動滑鼠，照亮畫中的另一處。'],find:['從一張面孔開始','照着樣貌，在畫中找到她。'],zoom:['近一點，看清衣料','輕輕滾動滾輪，放大衣料的細節。'],journal:['把發現收進冊中','點開見聞冊，看看剛才收下的小犬。']} as const;
const reviewOrder:GuideAction[]=['drag','focus','find','zoom','journal'];
export function ZanhuaPlayGuide({guide,viewport,setFocusing}:Props){
 const latest=useRef({guide,viewport});latest.current={guide,viewport};
 const previousStage=useRef<GuideStage>(null);
 useLayoutEffect(()=>{
  const stage=guide.active;
  if(stage==='drag'||stage==='find')setFocusing(false);
  else if(stage==='focus')setFocusing(true);
  const root=document.querySelector<HTMLElement>('.zanhua-preview');if(!root)return;
  const canvas=root.querySelector<HTMLElement>('.scroll-viewport');
  if(canvas)canvas.inert=stage==='journal'||stage==='review';
  if(!stage&&previousStage.current==='review')canvas?.focus({preventScroll:true});
  previousStage.current=stage;
  if(stage==='drag'||stage==='focus'||stage==='find'||stage==='zoom')canvas?.focus({preventScroll:true});
  if(stage==='journal')root.querySelector<HTMLButtonElement>('.lantern-journal-button')?.focus({preventScroll:true});
  if(stage==='review')root.querySelector<HTMLButtonElement>('.zanhua-play-guide button')?.focus({preventScroll:true});
  return()=>{if(canvas)canvas.inert=false;};
 },[guide.active,setFocusing]);
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>('.zanhua-preview'),canvas=root?.querySelector<HTMLElement>('.scroll-viewport');if(!root||!canvas)return;
  const removeGuard=installGuideInputGuard(root,()=>latest.current.guide.active);
  let down:{x:number;y:number;viewX:number;viewY:number}|null=null,focusStart:{x:number;y:number}|null=null,previous:GuideStage=null;
  const frames=new Set<number>();
  function afterView(check:()=>void){const first=requestAnimationFrame(()=>{frames.delete(first);const second=requestAnimationFrame(()=>{frames.delete(second);check();});frames.add(second);});frames.add(first);}
  const start=(event:PointerEvent)=>{const v=latest.current.viewport.view;down={x:event.clientX,y:event.clientY,viewX:v.x,viewY:v.y};};
  const move=(event:PointerEvent)=>{
   const {guide}=latest.current;
   if(guide.active!==previous){focusStart=null;previous=guide.active;}
   if(guide.active!=='focus')return;
   focusStart??={x:event.clientX,y:event.clientY};
   if(Math.hypot(event.clientX-focusStart.x,event.clientY-focusStart.y)>=45)guide.complete('focus');
  };
  const end=(event:PointerEvent)=>{
   const origin=down;down=null;if(!origin||event.type==='pointercancel'||latest.current.guide.active!=='drag')return;
   if(Math.hypot(event.clientX-origin.x,event.clientY-origin.y)<24)return;
   afterView(()=>{const {guide,viewport}=latest.current;if(guide.active==='drag'&&Math.hypot(viewport.view.x-origin.viewX,viewport.view.y-origin.viewY)>=8)guide.complete('drag');});
  };
  const zoom=()=>{if(latest.current.guide.active!=='zoom')return;const before=latest.current.viewport.view.scale;afterView(()=>{const {guide,viewport}=latest.current;if(guide.active==='zoom'&&Math.abs(viewport.view.scale-before)>.001)guide.complete('zoom');});};
  const keyboard=(event:KeyboardEvent)=>{
   const {guide,viewport}=latest.current;
   if(guide.active==='drag'&&['ArrowLeft','ArrowRight'].includes(event.key)){const before=viewport.view.x;afterView(()=>{if(latest.current.guide.active==='drag'&&latest.current.viewport.view.x!==before)guide.complete('drag');});}
   else if(guide.active==='focus'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))guide.complete('focus');
   else if(guide.active==='zoom'&&['+','=','-'].includes(event.key))zoom();
  };
  const pinch=(event:PointerEvent)=>{if(event.pointerType==='touch')zoom();};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&latest.current.guide.active==='review')latest.current.guide.closeReview();};
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointermove',pinch);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('wheel',zoom,{passive:true});canvas.addEventListener('keydown',keyboard);root.addEventListener('keydown',escape);
  return()=>{removeGuard();for(const frame of frames)cancelAnimationFrame(frame);canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointermove',pinch);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointercancel',end);canvas.removeEventListener('wheel',zoom);canvas.removeEventListener('keydown',keyboard);root.removeEventListener('keydown',escape);};
 },[]);
 if(!guide.active||guide.active==='find')return null;
 const action=guide.active==='review'?reviewOrder[guide.review??0]:guide.active;
 const reading=guide.active==='review';
 return <aside className={`zanhua-play-guide ${reading?'is-review':''}`} aria-live="polite" aria-label={reading?'操作教學回顧':'觀畫操作教學'}>
  <p className="lantern-eyebrow">{reading?`操作回顧 · ${(guide.review??0)+1}／5`:'觀畫小訣'}</p>
  <h2>{copy[action][0]}</h2><p>{copy[action][1]}</p>
  {reading&&<button onClick={guide.nextReview}>{guide.review===4?'繼續觀畫 →':'下一項 →'}</button>}
 </aside>;
}
