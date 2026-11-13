import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {leaveChapterFullscreen} from '../public/atelier/chapter-return-v1.js';
function fixture(){const win=new Window(),doc=win.document,frame=doc.createElement('iframe');Object.defineProperty(frame,'contentDocument',{value:new Window().document});return {doc,frame};}

test('return waits for fullscreen to leave before the chapter can be hidden',async()=>{
 const {doc,frame}=fixture();let active:any=frame,resolve!:()=>void;
 Object.defineProperty(doc,'fullscreenElement',{get:()=>active});
 (doc as any).exitFullscreen=()=>new Promise<void>(done=>{resolve=()=>{active=null;done();};});
 let finished=false;const returning=leaveChapterFullscreen(frame).then(()=>{finished=true;});
 await Promise.resolve();assert.equal(finished,false);assert.equal(typeof resolve,'function');
 resolve();await returning;assert.equal(Boolean(active),false);assert.equal(finished,true);
});
test('a child chapter fullscreen is released even when only the child reports it',async()=>{
 const {frame}=fixture();const child=frame.contentDocument!;let active:any=child.documentElement;
 Object.defineProperty(child,'fullscreenElement',{get:()=>active});
 (child as any).exitFullscreen=async()=>{active=null;};
 await leaveChapterFullscreen(frame);assert.equal(Boolean(active),false);
});
test('a failed exit leaves a usable chapter instead of proceeding to a covered room',async()=>{
 const {doc,frame}=fixture();Object.defineProperty(doc,'fullscreenElement',{get:()=>frame});
 (doc as any).exitFullscreen=async()=>{throw Error('exit denied');};
 await assert.rejects(()=>leaveChapterFullscreen(frame),/exit denied/);assert.equal(frame.hasAttribute('inert'),false);
});
test('ordinary chapter returns do not require the fullscreen API',async()=>{
 const {frame}=fixture();await leaveChapterFullscreen(frame);assert.equal(frame.hasAttribute('inert'),false);
});
