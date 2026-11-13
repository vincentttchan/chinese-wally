import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {installGuideInputGuard} from '../src/game/zanhuaGuide.ts';
import type {GuideStage} from '../src/game/zanhuaGuide.ts';
function fixture(stage:GuideStage){
 const win=new Window(),doc=win.document;
 doc.body.innerHTML='<main><div class="scroll-viewport" tabindex="0"><button data-guide-target>target</button></div><button class="lantern-journal-button">book</button><button class="lantern-mode">mode</button><aside class="zanhua-play-guide"><button>next</button></aside></main>';
 const root=doc.querySelector('main')!;
 const remove=installGuideInputGuard(root,()=>stage);
 let received=0;for(const name of ['wheel','pointerdown','pointermove','pointerup','keydown','click'])root.addEventListener(name,()=>received++);
 function send(type:string,selector='.scroll-viewport',options:Record<string,unknown>={}){const EventClass=type==='keydown'?win.KeyboardEvent:type.startsWith('pointer')?win.PointerEvent:type==='wheel'?win.WheelEvent:win.MouseEvent;const event=new EventClass(type,{bubbles:true,cancelable:true,...options});const before=received;doc.querySelector(selector)!.dispatchEvent(event);return {forwarded:received-before,prevented:event.defaultPrevented};}
 return {send,remove};
}
test('drag lesson allows real pointer dragging but blocks zoom, mode shortcuts and unrelated tools',()=>{
 const f=fixture('drag');
 assert.equal(f.send('pointerdown','.scroll-viewport',{pointerId:1,pointerType:'mouse',button:0}).forwarded,1);
 assert.equal(f.send('pointermove','.scroll-viewport',{pointerId:1,pointerType:'mouse',buttons:1}).forwarded,1);
 for(const [type,selector,options] of [['wheel','.scroll-viewport',{}],['keydown','.scroll-viewport',{key:'+'}],['keydown','.scroll-viewport',{key:'f'}],['click','.lantern-mode',{}]] as const)assert.equal(f.send(type,selector,options).forwarded,0);
 assert.equal(f.send('keydown','.scroll-viewport',{key:'ArrowRight'}).forwarded,1);
});
test('focus lesson allows moving the light but prevents mouse dragging, wheel zoom and mode toggle',()=>{
 const f=fixture('focus');
 assert.equal(f.send('pointermove','.scroll-viewport',{pointerType:'mouse',buttons:0}).forwarded,1);
 assert.equal(f.send('pointerdown','.scroll-viewport',{pointerType:'mouse',button:0}).forwarded,0);
 assert.equal(f.send('wheel').forwarded,0);
 assert.equal(f.send('keydown','.scroll-viewport',{key:'f'}).forwarded,0);
 assert.equal(f.send('keydown','.scroll-viewport',{key:'ArrowDown'}).forwarded,1);
});
test('journal lesson exposes only the notebook action and blocks the painting',()=>{
 const f=fixture('journal');
 assert.equal(f.send('click','.lantern-journal-button').forwarded,1);
 assert.equal(f.send('click','.lantern-mode').forwarded,0);
 assert.equal(f.send('pointerdown').forwarded,0);
 assert.equal(f.send('keydown','.scroll-viewport',{key:'ArrowRight'}).forwarded,0);
});
test('zoom lesson allows zoom keys and wheel but blocks panning and object clicks',()=>{
 const f=fixture('zoom');
 assert.equal(f.send('wheel').forwarded,1);
 assert.equal(f.send('keydown','.scroll-viewport',{key:'+'}).forwarded,1);
 assert.equal(f.send('keydown','.scroll-viewport',{key:'ArrowRight'}).forwarded,0);
 assert.equal(f.send('pointerdown','.scroll-viewport',{pointerType:'mouse',button:0}).forwarded,0);
 assert.equal(f.send('click','[data-guide-target]').forwarded,0);
});
test('reading a replay page only allows its continue button',()=>{
 const f=fixture('review');
 assert.equal(f.send('click','.zanhua-play-guide button').forwarded,1);
 assert.equal(f.send('click','[data-guide-target]').forwarded,0);
 assert.equal(f.send('wheel').forwarded,0);
});
test('normal exploration and removed guards leave existing inputs unchanged',()=>{
 for(const stage of [null,'drag']){const f=fixture(stage);if(stage)f.remove();assert.equal(f.send('wheel').forwarded,1);assert.equal(f.send('click','.lantern-mode').forwarded,1);}
});
test('single-action dragging cannot turn into an accidental two-finger pinch',()=>{
 const f=fixture('drag');
 assert.equal(f.send('pointerdown','.scroll-viewport',{pointerId:1,pointerType:'touch'}).forwarded,1);
 assert.equal(f.send('pointerdown','.scroll-viewport',{pointerId:2,pointerType:'touch'}).forwarded,0);
 assert.equal(f.send('pointermove','.scroll-viewport',{pointerId:2,pointerType:'touch'}).forwarded,0);
});

test('finding keeps the target and canvas available while tools and zoom remain unavailable',()=>{
 const f=fixture('find');
 assert.equal(f.send('click','[data-guide-target]').forwarded,1);
 assert.equal(f.send('keydown','[data-guide-target]',{key:'Enter'}).forwarded,1);
 assert.equal(f.send('click','.lantern-journal-button').forwarded,0);
 assert.equal(f.send('wheel').forwarded,0);
});
