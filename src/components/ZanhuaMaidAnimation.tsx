import {useEffect,useRef} from 'react';
import {assetPath} from '../game/assets.ts';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
import type {SceneViewport} from './ScrollScene.tsx';

// The independent study stays registered to the original figure. Feet and head
// remain still; the fan makes one small, continuous tilt and return.
const patch={x:3480,y:360,width:710,height:1018};
const duration=4400;
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
   const art=document.createElement('canvas');art.width=width;art.height=height;
   const a=art.getContext('2d')!;a.drawImage(study,0,0,width,height);
   const pixels=a.getImageData(0,0,width,height).data;
   const back=document.createElement('canvas');back.width=width;back.height=height;
   const b=back.getContext('2d')!;
   // Borrow adjacent silk only inside the silhouette, never a rectangular tile.
   for(let row=0;row<height;row++){
    let first=width,last=0;
    for(let col=0;col<width;col++)if(pixels[(row*width+col)*4+3]>24){first=Math.min(first,col);last=Math.max(last,col);}
    if(first>last)continue;
    const middle=(first+last)/2;
    const left=Math.max(0,first-5),right=Math.min(width,last+6);
    b.drawImage(original,Math.max(0,x+first-22),y+row,12,1,left,row,middle-left,1);
    b.drawImage(original,x+last+10,y+row,12,1,middle,row,right-middle,1);
   }
   // A slight feather avoids a hard cut line against the aged silk.
   b.globalCompositeOperation='destination-in';b.filter='blur(3px)';b.drawImage(art,0,0);b.filter='none';
   const grip={x:300,y:355};
   const fanPath=new Path2D('M285 323 L320 360 L423 260 L710 275 L710 0 L370 0 L350 200 Z');
   const body=document.createElement('canvas');body.width=width;body.height=height;
   const bodyContext=body.getContext('2d')!;bodyContext.drawImage(art,0,0);
   bodyContext.globalCompositeOperation='destination-out';bodyContext.fill(fanPath);
   const fan=document.createElement('canvas');fan.width=width;fan.height=height;
   const fanContext=fan.getContext('2d')!;fanContext.clip(fanPath);fanContext.drawImage(art,0,0);
   const paint=(now:number)=>{
    if(cancelled)return;start??=now;const time=now-start;
    if(time>=duration){done.current();return;}
    const lift=smooth((time-650)/1200)*(1-smooth((time-2600)/1200));
    const fade=smooth(time/500)*smooth((duration-time)/500);
    ctx.clearRect(0,0,width,height);ctx.globalAlpha=fade;
    ctx.drawImage(back,0,0);
    ctx.drawImage(body,0,0);
    ctx.save();ctx.translate(grip.x,grip.y);ctx.rotate(-.012*lift);ctx.translate(-grip.x,-grip.y);
    ctx.drawImage(fan,0,0);ctx.restore();
    ctx.globalAlpha=1;raf=requestAnimationFrame(paint);
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
