import test from 'node:test';
import assert from 'node:assert/strict';
import {luoshenPeople,luoshenCollectibles,luoshenSteps,luoshenEnding,luoshenSize,luoshenReply} from '../src/game/luoshen.ts';
import {luoshenFacePoints,resolveLuoshenHit} from '../src/game/luoshenHit.ts';
const actors=[...luoshenPeople,...luoshenCollectibles];
const point=(tile:number,x:number,y:number)=>({x:tile*1995+x,y});
test('opening companion torso does not accidentally find Cao Zhi',()=>{
 const a=actors.find(a=>a.id==='attendant-opening-left')!;
 assert.equal(resolveLuoshenHit({x:a.x*19950,y:a.y*943},.76,luoshenSize,actors)?.id,a.id);
});
test('low goddess, long-necked bird and trailing garment remain separate',()=>{
 for(const [p,id] of [[point(4,90,650),'L8'],[point(4,200,700),'bird-2'],[point(4,90,775),'ribbon-13']] as const)
  assert.equal(resolveLuoshenHit(p,.76,luoshenSize,actors)?.id,id);
});
test('every registered face has its own response, including crowded groups',()=>{
 assert.equal(luoshenPeople.length,Object.keys(luoshenFacePoints).length);
 for(const a of luoshenPeople){
  const p=luoshenFacePoints[a.id];assert.ok(p,a.id);
  for(const scale of [.4,.76,1.2])assert.equal(resolveLuoshenHit(p,scale,luoshenSize,actors)?.id,a.id,a.id);
  const lines=[0,1,2].map(i=>luoshenReply(a.id,i));
  assert.equal(new Set(lines).size,3,a.id);assert.ok(lines.every(l=>l!=='再看看這一處的姿態。'),a.id);
 }
});
test('small observation touch padding does not swallow an adjacent painted face',()=>{
 const face=luoshenFacePoints['attendant-seat-fan'];
 const o={id:'nearby',name:'detail',kind:'observation' as const,x:(face.x+30)/luoshenSize.width,y:face.y/luoshenSize.height,width:10/luoshenSize.width,height:10/luoshenSize.height};
 assert.equal(resolveLuoshenHit(face,.4,luoshenSize,[...actors,o],o)?.id,'attendant-seat-fan');
});
test('all required observations can be completed at their painted centre',()=>{
 for(const o of [...luoshenSteps.flatMap(s=>s.observations),...luoshenEnding.map(e=>e.observation)]){
  const a=o.actor,p={x:a.x*luoshenSize.width,y:a.y*luoshenSize.height};
  assert.equal(resolveLuoshenHit(p,.76,luoshenSize,[...actors,a],a)?.id,o.id,o.id);
 }
});
test('each collection site has a clickable painted area without borrowing touch padding',()=>{
 for(const a of luoshenCollectibles){
  let reachable=false;
  for(const rx of [-.3,0,.3])for(const ry of [-.3,0,.3]){
   const p={x:(a.x+a.width*rx)*luoshenSize.width,y:(a.y+a.height*ry)*luoshenSize.height};
   if(resolveLuoshenHit(p,1,luoshenSize,actors)?.id===a.id)reachable=true;
  }
  assert.ok(reachable,a.id);
 }
});
