import {useEffect,useId,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternSize} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import {lanternTheatrePoseRegistration as registration} from '../game/lanternTheatrePoseRegistration.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-acrobat.css';

const tile=lanternScrollPlacement.find(item=>item.number===7)!;
const background=assetPath('art/animations/lantern-theatre/background-v1.png');
const sources=registration.map(person=>assetPath(`art/animations/lantern-theatre/${person.id}-poses-v1.png`));
const outlines=[
'M265 650 L289 650 L298 676 L295 691 L322 702 L340 715 L340 737 L319 751 L298 753 L307 783 L295 795 L251 800 L242 782 L249 743 L242 720 L245 695 L260 685 Z',
'M464 687 L488 686 L498 703 L524 688 L548 682 L554 734 L533 745 L522 768 L534 778 L515 804 L495 805 L487 829 L468 837 L456 813 L445 815 L432 813 L408 787 L410 747 L416 722 L443 714 Z',
'M674 480 L744 480 L744 597 L706 600 L714 618 L718 652 L723 705 L711 728 L682 744 L649 737 L642 714 L647 686 L639 650 L640 615 L650 596 L671 588 L675 584 L674 541 Z'
];
const frameAt=(elapsed:number,id:string)=>{
  if(id==='drummer')return elapsed<500?0:elapsed<900?1:elapsed<1250?2:elapsed<1550?3:elapsed<1900?1:elapsed<2250?2:elapsed<2550?3:0;
  const offset=id==='dancer'?350:900,t=elapsed-offset;
  return t<600?0:t<1400?1:t<2400?2:t<3200?3:0;
};

export function LanternTheatreAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const id=useId().replace(/:/g,'');
  const [elapsed,setElapsed]=useState(0),[opacity,setOpacity]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,started:number|undefined;
    const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,12000);
    const tick=(now:number)=>{
      if(!live)return;started??=now;const t=now-started,duration=reduced?1000:5000;
      if(t>=duration){live=false;done.current();return;}
      setElapsed(t);setOpacity(reduced?0:Math.min(1,t/200,(duration-t)/220));raf=requestAnimationFrame(tick);
    };
    const images=[background,...sources].map(src=>{const image=new Image();image.onload=()=>{if(live&&++loaded===sources.length+1){clearTimeout(timeout);raf=requestAnimationFrame(tick);}};image.onerror=fail;image.src=src;return image;});
    return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(image=>{image.onload=null;image.onerror=null;});};
  },[reduced]);
  const h=tile.matrix,projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
  const {view}=viewport;
  // Back figures first; the lifted-knee dancer stays in front of the yellow robe.
  const layers=[2,0,1];
  return <div className="lantern-acrobat-animation" role="status" aria-label="戲班群像情景演繹正在播放" data-phase={elapsed<1850?'opening':elapsed<3000?'response':'returning'} style={{opacity}}>
    <div className="lantern-acrobat-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-acrobat-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <svg width={tile.sourceWidth} height={tile.sourceHeight} style={{position:'absolute',inset:0,overflow:'visible'}} aria-hidden="true">
          <defs>
            <filter id={`${id}-feather`} x="-15%" y="-15%" width="130%" height="130%"><feMorphology operator="dilate" radius="2"/><feGaussianBlur stdDeviation="1.7"/></filter>
            <filter id={`${id}-edge`}><feMorphology in="SourceAlpha" operator="erode" radius="1.2" result="core"/><feComposite in="SourceGraphic" in2="core" operator="in"/></filter>
            <mask id={`${id}-repair`} maskUnits="userSpaceOnUse" x="230" y="475" width="520" height="370"><g fill="white" filter={`url(#${id}-feather)`}>{outlines.map((d,i)=><path key={i} d={d}/>)}</g></mask>
            <clipPath id={`${id}-yellow`}><path d="M462 597 Q480 590 498 599 L507 589 L518 600 L511 640 L501 665 L487 662 L486 684 L497 711 L488 724 L440 728 L433 714 L411 721 L409 707 L420 667 L430 638 L447 622 Z"/></clipPath>
            <clipPath id={`${id}-foreground`}><path d="M697 671 L715 676 L721 688 L742 686 L750 680 L750 812 L656 817 L655 803 L656 778 L652 758 L658 731 L671 709 L687 699 Z"/></clipPath>
          </defs>
          <image href={background} width={tile.sourceWidth} height={tile.sourceHeight} preserveAspectRatio="none" mask={`url(#${id}-repair)`}/>
          <image href={assetPath('art/lantern-festival/detail-7.jpg')} width={tile.sourceWidth} height={tile.sourceHeight} clipPath={`url(#${id}-yellow)`}/>
          {layers.map(index=>{
            const person=registration[index],frame=frameAt(elapsed,person.id),anchor=person.frames[frame];
            return <svg key={person.id} x={person.x-anchor.x*person.scaleX} y={person.y-anchor.y*person.scaleY} width={person.slotWidth*person.scaleX} height={person.height*person.scaleY} viewBox={`${frame*person.slotWidth} 0 ${person.slotWidth} ${person.height}`} preserveAspectRatio="none" overflow="hidden">
              <image href={sources[index]} width={person.width} height={person.height} filter={`url(#${id}-edge)`}/>
            </svg>;
          })}
          <image href={assetPath('art/lantern-festival/detail-7.jpg')} width={tile.sourceWidth} height={tile.sourceHeight} clipPath={`url(#${id}-foreground)`}/>
        </svg>
      </div>
    </div>
    <p className="lantern-acrobat-caption">畫中情景演繹 · 鼓點起，長袖接</p>
  </div>;
}
