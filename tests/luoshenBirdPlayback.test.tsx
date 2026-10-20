import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {useLuoshenBirdPlayback} from '../src/hooks/useLuoshenBirdPlayback.ts';
test('bird observation waits for camera and collection, supports original/replay, and clears on leaving',async()=>{
 const w=new Window();for(const [key,value] of Object.entries({window:w,document:w.document,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,key,{value,configurable:true});
 let playback:ReturnType<typeof useLuoshenBirdPlayback>;
 function Harness({context,busy,pending}:{context:string|null;busy:boolean;pending:number}){playback=useLuoshenBirdPlayback(context,busy,pending);return null;}
 const el=w.document.createElement('div'),root=createRoot(el as unknown as HTMLElement);
 const render=async(context:string|null,busy=false,pending=0)=>act(async()=>root.render(<Harness context={context} busy={busy} pending={pending}/>));
 try{
  await render('observation',true,1);await act(async()=>playback.play());assert.equal(playback.mode,'preparing');
  await render('observation',false,1);assert.equal(playback.mode,'preparing');await render('observation');assert.equal(playback.mode,'playing');
  await act(async()=>playback.original());assert.equal(playback.mode,'still');
  await act(async()=>playback.play());assert.equal(playback.mode,'playing');await act(async()=>playback.finish());assert.equal(playback.mode,'still');
  await act(async()=>playback.play());await act(async()=>playback.fail());assert.equal(playback.mode,'failed');
  await act(async()=>playback.play());await render(null);assert.equal(playback.mode,'idle');
  await render('interpretation');assert.equal(playback.mode,'idle');
 }finally{await act(async()=>root.unmount());await w.happyDOM.abort();}
});
