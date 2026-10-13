import {useEffect,useId,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternLocation,lanternSize} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-market.css';

const poses=assetPath('art/animations/lantern-market/poses-v1.png');
const background=assetPath('art/animations/lantern-market/background-v1.png');
const ornaments=assetPath('art/animations/lantern-market/hanging-ornaments-v1.png');
const hangingBackground=assetPath('art/animations/lantern-market/hanging-background-v1.png');
const hangingMask=`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="365" height="130" viewBox="185 535 365 130"><defs><filter id="edge" x="-10%" y="-15%" width="120%" height="130%"><feMorphology operator="dilate" radius="2"/><feGaussianBlur stdDeviation="2"/></filter></defs><g fill="white" filter="url(#edge)"><polygon points="220,565 247,567 236,604 214,637 196,628 205,602"/><polygon points="323,549 364,549 364,657 324,657"/><polygon points="390,559 461,559 461,649 390,649"/><polygon points="507,543 539,543 541,638 505,638"/></g></svg>')}")`;
// Crop windows in the transparent sheet; pivots are original painting coordinates.
const hangingPieces=[
  {name:'左側紅掛飾',crop:[170,552,75,142],anchor:[57,14],pivot:[235,566],scale:.58,amplitude:-4.5,delay:30},
  {name:'藍色垂飾',crop:[307,550,57,173],anchor:[29,8],pivot:[340,565],scale:.56,amplitude:6,delay:0},
  {name:'小馬掛件',crop:[388,550,62,150],anchor:[33,8],pivot:[416,566],scale:.56,amplitude:-5,delay:65},
  {name:'右側紅掛飾',crop:[492,550,37,140],anchor:[17,8],pivot:[525,554],scale:.62,amplitude:3.5,delay:100},
];
function hangingAngle(time:number,amplitude:number,delay:number){
  const impulse=(start:number)=>{const age=time-start-delay;return age<0?0:Math.sin(age*Math.PI*2/950)*Math.exp(-age/850);};
  // Two gentle impulses accompany picking up and putting down the toy.
  const settle=Math.min(1,Math.max(0,(3980-time)/420));
  return amplitude*(impulse(780)-.72*impulse(2460))*settle;
}
const tile=lanternScrollPlacement.find(item=>item.number===18)!;
const h=tile.matrix;
const projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
// Four generated groups have unequal outer margins; retain one shared scale
// and bottom anchor while selecting the actual group boundaries in the strip.
const frameLeft=[32,591,1119,1677];
const baselines=[667,668,668,668];
const sequence=[0,1,2,3,0];
const mask=`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="354" height="390" viewBox="255 674 354 390"><defs><filter id="edge" x="-20%" y="-10%" width="140%" height="120%"><feMorphology operator="dilate" radius="5"/><feGaussianBlur stdDeviation="4"/></filter></defs><g fill="white" filter="url(#edge)"><polygon points="350,690 435,694 436,755 480,840 470,915 388,918 383,1025 298,1025 294,920 270,908 284,840 309,782 341,751"/><polygon points="508,817 554,817 562,856 571,928 596,1045 480,1045 499,930 475,894 451,889 459,862 494,870 497,840"/></g></svg>')}")`;
export const lanternMarketFocus=lanternLocation(18,410,835);
export const lanternMarketRegion={points:[[270,680],[600,680],[600,1050],[270,1050]].map(([x,y])=>lanternLocation(18,x,y))};

/** Short interpretation of the painted exchange; original pixels return afterwards. */
export function LanternMarketAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const filterId=`market-silk-${useId().replace(/:/g,'')}`;
  const [frame,setFrame]=useState(0),[opacity,setOpacity]=useState(0),[motionTime,setMotionTime]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,start:number|null=null;
    const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,8000);
    const tick=(now:number)=>{
      if(!live)return;
      start??=now;
      const elapsed=now-start,duration=4200;
      if(elapsed>=duration){live=false;setOpacity(0);done.current();return;}
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setFrame(reduced?0:sequence[Math.min(sequence.length-1,Math.floor(elapsed/(duration/sequence.length)))]);
      setMotionTime(reduced?0:elapsed);
      setOpacity(Math.min(1,elapsed/220,(duration-elapsed)/220));
      raf=requestAnimationFrame(tick);
    };
    const sources=[poses,background,ornaments,hangingBackground];
    const images=sources.map(src=>{const image=new Image();image.onload=()=>{if(!live)return;if(++loaded===sources.length){clearTimeout(timeout);raf=requestAnimationFrame(tick);}};image.onerror=fail;image.src=src;return image;});
    return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(image=>{image.onload=null;image.onerror=null;});};
  },[]);
  const {view}=viewport;
  return <div className="lantern-market-animation" role="status" aria-label="貨郎、童子與擔子掛飾的情景演繹正在播放" style={{opacity}}>
    <svg className="lantern-market-filter" width="0" height="0" aria-hidden="true" focusable="false"><defs><filter id={filterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 -0.001176 0 1 0 0 0.003922 0 0 1 0 0.003922 0 0 0 1 0"/></filter></defs></svg>
    <div className="lantern-market-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-market-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <div className="lantern-market-plate" style={{backgroundImage:`url(${background})`,filter:`url(#${filterId})`,maskImage:mask,WebkitMaskImage:mask}}/>
        <div className="lantern-market-hanging-plate" style={{backgroundImage:`url(${hangingBackground})`,filter:`url(#${filterId})`,maskImage:hangingMask,WebkitMaskImage:hangingMask}}/>
        <div aria-hidden="true">{hangingPieces.map(piece=><div key={piece.name} className="lantern-market-hanging-pivot" style={{left:piece.pivot[0],top:piece.pivot[1],transform:`rotate(${hangingAngle(motionTime,piece.amplitude,piece.delay)}deg)`}}>
          <div className="lantern-market-hanging-piece" style={{left:-piece.anchor[0]*piece.scale,top:-piece.anchor[1]*piece.scale,width:piece.crop[2],height:piece.crop[3],backgroundImage:`url(${ornaments})`,backgroundPosition:`${-piece.crop[0]}px ${-piece.crop[1]}px`,transform:`scale(${piece.scale})`}}/>
        </div>)}</div>
        <div className="lantern-market-poses" style={{backgroundImage:`url(${poses})`,backgroundPosition:`${-frameLeft[frame]}px ${668-baselines[frame]}px`}}/>
      </div>
    </div>
    <p className="lantern-market-caption">畫中情景演繹</p>
  </div>;
}
