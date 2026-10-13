import {useEffect,useId,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternSize,lanternLocation} from '../game/lanternFestival.ts';
import {lanternScrollPlacement} from '../game/lanternScrollPlacement.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import '../lantern-acrobat.css';

const poses=assetPath('art/animations/lantern-acrobat/poses-v1.png');
const background=assetPath('art/animations/lantern-acrobat/background-v1.png');
// Dilate before feathering so the old silhouettes remain covered at the seam.
// The extra 14px around the plate leaves room for the soft edge, without
// blurring either the animated people or the original painting.
const plateMask=`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="338" height="608" viewBox="-14 -14 338 608"><defs><filter id="edge" x="-15%" y="-10%" width="130%" height="120%"><feMorphology operator="dilate" radius="5"/><feGaussianBlur stdDeviation="5"/></filter></defs><polygon fill="white" filter="url(#edge)" points="93,0 214,0 226,180 282,197 282,273 214,284 301,307 298,574 6,574 6,418 43,313 115,290 28,278 0,226 19,191 96,180"/></svg>')}" )`;
const tile=lanternScrollPlacement.find(item=>item.number===10)!;
const h=tile.matrix;
const projection=`matrix3d(${[h[0][0],h[1][0],0,h[2][0],h[0][1],h[1][1],0,h[2][1],0,0,1,0,h[0][2],h[1][2],0,h[2][2]].join(',')})`;
const sequence=[0,1,2,3,4,5,4,3,2,1,0,1,2,3,4,5,4,3,2,1,0];
// Shared scale and table baseline for all six slots; no per-frame resizing.
const baselines=[689,688,689,688,689,688];
const corners=[[750,205],[1040,205],[1040,775],[750,775]].map(([x,y])=>lanternLocation(10,x,y));
export const lanternAcrobatRegion={points:corners};
export const lanternAcrobatFocus=lanternLocation(10,890,480);

/** A brief interpretation layer. It disappears entirely to restore the original pixels. */
export function LanternAcrobatAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
  const colourFilter=`acrobat-silk-${useId().replace(/:/g,'')}`;
  const [frame,setFrame]=useState(0),[opacity,setOpacity]=useState(0);
  const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
  useEffect(()=>{
    let live=true,raf=0,loaded=0,started=0;
    const finish=()=>{if(!live)return;live=false;window.clearTimeout(timeout);done.current();};
    const fail=()=>{if(!live)return;live=false;window.clearTimeout(timeout);cancelAnimationFrame(raf);error.current();};
    const timeout=window.setTimeout(fail,8000);
    const tick=(now:number)=>{
      if(!live)return;
      if(!started)started=now;
      const elapsed=now-started,duration=4000;
      if(elapsed>=duration){setOpacity(0);finish();return;}
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setFrame(reduced?0:sequence[Math.min(sequence.length-1,Math.floor(elapsed/(duration/sequence.length)))]);
      setOpacity(Math.min(1,elapsed/220,(duration-elapsed)/220));
      raf=requestAnimationFrame(tick);
    };
    const images=[poses,background].map(src=>{const img=new Image();img.onload=()=>{if(!live)return;if(++loaded===2){window.clearTimeout(timeout);raf=requestAnimationFrame(tick);}};img.onerror=fail;img.src=src;return img;});
    return()=>{live=false;cancelAnimationFrame(raf);window.clearTimeout(timeout);images.forEach(img=>{img.onload=null;img.onerror=null;});};
  },[]);
  const {view}=viewport;
  return <div className="lantern-acrobat-animation" role="status" aria-label="雜技情景演繹正在播放" style={{opacity}}>
    <svg className="lantern-acrobat-filter" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id={colourFilter} colorInterpolationFilters="sRGB">
          {/* Match nearby silk samples: -0.7 red, +2.3 green, +5.5 blue. */}
          <feColorMatrix type="matrix" values="1 0 0 0 -0.002745 0 1 0 0 0.009020 0 0 1 0 0.021569 0 0 0 1 0"/>
        </filter>
      </defs>
    </svg>
    <div className="lantern-acrobat-world" style={{width:lanternSize.width,height:lanternSize.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.scale})`}}>
      <div className="lantern-acrobat-tile" style={{width:tile.sourceWidth,height:tile.sourceHeight,transform:projection}}>
        <div className="lantern-acrobat-plate" style={{backgroundImage:`url(${background})`,filter:`url(#${colourFilter})`,maskImage:plateMask,WebkitMaskImage:plateMask}}/>
        <div className="lantern-acrobat-poses" style={{backgroundImage:`url(${poses})`,backgroundPosition:`${-frame*362-28}px ${624-baselines[frame]}px`} as CSSProperties}/>
      </div>
    </div>
    <p className="lantern-acrobat-caption">畫中情景演繹</p>
  </div>;
}
