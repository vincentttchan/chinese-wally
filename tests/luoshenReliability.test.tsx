import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {ScrollScene} from '../src/components/ScrollScene.tsx';
async function scene(keyboardNavigation=true,focusing=false){
 const window=new Window();for(const [key,value] of Object.entries({window,document:window.document,navigator:window.navigator,HTMLElement:window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,key,{value,configurable:true});
 Object.defineProperty(globalThis,'ResizeObserver',{configurable:true,value:class{constructor(private callback:(entries:unknown[])=>void){}observe(){this.callback([{contentRect:{width:900,height:400}}]);}disconnect(){}}});
 const el=window.document.createElement('div');window.document.body.append(el);const root=createRoot(el as unknown as HTMLElement);let ready=false;
 await act(async()=>root.render(<ScrollScene keyboardNavigation={keyboardNavigation} requireTiles artworkSize={{width:3000,height:1000}} image="/main.jpg" tiles={[{id:'one',image:'/one.jpg',x:0,width:.5},{id:'two',image:'/two.jpg',x:.5,width:.5}]} actors={[]} active blocked={false} resetKey={1} initialRegion={{x:.7,y:.5}} focusing={focusing} motion={false} steam={null} hint={null} onInspect={()=>{}} onReady={v=>{ready=v;}}/>));
 const event=async(selector:string,type:string)=>{await act(async()=>el.querySelector(selector)!.dispatchEvent(new window.Event(type,{bubbles:true})));};
 return {window,el,event,get ready(){return ready;},cleanup:async()=>{await act(async()=>root.unmount());await window.happyDOM.abort();}};
}
test('failed high-resolution tile offers retry and all tiles must recover before ready',async()=>{
 const app=await scene();try{await app.event('.painting','load');await app.event('.painting-world img[src="/one.jpg"]','load');await app.event('.painting-world img[src="/two.jpg"]','error');assert.equal(app.ready,false);assert.match(app.el.textContent!,/畫卷暫時未能展開/);await app.event('.scene-status button','click');assert.ok(app.el.querySelector('img[src="/two.jpg?retry=1"]'));await app.event('.painting','load');await app.event('.painting-world img[src="/one.jpg?retry=1"]','load');await app.event('.painting-world img[src="/two.jpg?retry=1"]','load');assert.equal(app.ready,true);assert.equal(app.el.querySelector('.scene-status'),null);}finally{await app.cleanup();}
});
test('chapter opt-in arrow navigation pans in colour and leaves other chapters unchanged',async()=>{
 for(const enabled of [true,false]){const app=await scene(enabled);try{await app.event('.painting','load');const world=app.el.querySelector('.painting-world')! as unknown as HTMLElement,before=world.style.transform;await act(async()=>app.el.querySelector('.scroll-viewport')!.dispatchEvent(new app.window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})));assert.equal(world.style.transform!==before,enabled);}finally{await app.cleanup();}}
});

test('single touch moves the focus light; two touches zoom and cancellation clears the drag',async()=>{
 const app=await scene(true,true);try{
  await app.event('.painting','load');
  const viewport=app.el.querySelector('.scroll-viewport')! as unknown as HTMLElement;
  Object.assign(viewport,{setPointerCapture:()=>{},hasPointerCapture:()=>false,releasePointerCapture:()=>{}});
  const world=app.el.querySelector('.painting-world')! as unknown as HTMLElement;
  const light=app.el.querySelector('.observation-light')! as unknown as HTMLElement;
  const pointer=async(type:string,id:number,x:number,y:number)=>act(async()=>viewport.dispatchEvent(new app.window.PointerEvent(type,{pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,bubbles:true})));
  const original=world.style.transform;
  await pointer('pointerdown',1,300,200);await pointer('pointermove',1,350,220);
  assert.equal(world.style.transform,original);assert.notEqual(light.style.getPropertyValue('--focus-x'),'50%');
  await pointer('pointerdown',2,500,220);await pointer('pointermove',2,650,220);
  assert.notEqual(world.style.transform,original);
  await pointer('pointercancel',1,350,220);await pointer('pointercancel',2,650,220);
  assert.equal(viewport.classList.contains('is-dragging'),false);
  const stopped=world.style.transform;await pointer('pointermove',2,700,220);assert.equal(world.style.transform,stopped);
 }finally{await app.cleanup();}
});
test('colour exploration pans with one touch and cancellation releases it',async()=>{
 const app=await scene();try{
  await app.event('.painting','load');const viewport=app.el.querySelector('.scroll-viewport')! as unknown as HTMLElement;
  Object.assign(viewport,{setPointerCapture:()=>{},hasPointerCapture:()=>false,releasePointerCapture:()=>{}});
  const world=app.el.querySelector('.painting-world')! as unknown as HTMLElement,before=world.style.transform;
  const pointer=async(type:string,x:number)=>act(async()=>viewport.dispatchEvent(new app.window.PointerEvent(type,{pointerId:1,pointerType:'touch',button:0,clientX:x,clientY:200,bubbles:true})));
  await pointer('pointerdown',300);await pointer('pointermove',400);assert.notEqual(world.style.transform,before);
  await pointer('pointercancel',400);assert.equal(viewport.classList.contains('is-dragging'),false);
 }finally{await app.cleanup();}
});
