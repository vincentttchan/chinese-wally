import {useId} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {zanhuaDetailContours} from '../game/zanhuaDetailContours.ts';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
const parts=['high-hair','hair-flower','hair-ornament'];
/** Only re-exposes the registered original pixels; no redrawing or image replacement. */
export function ZanhuaOriginalDetailReveal({viewport,trigger,selected}:{viewport:SceneViewport;trigger:number;selected?:string}){
 const id=useId().replace(/:/g,''),{view,frame}=viewport;
 const sequence=selected&&parts.includes(selected)?[selected]:parts;
 return <svg className="zanhua-original-detail-reveal" width={frame.width} height={frame.height} aria-hidden="true">
  <defs><filter id={`${id}-soft`}><feGaussianBlur stdDeviation="1.5"/></filter>
   {parts.map(part=>{const shape=zanhuaDetailContours[part];return <mask key={part} id={`${id}-${part}`} maskUnits="userSpaceOnUse" x="1080" y="0" width="500" height="400"><path d={shape.path} transform={`translate(${shape.origin} 0)`} fill="white" filter={`url(#${id}-soft)`}/></mask>;})}
  </defs>
  <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
   {sequence.map((part,n)=><g key={`${trigger}-${part}`} className="zanhua-original-detail-light" style={{animationDelay:`${n*1600}ms`}} mask={`url(#${id}-${part})`}>
    <image href={zanhuaImage} width="6455" height="1378" className="zanhua-original-detail-pixels"/>
   </g>)}
  </g>
 </svg>;
}
