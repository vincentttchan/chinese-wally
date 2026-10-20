import test from 'node:test';
import assert from 'node:assert/strict';
import * as ribbon from '../src/game/luoshenRibbonMotion.ts';
test('ribbon connection, hand and sleeve remain fixed while the end moves modestly',()=>{
 assert.equal(typeof ribbon.luoshenRibbonDisplacement,'function');
 const f=ribbon.luoshenRibbonDisplacement;
 for(const time of [0,1200,2300,3400,4600]){
  for(const [x,y] of [[846,539],[830,515],[810,525],[855,535],[765,430],[910,575]])assert.deepEqual(f(x,y,time),{x:0,y:0});
 }
 let max=0;for(let t=0;t<=4600;t+=20){const p=f(934,503,t);max=Math.max(max,Math.hypot(p.x,p.y));assert.ok(Math.abs(p.x)<=1.2&&Math.abs(p.y)<=3.2);}
 assert.ok(max>.8,'a visible but restrained motion reaches the distal ribbon');
});
test('source warp restores every pixel at both ends and keeps the patch boundary unchanged',()=>{
 const {width,height}=ribbon.luoshenRibbonPatch,source=Uint8ClampedArray.from({length:width*height*4},(_,i)=>(i*17)%256),out=new Uint8ClampedArray(source.length);
 for(const time of [0,ribbon.luoshenRibbonDuration]){ribbon.renderLuoshenRibbonFrame(source,out,time);assert.deepEqual(out,source);}
 ribbon.renderLuoshenRibbonFrame(source,out,2300);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(x<3||x>=width-3||y<3||y>=height-3){const i=(y*width+x)*4;assert.deepEqual(out.slice(i,i+4),source.slice(i,i+4));}
 assert.ok(out.some((value,i)=>value!==source[i]));
});
