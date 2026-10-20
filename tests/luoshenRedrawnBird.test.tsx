import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {redrawnBirdDuration,redrawnBirdPose,redrawnWingPoint,birdShoulder} from '../src/game/luoshenRedrawnBird.ts';
import {LuoshenRedrawnBird} from '../src/components/LuoshenRedrawnBird.tsx';
test('layered wings stay attached to one fixed shoulder and return exactly to rest',()=>{
 for(let t=0;t<=redrawnBirdDuration;t+=25){
  assert.deepEqual(redrawnWingPoint(685,113,t,'near'),birdShoulder);
  assert.deepEqual(redrawnWingPoint(220,360,t,'far'),birdShoulder);
  const p=redrawnBirdPose(t);assert.ok(Math.abs(p.near)<=16&&Math.abs(p.far)<=13&&Math.abs(p.tip)<=3);
 }
 assert.deepEqual(redrawnBirdPose(0),redrawnBirdPose(redrawnBirdDuration));
 const start=redrawnWingPoint(160,340,0,'near'),peak=redrawnWingPoint(160,340,2500,'near');
 assert.ok(Math.hypot(peak.x-start.x,peak.y-start.y)>80,'visible movement at a readable display size');
});
async function mount(playing=true,reduced=false){
 const window=new Window(),frames=new Map<number,FrameRequestCallback>(),images:MockImage[]=[];let id=0,done=0,errors=0,draws=0,hidden=0;
 class MockImage{onload:(()=>void)|null=null;onerror:(()=>void)|null=null;src='';constructor(){images.push(this);}}
 for(const [key,value] of Object.entries({window,document:window.document,navigator:window.navigator,HTMLElement:window.HTMLElement,Image:MockImage,requestAnimationFrame:(cb:FrameRequestCallback)=>{frames.set(++id,cb);return id;},cancelAnimationFrame:(id:number)=>frames.delete(id),IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,key,{value,configurable:true});
 window.matchMedia=(()=>({matches:reduced})) as typeof window.matchMedia;
 const ctx={getImageData(_x:number,_y:number,w:number,h:number){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){},drawImage(){draws++;},clearRect(){},save(){},restore(){},translate(){},rotate(){},transform(){},scale(){}};
 window.HTMLCanvasElement.prototype.getContext=(()=>ctx) as unknown as typeof window.HTMLCanvasElement.prototype.getContext;
 const el=window.document.createElement('div');window.document.body.append(el);const root=createRoot(el as unknown as HTMLElement);
 const update=(play=playing,show=true)=>act(async()=>root.render(<LuoshenRedrawnBird viewport={{view:{x:0,y:0,scale:1},frame:{width:1000,height:800}}} playing={play} show={show} ticket={1} onHidden={()=>hidden++} onDone={()=>done++} onError={()=>errors++}/>));
 await update();
 return {el,images,frames,update,get hidden(){return hidden;},get done(){return done;},get errors(){return errors;},get draws(){return draws;},load:()=>act(async()=>images.forEach(i=>i.onload?.())),tick:(time:number)=>act(async()=>{const f=[...frames.values()];frames.clear();f.forEach(cb=>cb(time));}),close:async()=>{await act(async()=>root.unmount());await window.happyDOM.abort();}};
}
test('redrawn sequence finishes on its resting pose, while static comparison schedules no animation',async()=>{
 const app=await mount();try{await app.load();assert.equal(app.frames.size,1);await app.tick(0);await app.tick(redrawnBirdDuration);assert.equal(app.done,1);assert.equal(app.frames.size,0);assert.ok(app.draws>3);assert.equal(app.errors,0);}finally{await app.close();}
 const still=await mount(false);try{await still.load();assert.equal(still.frames.size,0);assert.ok(still.draws>3);assert.equal(still.done,0);}finally{await still.close();}
});
test('cancel, image failure and reduced motion release playback safely',async()=>{
 const cancel=await mount();await cancel.load();await cancel.close();assert.equal(cancel.frames.size,0);assert.equal(cancel.images[0].onload,null);
 const failed=await mount();try{await act(async()=>{failed.images[0].onerror?.();failed.images[0].onerror?.();});assert.equal(failed.errors,1);assert.equal(failed.frames.size,0);}finally{await failed.close();}
 const reduced=await mount(true,true);try{await reduced.load();assert.equal(reduced.frames.size,0);assert.equal(reduced.done,1);}finally{await reduced.close();}
});

test('in-painting replacement preserves the original patch border and uses painting coordinates',async()=>{
 const {prepareBirdSilk,inPaintingBirdPatch}=await import('../src/game/luoshenBirdInPainting.ts');
 const {width,height}=inPaintingBirdPatch,original=new Uint8ClampedArray(width*height*4),plate=new Uint8ClampedArray(original.length);
 for(let p=0;p<width*height;p++){original.set([160+(p%3),120,80,255],p*4);plate.set([190,140,90,255],p*4);}
 const corrected=prepareBirdSilk(original,plate);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(x===0||y===0||x===width-1||y===height-1){const p=(y*width+x)*4;assert.deepEqual(corrected.slice(p,p+4),original.slice(p,p+4));}
 const app=await mount(false);try{
  await app.load();
  // All three inputs must exist: layered bird, original tile and temporary silk repair.
  assert.equal(app.images.length,3);assert.match(app.images[2].src,/silk-plate-v3/);
  const patch=app.el.querySelector<HTMLCanvasElement>('.luoshen-redrawn-patch')!;assert.equal(patch.style.left,'17068px');assert.equal(patch.style.top,'40px');assert.equal(patch.style.width,'236px');
  assert.match(app.el.querySelector<HTMLElement>('.luoshen-bird-world')!.style.transform,/translate\(0px,0px\) scale\(1\)/);
  assert.equal(app.el.querySelector<HTMLElement>('.luoshen-redrawn-stage')!.style.backgroundImage,'');
 }finally{await app.close();}
});

test('return fades before dismissal, cancels frames and retains the three loaded inputs',async()=>{
 const app=await mount();try{
  await app.load();await app.tick(0);assert.equal(app.frames.size,1);
  await app.update(false,false);assert.equal(app.el.querySelector<HTMLElement>('.luoshen-bird-world')!.style.opacity,'0');assert.equal(app.hidden,0);
  await app.tick(100);assert.equal(app.frames.size,0);assert.equal(app.images.length,3,'stopping must not reload and regrade the layers');
  await act(async()=>{await new Promise(r=>setTimeout(r,240));});assert.equal(app.hidden,1);assert.equal(app.done,0);
 }finally{await app.close();}
});
test('opaque shoulders are preserved until group compositing, and the two birds rest differently',async()=>{
 const {gradeBirdInk}=await import('../src/game/luoshenBirdInPainting.ts');
 const rgba=new Uint8ClampedArray(11*11*4);for(let i=0;i<rgba.length;i+=4)rgba.set([200,160,100,255],i);
 gradeBirdInk(rgba,11,11);const middle=(5*11+5)*4;assert.equal(rgba[middle+3],255,'torso must completely cover the wing attachments');assert.equal(rgba[middle],126);assert.ok(rgba[3]<255,'outline is feathered');
 assert.notDeepEqual(redrawnBirdPose(0,0),redrawnBirdPose(0,1));assert.deepEqual(redrawnBirdPose(0,1),redrawnBirdPose(redrawnBirdDuration,1));
 for(const t of [0,1700,3300,6200])assert.deepEqual(redrawnWingPoint(685,113,t,'near',1),birdShoulder);
});
