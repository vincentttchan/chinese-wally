import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {LuoshenRibbonAnimation} from '../src/components/LuoshenRibbonAnimation.tsx';
import {luoshenFigureDuration as luoshenRibbonDuration} from '../src/game/luoshenFigureMotion.ts';

async function mount(reduced=false){
 const window=new Window(),images:MockImage[]=[],frames=new Map<number,FrameRequestCallback>();let next=0,done=0,errors=0;
 class MockImage{onload:(()=>void)|null=null;onerror:(()=>void)|null=null;src='';constructor(){images.push(this);}}
 const values={window,document:window.document,navigator:window.navigator,HTMLElement:window.HTMLElement,Image:MockImage,requestAnimationFrame:(cb:FrameRequestCallback)=>{frames.set(++next,cb);return next;},cancelAnimationFrame:(id:number)=>frames.delete(id),IS_REACT_ACT_ENVIRONMENT:true};
 for(const [key,value] of Object.entries(values))Object.defineProperty(globalThis,key,{value,configurable:true});
 window.matchMedia=(()=>({matches:reduced})) as typeof window.matchMedia;
 window.HTMLCanvasElement.prototype.getContext=(()=>({drawImage(){},clearRect(){},save(){},restore(){},translate(){},rotate(){},scale(){},transform(){},getImageData(_x:number,_y:number,w:number,h:number){return {data:new Uint8ClampedArray(w*h*4)};},createImageData(w:number,h:number){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}})) as typeof window.HTMLCanvasElement.prototype.getContext;
 const el=window.document.createElement('div');window.document.body.append(el);const root=createRoot(el as unknown as HTMLElement);
 await act(async()=>root.render(<LuoshenRibbonAnimation viewport={{view:{x:0,y:0,scale:1},frame:{width:900,height:600}}} onDone={()=>done++} onError={()=>errors++}/>));
 return {images,frames,el,get done(){return done;},get errors(){return errors;},load:async()=>act(async()=>images.forEach(i=>i.onload?.())),tick:async(time:number)=>act(async()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb(time));}),cleanup:async()=>{await act(async()=>root.unmount());await window.happyDOM.abort();}};
}
test('source image must load; playback ends once and removes the visible composite',async()=>{
 const app=await mount();try{assert.equal(app.frames.size,0);assert.equal(app.images.length,3);await app.load();assert.equal(app.frames.size,1);await app.tick(100);await app.tick(2100);assert.equal(app.el.querySelector<HTMLElement>('.luoshen-ribbon-world')!.style.opacity,'1');await app.tick(100+luoshenRibbonDuration);assert.equal(app.done,1);assert.equal(app.errors,0);assert.equal(app.frames.size,0);assert.equal(app.el.querySelector<HTMLElement>('.luoshen-ribbon-world')!.style.opacity,'0');}finally{await app.cleanup();}
});
test('asset failure reports once; cancellation releases images and the animation frame',async()=>{
 const failed=await mount();try{await act(async()=>{failed.images[0].onerror?.();failed.images[0].onerror?.();});assert.equal(failed.errors,1);assert.equal(failed.done,0);assert.equal(failed.frames.size,0);}finally{await failed.cleanup();}
 const cancelled=await mount();await cancelled.load();assert.equal(cancelled.frames.size,1);await cancelled.cleanup();assert.equal(cancelled.frames.size,0);assert.ok(cancelled.images.every(image=>!image.onload&&!image.onerror));assert.equal(cancelled.done,0);
});
test('reduced motion keeps the original without loading interpretation assets',async()=>{
 const app=await mount(true);try{assert.equal(app.done,1);assert.equal(app.images.length,0);assert.equal(app.frames.size,0);}finally{await app.cleanup();}
});
