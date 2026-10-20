import test from 'node:test';import assert from 'node:assert/strict';
import {redrawnRibbonDuration as duration,redrawnRibbonPatch as p,redrawnRibbonDisplacement as displacement,prepareRibbonSilk,prepareRibbonInk,renderRedrawnRibbonInk,ribbonLayerOpacity} from '../src/game/luoshenRibbonRedraw.ts';
test('redrawn streamer fixes the connection, moves its tip clearly, and rests exactly at both ends',()=>{
 let max=0;for(let time=0;time<=duration;time+=25){assert.deepEqual(displacement(846,time),{x:0,y:0});assert.deepEqual(displacement(855,time),{x:0,y:0});max=Math.max(max,Math.abs(displacement(935,time).y));}
 assert.ok(max>5&&max<=8.5);assert.deepEqual(displacement(935,0),{x:0,y:0});assert.deepEqual(displacement(935,duration),{x:0,y:0});assert.equal(ribbonLayerOpacity(0),0);assert.equal(ribbonLayerOpacity(duration),0);assert.equal(ribbonLayerOpacity(2000),1);
});
test('repair keeps the hand, sleeve and patch boundary byte-for-byte unchanged',()=>{
 const source=new Uint8ClampedArray(p.width*p.height*4),plate=new Uint8ClampedArray(source.length);
 for(let i=0;i<source.length;i+=4){source.set([150+(i%5),114,80,255],i);plate.set([180,135,95,255],i);}
 const out=prepareRibbonSilk(source,plate);
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(x+p.left<=855||y+p.top>=546||x===0||y===0||x===p.width-1||y===p.height-1){const i=(y*p.width+x)*4;assert.deepEqual(out.slice(i,i+4),source.slice(i,i+4));}
});
test('only transparent ribbon pixels deform; endpoint images and fixed connection remain exact',()=>{
 const w=p.width*p.resolution,h=p.height*p.resolution,rgba=new Uint8ClampedArray(w*h*4);
 for(let y=68;y<96;y++)for(let x=30;x<180;x++)rgba.set([220,180,120,255],(y*w+x)*4);
 const ink=prepareRibbonInk(rgba),out=new Uint8ClampedArray(rgba.length);
 for(const t of [0,duration]){renderRedrawnRibbonInk(ink,out,t);assert.deepEqual(out,ink.straight);}
 renderRedrawnRibbonInk(ink,out,2800);assert.ok(out.some((v,i)=>v!==ink.straight[i]));
 for(let y=0;y<h;y++)for(let x=0;x<=(855-p.left)*p.resolution;x++){const i=(y*w+x)*4;assert.deepEqual(out.slice(i,i+4),ink.straight.slice(i,i+4));}
});
