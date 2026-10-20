import {useEffect,useRef} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {assetPath} from '../game/assets.ts';
import {luoshenSize} from '../game/luoshen.ts';
import {luoshenFigureDuration as redrawnRibbonDuration,luoshenFigurePatch as redrawnRibbonPatch,prepareFigureSilk,figureOpacity} from '../game/luoshenFigureMotion.ts';
import {figureAtlas,drawFigureParts,gradeFigurePart} from '../game/luoshenFigureParts.ts';
import type {FigurePart} from '../game/luoshenFigureParts.ts';
/** Full redrawn figure: head, torso, gesture and cloth move over a stationary ground. */
export function LuoshenRibbonAnimation({viewport,onDone,onError}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),world=useRef<HTMLDivElement>(null),done=useRef(onDone),error=useRef(onError);done.current=onDone;error.current=onError;
 useEffect(()=>{
  let live=true,raf=0,started:number|null=null,loaded=0;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  const images=[new Image(),new Image(),new Image()];let timeout=0;
  const fail=()=>{if(!live)return;live=false;clearTimeout(timeout);cancelAnimationFrame(raf);if(world.current)world.current.style.opacity='0';error.current();};
  const make=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const ready=()=>{
   if(!live||++loaded!==3)return;clearTimeout(timeout);
   try{
    const ctx=canvas.current?.getContext('2d'),p=redrawnRibbonPatch,res=p.resolution;
    const base=make(p.width,p.height),b=base.getContext('2d',{willReadFrequently:true}),repair=make(p.width,p.height),r=repair.getContext('2d',{willReadFrequently:true});
    const ribbon=make(p.width*res,p.height*res),rc=ribbon.getContext('2d',{willReadFrequently:true});if(!ctx||!b||!r||!rc){fail();return;}
    b.drawImage(images[0],p.left,p.top,p.width,p.height,0,0,p.width,p.height);r.drawImage(images[2],0,0,p.width,p.height);
    const original=b.getImageData(0,0,p.width,p.height);original.data.set(prepareFigureSilk(original.data,r.getImageData(0,0,p.width,p.height).data));b.putImageData(original,0,0);
    const parts={} as Record<FigurePart,HTMLCanvasElement>;
    for(const key of Object.keys(figureAtlas) as FigurePart[]){
     const crop=figureAtlas[key],part=make(crop.width,crop.height),pc=part.getContext('2d',{willReadFrequently:true});if(!pc){fail();return;}
     pc.drawImage(images[1],crop.x,crop.y,crop.width,crop.height,0,0,crop.width,crop.height);
     const pixels=pc.getImageData(0,0,crop.width,crop.height);gradeFigurePart(pixels.data,crop.width,crop.height,key);pc.putImageData(pixels,0,0);parts[key]=part;
    }
    const draw=(age:number)=>{drawFigureParts(rc,parts,age);ctx.clearRect(0,0,ribbon.width,ribbon.height);ctx.drawImage(base,0,0,ribbon.width,ribbon.height);ctx.globalAlpha=.92;ctx.drawImage(ribbon,0,0);ctx.globalAlpha=1;if(world.current)world.current.style.opacity=String(figureOpacity(age));};
    draw(0);
    const tick=(now:number)=>{
     if(!live)return;started??=now;const age=Math.min(redrawnRibbonDuration,now-started);
     try{draw(age);}catch{fail();return;}
     if(age>=redrawnRibbonDuration){live=false;done.current();return;}raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
   }catch{fail();}
  };
  timeout=window.setTimeout(fail,8000);for(const image of images){image.onerror=fail;image.onload=ready;}
  images[0].src=assetPath('art/luoshen/detail-8.jpg');images[1].src=assetPath('art/animations/luoshen-figure/figure-parts-v2.png');images[2].src=assetPath('art/animations/luoshen-figure/silk-plate-v1.png');
  return()=>{live=false;clearTimeout(timeout);cancelAnimationFrame(raf);for(const image of images){image.onload=null;image.onerror=null;}};
 },[]);
 const p=redrawnRibbonPatch;
 return <div className="luoshen-ribbon-animation" role="status" aria-label="重繪洛神身姿 · 遊戲演繹正在播放">
  <div ref={world} className="luoshen-ribbon-world" style={{width:luoshenSize.width,height:luoshenSize.height,transform:`translate(${viewport.view.x}px,${viewport.view.y}px) scale(${viewport.view.scale})`,opacity:0}}>
   <canvas ref={canvas} width={p.width*p.resolution} height={p.height*p.resolution} className="luoshen-ribbon-patch" style={{left:8*1995+p.left,top:p.top,width:p.width,height:p.height}} aria-hidden="true"/>
  </div>
  <p className="lantern-market-caption">畫中情景演繹 · 重繪洛神身姿</p>
 </div>;
}
