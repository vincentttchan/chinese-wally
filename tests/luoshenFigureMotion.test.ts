import test from 'node:test';
import assert from 'node:assert/strict';
import {figureDisplacement,figurePose,figureOpacity,luoshenFigureDuration,luoshenFigurePatch,prepareFigureSilk,prepareFigureInk,renderFigureInk} from '../src/game/luoshenFigureMotion.ts';
test('full figure has head, torso and gesture motion, with a planted hem and delayed cloth',()=>{
 const points=[[766,410],[765,515],[806,472],[720,540],[928,550]];
 for(const [x,y] of points){let peak=0;for(let t=500;t<5000;t+=100){const d=figureDisplacement(x,y,t);peak=Math.max(peak,Math.hypot(d.x,d.y));}assert.ok(peak>1,`${x},${y} actually moves`);}
 for(const t of [0,1800,3000,5400])assert.deepEqual(figureDisplacement(760,710,t),{x:0,y:0});
 assert.deepEqual(figurePose(0),figurePose(luoshenFigureDuration));assert.equal(figureOpacity(0),0);assert.equal(figureOpacity(luoshenFigureDuration),0);assert.equal(figureOpacity(2000),1);
 assert.notEqual(figurePose(2200).hand,figurePose(2200).ribbon);
});
test('temporary background preserves exact borders and untouched neighboring rocks',()=>{
 const p=luoshenFigurePatch,source=new Uint8ClampedArray(p.width*p.height*4).fill(120),plate=new Uint8ClampedArray(source.length).fill(170);
 for(let y=80;y<140;y++)for(let x=70;x<115;x++)for(let c=0;c<3;c++)plate[(y*p.width+x)*4+c]=210;
 const out=prepareFigureSilk(source,plate);assert.ok(out[((440-p.top)*p.width+765-p.left)*4]>120,'fill really changes the removed figure region');
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(x===0||y===0||x===p.width-1||y===p.height-1||x<15){const i=(y*p.width+x)*4;assert.deepEqual(out.slice(i,i+4),source.slice(i,i+4));}
});
test('only cutout pixels deform, opaque colour survives and start/end rest frames match',()=>{
 const w=24,h=28,rgba=new Uint8ClampedArray(w*h*4);for(let y=8;y<22;y++)for(let x=6;x<18;x++){const i=(y*w+x)*4;rgba.set([180,140,100,255],i);}
 const ink=prepareFigureInk(rgba,w,h),out=new Uint8ClampedArray(rgba.length);assert.equal(ink.straight[(12*w+12)*4+3],255);assert.ok(ink.straight[(12*w+12)*4]<180);
 renderFigureInk(ink,out,0);assert.deepEqual(out,ink.straight);renderFigureInk(ink,out,5400);assert.deepEqual(out,ink.straight);
});
