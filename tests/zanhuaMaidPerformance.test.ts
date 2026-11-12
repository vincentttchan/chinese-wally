import test from 'node:test';
import assert from 'node:assert/strict';
import {zanhuaMaidDuration,zanhuaMaidPerformance,zanhuaMaidPoint} from '../src/game/zanhuaMaidPerformance.ts';
test('the performance starts and ends on the exact original silhouette',()=>{
 for(const time of [0,zanhuaMaidDuration])for(const [x,y] of [[220,100],[270,420],[292,365],[90,548],[600,90],[230,1018]]){
  const p=zanhuaMaidPoint(x,y,zanhuaMaidPerformance(time));assert.ok(Math.hypot(p.x-x,p.y-y)<1e-8);
 }
});
test('head, torso and lower robe move while the feet remain planted throughout',()=>{
 const pose=zanhuaMaidPerformance(3300);
 for(const [x,y] of [[220,100],[270,420],[230,820]]){const p=zanhuaMaidPoint(x,y,pose);assert.ok(Math.hypot(p.x-x,p.y-y)>1);}
 for(let t=0;t<=zanhuaMaidDuration;t+=100){const foot=zanhuaMaidPoint(230,1018,zanhuaMaidPerformance(t));assert.ok(Math.hypot(foot.x-230,foot.y-1018)<1e-8);}
});
test('hands and fan handle stay in one affine unit while the fan is lifted',()=>{
 const pose=zanhuaMaidPerformance(3300),a=zanhuaMaidPoint(90,548,pose),b=zanhuaMaidPoint(345,300,pose),c=zanhuaMaidPoint(600,52,pose);
 assert.ok(Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))<1e-7);
 assert.ok(c.y<52);
});
test('head turn leads arm lift, and fanning has two smooth directional strokes',()=>{
 assert.ok(zanhuaMaidPerformance(1100).turn>0);assert.equal(zanhuaMaidPerformance(1100).lift,0);
 const angles=[2700,3100,3500,3900,4300].map(t=>zanhuaMaidPerformance(t).fan);
 assert.ok(Math.max(...angles)-Math.min(...angles)>.03);
 let previous=zanhuaMaidPoint(292,365,zanhuaMaidPerformance(0));
 for(let time=16;time<zanhuaMaidDuration;time+=16){const point=zanhuaMaidPoint(292,365,zanhuaMaidPerformance(time));assert.ok(Math.hypot(point.x-previous.x,point.y-previous.y)<3);previous=point;}
});
