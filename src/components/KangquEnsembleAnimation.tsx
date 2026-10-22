import {useEffect,useRef} from 'react';
import type {SceneViewport} from './ScrollScene.tsx';
import {kangquEnsembleCrop as crop,kangquEnsembleSource as source} from '../game/kangquEnsemble.ts';
import {ensembleMasterAsset as asset,ensembleMasterFrames as frames,ensembleMasterPlacement as placement,ensembleMasterDuration as duration,ensembleMasterFrame as frameAt,ensembleMasterLead as lead,ensembleMasterMotion as motion,ensembleMasterFade as fade} from '../game/kangquEnsembleMaster.ts';
/** Each RGBA drawing contains the complete repainted ensemble. The background is immutable. */
export function KangquEnsembleAnimation({viewport,onDone,onError,playbackRate=1}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void;playbackRate?:number}){
 const layer=useRef<HTMLCanvasElement>(null);
 const done=useRef(onDone),failed=useRef(onError);done.current=onDone;failed.current=onError;
 useEffect(()=>{
  let stopped=false,raf=0,start:number|undefined;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const images=[source,asset('fixed-background'),...frames].map(src=>{const image=new Image();image.src=src;return image;});
  Promise.all(images.map(image=>image.decode())).then(()=>{
   if(stopped)return;
   const canvas=layer.current,context=canvas?.getContext('2d');
   if(!canvas||!context)throw new Error('Animation canvas unavailable');
   const scene=document.createElement('canvas');scene.width=crop.width;scene.height=crop.height;
   const paint=scene.getContext('2d');if(!paint)throw new Error('Animation scene unavailable');
   const tick=(now:number)=>{
    if(stopped)return;start??=now;const t=(now-start)*(reduced?1:playbackRate);
    if(t>=(reduced?850:duration)){done.current();return;}
    context.globalAlpha=1;context.drawImage(images[0],0,0);
    const frame=frameAt(t);
    if(!reduced){
     // Same stationary plate on every frame; no articulated patches or people extracted at runtime.
     paint.clearRect(0,0,crop.width,crop.height);paint.drawImage(images[1],0,0);
     const group=images[frame+2];paint.drawImage(group,placement.x,placement.y,group.width*placement.scale,group.height*placement.scale);
     context.globalAlpha=Math.max(0,Math.min(1,t/lead,(lead+motion+fade-t)/fade));context.drawImage(scene,0,0);context.globalAlpha=1;
    }
    canvas.dataset.groupFrame=String(frame+1);canvas.dataset.time=String(Math.round(t));
    raf=requestAnimationFrame(tick);
   };
   raf=requestAnimationFrame(tick);
  }).catch(()=>{if(!stopped)failed.current();});
  const skip=(e:KeyboardEvent)=>{if(e.key==='Escape')done.current();};window.addEventListener('keydown',skip);
  return()=>{stopped=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',skip);};
 },[playbackRate]);
 const {view}=viewport;
 return <div className="lantern-acrobat-animation" aria-label="畫中情景演繹：以同一組三人摹繪製成的合奏動畫，背景固定">
  <canvas ref={layer} width={crop.width} height={crop.height} style={{position:'absolute',left:view.x+crop.x*view.scale,top:view.y+crop.y*view.scale,width:crop.width*view.scale,height:crop.height*view.scale,filter:'var(--painting-grade)'}}/>
 </div>;
}
