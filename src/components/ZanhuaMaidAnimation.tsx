import {useEffect,useId,useRef,useState} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
// Coordinates traced against the native (3480,360,710,1018) context, not a display screenshot.
const head='M187 119 Q175 101 184 76 Q177 53 195 44 L216 43 L224 35 L242 43 Q265 27 280 43 L290 64 L286 99 L298 135 L302 208 L294 226 L313 247 L292 271 L254 261 L229 248 L210 226 Q190 206 189 179 Z';
const body='M245 258 L218 285 L200 334 L181 389 L149 439 L128 466 L105 480 L82 498 L75 530 L62 548 L66 575 L80 592 L92 584 L86 619 L90 707 L96 778 L85 832 L69 862 L72 883 L102 888 L129 874 L143 883 L141 951 L115 966 L117 982 L156 985 L198 1007 L267 1008 L316 1016 L370 1011 L392 1005 L447 1007 L449 984 L423 961 L400 923 L390 867 L375 823 L377 746 L384 664 L391 581 L389 518 L389 430 L384 361 L369 314 L346 274 L321 228 L294 226 L309 258 L289 300 L261 333 L250 315 L239 292 Z';
// The fan includes a narrow silk margin so its faded ink perimeter is never clipped during a wider swing.
const fan='M102 561 L112 570 L579 44 L570 38 Z M370 155 L382 112 L424 63 L481 26 L531 18 L590 35 L642 57 L681 92 L700 136 L692 177 L660 215 L610 246 L554 265 L492 267 L438 250 L398 224 L377 194 Z';
const arm='M280 326 Q287 315 296 327 L304 343 L309 374 L310 406 L324 441 L340 449 L352 433 L361 392 L365 361 L378 371 L387 433 L387 510 Q385 539 366 544 L340 533 L321 505 L309 472 L290 444 L281 411 L273 379 L268 354 Z';
/** The grip, forearm and fan share one pivot throughout the wider fanning gesture. */
export function ZanhuaMaidAnimation({viewport,onDone}:{viewport:SceneViewport;onDone:()=>void}){
 const id=useId().replace(/:/g,''),done=useRef(onDone);done.current=onDone;
 const [time,setTime]=useState(0);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  let raf=0,start:number|undefined,live=true;
  const tick=(now:number)=>{if(!live)return;start??=now;const elapsed=now-start;if(elapsed>=6200){done.current();return;}setTime(elapsed);raf=requestAnimationFrame(tick);};
  raf=requestAnimationFrame(tick);return()=>{live=false;cancelAnimationFrame(raf);};
 },[]);
 const envelope=Math.sin(Math.PI*Math.min(1,time/6200))**2,gesture=Math.sin(time/950)*envelope;
 const fanAngle=-6.2*gesture,lean=.95*gesture,headAngle=2.6*envelope;
 const {view}=viewport;
 const original=<image href={zanhuaImage} x="-3480" y="-360" width="6455" height="1378"/>;
 return <div className="zanhua-dog-animation" role="status" aria-label="執扇侍女與長柄扇的遊戲演繹">
  <svg width="6455" height="1378" viewBox="0 0 6455 1378" style={{transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}} aria-hidden="true">
   <defs>
    <filter id={`${id}-soft`}><feGaussianBlur stdDeviation=".7"/></filter>
    <pattern id={`${id}-silk`} width="70" height="1018" patternUnits="userSpaceOnUse"><svg width="70" height="1018" viewBox="4210 360 70 1018" preserveAspectRatio="none"><image href={zanhuaImage} width="6455" height="1378"/></svg></pattern>
    <mask id={`${id}-erase`} maskUnits="userSpaceOnUse" x="40" y="0" width="680" height="1018"><g fill="white" stroke="white" strokeWidth="3" filter={`url(#${id}-soft)`}><path d={body}/><path d={head}/><path d={fan}/></g></mask>
    <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="40" y="0" width="680" height="1018"><path d={body} fill="white"/><path d={head} fill="black"/><path d={arm} fill="black"/></mask>
    <clipPath id={`${id}-head`}><path d={head}/></clipPath><clipPath id={`${id}-fan`}><path d={fan}/><path d={arm}/></clipPath>
    <clipPath id={`${id}-old-shaft`}><path d="M117 538 L131 550 L582 48 L568 36 Z"/></clipPath>
   </defs>
   <g transform="translate(3480 360)">
    <rect width="710" height="1018" fill={`url(#${id}-silk)`} mask={`url(#${id}-erase)`}/>
    <g transform={`rotate(${lean} 240 990)`}>
     <g mask={`url(#${id}-body)`}>{original}<g clipPath={`url(#${id}-old-shaft)`}><image href={zanhuaImage} x={-3480+14} y={-360+12} width="6455" height="1378"/></g></g>
     <g transform={`rotate(${headAngle} 281 263)`} clipPath={`url(#${id}-head)`}>{original}</g>
     <g transform={`rotate(${fanAngle} 107 566)`} clipPath={`url(#${id}-fan)`}>{original}</g>
    </g>
   </g>
  </svg>
 </div>;
}
