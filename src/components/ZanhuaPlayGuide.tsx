import {useEffect,useRef,useState} from 'react';
import {guideStep,zanhuaGuideKey} from '../game/zanhuaGuide.ts';
import type {GuideFlags} from '../game/zanhuaGuide.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../zanhua-guide.css';
type Props={searching:boolean;studying:boolean;hasDog:boolean;found:boolean;blocked:boolean;journalOpen:boolean;viewport:SceneViewport;focusing:boolean;setFocusing:(value:boolean)=>void;onHold:(value:boolean)=>void;replay:number};
export function ZanhuaPlayGuide(props:Props){
 const [flags,setFlags]=useState<GuideFlags>(()=>{try{const saved=JSON.parse(localStorage.getItem(zanhuaGuideKey)||'null');return saved?.version===1?Object.fromEntries(['drag','focus','find','zoom','journal'].filter(key=>saved.steps?.[key]===true).map(key=>[key,true])):{};}catch{return {};}});
 const [overview,setOverview]=useState(false),previousReplay=useRef(props.replay);
 const step=guideStep(flags,props),core=step==='drag'||step==='focus';
 const visible=!props.blocked&&(overview||step!==null);
 const latest=useRef({props,step,visible});latest.current={props,step,visible:visible&&!overview};
 function complete(name:keyof GuideFlags){setFlags(old=>{const steps={...old,[name]:true};try{localStorage.setItem(zanhuaGuideKey,JSON.stringify({version:1,steps}));}catch{}return steps;});}
 useEffect(()=>{if(previousReplay.current!==props.replay){previousReplay.current=props.replay;setOverview(true);}},[props.replay]);
 useEffect(()=>{props.onHold(visible&&core&&!overview);return()=>props.onHold(false);},[visible,core,overview,props.onHold]);
 useEffect(()=>{if(!visible||overview)return;if(step==='drag')props.setFocusing(false);else if(step==='focus')props.setFocusing(true);},[step,visible,overview,props.setFocusing]);
 useEffect(()=>{if(props.found&&!flags.find)complete('find');},[props.found,flags.find]);
 useEffect(()=>{if(props.journalOpen&&!flags.journal)complete('journal');},[props.journalOpen,flags.journal]);
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>('.zanhua-preview');if(!root)return;
  root.dataset.guideStep=visible?(overview?'overview':step??''):'';
  return()=>{delete root.dataset.guideStep;};
 },[visible,step,overview]);
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>('.zanhua-preview'),canvas=root?.querySelector<HTMLElement>('.scroll-viewport');if(!root||!canvas)return;
  let down:{x:number;y:number;viewX:number;viewY:number}|null=null,focusStart:{x:number;y:number}|null=null,raf=0;
  const start=(event:PointerEvent)=>{if(!latest.current.visible)return;const v=latest.current.props.viewport.view;down={x:event.clientX,y:event.clientY,viewX:v.x,viewY:v.y};};
  const move=(event:PointerEvent)=>{
   const current=latest.current;
   if(!current.visible||current.step!=='focus'||!current.props.focusing)return;
   if(event.pointerType==='mouse'&&event.buttons!==0)return;
   focusStart??={x:event.clientX,y:event.clientY};
   if(Math.hypot(event.clientX-focusStart.x,event.clientY-focusStart.y)>=45){focusStart=null;complete('focus');}
  };
  const end=(event:PointerEvent)=>{
   const origin=down;down=null;if(!origin||event.type==='pointercancel'||latest.current.step!=='drag')return;
   if(Math.hypot(event.clientX-origin.x,event.clientY-origin.y)<24)return;
   raf=requestAnimationFrame(()=>{const v=latest.current.props.viewport.view;if(Math.hypot(v.x-origin.viewX,v.y-origin.viewY)>=8)complete('drag');});
  };
  const zoom=()=>{if(!latest.current.visible||latest.current.step!=='zoom')return;const before=latest.current.props.viewport.view.scale;raf=requestAnimationFrame(()=>{if(Math.abs(latest.current.props.viewport.view.scale-before)>.001)complete('zoom');});};
  const keyboard=(event:KeyboardEvent)=>{
   if(!latest.current.visible)return;
   if(latest.current.step==='drag'&&['ArrowLeft','ArrowRight'].includes(event.key)){const before=latest.current.props.viewport.view.x;raf=requestAnimationFrame(()=>{if(latest.current.props.viewport.view.x!==before)complete('drag');});}
   else if(latest.current.step==='focus'&&latest.current.props.focusing&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))complete('focus');
   else if(['+','=','-'].includes(event.key))zoom();
  };
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('wheel',zoom,{passive:true});canvas.addEventListener('keydown',keyboard);
  return()=>{cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointercancel',end);canvas.removeEventListener('wheel',zoom);canvas.removeEventListener('keydown',keyboard);};
 },[]);
 if(!visible)return null;
 const copy={drag:['先試試移動畫卷','按住畫面，慢慢拖曳；也可用左右方向鍵移動。'],focus:['再試試凝神細看','移動滑鼠或手指，讓光區照向另一處；方向鍵也能移動光區。'],find:['從一張面孔開始','照着左上角的樣貌，在畫中找找她，點按人物便能相遇。'],zoom:['近一點，看清衣料','用滾輪或雙指縮放；也可按 ＋／−。'],journal:['把發現收進冊中','剛才的小犬已收進見聞冊，想再看時，翻開左下角的冊子。']} as const;
 return <aside className="zanhua-play-guide" aria-live="polite" aria-label={overview?'操作教學回顧':'觀畫操作教學'}>
  <p className="lantern-eyebrow">{overview?'操作回顧':core||step==='find'?'初次展卷':'觀畫小訣'}</p>
  {overview?<><h2>慢慢看，也可以隨時回來查閱</h2><ul><li>按住畫面拖曳，或用左右方向鍵移動畫卷。</li><li>移動滑鼠細看光區；右上角切換凝神與彩色，快捷鍵 F。</li><li>滾輪、雙指或 ＋／− 縮放。</li><li>點左上角樣貌可再看提示；找不到時按「給我提示」。</li><li>見聞冊保存已發現的圖樣；音樂與全螢幕按鈕在右上角。</li></ul><button onClick={()=>setOverview(false)}>繼續觀畫 →</button></>:<><h2>{copy[step!][0]}</h2><p>{copy[step!][1]}</p>{!core&&<button onClick={()=>complete(step!)}>知道了</button>}</>}
 </aside>;
}
