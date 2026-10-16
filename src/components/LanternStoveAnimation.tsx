import {useEffect,useId,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternSize} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import {lanternStovePoseRegistration as registration} from '../game/lanternStovePoseRegistration.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-acrobat.css';

const tile=lanternScrollPlacement.find(item=>item.number===15)!;
const original=assetPath('art/lantern-festival/detail-15.jpg');
const background=assetPath('art/animations/lantern-stove/background-v1.png');
const sources=registration.map(person=>assetPath(`art/animations/lantern-stove/${person.id}-poses-v1.png`));
const outlines=[
'M76 307 L100 308 L115 333 L112 350 L137 354 L145 375 L123 395 L96 399 L91 416 L103 455 L88 469 L78 483 L29 482 L17 472 L0 464 L15 414 L20 378 L44 347 L65 343 Z',
'M295 306 L318 305 L333 324 L337 344 L360 358 L382 391 L400 439 L386 456 L363 466 L356 479 L305 481 L297 469 L301 454 L285 447 L289 415 L264 401 L252 384 L255 365 L276 361 L288 343 Z'
];
// Match the painted charcoal and flame areas; only their existing pixels change light.
const fireRegions=[
  'M139 421 L148 394 L165 388 L173 412 L162 425 Z',
  'M172 418 L181 383 L196 363 L208 390 L216 416 Z',
  'M208 425 L216 395 L229 393 L244 422 Z'
];
const frameAt=(elapsed:number,index:number)=>{
  const t=elapsed-index*260;
  return t<700?0:t<1450?1:t<2650?2:t<3500?3:0;
};

export function LanternStoveAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const id=useId().replace(/:/g,'');
  const [elapsed,setElapsed]=useState(0),[opacity,setOpacity]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,started:number|undefined;
    const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,10000);
    const tick=(now:number)=>{
      if(!live)return;started??=now;const t=now-started,duration=reduced?1000:4500;
      if(t>=duration){live=false;done.current();return;}
      setElapsed(t);setOpacity(reduced?0:Math.min(1,t/200,(duration-t)/220));raf=requestAnimationFrame(tick);
    };
    const images=[original,background,...sources].map(src=>{const image=new Image();image.onload=()=>{if(live&&++loaded===4){clearTimeout(timeout);raf=requestAnimationFrame(tick);}};image.onerror=fail;image.src=src;return image;});
    return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(image=>{image.onload=null;image.onerror=null;});};
  },[reduced]);
  const h=tile.matrix,projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
  const {view}=viewport;
  return <div className="lantern-acrobat-animation" role="status" aria-label="爐旁取暖情景演繹正在播放" data-phase={elapsed<1750?'warming':elapsed<2700?'rubbing':'returning'} style={{opacity}}>
    <div className="lantern-acrobat-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-acrobat-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <svg width={tile.sourceWidth} height={tile.sourceHeight} style={{position:'absolute',inset:0,overflow:'visible'}} aria-hidden="true">
          <defs>
            <filter id={`${id}-feather`} x="-15%" y="-15%" width="130%" height="130%"><feMorphology operator="dilate" radius="3"/><feGaussianBlur stdDeviation="2"/></filter>
            <filter id={`${id}-edge`}><feMorphology in="SourceAlpha" operator="erode" radius="1.2" result="core"/><feComposite in="SourceGraphic" in2="core" operator="in"/></filter>
            <mask id={`${id}-repair`} maskUnits="userSpaceOnUse" x="0" y="290" width="415" height="205"><g fill="white" filter={`url(#${id}-feather)`}>{outlines.map((d,i)=><path key={i} d={d}/>)}</g></mask>
            <clipPath id={`${id}-brazier`}><path d="M130 393 L241 393 L266 410 L281 433 L275 458 L285 508 L93 508 L101 458 L96 438 L105 417 Z"/></clipPath>
            <filter id={`${id}-fire-edge`}><feGaussianBlur stdDeviation="1.7"/></filter>
            {fireRegions.map((d,i)=>{
              const warmth=.42+.23*Math.sin(elapsed/170+i*1.9)+.13*Math.sin(elapsed/67+i*2.3);
              return <g key={i}>
                <mask id={`${id}-coal-${i}`} maskUnits="userSpaceOnUse" x="130" y="350" width="120" height="85"><path d={d} fill="white" filter={`url(#${id}-fire-edge)`}/></mask>
                <filter id={`${id}-warmth-${i}`} filterUnits="userSpaceOnUse" x="130" y="350" width="120" height="85" colorInterpolationFilters="sRGB">
                  <feComponentTransfer><feFuncR type="linear" slope={1+.3*warmth}/><feFuncG type="linear" slope={1+.18*warmth}/><feFuncB type="linear" slope="1"/></feComponentTransfer>
                </filter>
              </g>;
            })}
          </defs>
          <image href={background} width={tile.sourceWidth} height={tile.sourceHeight} preserveAspectRatio="none" mask={`url(#${id}-repair)`}/>
          {registration.map((person,index)=>{
            const frame=frameAt(elapsed,index),anchor=person.frames[frame];
            return <svg key={person.id} x={person.x-anchor.x*person.scaleX} y={person.y-anchor.y*person.scaleY} width={person.slotWidth*person.scaleX} height={person.height*person.scaleY} viewBox={`${frame*person.slotWidth} 0 ${person.slotWidth} ${person.height}`} preserveAspectRatio="none" overflow="hidden">
              <image href={sources[index]} width={person.width} height={person.height} filter={`url(#${id}-edge)`}/>
            </svg>;
          })}
          <image href={original} width={tile.sourceWidth} height={tile.sourceHeight} clipPath={`url(#${id}-brazier)`}/>
          {fireRegions.map((_,i)=><image key={i} href={original} width={tile.sourceWidth} height={tile.sourceHeight}
            mask={`url(#${id}-coal-${i})`} filter={`url(#${id}-warmth-${i})`}/>)}
        </svg>
      </div>
    </div>
    <p className="lantern-acrobat-caption">畫中情景演繹 · 爐旁取暖</p>
  </div>;
}
