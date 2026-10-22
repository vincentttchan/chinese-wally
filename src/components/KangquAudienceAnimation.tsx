import {useEffect,useRef} from 'react';
import playback from '../game/kangquAudiencePlayback.json';
import type {SceneViewport} from './ScrollScene.tsx';
import {kangquAudienceCrop as crop,kangquAudienceAsset as asset,kangquAudienceFrames as frames,kangquAudienceDuration as duration,kangquAudienceFrame as frameAt,kangquAudienceLead as lead,kangquAudienceMotion as motion,kangquAudienceFade as fade} from '../game/kangquAudience.ts';
const source=asset('original-reference');
/** Each RGBA drawing contains the complete repainted ensemble. The background is immutable. */
export function KangquAudienceAnimation({viewport,onDone,onError,playbackRate=1}:{viewport:SceneViewport;onDone:()=>void;onError:()=>void;playbackRate?:number}){
 const layer=useRef<HTMLCanvasElement>(null);
 const currentViewport=useRef(viewport);currentViewport.current=viewport;
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
    // Keep source art in device pixels; never bake the detailed group into a native-crop-sized intermediate.
    const density=Math.min(4,Math.max(1,currentViewport.current.view.scale*window.devicePixelRatio));
    const width=Math.ceil(crop.width*density),height=Math.ceil(crop.height*density);
    if(canvas.width!==width||canvas.height!==height){canvas.width=scene.width=width;canvas.height=scene.height=height;}
    context.setTransform(width/crop.width,0,0,height/crop.height,0,0);paint.setTransform(width/crop.width,0,0,height/crop.height,0,0);
    context.imageSmoothingEnabled=paint.imageSmoothingEnabled=true;context.imageSmoothingQuality=paint.imageSmoothingQuality='high';
    context.globalAlpha=1;context.clearRect(0,0,crop.width,crop.height);context.drawImage(images[0],0,0,crop.width,crop.height);
    const frame=frameAt(t);
    if(!reduced){
     // Same stationary plate on every frame; no articulated patches or people extracted at runtime.
     paint.clearRect(0,0,crop.width,crop.height);paint.drawImage(images[1],0,0,crop.width,crop.height);
     const group=images[frame+2];paint.drawImage(group,0,0,crop.width,crop.height);
     // The original roofs occlude the painted group exactly as they do in the source.
     paint.save();paint.beginPath();
     for(const polygon of playback.foreground){polygon.forEach(([x,y],i)=>i?paint.lineTo(x,y):paint.moveTo(x,y));paint.closePath();}
     paint.clip();paint.drawImage(images[0],0,0,crop.width,crop.height);paint.restore();
     context.globalAlpha=Math.max(0,Math.min(1,t/lead,(lead+motion+fade-t)/fade));context.drawImage(scene,0,0,crop.width,crop.height);context.globalAlpha=1;
    }
    canvas.dataset.renderWidth=String(width);canvas.dataset.sourceWidth=String(images[frame+2].width);canvas.dataset.groupFrame=String(frame+1);canvas.dataset.time=String(Math.round(t));
    raf=requestAnimationFrame(tick);
   };
   raf=requestAnimationFrame(tick);
  }).catch(()=>{if(!stopped)failed.current();});
  const skip=(e:KeyboardEvent)=>{if(e.key==='Escape')done.current();};window.addEventListener('keydown',skip);
  return()=>{stopped=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',skip);};
 },[playbackRate]);
 const {view}=viewport;
 return <div className="lantern-acrobat-animation" aria-label="畫中情景演繹：七位人物前後呼應的整組摹繪動畫，背景固定">
  <canvas ref={layer} width={crop.width} height={crop.height} style={{position:'absolute',left:view.x+crop.x*view.scale,top:view.y+crop.y*view.scale,width:crop.width*view.scale,height:crop.height*view.scale,filter:'var(--painting-grade)'}}/>
 </div>;
}
