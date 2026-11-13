import test from 'node:test';
import assert from 'node:assert/strict';
import {maidMotionDuration,maidMotionPose,maidBodyPoint,maidFanPoint,maidRestArms,maidSkinWeights} from '../src/game/zanhuaMaidMotionV2.ts';
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
test('both articulated arms keep the upper arm and forearm lengths while hands hold the fan',()=>{
 for(let t=0;t<=maidMotionDuration;t+=32){const pose=maidMotionPose(t);
  pose.arms.forEach((arm,i)=>{const rest=maidRestArms[i];
   assert.ok(Math.abs(distance(arm.shoulder,arm.elbow)-distance(rest.shoulder,rest.elbow))<.001);
   assert.ok(Math.abs(distance(arm.elbow,arm.wrist)-distance(rest.elbow,rest.wrist))<.001);
   const hand=rest.grip,a=maidBodyPoint(hand.x,hand.y,pose,maidSkinWeights(hand.x,hand.y)),b=maidFanPoint(hand.x,hand.y,pose);
   assert.ok(distance(a,b)<.001);
  });
 }
});
test('the fan remains rigid throughout both strokes instead of narrowing and widening',()=>{
 const a={x:430,y:120},b={x:590,y:262};
 for(let t=0;t<=maidMotionDuration;t+=32){const p=maidMotionPose(t);assert.ok(Math.abs(distance(maidFanPoint(a.x,a.y,p),maidFanPoint(b.x,b.y,p))-distance(a,b))<.001);}
});
test('each stroke has a distinct rhythm, with the return slower than the outward push',()=>{
 assert.ok(maidMotionPose(3300).stroke>maidMotionPose(4800).stroke);
 assert.ok(maidMotionPose(3600).stroke>0);assert.ok(maidMotionPose(4000).stroke<0);
 assert.equal(maidMotionPose(900).lift,0);assert.ok(maidMotionPose(900).turn>0);
});
test('joints and fan move continuously and the performance returns exactly to its starting pose',()=>{
 const points=[{x:111,y:560},{x:289,y:360},{x:230,y:150},{x:150,y:660},{x:350,y:710},{x:250,y:1005}];
 for(const t of [0,maidMotionDuration])for(const p of points)assert.ok(distance(maidBodyPoint(p.x,p.y,maidMotionPose(t),maidSkinWeights(p.x,p.y)),p)<.001);
 for(let t=16;t<=maidMotionDuration;t+=16){const now=maidMotionPose(t),before=maidMotionPose(t-16);
  for(const p of points){assert.ok(distance(maidBodyPoint(p.x,p.y,now,maidSkinWeights(p.x,p.y)),maidBodyPoint(p.x,p.y,before,maidSkinWeights(p.x,p.y)))<3);}
  assert.ok(distance(maidFanPoint(500,100,now),maidFanPoint(500,100,before))<5);
  assert.ok(distance(maidBodyPoint(250,1005,now,maidSkinWeights(250,1005)),{x:250,y:1005})<.001);
 }
});
test('all GPU skin weights preserve the rest silhouette, including vertices around the fingertips',async()=>{
 const {maidSkinChannels}=await import('../src/game/zanhuaMaidMotionV2.ts');
 for(let y=0;y<=1018;y+=5)for(let x=0;x<=710;x+=5){
  const w=maidSkinChannels(x,y);
  assert.ok(Math.abs(w.torso[0]+w.torso[3]+w.bones.reduce((a,b)=>a+b,0)-1)<1e-6,`lost weight at ${x}, ${y}`);
 }
});
