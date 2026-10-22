import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {zanhuaDressStudies} from '../game/zanhuaDressStudies.ts';
import {zanhuaCoiffureLayers} from '../game/zanhuaCoiffureStudy.ts';
import {zanhuaHistorySources} from '../game/zanhuaContext.ts';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
import {zanhuaStudyLayout,zanhuaStudyParts,zanhuaStudyRegistration,zanhuaStudySource} from '../game/zanhuaStudyInteraction.ts';
import type {ZanhuaStudyScope} from '../game/zanhuaStudyInteraction.ts';
import {zanhuaFigureContour} from './ZanhuaFigureAnimation.tsx';
import {ZanhuaArtEdge} from './ZanhuaArtEdge.tsx';
import {assetPath} from '../game/assets.ts';
import {ArrowRight} from './ArtIcons.tsx';

/** Complete figure first; a copy of the selected visible garment travels to the fixed reading area. */
export function ZanhuaInPaintingStudy({person,viewport,anchorViewport,selected,onSelect,onClose,onCompareChange,active=true,scope='all',requireCompletion=true,returnLabel='下一步'}:{person:number;viewport:SceneViewport;anchorViewport:SceneViewport;selected:string|null;onSelect:(id:string|null)=>void;onClose:()=>void;onCompareChange:(original:boolean)=>void;active?:boolean;scope?:ZanhuaStudyScope;requireCompletion?:boolean;returnLabel?:string}){
 const id=useId().replace(/:/g,''),r=zanhuaStudyRegistration[person],kind=(['P1','P4','P6'] as const)[person];
 const dress=person<2?zanhuaDressStudies[person]:null,parts=zanhuaStudyParts(person,scope),source=zanhuaStudySource(person);
 const item=active?parts.find(p=>p.id===selected):undefined,layer=dress?.layers.find(l=>l.id===item?.layer);
 const crop=layer?.crop??(selected?zanhuaCoiffureLayers.parts[selected]:undefined);
 const atlas=dress?.atlas??zanhuaCoiffureLayers.image;
 const backdrop=`art/zanhua/animation/${kind}-full-background-v1.png`;
 const gain=[[1.02,1.119,1.421],[.995,1.048,1.273],[1.009,1.056,1.152]][person];
 const contour=zanhuaFigureContour(kind),{view,frame}=viewport;
 const {pose,paper,art,compact}=zanhuaStudyLayout(person,viewport,anchorViewport);
 const [loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false),[original,setOriginal]=useState(false),[clock,setClock]=useState(0);
 const [seen,setSeen]=useState<string[]>([]),[focused,setFocused]=useState<string|null>(null);
 const focusedItem=parts.find(part=>part.id===focused);
 const banner=useRef<HTMLDivElement>(null),targets=useRef<Record<string,SVGPathElement|null>>({}),close=useRef(onClose),compareChange=useRef(onCompareChange);
 close.current=onClose;compareChange.current=onCompareChange;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const guide=parts.find(p=>!seen.includes(p.id))??parts[0];
 useEffect(()=>{
  let live=true,count=0;setLoaded(false);setFailed(false);
  const images=[source.image,backdrop].map(src=>{const im=new Image();im.onload=()=>{if(live&&++count===2)setLoaded(true);};im.onerror=()=>{if(live)setFailed(true);};im.src=assetPath(src);return im;});
  const separate=new Image();separate.src=assetPath(atlas);
  return()=>{live=false;images.forEach(im=>{im.onload=null;im.onerror=null;});};
 },[source.image,atlas,backdrop]);
 useEffect(()=>{
  if(!active)return;
  banner.current?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close.current();}};
  window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);compareChange.current(false);};
 },[active]);
 useLayoutEffect(()=>{setClock(reduced?1500:0);if(!active){setOriginal(false);compareChange.current(false);}},[selected,original,reduced,active]);
 useEffect(()=>{if(active&&selected&&!original&&reduced)setSeen(old=>old.includes(selected)?old:[...old,selected]);},[selected,original,reduced,active]);
 useEffect(()=>{
  if(!active||!selected||original||reduced)return;
  let raf=0,start:number|undefined,counted=false;
  const tick=(now:number)=>{start??=now;const elapsed=Math.min(1500,now-start);setClock(elapsed);if(elapsed>=1250&&!counted){counted=true;setSeen(old=>old.includes(selected)?old:[...old,selected]);}if(elapsed<1500)raf=requestAnimationFrame(tick);};
  raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
 },[selected,original,reduced,active]);
 function compare(){setOriginal(v=>{compareChange.current(!v);return !v;});}
 function choose(part:string){setOriginal(false);compareChange.current(false);onSelect(part);}
 const b=item?.bounds;
 const amount=Math.max(0,Math.min(1,(clock-250)/850)),ease=amount*amount*(3-2*amount);
 const fit=b?Math.min(art.width/b[2],art.height/b[3]):1;
 const start=b?{left:pose.x+b[0]*pose.scale,top:pose.y+b[1]*pose.scale,width:b[2]*pose.scale,height:b[3]*pose.scale}:art;
 const end=b?{left:art.left+(art.width-b[2]*fit)/2,top:art.top+(art.height-b[3]*fit)/2,width:b[2]*fit,height:b[3]*fit}:art;
 const flight={left:start.left+(end.left-start.left)*ease,top:start.top+(end.top-start.top)*ease,width:start.width+(end.width-start.width)*ease,height:start.height+(end.height-start.height)*ease};
 const reading=reduced||clock>=1250;
 const complete=parts.every(part=>seen.includes(part.id));
 const leftSpace=pose.x-40;
 const guidance=!compact&&leftSpace>=160?{left:20,top:Math.max(30,Math.min(frame.height-140,pose.y+source.height*pose.scale*.54)),width:Math.min(320,leftSpace)}:{left:20,top:Math.max(20,Math.min(pose.y+source.height*pose.scale+10,compact?paper.top-44:frame.height-82)),width:compact?frame.width-40:Math.min(430,frame.width-48)};
 const prompt=original?'原畫對照；關閉細看後保留目前位置與倍率。':failed?'摹繪暫未載入，可返回原畫。':!loaded?'摹繪載入中…':item?(!reading?(compact?'看衣飾移向下方，再細讀它的層次。':(paper.left<pose.x?'看衣飾移向左側，再細讀它的層次。':'看衣飾移向右側，再細讀它的層次。')):complete?'這次的細節都看過了，讀完便回到畫中聽她說。':guide.prompt):guide.prompt;
 const lurePath=person===0?'M506 576 L510 583 L163 834 L157 830 Z M153 830 L165 836 L145 865 L138 893 L122 906 L113 944 L88 1016 L55 1061 L80 1011 L107 924 L118 886 L132 862 Z':'';
 return <div className={`zanhua-inplace-study zanhua-guided-study${active?' is-active-study':' is-retained-study'}${item?' has-selected-part':''}${compact?' is-compact':''}`} aria-label="原位完整造型摹繪">
  {loaded&&!original&&<svg className="zanhua-guided-canvas" width={frame.width} height={frame.height} viewBox={`0 0 ${frame.width} ${frame.height}`}>
   <defs>
    <filter id={`${id}-feather`}><feMorphology operator="dilate" radius="8"/><feGaussianBlur stdDeviation="5"/></filter>
    <filter id={`${id}-backdrop-color`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`${gain[0]} 0 0 0 0  0 ${gain[1]} 0 0 0  0 0 ${gain[2]} 0 0  0 0 0 1 0`}/></filter>
    <mask id={`${id}-clear`} maskUnits="userSpaceOnUse" x="-30" y="-30" width={r.width+60} height="1438"><path d={contour.path} fill="white" stroke="white" strokeWidth="26" strokeLinejoin="round" filter={`url(#${id}-feather)`}/></mask>
    <clipPath id={`${id}-lure`}><path d={lurePath}/></clipPath>
    {parts.map(p=><clipPath key={p.id} id={`${id}-focus-${p.id}`}><path d={p.path}/></clipPath>)}
    {parts.filter(p=>p.focusMask).map(p=><mask key={p.id} id={`${id}-mask-${p.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={source.width} height={source.height}><image href={assetPath(p.focusMask!)} width={source.width} height={source.height}/></mask>)}
    <pattern id={`${id}-silk`} width="78" height="1378" patternUnits="userSpaceOnUse"><svg width="78" height="1378" viewBox={`${person===0?5130:person===1?2700:1570} 0 78 1378`} preserveAspectRatio="none"><image href={zanhuaImage} width="6455" height="1378"/></svg></pattern>
   </defs>
   <g transform={`translate(${view.x+r.origin*view.scale} ${view.y}) scale(${view.scale})`} aria-hidden="true">
    {person===0&&<g clipPath={`url(#${id}-lure)`}><image href={zanhuaImage} x={-r.origin} y="9" width="6455" height="1378"/></g>}
    <image href={assetPath(backdrop)} width={r.width} height="1378" preserveAspectRatio="none" filter={`url(#${id}-backdrop-color)`} mask={`url(#${id}-clear)`}/>
   </g>
   <g transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale})`}>
    <image className={`zanhua-guided-figure${item?' is-dimmed':''}`} href={assetPath(source.image)} width={source.width} height={source.height} aria-hidden="true"/>
    {item&&<image key={item.id} className="zanhua-guided-emphasis" href={assetPath(source.image)} width={source.width} height={source.height} clipPath={item.focusMask?undefined:`url(#${id}-focus-${item.id})`} mask={item.focusMask?`url(#${id}-mask-${item.id})`:undefined} aria-hidden="true"/>}
    {active&&focusedItem&&focusedItem.id!==item?.id&&<image href={assetPath(source.image)} width={source.width} height={source.height} opacity=".7" clipPath={focusedItem.focusMask?undefined:`url(#${id}-focus-${focusedItem.id})`} mask={focusedItem.focusMask?`url(#${id}-mask-${focusedItem.id})`:undefined} aria-hidden="true"/>}
    {active&&!item&&<image className="zanhua-guided-invitation" href={assetPath(source.image)} width={source.width} height={source.height} clipPath={guide.focusMask?undefined:`url(#${id}-focus-${guide.id})`} mask={guide.focusMask?`url(#${id}-mask-${guide.id})`:undefined} aria-hidden="true"/>}
    {active&&parts.map(p=><path ref={node=>{targets.current[p.id]=node;}} key={p.id} d={p.hitPath??p.path} className={`zanhua-study-hit-target${focused===p.id?' is-keyboard-focused':''}`} role="button" tabIndex={0} aria-label={`細看${p.label}`} aria-pressed={selected===p.id} onClick={()=>choose(p.id)} onFocus={()=>setFocused(p.id)} onBlur={()=>setFocused(null)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(p.id);}}}/>)}
   </g>

  </svg>}
  {loaded&&!original&&<svg className="zanhua-study-flight-layer" width={frame.width} height={frame.height} aria-hidden="true">
   {item&&b&&clock>=250&&clock<1400&&!reduced&&<svg className="zanhua-study-travelling-copy" x={flight.left} y={flight.top} width={flight.width} height={flight.height} viewBox={b.join(' ')} style={{opacity:Math.min(1,(clock-250)/100,(1400-clock)/250)}} aria-hidden="true">
    <image href={assetPath(source.image)} width={source.width} height={source.height} clipPath={item.focusMask?undefined:`url(#${id}-focus-${item.id})`} mask={item.focusMask?`url(#${id}-mask-${item.id})`:undefined}/>
   </svg>}
  </svg>}
  {active&&<div ref={banner} tabIndex={-1} className="zanhua-guided-caption" style={guidance} aria-label="造型細看提示">
   <p className="zanhua-guided-prompt" role="status">{prompt}</p>
   <p className="zanhua-guided-credit">{person===0?'逗犬女子':person===1?'持花女子':'斜首女子'} · 造型摹繪（含補繪）</p>
  </div>}
  {active&&<nav className="zanhua-guided-actions" aria-label="造型細看操作"><button className="lantern-text-button" onClick={compare}>{original?'再看摹繪':'對照原畫'}</button>{(!requireCompletion||complete)&&<button className="lantern-quiet-button" onClick={onClose}>{returnLabel}<ArrowRight size={17}/></button>}</nav>}
  {item&&crop&&!original&&<aside className="zanhua-study-part-paper zanhua-guided-paper" style={{left:paper.left,top:paper.top,width:paper.width,maxHeight:paper.height}} aria-label={`${item.label}解說`} key={selected} data-stage={reading?'reading':clock>=250?'travelling':'focusing'}>
   {!complete&&<button className="zanhua-study-part-close lantern-text-button" aria-label="收起部件解說" onClick={()=>{onSelect(null);targets.current[selected!]?.focus({preventScroll:true});}}>合回盛裝 ×</button>}
   <svg viewBox={crop.join(' ')} className="zanhua-study-separated-art" style={{height:art.height,opacity:reduced?1:Math.max(0,Math.min(1,(clock-1000)/250))}} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${item.label}獨立美術摹繪`}>
    <defs><clipPath id={`${id}-crop`}><rect x={crop[0]} y={crop[1]} width={crop[2]} height={crop[3]}/></clipPath>{layer?.atlasPath&&<clipPath id={`${id}-part`}><path d={layer.atlasPath}/></clipPath>}</defs>
    <g clipPath={`url(#${id}-crop)`}><image href={assetPath(atlas)} width={dress?.atlasWidth??zanhuaCoiffureLayers.width} height={dress?.atlasHeight??zanhuaCoiffureLayers.height} clipPath={layer?.atlasPath?`url(#${id}-part)`:undefined}/><ZanhuaArtEdge asset={`${kind}-${layer?.id??item.id}`}/></g>
   </svg>
   {reading?<div className="zanhua-guided-reading" aria-live="polite"><h3>{item.label}</h3><p>{item.body}</p><a href={zanhuaHistorySources[item.source].url} target="_blank" rel="noreferrer">資料依據 ↗</a></div>:<span className="sr-only" role="status">正在展看{item.label}</span>}
  </aside>}
 </div>;
}
