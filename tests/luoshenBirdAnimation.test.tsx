import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {LuoshenBirdAnimation} from '../src/components/LuoshenBirdAnimation.tsx';
import {luoshenBirdDuration,luoshenBirdPose,luoshenBirdPatch} from '../src/game/luoshenBirdMotion.ts';

test('bird motion returns to the source pose and stays within its modest bounds',()=>{
 for(const index of [0,1]){
  for(const t of [-100,0,luoshenBirdDuration,luoshenBirdDuration+100])for(const value of Object.values(luoshenBirdPose(t,index)))assert.ok(Math.abs(value)<1e-10);
  for(let t=0;t<=luoshenBirdDuration;t+=20){const p=luoshenBirdPose(t,index);assert.ok(Math.abs(p.wing)<=6);assert.ok(Math.abs(p.lift)<=1.3);assert.ok(Math.abs(p.tilt)<=.8);}
 }
 assert.notEqual(luoshenBirdPose(2000,0).wing,luoshenBirdPose(2000,1).wing);
});
async function mount(reduced=false){
 const window=new Window(),images:MockImage[]=[],frames=new Map<number,FrameRequestCallback>();let next=0,done=0,errors=0;
 class MockImage{onload:(()=>void)|null=null;onerror:(()=>void)|null=null;src='';constructor(){images.push(this);}}
 const values={window,document:window.document,navigator:window.navigator,HTMLElement:window.HTMLElement,Image:MockImage,requestAnimationFrame:(cb:FrameRequestCallback)=>{frames.set(++next,cb);return next;},cancelAnimationFrame:(id:number)=>frames.delete(id),IS_REACT_ACT_ENVIRONMENT:true};
 for(const [key,value] of Object.entries(values))Object.defineProperty(globalThis,key,{value,configurable:true});
 window.matchMedia=(()=>({matches:reduced})) as typeof window.matchMedia;
 window.HTMLCanvasElement.prototype.getContext=(()=>({drawImage(){},getImageData(){return {data:new Uint8ClampedArray(luoshenBirdPatch.width*luoshenBirdPatch.height*4)};},createImageData(w:number,h:number){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}})) as typeof window.HTMLCanvasElement.prototype.getContext;
 const el=window.document.createElement('div');window.document.body.append(el);const root=createRoot(el as unknown as HTMLElement);
 await act(async()=>root.render(<LuoshenBirdAnimation viewport={{view:{x:0,y:0,scale:1},frame:{width:900,height:600}}} onDone={()=>done++} onError={()=>errors++}/>));
 return {images,frames,el,get done(){return done;},get errors(){return errors;},load:async()=>act(async()=>images.forEach(i=>i.onload?.())),tick:async(time:number)=>act(async()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb(time));}),cleanup:async()=>{await act(async()=>root.unmount());await window.happyDOM.abort();}};
}
test('source image must load; playback ends once and removes the visible composite',async()=>{
 const app=await mount();try{assert.equal(app.frames.size,0);assert.equal(app.images.length,1);await act(async()=>app.images[0].onload?.());assert.equal(app.frames.size,1);await app.tick(100);await app.tick(2100);assert.equal(app.el.querySelector<HTMLElement>('.luoshen-bird-world')!.style.opacity,'1');await app.tick(100+luoshenBirdDuration);assert.equal(app.done,1);assert.equal(app.errors,0);assert.equal(app.frames.size,0);assert.equal(app.el.querySelector<HTMLElement>('.luoshen-bird-world')!.style.opacity,'0');}finally{await app.cleanup();}
});
test('asset failure reports once; cancellation releases images and the animation frame',async()=>{
 const failed=await mount();try{await act(async()=>{failed.images[0].onerror?.();failed.images[0].onerror?.();});assert.equal(failed.errors,1);assert.equal(failed.done,0);assert.equal(failed.frames.size,0);}finally{await failed.cleanup();}
 const cancelled=await mount();await cancelled.load();assert.equal(cancelled.frames.size,1);await cancelled.cleanup();assert.equal(cancelled.frames.size,0);assert.ok(cancelled.images.every(image=>!image.onload&&!image.onerror));assert.equal(cancelled.done,0);
});
test('reduced motion keeps the original without loading interpretation assets',async()=>{
 const app=await mount(true);try{assert.equal(app.done,1);assert.equal(app.images.length,0);assert.equal(app.frames.size,0);}finally{await app.cleanup();}
});
