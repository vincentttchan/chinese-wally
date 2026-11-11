import {useEffect,useRef} from 'react';
import {assetPath} from '../game/assets.ts';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
import type {SceneViewport} from './ScrollScene.tsx';

// The independent study defines the articulated hands, handle and fan. The
// original silk supplies their finish; the head, robe and feet never dissolve.
const patch={x:3480,y:360,width:710,height:1018};
const duration=4600;
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
export function ZanhuaMaidAnimation({viewport,onDone}:{viewport:SceneViewport;onDone:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),done=useRef(onDone);done.current=onDone;
 useEffect(()=>{
  const output=canvas.current,ctx=output?.getContext('2d');
  if(!output||!ctx||matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  let cancelled=false,raf=0,start:number|undefined;
  const original=new Image(),study=new Image();
  original.src=zanhuaImage;study.src=assetPath('art/zanhua/animation/P3-maid-study-v1.png');
  const timeout=window.setTimeout(()=>{if(!cancelled){cancelled=true;done.current();}},8000);
  Promise.all([original.decode(),study.decode()]).then(()=>{
   if(cancelled)return;window.clearTimeout(timeout);
   const {x,y,width,height}=patch;
   const surface=()=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c;};
   const originalPatch=surface(),o=originalPatch.getContext('2d')!;o.drawImage(original,x,y,width,height,0,0,width,height);
   const drawing=surface(),d=drawing.getContext('2d')!;d.drawImage(study,0,0,width,height);
   // One articulated unit: both grips stay attached to the same handle.
   const regions=new Path2D('M365 290 L356 235 L383 115 Q445 4 570 18 Q697 20 697 158 Q685 255 560 266 L436 257 Z M83 548 L288 345 L310 327 L320 346 L98 566 Z M264 330 Q284 313 303 333 L321 385 L304 431 L282 418 L265 374 Z M66 518 L93 492 L121 507 L114 546 L94 581 L70 575 Z');
   const mask=surface(),m=mask.getContext('2d')!;m.fill(regions);
   m.globalCompositeOperation='destination-in';m.drawImage(drawing,0,0);
   const moving=surface(),a=moving.getContext('2d')!;a.drawImage(originalPatch,0,0);a.globalCompositeOperation='destination-in';a.drawImage(mask,0,0);
   // Fill only the vacated moving silhouettes, preserving every fixed pixel.
   const pixels=m.getImageData(0,0,width,height).data;
   const repair=surface(),b=repair.getContext('2d')!;
   for(let row=0;row<height;row++){
    let col=0;
    while(col<width){
     while(col<width&&pixels[(row*width+col)*4+3]<24)col++;
     const first=col;
     while(col<width&&pixels[(row*width+col)*4+3]>=24)col++;
     if(first===col)continue;
     const left=Math.max(0,first-3),right=Math.min(width,col+3),mid=(left+right)/2;
     b.drawImage(originalPatch,Math.max(0,left-10),row,7,1,left,row,mid-left,1);
     b.drawImage(originalPatch,Math.min(width-7,right+3),row,7,1,mid,row,right-mid,1);
    }
   }
   b.globalCompositeOperation='destination-in';b.filter='blur(1.2px)';b.drawImage(mask,0,0);b.filter='none';
   const frame=surface(),f=frame.getContext('2d')!;
   const pivot={x:90,y:548};
   const paint=(now:number)=>{
    if(cancelled)return;start??=now;const time=now-start;
    if(time>=duration){done.current();return;}
    const lift=smooth((time-500)/1500)*(1-smooth((time-2600)/1500));
    const fade=smooth(time/350)*smooth((duration-time)/350);
    f.clearRect(0,0,width,height);f.drawImage(repair,0,0);
    f.save();f.translate(pivot.x,pivot.y);f.rotate(-.018*lift);f.translate(-pivot.x,-pivot.y);f.drawImage(moving,0,0);f.restore();
    ctx.clearRect(0,0,width,height);ctx.globalAlpha=fade;ctx.drawImage(frame,0,0);ctx.globalAlpha=1;
    raf=requestAnimationFrame(paint);
   };
   raf=requestAnimationFrame(paint);
  },()=>{window.clearTimeout(timeout);if(!cancelled)done.current();});
  return()=>{cancelled=true;cancelAnimationFrame(raf);window.clearTimeout(timeout);};
 },[]);
 const {view}=viewport;
 return <div className="zanhua-dog-animation" role="status" aria-label="執扇侍女在原位輕抬長柄扇的遊戲演繹">
  <canvas ref={canvas} className="zanhua-maid-in-painting" width={patch.width} height={patch.height}
   style={{transform:`translate(${view.x+patch.x*view.scale}px,${view.y+patch.y*view.scale}px) scale(${view.scale})`}} aria-hidden="true"/>
 </div>;
}
