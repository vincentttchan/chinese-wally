import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {mountPaintingAlbum} from '../public/atelier/painting-album-stickers-v5.js';
const key='chinese-wally:atelier:mementos:v1';
function fixture(findings={dog:'dog-right',blossom:'blossom-P6'},saved){
 const win=new Window({url:'http://127.0.0.1:4193/atelier/index.html'}),doc=win.document;
 win.matchMedia=()=>({matches:true});
 win.HTMLCanvasElement.prototype.getContext=()=>({measureText:()=>({actualBoundingBoxLeft:0,actualBoundingBoxRight:60,actualBoundingBoxAscent:75,actualBoundingBoxDescent:0})});
 win.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 win.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new win.Event('close'));};
 doc.defaultView.localStorage.setItem('chinese-wally:zanhua-findings:v1',JSON.stringify(findings));
 if(saved)doc.defaultView.localStorage.setItem(key,JSON.stringify({version:1,selections:{zanhua:saved}}));
 const chapter={id:'zanhua',title:'簪花仕女圖'};
 const refresh=mountPaintingAlbum(doc.body,()=>[chapter],()=>{throw Error('Booklet must not navigate chapters');});
 const button=text=>[...doc.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
 const selected=()=>JSON.parse(win.localStorage.getItem(key)||'null')?.selections?.zanhua;
 return {win,doc,chapter,refresh,button,selected,dialog:doc.querySelector('dialog')};
}
test('first click only previews; a second click on the same option saves and resolves the invitation',async()=>{
 const f=fixture(),closed=f.refresh.offer(f.chapter);
 assert.equal(f.doc.querySelector('[aria-pressed="true"]'),null);
 f.doc.querySelector('[data-item="dog"]').click();
 assert.equal(f.selected(),undefined);
 assert.equal(f.doc.querySelector('.memento-preview h4')?.textContent,'小犬');
 f.doc.querySelector('[data-item="dog"]').click();
 assert.equal(f.selected(),'dog');assert.equal(await closed,true);assert.equal(f.dialog.open,false);
});
test('switching stickers changes preview without confirming the previous or next sticker',()=>{
 const f=fixture();f.refresh.offer(f.chapter);
 f.doc.querySelector('[data-item="dog"]').click();
 f.doc.querySelector('[data-item="blossom"]').click();
 assert.equal(f.selected(),undefined);
 assert.equal(f.doc.querySelector('.memento-preview h4').textContent,'簪花');
});
test('the large preview is the confirmation target and has no visible instruction text',async()=>{
 const f=fixture(),closed=f.refresh.offer(f.chapter);
 f.doc.querySelector('[data-item="dog"]').click();
 const art=f.doc.querySelector('button.memento-preview-sticker');
 assert.ok(art);assert.equal(art.textContent,'');
 assert.equal(f.doc.querySelector('.memento-confirm'),null);
 art.click();await closed;assert.equal(f.selected(),'dog');
});
test('closing an unchosen invitation continues without inventing a saved sticker',async()=>{
 const f=fixture(),closed=f.refresh.offer(f.chapter);
 assert.ok(!f.dialog.textContent.includes('先留待貼'));
 f.dialog.close();assert.equal(await closed,true);assert.equal(f.selected(),undefined);
});
test('changing an existing sticker still needs a fresh preview click; closing preserves the original',()=>{
 const f=fixture(undefined,'dog');f.doc.querySelector('.painting-album-toggle').click();f.button('換一張').click();
 assert.equal(f.doc.querySelector('[aria-pressed="true"]'),null);
 f.doc.querySelector('[data-item="blossom"]').click();
 assert.equal(f.selected(),'dog');f.dialog.close();assert.equal(f.selected(),'dog');
});
test('booklet stories and empty pages have no chapter navigation controls',()=>{
 const f=fixture(undefined,'dog');f.doc.querySelector('.painting-album-toggle').click();f.doc.querySelector('.memento-sticker').click();
 assert.ok(!f.dialog.textContent.includes('再入此卷'));
 const empty=fixture({});empty.refresh.offer(empty.chapter);
 assert.ok(!empty.dialog.textContent.includes('回畫中'));
 assert.ok(!empty.dialog.textContent.includes('先留待貼'));
});
