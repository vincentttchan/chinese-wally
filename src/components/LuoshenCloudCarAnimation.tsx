import {useEffect,useRef} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {assetPath} from '../game/assets.ts';
import {luoshenSize} from '../game/luoshen.ts';


import {cloudCarDuration as sceneDuration,cloudCarPatch as p,cloudCarOpacity as farewellOpacity} from '../game/luoshenCloudCarMotion.ts';
import {prepareCloudCar as prepareFarewellScene} from '../game/luoshenCloudCarRenderer.ts';
const files=['art/luoshen/detail-3.jpg','art/animations/luoshen-cloudcar/silk-plate-v1.png','art/animations/luoshen-cloudcar/master-v2.png'];
export function LuoshenCloudCarAnimation({viewport,onDone,onError,onOriginal}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void;onOriginal:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),world=useRef<HTMLDivElement>(null),done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
 useEffect(()=>{let live=true,raf=0,loaded=0,timer=0,start:number|null=null,last=-Infinity;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  const images=files.map(()=>new Image()),fail=()=>{if(!live)return;live=false;clearTimeout(timer);cancelAnimationFrame(raf);if(world.current)world.current.style.opacity='0';error.current();};
  const ready=()=>{if(!live||++loaded!==images.length)return;clearTimeout(timer);try{const ctx=canvas.current?.getContext('2d',{willReadFrequently:true});if(!ctx){fail();return;}const renderer=prepareFarewellScene(images,(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});renderer.draw(ctx,0);
   const tick=(now:number)=>{if(!live)return;start??=now;const age=Math.min(sceneDuration,now-start);try{if(now-last>=1000/30||age===sceneDuration){renderer.draw(ctx,age);if(world.current)world.current.style.opacity=String(farewellOpacity(age));last=now;}}catch{fail();return;}if(age===sceneDuration){live=false;done.current();return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  }catch{fail();}};
  timer=window.setTimeout(fail,10000);images.forEach((image,index)=>{image.onload=ready;image.onerror=fail;image.src=assetPath(files[index]);});return()=>{live=false;clearTimeout(timer);cancelAnimationFrame(raf);images.forEach(i=>{i.onload=null;i.onerror=null;});};
 },[]);
 return <div className="luoshen-farewell-animation luoshen-cloudcar-animation" role="status" aria-label="雲車乘坐者、衣帶與華蓋流蘇原位演繹正在播放">
  <div ref={world} className="luoshen-farewell-world" style={{width:luoshenSize.width,height:luoshenSize.height,transform:`translate(${viewport.view.x}px,${viewport.view.y}px) scale(${viewport.view.scale})`,opacity:0}}><canvas ref={canvas} width={p.width} height={p.height} style={{left:p.tile*1995+p.left,top:p.top,width:p.width,height:p.height}} aria-hidden="true"/></div>
  {[{name:'雲車',x:6290,y:572.5,width:300,height:185},{name:'洛神',x:6310,y:405,width:52,height:60},{name:'同行者',x:6210,y:390,width:52,height:60}].map(a=><button key={a.name} className="luoshen-farewell-return-hit" style={{left:viewport.view.x+a.x*viewport.view.scale,top:viewport.view.y+a.y*viewport.view.scale,width:Math.max(44,a.width*viewport.view.scale),height:Math.max(44,a.height*viewport.view.scale)}} aria-label={`點${a.name}，返回原畫`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onOriginal();}}/>)}
 </div>;
}
