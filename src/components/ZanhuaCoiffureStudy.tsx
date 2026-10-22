import {useId} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import type {ZanhuaAnnotation} from '../game/zanhuaAnnotations.ts';
import {zanhuaCoiffureRegistration as registration,zanhuaCoiffureParts} from '../game/zanhuaCoiffureStudy.ts';
import {assetPath} from '../game/assets.ts';

/** Full study first; all subsequent part interactions use the study's own geometry. */
export function ZanhuaCoiffureStudy({viewport,selected,items,onSelect}:{viewport:SceneViewport;selected?:string;items:ZanhuaAnnotation[];onSelect:(item:ZanhuaAnnotation)=>void}){
 const id=useId().replace(/:/g,''),{view,frame}=viewport,part=selected?zanhuaCoiffureParts[selected]:null;
 const source=assetPath('art/zanhua/studies/P6-coiffure-study-v1.png');
 return <svg className="zanhua-coiffure-study" width={frame.width} height={frame.height} aria-label="原位完整髮髻造型摹繪">
  <defs><filter id={`${id}-light`}><feComponentTransfer><feFuncR type="linear" slope="1.15"/><feFuncG type="linear" slope="1.15"/><feFuncB type="linear" slope="1.08"/></feComponentTransfer></filter>
   {part&&<clipPath id={`${id}-part`}><path d={part.path}/></clipPath>}
  </defs>
  <g transform={`translate(${view.x+registration.x*view.scale} ${view.y+registration.y*view.scale}) scale(${registration.width/registration.size*view.scale})`}>
   <image className="zanhua-coiffure-complete" href={source} width={registration.size} height={registration.size}/>
   {part&&<image key={selected} className="zanhua-coiffure-part-light" href={source} width={registration.size} height={registration.size} clipPath={`url(#${id}-part)`} filter={`url(#${id}-light)`}/>}
   {items.some(item=>item.id==='hair-ornament')&&<path d={zanhuaCoiffureParts['hair-ornament'].path} className="zanhua-coiffure-hit" aria-hidden="true" onClick={()=>onSelect(items.find(item=>item.id==='hair-ornament')!)}/> }
   {items.map(item=><path key={item.id} d={item.id==='hair-ornament'?zanhuaCoiffureParts[item.id].path.split(' Z M')[0]+' Z':zanhuaCoiffureParts[item.id].path} className="zanhua-coiffure-hit" role="button" tabIndex={0} aria-label={`細看摹繪${item.label}`} aria-pressed={selected===item.id} onClick={()=>onSelect(item)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(item);}}}/>)}
  </g>
 </svg>;
}
