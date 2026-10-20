import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveQingmingHit,qingmingObservationId} from '../src/game/qingmingHit.ts';
import {qingmingActors,qingmingSize,qingmingStages,actorById} from '../src/game/qingming.ts';
import {qingmingCoverageEntries} from '../src/game/qingmingCoverageData.ts';
import {initialQingming,qingmingReducer} from '../src/game/qingmingState.ts';

const hit=(x:number,y:number,scale=.4)=>resolveQingmingHit({x,y},scale,qingmingSize,qingmingActors)?.id;

test('paper shop neighbour and the bucket have distinct painted hit locations',()=>{
 assert.equal(hit(27775,337),'neighbour-paper-right');
 assert.equal(hit(27806,409),'extra-object-outskirts-029');
 assert.equal(hit(27651,363),'person-paper');
});
test('adjacent city figures do not always yield to the smaller rectangle',()=>{
 assert.equal(hit(2990,1121),'extra-person-city-040');
 assert.equal(hit(2990,1185),'extra-person-city-040');
 assert.equal(hit(3018,1046),'extra-person-city-043');
 assert.equal(hit(3451,1085),'extra-person-city-110');
 assert.equal(hit(3503,1055),'extra-person-city-109');
});
test('medicine shop adults and the small figure remain separately selectable',()=>{
 assert.equal(hit(1528,760),'person-medicine');
 assert.equal(hit(1566,746),'extra-person-city-007');
 assert.equal(hit(1558,780),'extra-person-city-279');
 assert.equal(hit(1629,771),'neighbour-medicine-standing');
});
test('bridge crowds keep individual identities inside collective observation rectangles',()=>{
 assert.equal(hit(19528,218),'extra-person-river-207');
 assert.equal(hit(19448,193),'extra-person-river-205');
 assert.equal(hit(13388,515),'extra-person-river-027');
 assert.equal(hit(13425,507),'extra-person-river-028');
});
test('a native pointer rounding just outside a figure bound still reaches its verified face',()=>{
 assert.equal(hit(21021,1260),'extra-person-river-265');
 assert.equal(hit(21023,1261),'extra-person-river-265');
});
test('existing actor IDs use the same bounds as the source inventory',()=>{
 for(const entry of qingmingCoverageEntries.filter(e=>e.existingId)){
  const actor=actorById(entry.existingId!);
  const b=[(actor.x-actor.width/2)*38414,(actor.y-actor.height/2)*1800,(actor.x+actor.width/2)*38414,(actor.y+actor.height/2)*1800];
  b.forEach((v,i)=>assert.ok(Math.abs(v-entry.bounds[i])<1e-6,entry.existingId));
 }
});
test('the duplicated half-body record does not cover the bridge figure again',()=>{
 assert.equal(qingmingActors.some(a=>a.id==='extra-person-river-166'),false);
 assert.equal(hit(18280,1154),'extra-person-river-181');
});
test('an individual bridge participant can satisfy its group observation without replacing identity',()=>{
 const actorId=hit(19528,218)!;
 const observation=qingmingObservationId(actorId,['bridge-people'],qingmingActors);
 assert.equal(actorId,'extra-person-river-207');
 assert.equal(observation,'bridge-people');
 const index=qingmingStages.findIndex(s=>s.id==='bridge');
 const step=qingmingStages[index].steps.findIndex(s=>s.kind==='observe'&&s.ids.includes('bridge-people'));
 const state={...initialQingming({origins:{},read:[]}),mode:'study' as const,index,step};
 assert.equal(qingmingReducer(state,{type:'inspect',id:observation!}).observed,true);
 assert.equal(qingmingObservationId('extra-person-city-040',['bridge-people'],qingmingActors),null);
 assert.equal(qingmingObservationId('extra-person-city-143',['wine-decoration'],qingmingActors),null);
});
test('nested sign text and stall details satisfy the matching parent observation only',()=>{
 assert.equal(qingmingObservationId('incense-goods',['incense-sign'],qingmingActors),'incense-sign');
 assert.equal(qingmingObservationId('incense-goods',['medicine-name'],qingmingActors),null);
 assert.equal(qingmingObservationId('extra-object-river-032',['bridge-stalls'],qingmingActors),'bridge-stalls');
});
