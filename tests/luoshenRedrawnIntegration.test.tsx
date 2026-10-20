import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
const css=registerHooks({load(url,context,next){if(url.endsWith('.css'))return {format:'module',source:'',shortCircuit:true};return next(url,context);}});
const {LuoshenGame}=await import('../src/components/LuoshenGame.tsx');
const {LuoshenRibbonPreview}=await import('../src/components/LuoshenRibbonPreview.tsx');
const {LuoshenDragonPreview}=await import('../src/components/LuoshenDragonPreview.tsx');
const {luoshenFigureLayout}=await import('../src/game/luoshenFigureLayout.ts');
css.deregister();
async function setup({preview=false,dragon=false,trialDragon=false,frame={width:1000,height:800}}={}){
 const w=new Window(),frames=new Map<number,FrameRequestCallback>(),images:MockImage[]=[];let id=0,reduced=true;
 class MockImage{onload:(()=>void)|null=null;onerror:(()=>void)|null=null;src='';constructor(){images.push(this);}}
 const matchMedia=()=>({matches:reduced,addEventListener(){},removeEventListener(){}});
 for(const [key,value] of Object.entries({window:w,document:w.document,navigator:w.navigator,localStorage:w.localStorage,HTMLElement:w.HTMLElement,Image:MockImage,matchMedia,requestAnimationFrame:(cb:FrameRequestCallback)=>{frames.set(++id,cb);return id;},cancelAnimationFrame:(i:number)=>frames.delete(i),ResizeObserver:class{constructor(private cb:(e:unknown[])=>void){}observe(){this.cb([{contentRect:frame}]);}disconnect(){}},IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,key,{value,configurable:true});
 w.matchMedia=matchMedia as typeof w.matchMedia;
 const ctx={createImageData(w:number,h:number){return {data:new Uint8ClampedArray(w*h*4)};},getImageData(_x:number,_y:number,w:number,h:number){const data=new Uint8ClampedArray(w*h*4);data.fill(255);return {data};},putImageData(){},drawImage(){},clearRect(){},save(){},restore(){},translate(){},rotate(){},transform(){},scale(){}};
 w.HTMLCanvasElement.prototype.getContext=(()=>ctx) as unknown as typeof w.HTMLCanvasElement.prototype.getContext;
 const el=w.document.createElement('div');w.document.body.append(el);const root=createRoot(el as unknown as HTMLElement);
 await act(async()=>root.render(dragon?<LuoshenDragonPreview/>:preview?<LuoshenRibbonPreview/>:<LuoshenGame birdTrial={!trialDragon} dragonTrial={trialDragon}/>));
 const click=async(text:string)=>{const b=[...el.querySelectorAll('button')].find(b=>b.textContent?.trim().replace(/\s*→$/,'')===text);assert.ok(b,`button ${text}`);assert.equal(b.disabled,false,`${text} enabled`);await act(async()=>b.click());if(['返回原畫','再看龍形','回到圖文對讀'].includes(text))await act(async()=>{await new Promise(r=>setTimeout(r,240));});};
 const actor=async(id:string)=>{const b=el.querySelector<HTMLButtonElement>(`[data-actor="${id}"]`);assert.ok(b,`actor ${id}`);assert.equal(b.disabled,false,`${id} enabled`);await act(async()=>b.click());};
 const wait=(ms=5)=>act(async()=>{await new Promise(r=>setTimeout(r,ms));});
 const load=()=>act(async()=>{for(const image of images)image.onload?.();});
 const tick=(time:number)=>act(async()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb(time));});
 await act(async()=>{for(const image of el.querySelectorAll('.painting,.painting-world img'))image.dispatchEvent(new w.Event('load'));});
 if(!preview&&!dragon){if(!trialDragon)await click('展開這一卷');await click('繼續這一卷');await wait();}reduced=false;
 const book=el.querySelector('.lantern-journal-button');if(book)book.getBoundingClientRect=(()=>null) as unknown as typeof book.getBoundingClientRect;
 return {el,w,images,frames,click,actor,wait,load,tick,setReduced:(value:boolean)=>{reduced=value;},close:async()=>{await act(async()=>root.unmount());await w.happyDOM.abort();}};
}
test('found goddess -> redrawn bird -> original/replay -> ribbon stays exclusive -> dragon',async()=>{
 const app=await setup();try{
  await app.actor('L1');await app.click('近看原畫');await app.tick(performance.now()+1000);await app.actor('bird');await app.tick(performance.now()+1000);await app.wait();
  assert.ok(app.el.querySelector('.luoshen-redrawn-stage'),'bird starts after collection receipt');
  assert.equal(app.el.querySelector('.luoshen-ribbon-animation'),null);
  assert.ok(app.el.querySelector('.lantern-hud')?.hasAttribute('inert'));
  await app.load();await app.tick(100);await app.tick(6400);
  assert.ok(app.el.querySelector('.luoshen-redrawn-stage'),'resting drawing remains for comparison');
  assert.equal(app.el.querySelector('.lantern-hud')?.hasAttribute('inert'),false,'playback completion unlocks tools');
  assert.equal(app.el.querySelector<HTMLButtonElement>('[data-actor="L1"]')?.disabled,false);
  const world=app.el.querySelector<HTMLElement>('.painting-world')!,drawing=app.el.querySelector<HTMLElement>('.luoshen-bird-world')!,before=world.style.transform,beforeDrawing=drawing.style.transform;
  await act(async()=>app.el.querySelector('.scroll-viewport')!.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})));
  assert.notEqual(world.style.transform,before,'resting overlay allows moving the painting');assert.notEqual(drawing.style.transform,beforeDrawing,'drawing follows the updated painting viewport');
  const beforeZoom=world.style.transform,wheel=new app.w.WheelEvent('wheel',{deltaY:-100,bubbles:true,cancelable:true});Object.defineProperties(wheel,{clientX:{value:500},clientY:{value:400}});await act(async()=>app.el.querySelector('.scroll-viewport')!.dispatchEvent(wheel));assert.notEqual(world.style.transform,beforeZoom,'resting overlay allows zooming');assert.doesNotMatch(world.style.transform,/NaN/);
  await app.click('返回原畫');assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);
  await app.click('再看一次');await app.tick(performance.now()+1000);await app.load();assert.ok(app.el.querySelector('.luoshen-redrawn-stage'));
  await act(async()=>app.w.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Escape'})));await app.wait(240);
  assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);
  await app.actor('ribbon-0');await app.wait();await app.click('看洛神身姿');await app.tick(performance.now()+1000);
  assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);assert.ok(app.el.querySelector('.luoshen-ribbon-animation'));
  await app.load();await app.tick(100);await app.tick(5600);assert.equal(app.el.querySelector('.luoshen-ribbon-animation'),null,'ribbon naturally returns to original');
  await app.click('再看一次');await app.tick(performance.now()+1000);await app.load();assert.ok(app.el.querySelector('.luoshen-ribbon-animation'));assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);
  await app.click('返回原畫');await app.click('繼續探索');await app.tick(performance.now()+1000);
  assert.equal(app.el.querySelector('.luoshen-ribbon-animation'),null);
  await app.click('再看一次');await app.tick(performance.now()+1000);assert.ok(app.el.querySelector('.luoshen-redrawn-stage'));assert.equal(app.el.querySelector('.luoshen-ribbon-animation'),null);
  await app.click('返回原畫');await app.click('再看龍形');
  assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);assert.match(app.el.textContent!,/再看飛鳥附近的龍形/);
  await app.tick(performance.now()+1000);await app.actor('dragon-first');await app.tick(performance.now()+1000);await app.wait();
  assert.match(app.el.textContent!,/看龍形演繹/);assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null,'offers without autoplay');
  await app.click('看龍形演繹');await app.tick(performance.now()+1000);assert.ok(app.el.querySelector('.luoshen-dragon-animation'));
  assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null,'dragon owns playback');
  assert.equal(app.el.querySelector('.luoshen-ribbon-animation:not(.luoshen-dragon-animation)'),null);
  await app.load();await app.tick(100);await app.tick(5600);assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null,'dragon returns to original');
  await app.click('再看一次');await app.tick(performance.now()+1000);await app.load();assert.ok(app.el.querySelector('.luoshen-dragon-animation'));
  await app.click('返回原畫');assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null);
  await app.click('圖文對讀');await app.tick(performance.now()+1000);assert.match(app.el.textContent!,/繼續故事/);
  await app.click('重看龍形演繹');await app.tick(performance.now()+1000);await app.click('看龍形演繹');await app.tick(performance.now()+1000);
  await act(async()=>app.w.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Escape'})));assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null);
  await app.click('回到圖文對讀');await app.tick(performance.now()+1000);
  assert.match(app.el.querySelector('.lantern-journal-button')!.textContent!,/3／5/,'replay never adds duplicate collections');
  await app.click('重看鳥形演繹');await app.tick(performance.now()+1000);await app.load();await app.tick(100);await app.tick(6400);
  await app.click('回到圖文對讀');await app.tick(performance.now()+1000);assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);
  await app.click('繼續故事');assert.match(app.el.textContent!,/已尋得 2／6 處/);
  assert.equal(app.w.localStorage.length,0,'isolated trial must not write formal progress');
 }finally{await app.close();}
});

test('failed redrawn asset keeps the same original observation and permits retry',async()=>{
 const app=await setup();try{
  await app.actor('L1');await app.click('近看原畫');await app.tick(performance.now()+1000);await app.actor('bird');await app.tick(performance.now()+1000);await app.wait();
  assert.ok(app.el.querySelector('.luoshen-redrawn-stage'));
  await act(async()=>app.images.at(-1)?.onerror?.());
  assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);assert.match(app.el.textContent!,/演繹暫未載入/);
  await app.click('再看一次');await app.tick(performance.now()+1000);await app.load();assert.ok(app.el.querySelector('.luoshen-redrawn-stage'));
  await app.click('返回原畫');await app.click('再看龍形');assert.match(app.el.textContent!,/再看飛鳥附近的龍形/);
 }finally{await app.close();}
});

test('fade keeps controls locked briefly, then restores the original and focus controls',async()=>{
 const app=await setup();try{
  await app.actor('L1');await app.click('近看原畫');await app.tick(performance.now()+1000);await app.actor('bird');await app.tick(performance.now()+1000);await app.wait();await app.load();await app.tick(0);await app.tick(6300);
  await act(async()=>app.w.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'f'})));
  assert.ok(app.el.querySelector('.luoshen-redrawn-stage'));assert.equal(app.el.querySelector<HTMLElement>('.luoshen-bird-world')!.style.opacity,'0');assert.ok(app.el.querySelector('.lantern-hud')?.hasAttribute('inert'));
  await app.wait(240);assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);assert.equal(app.el.querySelector('.lantern-hud')?.hasAttribute('inert'),false);assert.match(app.el.textContent!,/轉回彩色/);
 }finally{await app.close();}
});


test('portrait preview reserves paper below the figure and keeps replay/original reachable',async()=>{
 const app=await setup({preview:true,frame:{width:390,height:844}});try{
  const main=app.el.querySelector<HTMLElement>('main')!,layout=luoshenFigureLayout({width:390,height:844});
  assert.ok(main.classList.contains('is-figure-stacked'));assert.equal(main.style.getPropertyValue('--figure-note-height'),`${layout.noteMaxHeight}px`);
  const original=[...app.el.querySelectorAll('button')].find(b=>b.textContent==='返回原畫');assert.ok(original?.closest('.luoshen-note-primary'),'original control is outside scrolling copy');
  await app.click('播放演繹');assert.ok(app.el.querySelector('.luoshen-ribbon-animation'));
  assert.ok(app.images.some(i=>i.src.endsWith('figure-parts-v2.png')),'uses actual disjoint atlas');
  await app.load();await app.tick(100);await app.tick(5500);assert.equal(app.el.querySelector('.luoshen-ribbon-animation'),null);
  await app.click('再看一次');await app.load();await app.tick(100);assert.ok(app.el.querySelector('.luoshen-ribbon-animation'));
  await app.click('返回原畫');assert.equal(app.el.querySelector('.luoshen-ribbon-animation'),null);assert.match(app.el.textContent!,/播放演繹/);
  assert.equal(app.w.localStorage.length,0);
 }finally{await app.close();}
});


test('dragon preview plays alone, returns to original and permits replay without formal progress',async()=>{
 const app=await setup({dragon:true,frame:{width:390,height:844}});try{
  assert.ok(app.el.querySelector('main.is-figure-stacked'));await app.click('播放演繹');assert.ok(app.el.querySelector('.luoshen-dragon-animation'));
  assert.equal(app.el.querySelector('.luoshen-redrawn-stage'),null);assert.ok(app.images.some(i=>i.src.endsWith('luoshen-dragon/dragon-parts-v2.png')));assert.ok(app.images.some(i=>i.src.endsWith('luoshen-dragon/hindleg-v3.png')),'dedicated lowered hindleg asset');
  assert.equal(app.el.querySelector('.lantern-market-preview-header'),null,'wide banner no longer covers birds');assert.ok(app.el.querySelector('a[aria-label="回到洛水之間"] .art-icon')); 
  await app.load();await app.tick(100);await app.tick(5500);assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null);
  await app.click('再看一次');await app.load();await app.tick(100);assert.ok(app.el.querySelector('.luoshen-dragon-animation'));
  await act(async()=>app.w.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Escape'})));assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null);
  assert.equal(app.w.document.activeElement?.getAttribute('aria-label'),'婉若游龍');assert.equal(app.w.localStorage.length,0);
 }finally{await app.close();}
});


test('portrait dragon flow supports failed assets, retry, reduced motion and optional skip',async()=>{
 const app=await setup({trialDragon:true,frame:{width:390,height:844}});try{
  await app.actor('L1');await app.click('近看原畫');await app.tick(performance.now()+1000);await app.actor('bird');await app.tick(performance.now()+1000);await app.wait();
  await app.click('返回原畫');await app.click('再看龍形');await app.tick(performance.now()+1000);
  const main=app.el.querySelector('main')!;assert.ok(main.classList.contains('is-dragon-context'));assert.ok(main.classList.contains('is-figure-stacked'));
  await app.actor('dragon-first');await app.tick(performance.now()+1000);await app.wait();
  await app.click('看龍形演繹');await app.tick(performance.now()+1000);const staleDone=app.images.at(-1)?.onload;
  await act(async()=>app.images.at(-1)?.onerror?.());assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null);assert.match(app.el.textContent!,/演繹暫未載入/);
  await app.click('再看一次');await app.tick(performance.now()+1000);await app.load();assert.ok(app.el.querySelector('.luoshen-dragon-animation'));
  await app.click('返回原畫');await act(async()=>staleDone?.());assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null,'cancelled load cannot revive an old animation');
  app.setReduced(true);await app.click('再看一次');await app.tick(performance.now()+1000);assert.equal(app.el.querySelector('.luoshen-dragon-animation'),null,'reduced motion stays on original');
  await app.click('圖文對讀');await app.tick(performance.now()+1000);assert.match(app.el.textContent!,/繼續故事/);
  await app.click('重看龍形演繹');await app.tick(performance.now()+1000);await app.click('回到圖文對讀');await app.tick(performance.now()+1000);
  assert.match(app.el.querySelector('.lantern-journal-button')!.textContent!,/2／5/,'optional skip keeps category dedup');assert.equal(app.w.localStorage.length,0);
 }finally{await app.close();}
});
