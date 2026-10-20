import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {useLuoshenCollectionFeedback} from '../src/hooks/useLuoshenCollectionFeedback.ts';
import {luoshenNoticePlacement} from '../src/game/luoshenLayout.ts';

async function setup(reduced=false){
 const window=new Window();
 for(const [key,value] of Object.entries({window,document:window.document,navigator:window.navigator,HTMLElement:window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true,matchMedia:()=>({matches:reduced})}))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
 const el=window.document.createElement('div');window.document.body.append(el);const root=createRoot(el as unknown as HTMLElement);
 const book={current:{getBoundingClientRect:()=>({left:16,top:780,width:134,height:44})} as HTMLButtonElement};
 const notices:string[]=[];let feedback:ReturnType<typeof useLuoshenCollectionFeedback>;
 function Harness(){feedback=useLuoshenCollectionFeedback(0,{view:{x:0,y:0,scale:1},frame:{width:390,height:844}},book,text=>notices.push(text));return null;}
 await act(async()=>root.render(<Harness/>));
 return {get value(){return feedback!;},notices,window,cleanup:async()=>{await act(async()=>root.unmount());await window.happyDOM.abort();}};
}
test('rapid discoveries each fly, arrive and acknowledge in discovery order',async t=>{
 const app=await setup();t.mock.timers.enable({apis:['setTimeout']});
 try{
  act(()=>{app.value.enqueue('bird','鳥形',.01,.4);app.value.enqueue('ribbon','衣帶',.012,.45);});
  assert.equal(app.value.flight?.category,'bird');assert.equal(app.value.count,0);assert.equal(app.value.pendingCount,2);
  act(()=>t.mock.timers.tick(1500));
  assert.equal(app.value.count,1);assert.equal(app.value.flight?.category,'ribbon');assert.deepEqual(app.notices,['已收藏：鳥形']);
  act(()=>t.mock.timers.tick(1500));
  assert.equal(app.value.count,2);assert.equal(app.value.flight,null);assert.equal(app.value.pendingCount,0);assert.deepEqual(app.notices,['已收藏：鳥形','已收藏：鳥形、衣帶']);
 }finally{t.mock.timers.reset();await app.cleanup();}
});
test('opening the book settles all pending receipts and old timers cannot count twice',async t=>{
 const app=await setup();t.mock.timers.enable({apis:['setTimeout']});
 try{
  act(()=>{app.value.enqueue('bird','鳥形',.01,.4);app.value.enqueue('ribbon','衣帶',.012,.45);});
  act(()=>app.value.settle());
  assert.equal(app.value.count,2);assert.equal(app.value.flight,null);assert.deepEqual(app.notices,['已收藏：鳥形、衣帶']);
  act(()=>t.mock.timers.tick(10000));assert.equal(app.value.count,2);assert.equal(app.notices.length,1);
 }finally{t.mock.timers.reset();await app.cleanup();}
});
test('rotation settles pending discoveries instead of flying to a stale book position',async t=>{
 const app=await setup();t.mock.timers.enable({apis:['setTimeout']});
 try{
  act(()=>app.value.enqueue('canopy','華蓋',.01,.4));
  act(()=>app.window.dispatchEvent(new app.window.Event('resize')));
  assert.equal(app.value.count,1);assert.equal(app.value.flight,null);
  act(()=>t.mock.timers.tick(5000));assert.equal(app.value.count,1);
 }finally{t.mock.timers.reset();await app.cleanup();}
});
test('reduced motion acknowledges every queued item without flight',async t=>{
 const app=await setup(true);t.mock.timers.enable({apis:['setTimeout']});
 try{
  act(()=>{app.value.enqueue('bird','鳥形',.01,.4);app.value.enqueue('ribbon','衣帶',.012,.45);});
  assert.equal(app.value.flight,null);
  act(()=>t.mock.timers.tick(0));act(()=>t.mock.timers.tick(0));
  assert.equal(app.value.count,2);assert.deepEqual(app.notices,['已收藏：鳥形','已收藏：鳥形、衣帶']);
 }finally{t.mock.timers.reset();await app.cleanup();}
});
test('portrait and landscape notices avoid the reading panel and its next button',()=>{
 for(const [frame,note] of [[{width:390,height:844},{left:86,top:463,width:288,height:291}],[{width:320,height:568},{left:16,top:78,width:288,height:160}],[{width:844,height:390},{left:532,top:78,width:288,height:224}],[{width:667,height:375},{left:363,top:78,width:288,height:209}]] as const){
  const p=luoshenNoticePlacement(frame,note);const y=p.top??frame.height-p.bottom!-52;
  assert.ok(p.left+p.width<=note.left||p.left>=note.left+note.width||y+52<=note.top||y>=note.top+note.height);
  assert.ok(p.left>=0&&p.left+p.width<=frame.width);
 }
});
