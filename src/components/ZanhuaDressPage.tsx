import {ZanhuaArtEdge} from './ZanhuaArtEdge.tsx';
import {useId,useRef,useState} from 'react';
import {ChapterDialog} from './ChapterDialog.tsx';
import {zanhuaDressStudies} from '../game/zanhuaDressStudies.ts';
import {zanhuaHistorySources} from '../game/zanhuaContext.ts';
import {assetPath} from '../game/assets.ts';

/** A complete costume remains the anchor; garments open as labelled schematic layers. */
export function ZanhuaDressPage({person,initialPart,onClose}:{person:0|1;initialPart?:string;onClose:()=>void}){
 const study=zanhuaDressStudies[person],id=useId().replace(/:/g,'');
 const [selected,setSelected]=useState<string|null>(initialPart??null),[original,setOriginal]=useState(false);
 const item=study.parts.find(part=>part.id===selected),layer=item?study.layers.find(layer=>layer.id===item.layer):undefined;
 const source=assetPath(study.image),partButtons=useRef<Record<string,HTMLButtonElement|null>>({});
 function assemble(){if(selected)partButtons.current[selected]?.focus();setSelected(null);setOriginal(false);}
 function select(part:string){setSelected(part);setOriginal(false);}
 return <ChapterDialog label={`${study.name}衣飾圖解`} className="zanhua-coiffure-page zanhua-dress-page zanhua-dress-layers-page" onClose={onClose}>
  <p className="lantern-eyebrow">盛裝細看 · {study.name}</p><h2>{study.title}</h2>
  <div className="zanhua-dress-page-layout"><figure className="zanhua-coiffure-page-figure">
   {original?<img src={assetPath(study.original)} alt={`${study.name}完整衣飾的原畫局部`}/>:<svg className={`zanhua-dress-stage${item?' is-separated':''}`} viewBox="-30 0 1580 1790" width="1580" height="1790" aria-label={`${study.name}可點選細節的完整造型摹繪`}>
    <defs>{study.layers.map(part=><clipPath key={part.id} id={`${id}-${part.id}`}><path d={part.path}/></clipPath>)}{study.layers.filter(part=>part.atlasPath).map(part=><clipPath key={part.id} id={`${id}-atlas-${part.id}`}><path d={part.atlasPath}/></clipPath>)}</defs>
    <g transform="translate(0 35)">
     <image className="zanhua-dress-base" href={source} width={study.width} height={study.height}/>
     {study.layers.map(part=><g key={part.id} className={`zanhua-dress-emphasis${layer?.id===part.id?' is-active':''}`} aria-hidden="true">
      <image href={source} width={study.width} height={study.height} clipPath={`url(#${id}-${part.id})`}/>
     </g>)}
     {study.parts.filter(part=>part.hitPath).map(part=><path key={`${part.id}-area`} d={part.path} className="zanhua-coiffure-hit" aria-hidden="true" onClick={()=>select(part.id)}/>)}
     {study.parts.map(part=><path key={part.id} d={part.hitPath??part.path} className="zanhua-coiffure-hit" role="button" tabIndex={0} aria-label={`細看摹繪${part.label}`} aria-pressed={selected===part.id} onClick={()=>select(part.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(part.id);}}}/>)}
    </g>
    {study.layers.map(part=><g key={part.id} className={`zanhua-dress-layer${layer?.id===part.id?' is-active':''}`} aria-hidden="true">
     <path d={`M ${part.anchor[0]} ${part.anchor[1]+35} Q 840 ${part.anchor[1]+35} 1000 850`} className="zanhua-dress-layer-leader"/>
     <circle cx={part.anchor[0]} cy={part.anchor[1]+35} r="11" className="zanhua-dress-layer-dot"/>
     <g className="zanhua-dress-garment">
      <svg x="850" y="190" width="700" height="1300" viewBox={part.crop.join(' ')} preserveAspectRatio="xMidYMid meet" overflow="hidden"><image href={assetPath(study.atlas)} width={study.atlasWidth} height={study.atlasHeight} clipPath={part.atlasPath?`url(#${id}-atlas-${part.id})`:undefined}/><ZanhuaArtEdge asset={`${person===0?'P1':'P4'}-${part.id}`}/></svg>
     </g>
    </g>)}
   </svg>}
   <figcaption>{original?'原畫局部':item?`${layer?.label} · 遮擋處含補繪`:'完整造型摹繪 · 點衣飾展看層次'}</figcaption>
  </figure>
  <div className="zanhua-dress-page-reading"><div className="zanhua-coiffure-page-parts" role="group" aria-label="選看衣飾細節">{study.parts.map(part=><button className="lantern-text-button" key={part.id} ref={button=>{partButtons.current[part.id]=button;}} aria-pressed={selected===part.id} onClick={()=>select(part.id)}>{part.label}</button>)}</div>
  <div className="zanhua-coiffure-page-copy" aria-live="polite">{item?<><p className="zanhua-dress-layer-kind">{layer?.label}</p><h3>{item.label}</h3><p>{item.body}</p>{layer?.id==='skirt'&&<p className="zanhua-dress-layer-relation">裙腰與裙襬，是同一件長裙的兩處。</p>}</>:<p>點選衣飾，看看長裙、外罩衣與披帛如何疊成這身盛裝。</p>}</div>
  </div></div>
  <div className="lantern-paper-actions zanhua-coiffure-page-actions">{item&&<button className="lantern-text-button" onClick={assemble}>合回盛裝</button>}<button className="lantern-text-button" onClick={()=>setOriginal(value=>!value)}>{original?'看衣飾分層':'對照原畫'}</button>{item&&<a href={zanhuaHistorySources[item.source].url} target="_blank" rel="noreferrer">資料依據 ↗</a>}<button className="lantern-return-link" onClick={onClose}>回到畫中 →</button></div>
 </ChapterDialog>;
}
