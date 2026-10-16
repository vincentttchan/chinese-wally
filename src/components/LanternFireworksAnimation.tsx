import {useEffect,useRef,useState} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {assetPath} from '../game/assets.ts';
import {lanternSize,lanternLocation} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import {lanternFireworksRegistration as registration} from '../game/lanternFireworksRegistration.ts';
import '../lantern-acrobat.css';

const tile=lanternScrollPlacement.find(item=>item.number===17)!;
const h=tile.matrix;
const projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
const background=assetPath('art/animations/lantern-fireworks/background-v1.png');
const sources=registration.map(person=>assetPath(`art/animations/lantern-fireworks/${person.id}-v1.png`));
// Keep the untouched silk and architecture between people; mask each old silhouette.
const outlines=[
'M750 824 H767 V1038 H750 Z',
'M230 824 L260 824 L290 857 L317 874 L350 842 L355 900 L299 930 L285 972 L320 1045 L286 1070 L207 1070 L174 1040 L205 943 L192 898 Z',
'M475 691 L517 684 L548 705 L572 680 L590 697 L582 756 L555 777 L566 884 L535 941 L482 945 L429 906 L448 805 L450 749 Z',
'M590 709 L610 708 L623 736 L657 730 L662 773 L703 785 L730 743 L744 743 L748 929 L733 938 L719 831 L690 826 L684 914 L689 962 L646 985 L579 970 L544 949 L571 851 L551 806 L587 766 Z',
'M875 793 L896 795 L895 834 L920 882 L914 938 L938 1010 L892 1039 L882 1066 L820 1067 L792 1032 L812 969 L824 932 L776 907 L748 891 L747 836 L766 827 L775 851 L808 863 L836 831 L867 818 Z'
];
const mask=`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="430" viewBox="160 660 800 430"><defs><filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="5"/><feGaussianBlur stdDeviation="3"/></filter></defs><g fill="white" filter="url(#soft)">${outlines.map(d=>`<path d="${d}"/>`).join('')}</g></svg>`)}")`;
export const lanternFireworksFocus=lanternLocation(17,560,880);
export const lanternFireworksRegions=[[175,820,180,260],[425,675,170,275],[540,700,215,290],[740,790,205,285]].map(([x,y,w,h])=>({points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([px,py])=>lanternLocation(17,px,py))}));
const frameAt=(time:number,index:number)=>{
  // Lighter moves first; the three reactions follow the ember with a short delay.
  const t=time-(index===0?0:index===1?240:index===2?380:520);
  return t<700?0:t<1500?1:t<2700?2:t<3550?3:0;
};

export function LanternFireworksAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const [elapsed,setElapsed]=useState(0),[opacity,setOpacity]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,started:number|undefined;
    const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,10000);
    const tick=(now:number)=>{
      if(!live)return;started??=now;
      const t=now-started,duration=reduced?1200:4800;
      if(t>=duration){live=false;done.current();return;}
      setElapsed(t);setOpacity(Math.min(1,t/220,(duration-t)/220));raf=requestAnimationFrame(tick);
    };
    const images=[background,...sources].map(src=>{const image=new Image();image.onload=()=>{if(live&&++loaded===5){clearTimeout(timeout);raf=requestAnimationFrame(tick);}};image.onerror=fail;image.src=src;return image;});
    return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(image=>{image.onload=null;image.onerror=null;});};
  },[reduced]);
  const {view}=viewport;
  const lighterFrame=reduced?0:frameAt(elapsed,0);
  const lighter=registration[0],lighterAnchor=lighter.frames[lighterFrame];
  const tip=[[414,208],[472,208],[371,215],[455,207]][lighterFrame];
  const tipX=lighter.x+(tip[0]-lighterAnchor.x)*lighter.scale,tipY=lighter.y+(tip[1]-lighterAnchor.y)*lighter.scale;
  // A sustained flame must remain legible after the painting is scaled down.
  const ember=!reduced?Math.max(0,Math.min(1,(elapsed-1050)/180,(3150-elapsed)/450)):0;
  const flicker=1+Math.sin(elapsed/75)*.07;
  const sparkTravel=((elapsed-1050)%430)/430;
  return <div className="lantern-acrobat-animation" role="status" data-phase={elapsed<1300?'preparing':elapsed<2700?'spark':elapsed<3550?'reacting':'settling'} aria-label="爆竹群像情景演繹正在播放" style={{opacity}}>
    <div className="lantern-acrobat-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-acrobat-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <div style={{position:'absolute',left:160,top:660,width:800,height:430,backgroundImage:`url(${background})`,backgroundSize:`${tile.sourceWidth}px ${tile.sourceHeight}px`,backgroundPosition:'-160px -660px',maskImage:mask,WebkitMaskImage:mask}}/>
        {registration.map((person,index)=>{
          const frame=reduced?0:frameAt(elapsed,index),anchor=person.frames[frame];
          return <div key={person.id} style={{position:'absolute',left:person.x-anchor.x*person.scale,top:person.y-anchor.y*person.scale,width:person.slotWidth,height:person.height,backgroundImage:`url(${sources[index]})`,backgroundSize:`${person.width}px ${person.height}px`,backgroundPosition:`${-frame*person.slotWidth}px 0`,backgroundRepeat:'no-repeat',transform:`scale(${person.scale})`,transformOrigin:'0 0'}}/>;
        })}
        <svg aria-hidden="true" width="100" height="110" viewBox="0 0 100 110" style={{position:'absolute',left:tipX-25,top:tipY-76,opacity:ember,overflow:'visible'}}>
          <path d="M26 44 Q12 26 34 17 Q50 8 38 -5" fill="none" stroke="#78694f" strokeWidth="2.6" opacity=".48"/>
          <path d="M34 46 Q51 30 43 19" fill="none" stroke="#f4ead1" strokeWidth="4" opacity=".85"/>
          <g transform={`translate(25 76) scale(${flicker})`}>
            <path d="M0 2 C-16 -3 -13 -17 -8 -22 C-8 -13 -2 -15 -3 -25 C-5 -31 1 -36 3 -40 C1 -27 15 -23 11 -12 C18 -17 15 -4 7 0 Z" fill="#c36c2d" stroke="#85452d" strokeWidth="1.4"/>
            <path d="M0 0 C-7 -5 -6 -11 -2 -15 C1 -20 2 -24 1 -29 C9 -20 11 -9 5 -2 Z" fill="#f0bd57"/>
            <path d="M1 0 C-3 -4 -1 -10 2 -14 C6 -9 6 -3 1 0 Z" fill="#fff1b7"/>
          </g>
          {[[-29,-24],[-18,-43],[15,-45],[31,-25],[24,-7]].map(([dx,dy],index)=><path key={index}
            d={`M${25+dx*(.35+sparkTravel*.65)} ${76+dy*(.35+sparkTravel*.65)} l${dx*.12} ${dy*.12}`}
            stroke={index%2?'#9b4d2b':'#cb8534'} strokeWidth="2.8" strokeLinecap="round" opacity={1-sparkTravel*.7}/>) }
        </svg>
      </div>
    </div>
    <p className="lantern-acrobat-caption">畫中情景演繹 · 一點火光，幾種反應</p>
  </div>;
}
