import {ZanhuaArtEdge} from './ZanhuaArtEdge.tsx';
import {useId,useRef,useState} from 'react';
import {ChapterDialog} from './ChapterDialog.tsx';
import {zanhuaAnnotations} from '../game/zanhuaAnnotations.ts';
import {zanhuaCoiffureLayers,zanhuaCoiffureParts} from '../game/zanhuaCoiffureStudy.ts';
import {zanhuaHistorySources} from '../game/zanhuaContext.ts';
import {assetPath} from '../game/assets.ts';

/** The complete hairstyle anchors each separate, schematic component. */
export function ZanhuaCoiffurePage({onClose}:{onClose:()=>void}){
 const id=useId().replace(/:/g,''),items=zanhuaAnnotations[2][0];
 const [selected,setSelected]=useState<string|null>(null),[original,setOriginal]=useState(false);
 const buttons=useRef<Record<string,HTMLButtonElement|null>>({});
 const item=items.find(item=>item.id===selected),source=assetPath('art/zanhua/studies/P6-coiffure-study-v1.png');
 function select(part:string){setSelected(part);setOriginal(false);}
 function assemble(){if(selected)buttons.current[selected]?.focus();setSelected(null);setOriginal(false);}
 return <ChapterDialog label="髮髻與髮飾圖解" className="zanhua-coiffure-page zanhua-dress-page zanhua-dress-layers-page zanhua-coiffure-layers-page" onClose={onClose}>
  <p className="lantern-eyebrow">盛裝細看 · 斜首女子</p><h2>髮髻上的盛裝</h2>
  <div className="zanhua-dress-page-layout"><figure className="zanhua-coiffure-page-figure">
   {original?<img src={assetPath('art/zanhua/studies/P6-head-original.png')} alt="斜首女子髮髻與髮飾的原畫局部"/>:<svg className={`zanhua-coiffure-layer-stage${item?' is-separated':''}`} viewBox="0 0 2000 1350" width="2000" height="1350" aria-label="可點選部件的完整髮髻摹繪">
    <defs>
     {items.map(part=><clipPath key={part.id} id={`${id}-${part.id}`}><path d={zanhuaCoiffureParts[part.id].path}/></clipPath>)}
     <filter id={`${id}-gold`} x="-5%" y="-5%" width="110%" height="110%"><feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="light"/><feComponentTransfer in="light" result="gold"><feFuncA type="linear" slope="6" intercept="-.3"/></feComponentTransfer><feComposite in="SourceGraphic" in2="gold" operator="in"/><feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#b08026" floodOpacity=".8"/></filter>
     <filter id={`${id}-hair`}><feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="light"/><feComponentTransfer in="light" result="dark"><feFuncA type="linear" slope="-6" intercept="1.3"/></feComponentTransfer><feComposite in="SourceGraphic" in2="dark" operator="in"/></filter>
     <mask id={`${id}-ornaments-only`}><path d={zanhuaCoiffureParts['high-hair'].path} fill="white"/><path d={'M'+zanhuaCoiffureParts['hair-ornament'].path.split(' Z M').slice(1).join(' Z M')} fill="white"/></mask>
     <mask id={`${id}-flower-only`}><rect width="1254" height="1254" fill="white"/><path d={zanhuaCoiffureParts['high-hair'].path} fill="black"/></mask>
     <filter id={`${id}-edge`} x="-8%" y="-8%" width="116%" height="116%"><feMorphology in="SourceAlpha" operator="dilate" radius="4" result="spread"/><feFlood floodColor="#a77924"/><feComposite in2="spread" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g transform="translate(0 20)">
     <image className="zanhua-dress-base" href={source} width="1254" height="1254"/>
     {items.map(part=><g key={part.id} className={`zanhua-dress-emphasis${selected===part.id?' is-active':''}`} aria-hidden="true">
      <g filter={part.id==='hair-flower'?`url(#${id}-edge)`:undefined}><image href={source} width="1254" height="1254" clipPath={`url(#${id}-${part.id})`} mask={part.id==='hair-flower'?`url(#${id}-flower-only)`:part.id==='hair-ornament'?`url(#${id}-ornaments-only)`:undefined} filter={part.id==='hair-ornament'?`url(#${id}-gold)`:part.id==='high-hair'?`url(#${id}-hair)`:undefined}/></g>
     </g>)}
     <path d={zanhuaCoiffureParts['hair-ornament'].path} className="zanhua-coiffure-hit" aria-hidden="true" onClick={()=>select('hair-ornament')}/>
     {items.map(part=><path key={part.id} d={part.id==='hair-ornament'?zanhuaCoiffureParts[part.id].path.split(' Z M')[0]+' Z':zanhuaCoiffureParts[part.id].path} className="zanhua-coiffure-hit" role="button" tabIndex={0} aria-label={`細看摹繪${part.label}`} aria-pressed={selected===part.id} onClick={()=>select(part.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(part.id);}}}/>)}
    </g>
    {items.map(part=><g key={part.id} className={`zanhua-dress-layer${selected===part.id?' is-active':''}`} aria-hidden="true">
     <path d={`M ${zanhuaCoiffureParts[part.id].at[0]} ${zanhuaCoiffureParts[part.id].at[1]+20} Q 1190 ${zanhuaCoiffureParts[part.id].at[1]+20} 1390 660`} className="zanhua-dress-layer-leader"/>
     <circle cx={zanhuaCoiffureParts[part.id].at[0]} cy={zanhuaCoiffureParts[part.id].at[1]+20} r="11" className="zanhua-dress-layer-dot"/>
     <g className="zanhua-coiffure-separated-part">
      <svg x="1320" y="170" width="650" height="900" viewBox={zanhuaCoiffureLayers.parts[part.id].join(' ')} preserveAspectRatio="xMidYMid meet" overflow="hidden"><image href={assetPath(zanhuaCoiffureLayers.image)} width={zanhuaCoiffureLayers.width} height={zanhuaCoiffureLayers.height}/><ZanhuaArtEdge asset={`P6-${part.id}`}/></svg>
     </g>
    </g>)}
   </svg>}
   <figcaption>{original?'原畫局部':item?`${item.label} · 遮擋處含補繪`:'完整造型摹繪 · 點選部件展看層次'}</figcaption>
  </figure>
  <div className="zanhua-dress-page-reading"><div className="zanhua-coiffure-page-parts" role="group" aria-label="選看髮型部件">{items.map(part=><button className="lantern-text-button" key={part.id} ref={button=>{buttons.current[part.id]=button;}} aria-pressed={selected===part.id} onClick={()=>select(part.id)}>{part.label}</button>)}</div>
   <div className="zanhua-coiffure-page-copy" aria-live="polite">{item?<><h3>{item.label}</h3><p>{item.body}</p></>:<p>點選高髻、簪花或金色髮飾，看看它們如何組成完整髮型。</p>}</div>
  </div></div>
  <div className="lantern-paper-actions zanhua-coiffure-page-actions">{item&&<button className="lantern-text-button" onClick={assemble}>合回髮型</button>}<button className="lantern-text-button" onClick={()=>setOriginal(value=>!value)}>{original?'看髮型分層':'對照原畫'}</button>{item&&<a href={zanhuaHistorySources[item.source].url} target="_blank" rel="noreferrer">資料依據 ↗</a>}<button className="lantern-return-link" onClick={onClose}>回到畫中 →</button></div>
 </ChapterDialog>;
}
