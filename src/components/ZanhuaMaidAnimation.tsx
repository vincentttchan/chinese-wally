import {useEffect,useRef} from 'react';
import {zanhuaImage} from '../game/zanhuaPreview.ts';
import type {SceneViewport} from './ScrollScene.tsx';

// Animate the fan tip in the painting's coordinates. The hand, figure and
// lower shaft sit outside the moving area and stay on the original scroll.
const patch={x:3805,y:359,width:411,height:346};
const duration=2450;
const smooth=(value:number)=>{
 const t=Math.max(0,Math.min(1,value));
 return t*t*(3-2*t);
};

export function ZanhuaMaidAnimation({viewport,onDone}:{viewport:SceneViewport;onDone:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const done=useRef(onDone);
 done.current=onDone;

 useEffect(()=>{
  const context=canvas.current?.getContext('2d');
  if(!context||matchMedia('(prefers-reduced-motion: reduce)').matches){done.current();return;}
  const {x,y,width,height}=patch;
  const original=new Image();
  const edges=context.createLinearGradient(0,0,width,0);
  edges.addColorStop(0,'transparent');
  edges.addColorStop(.12,'black');
  edges.addColorStop(.88,'black');
  edges.addColorStop(1,'transparent');
  const sway=Array.from({length:height},(_,row)=>
   smooth(row/64)*smooth((height-row)/152));
  let cancelled=false,frame=0,started:number|undefined;
  function paint(time:number){
   if(cancelled||!context)return;
   started??=time;
   const progress=(time-started)/duration;
   if(progress>=1){done.current();return;}
   const amount=12*Math.sin(2*Math.PI*progress)*Math.sin(Math.PI*progress);
   context.clearRect(0,0,width,height);
   for(let row=0;row<height;row++){
    const offset=amount*sway[row];
    context.drawImage(original,x-offset,y+row,width,1,0,row,width,1);
   }
   context.globalCompositeOperation='destination-in';
   context.fillStyle=edges;
   context.fillRect(0,0,width,height);
   context.globalCompositeOperation='source-over';
   frame=requestAnimationFrame(paint);
  }
  original.src=zanhuaImage;
  void original.decode().then(()=>{
   if(!cancelled)frame=requestAnimationFrame(paint);
  },()=>{if(!cancelled)done.current();});
  return()=>{cancelled=true;cancelAnimationFrame(frame);};
 },[]);

 const {view}=viewport;
 return <div className="zanhua-dog-animation" role="status" aria-label="執扇侍女與長柄扇的遊戲演繹">
  <canvas ref={canvas} className="zanhua-maid-in-painting" width={patch.width} height={patch.height}
   style={{transform:`translate(${view.x+patch.x*view.scale}px,${view.y+patch.y*view.scale}px) scale(${view.scale})`}} aria-hidden="true"/>
 </div>;
}
