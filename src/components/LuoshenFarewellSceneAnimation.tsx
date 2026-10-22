import {useEffect,useRef} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {assetPath} from '../game/assets.ts';
import {luoshenSize} from '../game/luoshen.ts';
import {luoshenFacePoints} from '../game/luoshenHit.ts';
import {farewellOpacity} from '../game/luoshenFarewellMotion.ts';
import {sceneDuration,scenePatch as p} from '../game/luoshenFarewellSceneMotion.ts';
import {prepareFarewellScene} from '../game/luoshenFarewellSceneRenderer.ts';
const files=['art/luoshen/detail-4.jpg','art/animations/luoshen-farewell-scene/silk-plate-v1.png','art/animations/luoshen-farewell/figure-parts-v1.png','art/animations/luoshen-cao/figure-master-v2.png','art/animations/luoshen-farewell-scene/retinue-master-v1.png','art/animations/luoshen-farewell-scene/mount-master-v1.png'];
export function LuoshenFarewellSceneAnimation({viewport,onDone,onError,onOriginal}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void;onOriginal:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),world=useRef<HTMLDivElement>(null),done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
 useEffect(()=>{let live=true,raf=0,loaded=0,timer=0,start:number|null=null,last=-Infinity;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  const images=files.map(()=>new Image()),fail=()=>{if(!live)return;live=false;clearTimeout(timer);cancelAnimationFrame(raf);if(world.current)world.current.style.opacity='0';error.current();};
  const ready=()=>{if(!live||++loaded!==images.length)return;clearTimeout(timer);try{const ctx=canvas.current?.getContext('2d',{willReadFrequently:true});if(!ctx){fail();return;}const renderer=prepareFarewellScene(images,(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});renderer.draw(ctx,0);
   const tick=(now:number)=>{if(!live)return;start??=now;const age=Math.min(sceneDuration,now-start);try{if(now-last>=1000/30||age===sceneDuration){renderer.draw(ctx,age);if(world.current)world.current.style.opacity=String(farewellOpacity(age));last=now;}}catch{fail();return;}if(age===sceneDuration){live=false;done.current();return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  }catch{fail();}};
  timer=window.setTimeout(fail,10000);images.forEach((image,index)=>{image.onload=ready;image.onerror=fail;image.src=assetPath(files[index]);});return()=>{live=false;clearTimeout(timer);cancelAnimationFrame(raf);images.forEach(i=>{i.onload=null;i.onerror=null;});};
 },[]);
 const targets=[{id:'L8',label:'神女'},{id:'C3',label:'曹植'},{id:'attendant-farewell-back',label:'持傘隨從'},{id:'attendant-farewell-beard',label:'長髯隨從'},{id:'attendant-farewell-box',label:'捧物隨從'},{id:'mount',label:'鳥形'}];
 return <div className="luoshen-farewell-animation luoshen-farewell-pair-animation luoshen-farewell-scene-animation" role="status" aria-label="神女、曹植、三位隨從與長頸鳥形同步原位演繹正在播放">
  <div ref={world} className="luoshen-farewell-world" style={{width:luoshenSize.width,height:luoshenSize.height,transform:`translate(${viewport.view.x}px,${viewport.view.y}px) scale(${viewport.view.scale})`,opacity:0}}><canvas ref={canvas} width={p.width} height={p.height} style={{left:p.tile*1995+p.left,top:p.top,width:p.width,height:p.height}} aria-hidden="true"/></div>
  {targets.map(({id,label})=>{const f=id==='mount'?{x:4*1995+180,y:700}:luoshenFacePoints[id];return <button key={id} className="luoshen-farewell-return-hit" style={{left:viewport.view.x+f.x*viewport.view.scale,top:viewport.view.y+f.y*viewport.view.scale}} aria-label={`點${label}，返回原畫`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onOriginal();}}/>;})}
 </div>;
}
