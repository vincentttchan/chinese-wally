import {useEffect,useId,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternSize} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import {lanternMonkPoseRegistration as registration} from '../game/lanternMonkPoseRegistration.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-acrobat.css';

const tile=lanternScrollPlacement.find(item=>item.number===7)!;
const background=assetPath('art/animations/lantern-theatre/background-v1.png');
const sources=registration.map(person=>assetPath(`art/animations/lantern-monk/${person.id}-poses-v1.png`));
const outlines=['M465 599 Q480 592 493 600 L501 596 L507 598 L513 594 L518 604 L515 635 L508 656 L497 655 L493 665 L488 683 L496 696 L483 725 L444 742 L429 725 L409 723 L405 708 L417 673 L430 639 L447 622 L456 618 Z'];
const frameAt=(elapsed:number)=>elapsed<650?0:elapsed<1550?1:elapsed<2850?2:elapsed<3700?3:0;

export function LanternMonkAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const id=useId().replace(/:/g,'');
  const [elapsed,setElapsed]=useState(0),[opacity,setOpacity]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,started:number|undefined;
    const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,12000);
    const tick=(now:number)=>{
      if(!live)return;started??=now;const t=now-started,duration=reduced?1000:4600;
      if(t>=duration){live=false;done.current();return;}
      setElapsed(t);setOpacity(reduced?0:Math.min(1,t/200,(duration-t)/220));raf=requestAnimationFrame(tick);
    };
    const images=[background,...sources].map(src=>{const image=new Image();image.onload=()=>{if(live&&++loaded===sources.length+1){clearTimeout(timeout);raf=requestAnimationFrame(tick);}};image.onerror=fail;image.src=src;return image;});
    return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(image=>{image.onload=null;image.onerror=null;});};
  },[reduced]);
  const h=tile.matrix,projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
  const {view}=viewport;
  const layers=[0];
  return <div className="lantern-acrobat-animation" role="status" aria-label="和尚情景演繹正在播放" data-phase={elapsed<1850?'opening':elapsed<3000?'response':'returning'} style={{opacity}}>
    <div className="lantern-acrobat-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-acrobat-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <svg width={tile.sourceWidth} height={tile.sourceHeight} style={{position:'absolute',inset:0,overflow:'visible'}} aria-hidden="true">
          <defs>
            <filter id={`${id}-feather`} x="-15%" y="-15%" width="130%" height="130%"><feMorphology operator="dilate" radius="2"/><feGaussianBlur stdDeviation="1.7"/></filter>
            <filter id={`${id}-edge`}><feMorphology in="SourceAlpha" operator="erode" radius="1.2" result="core"/><feComposite in="SourceGraphic" in2="core" operator="in"/></filter>
            <mask id={`${id}-repair`} maskUnits="userSpaceOnUse" x="395" y="580" width="135" height="180"><g fill="white" filter={`url(#${id}-feather)`}>{outlines.map((d,i)=><path key={i} d={d}/>)}</g></mask>
            <clipPath id={`${id}-foreground`}><path d="M465 688 L488 687 L498 703 L524 688 L549 682 L554 734 L533 745 L522 768 L534 778 L515 804 L495 805 L487 829 L468 837 L456 813 L445 815 L432 813 L408 787 L410 747 L416 722 L443 714 Z"/></clipPath>
          </defs>
          <image href={background} width={tile.sourceWidth} height={tile.sourceHeight} preserveAspectRatio="none" mask={`url(#${id}-repair)`}/>
          {layers.map(index=>{
            const person=registration[index],frame=frameAt(elapsed),anchor=person.frames[frame];
            return <svg key={person.id} x={person.x-anchor.x*person.scaleX} y={person.y-anchor.y*person.scaleY} width={person.slotWidth*person.scaleX} height={person.height*person.scaleY} viewBox={`${frame*person.slotWidth} 0 ${person.slotWidth} ${person.height}`} preserveAspectRatio="none" overflow="hidden">
              <image href={sources[index]} width={person.width} height={person.height} filter={`url(#${id}-edge)`}/>
            </svg>;
          })}
          <image href={assetPath('art/lantern-festival/detail-7.jpg')} width={tile.sourceWidth} height={tile.sourceHeight} clipPath={`url(#${id}-foreground)`}/>
        </svg>
      </div>
    </div>
    <p className="lantern-acrobat-caption">畫中情景演繹 · 笑臉舉手，招呼一聲</p>
  </div>;
}
