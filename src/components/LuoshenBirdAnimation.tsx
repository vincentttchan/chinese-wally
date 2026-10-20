import {useEffect,useRef,useState} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {assetPath} from '../game/assets.ts';
import {luoshenSize} from '../game/luoshen.ts';
import {luoshenBirdDuration,luoshenBirdPatch,renderLuoshenBirdFrame} from '../game/luoshenBirdMotion.ts';
const original=assetPath('art/luoshen/detail-8.jpg');
/** One continuously deformed source surface: no cut-out roots or restoration plate. */
export function LuoshenBirdAnimation({viewport,onDone,onError,tipOnly=false}:{tipOnly?:boolean;viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),[visible,setVisible]=useState(false);
 const done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
 useEffect(()=>{
  let live=true,raf=0,started:number|null=null;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);setVisible(false);error.current();};
  const timeout=window.setTimeout(fail,8000),image=new Image();
  image.onerror=fail;
  image.onload=()=>{
   if(!live)return;
   try{
    const context=canvas.current?.getContext('2d',{willReadFrequently:true});if(!context){fail();return;}
    const {left,top,width,height}=luoshenBirdPatch;
    context.drawImage(image,left,top,width,height,0,0,width,height);
    const source=context.getImageData(0,0,width,height).data,frame=context.createImageData(width,height);
    clearTimeout(timeout);setVisible(true);
    const tick=(now:number)=>{
     if(!live)return;started??=now;const age=now-started;
     if(age>=luoshenBirdDuration){live=false;setVisible(false);done.current();return;}
     try{renderLuoshenBirdFrame(source,frame.data,age,tipOnly);context.putImageData(frame,0,0);raf=requestAnimationFrame(tick);}catch{fail();}
    };
    raf=requestAnimationFrame(tick);
   }catch{fail();}
  };
  image.src=original;
  return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);image.onload=null;image.onerror=null;};
 },[tipOnly]);
 return <div className="luoshen-bird-animation" role="status" aria-label="雙鳥振翅 · 遊戲演繹正在播放">
  <div className="luoshen-bird-world" style={{width:luoshenSize.width,height:luoshenSize.height,transform:`translate(${viewport.view.x}px,${viewport.view.y}px) scale(${viewport.view.scale})`,opacity:visible?1:0}}>
   <canvas ref={canvas} width={luoshenBirdPatch.width} height={luoshenBirdPatch.height} className="luoshen-bird-patch" style={{left:8*1995+luoshenBirdPatch.left,top:luoshenBirdPatch.top}} aria-hidden="true"/>
  </div>
  <p className="lantern-market-caption">畫中情景演繹 · 雙鳥振翅</p>
 </div>;
}
