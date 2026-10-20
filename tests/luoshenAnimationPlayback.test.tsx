import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {useLuoshenAnimationPlayback} from '../src/hooks/useLuoshenAnimationPlayback.ts';
async function setup(){
 const w=new Window();for(const [key,value] of Object.entries({window:w,document:w.document,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,key,{value,configurable:true});
 let player:ReturnType<typeof useLuoshenAnimationPlayback>;
 function Harness({scope,busy,pending}:{scope:string|null;busy:boolean;pending:number}){player=useLuoshenAnimationPlayback(scope,busy,pending);return null;}
 const el=w.document.createElement('div'),root=createRoot(el as unknown as HTMLElement);
 const render=async(scope:string|null,busy=false,pending=0)=>act(async()=>root.render(<Harness scope={scope} busy={busy} pending={pending}/>));
 await render('observe:1:0');
 return {get player(){return player;},render,cleanup:async()=>{await act(async()=>root.unmount());await w.happyDOM.abort();}};
}
test('one owner replaces the other and stale completion cannot stop the new animation',async()=>{
 const app=await setup();try{
  await act(async()=>app.player.play('bird'));assert.equal(app.player.kind,'bird');assert.equal(app.player.mode,'playing');const birdTicket=app.player.ticket;
  await act(async()=>app.player.offer('ribbon'));assert.equal(app.player.kind,'ribbon');assert.equal(app.player.mode,'offered');
  await act(async()=>app.player.play('ribbon'));const ribbonTicket=app.player.ticket;assert.equal(app.player.mode,'playing');
  await act(async()=>app.player.finish(birdTicket));assert.equal(app.player.kind,'ribbon');assert.equal(app.player.mode,'playing');
  await act(async()=>app.player.finish(ribbonTicket));assert.equal(app.player.mode,'still');
  await act(async()=>app.player.play('dragon'));assert.equal(app.player.kind,'dragon');const dragonTicket=app.player.ticket;
  await act(async()=>app.player.finish(ribbonTicket));assert.equal(app.player.mode,'playing');assert.equal(app.player.kind,'dragon');
  await act(async()=>app.player.finish(dragonTicket));assert.equal(app.player.mode,'still');
  await act(async()=>app.player.showOriginal('bird'));assert.equal(app.player.kind,'bird');assert.equal(app.player.mode,'still');
 }finally{await app.cleanup();}
});
test('offering is optional, playback waits for collection and camera, and leaving clears ownership',async()=>{
 const app=await setup();try{
  await app.render('search:1',true,1);await act(async()=>app.player.offer('ribbon'));assert.equal(app.player.mode,'offered');
  await app.render('search:1');assert.equal(app.player.mode,'offered');
  await app.render('search:1',true,1);await act(async()=>app.player.play('ribbon'));assert.equal(app.player.mode,'preparing');
  await app.render('search:1',false,1);assert.equal(app.player.mode,'preparing');await app.render('search:1');assert.equal(app.player.mode,'playing');
  await act(async()=>app.player.original());assert.equal(app.player.mode,'still');await act(async()=>app.player.play('ribbon'));assert.equal(app.player.mode,'playing');
  const ticket=app.player.ticket;await app.render('observe:1:1');assert.equal(app.player.kind,null);assert.equal(app.player.mode,'idle');
  await act(async()=>app.player.fail(ticket));assert.equal(app.player.mode,'idle');
 }finally{await app.cleanup();}
});
