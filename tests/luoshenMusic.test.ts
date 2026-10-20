import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {createChapterMusic} from '../src/audio/chapterMusic.js';
function audioEnvironment(){
 const window=new Window({url:'http://localhost/'});Object.defineProperty(globalThis,'window',{value:window,configurable:true});Object.defineProperty(globalThis,'document',{value:window.document,configurable:true});
 const volumes:number[]=[],contexts:FakeContext[]=[];
 class FakeContext{currentTime=0;state='running';destination={};closed=false;constructor(){contexts.push(this);}createGain(){return{gain:{value:0,setTargetAtTime:(v:number)=>volumes.push(v),setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){}};}createBufferSource(){return{buffer:null,onended:null,connect(){},disconnect(){},start(){},stop(){}};}resume(){return Promise.resolve();}decodeAudioData(){return Promise.resolve({duration:12});}close(){this.closed=true;return Promise.resolve();}}
 Object.defineProperty(globalThis,'AudioContext',{value:FakeContext,configurable:true});return{window,volumes,contexts};
}
test('chapter music starts only on request, lowers for reading, stops and disposes',async t=>{
 const env=audioEnvironment();t.mock.method(globalThis,'fetch',async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)}) as Response);
 const states:string[]=[],music=createChapterMusic('/audio/luoshen.mp3',(s:string)=>states.push(s));
 try{assert.equal(env.contexts.length,0);await music.toggle();assert.equal(states.at(-1),'on');assert.equal(env.volumes.at(-1),.19);music.setQuiet(true);assert.equal(env.volumes.at(-1),.07);await music.toggle();assert.equal(states.at(-1),'off');assert.equal(env.volumes.at(-1),0);}finally{music.dispose();assert.equal(env.contexts[0].closed,true);await env.window.happyDOM.abort();}
});
test('a failed music request reports an error and can be retried',async t=>{
 const env=audioEnvironment();let available=false;t.mock.method(globalThis,'fetch',async()=>({ok:available,arrayBuffer:async()=>new ArrayBuffer(0)}) as Response);const states:string[]=[],music=createChapterMusic('/audio/luoshen.mp3',(s:string)=>states.push(s));
 try{await music.toggle();assert.equal(states.at(-1),'error');assert.equal(env.contexts[0].closed,true);available=true;await music.toggle();assert.equal(states.at(-1),'on');}finally{music.dispose();await env.window.happyDOM.abort();}
});
