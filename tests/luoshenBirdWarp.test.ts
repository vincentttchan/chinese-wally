import test from 'node:test';
import assert from 'node:assert/strict';
import * as motion from '../src/game/luoshenBirdMotion.ts';
test('continuous wing deformation pins both roots and leaves the patch boundary unchanged',()=>{
 assert.equal(typeof motion.luoshenBirdDisplacement,'function','continuous source deformation is required');
 const f=motion.luoshenBirdDisplacement;
 for(const t of [0,1100,2200,3200,4200]){
  for(const [x,y] of [[1194,100],[1275,126],[1108,40],[1344,40],[1108,164],[1344,164]]){const p=f(x,y,t);assert.ok(Math.hypot(p.x,p.y)<1e-9);}
 }
 const tip=f(1218,65,2000);assert.ok(Math.hypot(tip.x,tip.y)>.2);
});
test('bilinear sampling preserves all original pixels at rest and never alters boundary pixels',()=>{
 assert.equal(typeof motion.renderLuoshenBirdFrame,'function','continuous sampling is required');
 const {width,height,left,top}=motion.luoshenBirdPatch;
 const source=new Uint8ClampedArray(width*height*4);for(let i=0;i<source.length;i++)source[i]=(i*17)%256;
 for(const time of [0,4200]){const out=new Uint8ClampedArray(source.length);motion.renderLuoshenBirdFrame(source,out,time);assert.deepEqual(out,source);}
 const out=new Uint8ClampedArray(source.length);motion.renderLuoshenBirdFrame(source,out,2000);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(x<2||x>=width-2||y<2||y>=height-2){const i=(y*width+x)*4;assert.deepEqual(out.slice(i,i+4),source.slice(i,i+4),`boundary ${left+x},${top+y}`);}
 assert.ok(out.some((v,i)=>v!==source[i]));
});
test('tip-only revision keeps roots, necks and bodies exact throughout the gesture',()=>{
 for(let t=0;t<=4200;t+=70){
  for(const [x,y] of [[1194,100],[1275,126],[1165,76],[1204,104],[1260,104],[1283,128]]){
   assert.deepEqual(motion.luoshenBirdTipDisplacement(x,y,t),{x:0,y:0});
  }
  for(const [x,y] of [[1218,65],[1154,108],[1303,108],[1247,135]]){
   const p=motion.luoshenBirdTipDisplacement(x,y,t);assert.ok(Math.hypot(p.x,p.y)<6.6);
  }
 }
 assert.ok(Math.abs(motion.luoshenBirdTipDisplacement(1228,72,1750).y)>6);
 for(const t of [0,4200])assert.deepEqual(motion.luoshenBirdTipDisplacement(1218,65,t),{x:0,y:0});
 const {width,height}=motion.luoshenBirdPatch,source=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<source.length;i++)source[i]=(i*17)%256;
 for(const t of [0,4200]){const out=new Uint8ClampedArray(source.length);motion.renderLuoshenBirdFrame(source,out,t,true);assert.deepEqual(out,source);}
});

test('isolated feather ink leaves uniform silk and complete root regions stationary',()=>{
 const {width,height,left,top}=motion.luoshenBirdPatch;
 const silk=new Uint8ClampedArray(width*height*4);
 for(let p=0;p<width*height;p++)silk.set([160,130,94,255],p*4);
 for(const t of [500,1300,1750,2070,2900]){
  const out=new Uint8ClampedArray(silk.length);motion.renderLuoshenBirdFrame(silk,out,t,true);assert.deepEqual(out,silk,'silk without ink must never move');
 }
 const textured=new Uint8ClampedArray(silk);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if((x+y)%3===0)textured.set([82,65,49,255],(y*width+x)*4);
 for(const t of [700,1750,2070,3100]){
  const out=new Uint8ClampedArray(silk.length);motion.renderLuoshenBirdFrame(textured,out,t,true);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const gx=left+x,gy=top+y;
   const fixedRoot=[[1194,100],[1275,120]].some(([rx,ry])=>Math.hypot(gx-rx,gy-ry)<20);
   const outsideFeathers=gy<60||gy>147||gx<1137||gx>1314;
   if(fixedRoot||outsideFeathers){const i=(y*width+x)*4;assert.deepEqual(out.slice(i,i+4),textured.slice(i,i+4));}
  }
 }
});
