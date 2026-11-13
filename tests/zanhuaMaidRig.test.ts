import test from 'node:test';
import assert from 'node:assert/strict';
import * as rig from '../src/game/zanhuaMaidPerformance.ts';
const lower={x:111,y:560},upper={x:289,y:360};
const body=(p:{x:number;y:number},t:number)=>rig.zanhuaMaidBodyPoint(p.x,p.y,t);
const fan=(p:{x:number;y:number},t:number)=>rig.zanhuaMaidFanPoint(p.x,p.y,t);
const duration=rig.zanhuaMaidRigDuration;
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
test('both hands stay attached to their own shaft grips throughout the separate animation',()=>{
 for(let t=0;t<=duration;t+=16)for(const hand of [lower,upper])assert.ok(distance(body(hand,t),fan(hand,t))<.001);
});
test('the entire shaft remains straight and the distance between grip points stays constant',()=>{
 const end={x:lower.x+2.3*(upper.x-lower.x),y:lower.y+2.3*(upper.y-lower.y)};
 for(let t=0;t<=duration;t+=40){
  const a=fan(lower,t),b=fan(upper,t),c=fan(end,t);
  assert.ok(Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))<.001);
  assert.ok(Math.abs(distance(a,b)-distance(lower,upper))<.001);
 }
});
test('fanning turns the fan plane while the lifted hand span stays steady',()=>{
 const a={x:430,y:120},b={x:590,y:262},width=distance(fan(a,3200),fan(b,3200));
 const samples=[3200,3500,3800,4100,4400].map(t=>distance(fan(a,t),fan(b,t)));
 assert.ok(Math.max(...samples)-Math.min(...samples)>12);
 assert.ok(width>100);
});
test('body and prop return exactly to their registered position; the hem never drifts',()=>{
 for(const t of [0,duration])for(const p of [lower,upper,{x:235,y:170},{x:500,y:100},{x:250,y:990}]){
  assert.ok(distance(body(p,t),p)<.001);assert.ok(distance(fan(p,t),p)<.001);
 }
 for(let t=0;t<=duration;t+=40)assert.ok(distance(body({x:250,y:1005},t),{x:250,y:1005})<.001);
});
test('linked body and prop move continuously, with the body turn leading the lift',()=>{
 const early=rig.zanhuaMaidRigPose(1500);assert.ok(early.turn>.7);assert.equal(early.lift,0);
 for(let t=16;t<=duration;t+=16)for(const p of [lower,upper,{x:500,y:100}]){
  assert.ok(distance(fan(p,t),fan(p,t-16))<4);
  assert.ok(distance(body(p,t),body(p,t-16))<3);
 }
});
