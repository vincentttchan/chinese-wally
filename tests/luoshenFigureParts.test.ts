import test from 'node:test';
import assert from 'node:assert/strict';
import {figureAtlas,figureRig,figurePartPoint,figurePartsPose,gradeFigurePart} from '../src/game/luoshenFigureParts.ts';
import {luoshenFigureLayout,figureBounds} from '../src/game/luoshenFigureLayout.ts';
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
test('head and held object remain rigid while the shoulder, neck and planted foot stay attached',()=>{
 for(const part of ['head','arm'] as const){const r=figureRig[part],rest=distance(figurePartPoint(part,40,80,0),figurePartPoint(part,180,220,0));let peak=0;
  for(let time=0;time<=5400;time+=90){
   const a=figurePartPoint(part,40,80,time),b=figurePartPoint(part,180,220,time);assert.ok(Math.abs(distance(a,b)-rest)<1e-8,'no face or disc stretch');
   const joint=figurePartPoint(part,r.pivot.x,r.pivot.y,time),body=figureRig.body;
   const socket=figurePartPoint('body',body.pivot.x+(r.joint.x-body.joint.x)/body.sx,body.pivot.y+(r.joint.y-body.joint.y)/body.sy,time);
   assert.ok(distance(joint,socket)<1e-8);peak=Math.max(peak,distance(a,figurePartPoint(part,40,80,0)));
  }assert.ok(peak>2,'visible independent motion');
 }
 for(const t of [0,1700,3000,5400])assert.deepEqual(figurePartPoint('body',figureRig.body.pivot.x,figureRig.body.pivot.y,t),{x:768,y:700});
 assert.deepEqual(figurePartsPose(0),figurePartsPose(5400));assert.notEqual(figurePartsPose(2400).arm,figurePartsPose(2400).ribbons);
});
test('four genuine atlas parts occupy disjoint rectangles and opaque interiors survive grading',()=>{
 const boxes=Object.values(figureAtlas);for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y);}
 const w=20,h=20,data=new Uint8ClampedArray(w*h*4);for(let i=0;i<data.length;i+=4)data.set([200,150,100,255],i);gradeFigurePart(data,w,h,'head');assert.equal(data[(10*w+10)*4+3],255);assert.ok(data[(10*w+10)*4]<200);
});
test('clamped portrait and landscape camera keeps the entire figure clear of the reserved paper',()=>{
 for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[320,932],[568,320],[667,375],[700,900],[768,1024],[1000,800]]){
  const layout=luoshenFigureLayout({width,height}),{view}=layout,b=figureBounds;
  const left=view.x+b.left*view.scale,right=view.x+b.right*view.scale,top=view.y+b.top*view.scale,bottom=view.y+b.bottom*view.scale;
  assert.ok(left>=0&&right<=width,`${width}x${height}: full width`);assert.ok(top>=44&&bottom<height,`${width}x${height}: hair and hem`);
  if(layout.stacked){assert.ok(height-16-layout.noteMaxHeight>=bottom+12,`${width}x${height}: paper below actual clamped hem`);assert.ok(layout.noteMaxHeight>=150,'room for keyboard reachable action and scrolling copy');}
  else assert.ok(right+16<=width-288-24,'side paper does not cover figure');
 }
});
