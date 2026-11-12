import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {createChapterPreparation,chapterCoverReady} from '../public/atelier/chapter-preparation-v1.js';
const chapter={id:'lantern-festival',page:'lantern-dialogue-v2.html'};
test('repeated preparation shares requests and fetches only entry, painting and typeface',async()=>{
 const win=new Window(),calls=[];
 win.fetch=async(url,options)=>{calls.push([url,options]);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(0)};};
 const prepare=createChapterPreparation(win.document);
 await Promise.all([prepare(chapter),prepare(chapter)]);
 assert.equal(calls.length,3);
 assert.ok(calls.some(([url])=>url.endsWith('/art/lantern-festival/full-scroll.jpg')));
 assert.ok(calls.every(([url])=>!url.endsWith('.mp3')&&!url.includes('/animations/')));
 assert.ok(calls.every(([,options])=>options.cache==='force-cache'));
});
test('failed preparation can be retried instead of poisoning the cache',async()=>{
 const win=new Window();let calls=0;
 win.fetch=async()=>{calls++;return {ok:calls>3,arrayBuffer:async()=>new ArrayBuffer(0)};};
 const prepare=createChapterPreparation(win.document);
 const first=await prepare(chapter);assert.ok(first.every(x=>x.status==='rejected'));
 const second=await prepare(chapter);assert.ok(second.every(x=>x.status==='fulfilled'));assert.equal(calls,6);
});
test('a usable cover does not wait for unrelated iframe resources; outgoing and broken images are rejected',()=>{
 const win=new Window({url:'http://localhost/atelier/lantern-dialogue-v2.html'}),doc=win.document;
 doc.body.innerHTML='<h1>宮中鬧元宵</h1><div class="painting-world"><img class="painting"></div>';
 Object.defineProperty(doc,'readyState',{value:'interactive'});
 const art=doc.querySelector('img');
 Object.defineProperty(art,'complete',{value:true,configurable:true});Object.defineProperty(art,'naturalWidth',{value:18000,configurable:true});
 assert.equal(chapterCoverReady(doc,doc.URL,'宮中鬧元宵'),true);
 assert.equal(chapterCoverReady(doc,'http://localhost/?atelier=1#zanhua','簪花仕女圖'),false);
 assert.equal(chapterCoverReady(doc,doc.URL,'洛水之間'),false);
 Object.defineProperty(art,'naturalWidth',{value:0});assert.equal(chapterCoverReady(doc,doc.URL,'宮中鬧元宵'),false);
});
