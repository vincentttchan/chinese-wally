import {useEffect,useId,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternSize} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import {lanternEmperorMotions} from '../game/lanternEmperorMotion.ts';
import {lanternEmperorPoseRegistration} from '../game/lanternEmperorPoseRegistration.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-acrobat.css';

// Whole, connected poses replace the rejected independently rotating head/hand layers.
const silhouettes=[
'M1144 312 L1180 312 L1204 350 L1201 390 L1226 407 L1258 451 L1258 491 L1241 514 L1256 553 L1266 632 L1235 649 L1100 568 L1080 535 L1068 516 L1092 492 L1079 466 L1084 438 L1110 409 L1137 396 L1130 364 L1123 352 Z',
'M373 454 L394 454 L416 491 L429 497 L428 514 L412 517 L412 541 L434 550 L459 583 L474 620 L467 649 L447 671 L483 767 L288 767 L295 683 L290 634 L301 585 L326 555 L349 540 L342 516 L332 506 L336 492 L355 488 Z',
'M86 393 L107 393 L119 418 L138 431 L135 445 L127 450 L127 475 L148 486 L173 517 L190 547 L195 587 L179 608 L183 650 L172 686 L142 701 L107 707 L77 688 L46 692 L34 654 L38 599 L33 549 L39 513 L58 483 L76 475 L69 448 L60 438 L67 424 Z'
];
// Preserve the source balustrades and curtain in front of the figures.
const visibleAreas=[
'M1020 280 H1296 V687 L1020 494 Z',
'M270 435 H570 V724 H270 Z',
'M20 375 H194 V720 H20 Z'
];

export function LanternEmperorAnimation({index,viewport,onDone,onError}:{index:number;viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const motion=lanternEmperorMotions[index],tile=lanternScrollPlacement.find(item=>item.number===motion.tile)!;
  const registration=lanternEmperorPoseRegistration[index];
  const poses=assetPath(`art/animations/lantern-emperor/${motion.id}-poses-v2.png`),background=assetPath(`art/animations/lantern-emperor/${motion.id}-background-v3.png`);
  const id=useId().replace(/:/g,'');
  const [elapsed,setElapsed]=useState(0),[opacity,setOpacity]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,started:number|undefined;
    const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,10000);
    const tick=(now:number)=>{
      if(!live)return;started??=now;const t=now-started,duration=reduced?1000:4000;
      if(t>=duration){live=false;done.current();return;}
      setElapsed(t);setOpacity(reduced?0:Math.min(1,t/200,(duration-t)/200));raf=requestAnimationFrame(tick);
    };
    const images=[poses,background].map(src=>{const image=new Image();image.onload=()=>{if(live&&++loaded===2){clearTimeout(timeout);raf=requestAnimationFrame(tick);}};image.onerror=fail;image.src=src;return image;});
    return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(image=>{image.onload=null;image.onerror=null;});};
  },[index,reduced]);
  const frame=elapsed<650?0:elapsed<1250?1:elapsed<2350?2:elapsed<3100?3:0;
  const anchor=registration.frames[frame];
  const mirrored=index===2;
  const left=registration.x-(mirrored?registration.slotWidth-anchor.x:anchor.x)*registration.scaleX,top=registration.y-anchor.y*registration.scaleY;
  const h=tile.matrix,projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
  const {view}=viewport;
  return <div className="lantern-acrobat-animation" role="status" aria-label="皇帝尋獲後的動作演繹正在播放" data-phase={frame===2?'gesture':elapsed<1250?'preparing':'returning'} style={{opacity}}>
    <div className="lantern-acrobat-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-acrobat-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <svg width={tile.sourceWidth} height={tile.sourceHeight} style={{position:'absolute',inset:0,overflow:'visible'}} aria-hidden="true">
          <defs>
            <filter id={`${id}-sprite-edge`}><feMorphology in="SourceAlpha" operator="erode" radius="1.2" result="core"/><feComposite in="SourceGraphic" in2="core" operator="in"/></filter>
            <filter id={`${id}-feather`} x="-20%" y="-10%" width="140%" height="120%"><feMorphology operator="dilate" radius="4"/><feGaussianBlur stdDeviation="3"/></filter>
            <mask id={`${id}-repair`} maskUnits="userSpaceOnUse" x="0" y="0" width={tile.sourceWidth} height={tile.sourceHeight}><path d={silhouettes[index]} fill="white" filter={`url(#${id}-feather)`}/></mask>
            <clipPath id={`${id}-foreground`}><path d={visibleAreas[index]}/></clipPath>
          </defs>
          <g clipPath={`url(#${id}-foreground)`}>
            <image href={background} width={tile.sourceWidth} height={tile.sourceHeight} preserveAspectRatio="none" mask={`url(#${id}-repair)`}/>
            <svg x={left} y={top} width={registration.slotWidth*registration.scaleX} height={registration.height*registration.scaleY} viewBox={`${frame*registration.slotWidth} 0 ${registration.slotWidth} ${registration.height}`} preserveAspectRatio="none" overflow="hidden">
              <image href={poses} width={registration.width} height={registration.height} transform={mirrored?`translate(${(2*frame+1)*registration.slotWidth} 0) scale(-1 1)`:undefined} filter={`url(#${id}-sprite-edge)`}/>
            </svg>
          </g>
        </svg>
      </div>
    </div>
    <p className="lantern-acrobat-caption">尋獲後的動作演繹 · {motion.label}</p>
  </div>;
}
