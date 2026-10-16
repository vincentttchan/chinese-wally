import {useEffect,useRef,useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternSize,lanternLocation} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-acrobat.css';

const poses=assetPath('art/animations/lantern-drummer/poses-v1.png');
const background=assetPath('art/animations/lantern-drummer/background-v1.png');
const tile=lanternScrollPlacement.find(item=>item.number===13)!;
const h=tile.matrix;
const projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
// Repair only the old drummer silhouette; neighbouring musicians stay original.
const mask=`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="310" viewBox="20 1120 240 310"><defs><filter id="soft" x="-20%" y="-15%" width="140%" height="130%"><feMorphology operator="dilate" radius="4"/><feGaussianBlur stdDeviation="3"/></filter></defs><path fill="white" filter="url(#soft)" d="M65 1140 L80 1140 L103 1200 L112 1174 L169 1150 L201 1180 L186 1228 L180 1280 L213 1375 L177 1392 L148 1411 L109 1420 L96 1405 L110 1364 L93 1305 L71 1285 L42 1272 L38 1251 L51 1237 L100 1228 L73 1190 Z"/></svg>')}")`;
export const lanternDrummerFocus=lanternLocation(13,140,1265);
export const lanternDrummerRegion={points:[[40,1125],[225,1125],[225,1430],[40,1430]].map(([x,y])=>lanternLocation(13,x,y))};
// Two beats with a pause after each rebound. The generated feet share y=692.
const sequence=[0,0,1,1,2,3,0,0,0,1,1,2,3,0,0,0];
const offsets=[0,17,0,16];

/** Temporary interpretation only: unmounting restores the untouched original. */
export function LanternDrummerAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const [frame,setFrame]=useState(0),[opacity,setOpacity]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,started:number|undefined;
    const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,8000);
    const tick=(now:number)=>{
      if(!live)return;
      started??=now;
      const elapsed=now-started,duration=4000;
      if(elapsed>=duration){live=false;setOpacity(0);done.current();return;}
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setFrame(reduced?0:sequence[Math.min(sequence.length-1,Math.floor(elapsed/250))]);
      setOpacity(Math.min(1,elapsed/200,(duration-elapsed)/200));
      raf=requestAnimationFrame(tick);
    };
    const images=[poses,background].map(src=>{const img=new Image();img.onload=()=>{if(live&&++loaded===2){clearTimeout(timeout);raf=requestAnimationFrame(tick);}};img.onerror=fail;img.src=src;return img;});
    return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);images.forEach(img=>{img.onload=null;img.onerror=null;});};
  },[]);
  const {view}=viewport;
  return <div className="lantern-acrobat-animation" role="status" aria-label="鼓手擊鼓情景演繹正在播放" style={{opacity}}>
    <div className="lantern-acrobat-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-acrobat-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <div style={{position:'absolute',left:20,top:1120,width:240,height:310,backgroundImage:`url(${background})`,backgroundSize:`${tile.sourceWidth}px ${tile.sourceHeight}px`,backgroundPosition:'-20px -1120px',maskImage:mask,WebkitMaskImage:mask}}/>
        <div style={{position:'absolute',left:0,top:1105,width:543,height:724,backgroundImage:`url(${poses})`,backgroundSize:'2172px 724px',backgroundPosition:`${-frame*543-offsets[frame]}px 0`,backgroundRepeat:'no-repeat',transform:'scale(.444)',transformOrigin:'0 0'}}/>
      </div>
    </div>
    <p className="lantern-acrobat-caption">畫中情景演繹 · 鼓手擊鼓</p>
  </div>;
}
