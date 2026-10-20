import {useEffect,useRef,useState} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {assetPath} from '../game/assets.ts';
import {luoshenSize} from '../game/luoshen.ts';
import {birdAtlas,drawRedrawnBird,redrawnBirdDuration,redrawnBirdSize} from '../game/luoshenRedrawnBird.ts';
import {inPaintingBirdPatch,prepareBirdSilk,drawBirdsInPainting,gradeBirdInk} from '../game/luoshenBirdInPainting.ts';
export function LuoshenRedrawnBird({viewport,playing,ticket,onDone,onError,show=true,onHidden}:{viewport:SceneViewport;playing:boolean;ticket:number;onDone:()=>void;onError:()=>void;show?:boolean;onHidden?:()=>void}){
 const running=useRef(playing&&show),hidden=useRef(onHidden);running.current=playing&&show;hidden.current=onHidden;
 const canvas=useRef<HTMLCanvasElement>(null),done=useRef(onDone),error=useRef(onError),[visible,setVisible]=useState(false);done.current=onDone;error.current=onError;
 useEffect(()=>{if(show)return;const timer=window.setTimeout(()=>hidden.current?.(),window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:220);return()=>clearTimeout(timer);},[show]);
 useEffect(()=>{
  let live=true,raf=0,start:number|null=null,loaded=0;
  const images=[new Image(),new Image(),new Image()];let timer=0;
  const fail=()=>{if(!live)return;live=false;clearTimeout(timer);cancelAnimationFrame(raf);setVisible(false);error.current();};
  const makeCanvas=(width:number,height:number)=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c;};
  const paint=()=>{
   if(!live||++loaded!==images.length)return;clearTimeout(timer);
   try{
    const ctx=canvas.current?.getContext('2d');if(!ctx){fail();return;}
    const parts={} as Record<keyof typeof birdAtlas,HTMLCanvasElement>;
    for(const key of ['body','near','far'] as const){const crop=birdAtlas[key],part=makeCanvas(crop.width,crop.height),p=part.getContext('2d');if(!p){fail();return;}p.drawImage(images[0],crop.x,crop.y,crop.width,crop.height,0,0,crop.width,crop.height);const ink=p.getImageData(0,0,crop.width,crop.height);gradeBirdInk(ink.data,crop.width,crop.height);p.putImageData(ink,0,0);parts[key]=part;}
    const patch=inPaintingBirdPatch,base=makeCanvas(patch.width,patch.height),b=base.getContext('2d',{willReadFrequently:true});
    const repair=makeCanvas(patch.width,patch.height),r=repair.getContext('2d',{willReadFrequently:true});
    const bird=makeCanvas(redrawnBirdSize.width,redrawnBirdSize.height),bc=bird.getContext('2d');if(!b||!r||!bc){fail();return;}
    b.drawImage(images[1],patch.left,patch.top,patch.width,patch.height,0,0,patch.width,patch.height);r.drawImage(images[2],0,0,patch.width,patch.height);
    const source=b.getImageData(0,0,patch.width,patch.height),plate=r.getImageData(0,0,patch.width,patch.height);
    source.data.set(prepareBirdSilk(source.data,plate.data));b.putImageData(source,0,0);
    const draw=(time:number)=>drawBirdsInPainting(ctx,base,bird,time,(t,variant)=>drawRedrawnBird(bc,parts,t,variant));
    draw(0);setVisible(true);
    if(!running.current)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
    const tick=(now:number)=>{
     if(!live||!running.current)return;start??=now;const age=now-start;
     try{draw(Math.min(age,redrawnBirdDuration));}catch{fail();return;}
     if(age>=redrawnBirdDuration){done.current();return;}raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
   }catch{fail();}
  };
  timer=window.setTimeout(fail,8000);for(const image of images){image.onerror=fail;image.onload=paint;}
  images[0].src=assetPath('art/animations/luoshen-birds/redrawn/bird-parts-v2.png');
  images[1].src=assetPath('art/luoshen/detail-8.jpg');
  images[2].src=assetPath('art/animations/luoshen-birds/redrawn/silk-plate-v3.png');
  return()=>{live=false;clearTimeout(timer);cancelAnimationFrame(raf);for(const image of images){image.onload=null;image.onerror=null;}};
 },[ticket]);
 const p=inPaintingBirdPatch;
 return <div className="luoshen-redrawn-stage" role="img" aria-label={playing?'畫中重繪雙鳥振翅 · 遊戲演繹正在播放':'畫中重繪雙鳥 · 靜止對照'}>
  <div className="luoshen-bird-world" style={{width:luoshenSize.width,height:luoshenSize.height,transform:`translate(${viewport.view.x}px,${viewport.view.y}px) scale(${viewport.view.scale})`,opacity:visible&&show?1:0}}>
   <canvas ref={canvas} className="luoshen-redrawn-patch" width={p.width*p.resolution} height={p.height*p.resolution} style={{left:8*1995+p.left,top:p.top,width:p.width,height:p.height}} aria-hidden="true"/>
  </div>
 </div>;
}
