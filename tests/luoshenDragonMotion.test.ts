import test from 'node:test';
import assert from 'node:assert/strict';
import {dragonRig,dragonPoint,dragonPose,dragonDuration,dragonOpacity,dragonPatch,isolateDragonPart,prepareDragonSilk} from '../src/game/luoshenDragonMotion.ts';
import {luoshenDragonLayout,dragonBounds,dragonContextBounds,dragonBirdBounds} from '../src/game/luoshenDragonLayout.ts';
const dist=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
test('dragon head and claws stay rigid, joints follow torso and the delayed tail visibly moves',()=>{
 for(const key of ['neckLower','neckUpper','head','foreleg','hindleg','tail'] as const){const rig=dragonRig[key];let peak=0;
  for(let t=0;t<=5400;t+=90){
   const joint=dragonPoint(key,rig.pivot.x,rig.pivot.y,t);
   assert.ok(rig.parent);const socket=dragonPoint(rig.parent,rig.socket.x,rig.socket.y,t);assert.ok(dist(joint,socket)<1e-8,'no detached root along neck chain');
   if(key!=='tail')assert.ok(Math.abs(dist(dragonPoint(key,40,30,t),dragonPoint(key,140,160,t))-dist(dragonPoint(key,40,30,0),dragonPoint(key,140,160,0)))<1e-8,'no skull/claw stretch');
   const tip=key==='tail'?{x:610,y:40}:key==='hindleg'?{x:650,y:900}:{x:40,y:30};peak=Math.max(peak,dist(dragonPoint(key,tip.x,tip.y,t),dragonPoint(key,tip.x,tip.y,0)));
  }assert.ok(peak>1,`${key} moves`);
 }
 assert.deepEqual(dragonPose(0),dragonPose(dragonDuration));assert.equal(dragonOpacity(0),0);assert.equal(dragonOpacity(dragonDuration),0);assert.equal(dragonOpacity(2000),1);assert.notEqual(dragonPose(2100).head,dragonPose(2100).tail);assert.notEqual(dragonPose(2100).neckUpper,dragonPose(2100).neckLower);
 assert.equal(dragonRig.head.parent,'neckUpper');assert.equal(dragonRig.neckUpper.parent,'neckLower');assert.equal(dragonRig.hindleg.rest,0,'dedicated lowered hindleg is not a rotated foreclaw');
});
test('atlas decoding removes neighboring disconnected parts without hollowing opaque interiors',()=>{
 const w=90,h=70,data=new Uint8ClampedArray(w*h*4);for(const [left,top] of [[8,8],[60,35]])for(let y=top;y<top+22;y++)for(let x=left;x<left+22;x++)data.set([200,150,100,255],(y*w+x)*4);
 isolateDragonPart(data,w,h,{x:18,y:18});assert.equal(data[(18*w+18)*4+3],255);assert.equal(data[(45*w+70)*4+3],0);assert.throws(()=>isolateDragonPart(new Uint8ClampedArray(w*h*4),w,h,{x:18,y:18}),/Missing/);
});
test('dragon fill leaves original border, alpha and surrounding intact silk unchanged',()=>{
 const p=dragonPatch,w=p.width,h=p.height,original=new Uint8ClampedArray(w*h*4).fill(130),plate=new Uint8ClampedArray(original.length).fill(170);
 for(let y=20;y<65;y++)for(let x=70;x<140;x++)for(let c=0;c<3;c++)plate[(y*w+x)*4+c]=220;
 const result=prepareDragonSilk(original,plate);assert.ok(result[((200-p.top)*w+1144-p.left)*4]>130);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;assert.equal(result[i+3],original[i+3]);if(!x||!y||x===w-1||y===h-1||x>w-8)assert.deepEqual(result.slice(i,i+4),original.slice(i,i+4));}
 assert.ok(p.top>152,'bird region never belongs to the dragon patch');
});
test('dragon camera reserves actual clamped bounds beside or above the shared note',()=>{
 for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[320,932],[568,320],[667,375],[700,900],[768,1024],[1000,800]]){
  const p=luoshenDragonLayout({width,height}),b=dragonBounds,s=p.view.scale,left=p.view.x+b.left*s,right=p.view.x+b.right*s,top=p.view.y+b.top*s,bottom=p.view.y+b.bottom*s;
  assert.ok(left>=0&&right<=width,`${width}x${height} width`);assert.ok(top>=44&&bottom<height);
  if(p.stacked)assert.ok(height-16-p.noteMaxHeight>=bottom+12);else assert.ok(right+16<=width-312);
  const birds=dragonBirdBounds,nav={left:width<700?16:28,right:(width<700?16:28)+44,bottom:(width<700?16:24)+44};
  const birdLeft=p.view.x+birds.left*s,birdTop=p.view.y+birds.top*s,birdRight=p.view.x+birds.right*s;
  assert.ok(p.view.y+dragonContextBounds.top*s>=0,'complete bird wing margin is inside viewport');assert.ok(birdRight<=width&&birdLeft>=0);
  assert.ok(birdLeft>=nav.right+4||birdTop>=nav.bottom+4,'back control does not cover a wing');
 }
});
