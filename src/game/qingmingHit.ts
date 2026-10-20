import type {SceneActor} from './level.ts';
import type {Point,Size} from './geometry.ts';
import {qingmingCoverageEntries} from './qingmingCoverageData.ts';

// Original-pixel points were checked against every registered person's crop.
// Usually a face; for obscured figures, a visible shoulder or body is used.
const points=new Map(qingmingCoverageEntries.filter(e=>e.hitPoint).map(e=>[e.existingId??e.id,e.hitPoint!]));
const isPerson=(a:SceneActor)=>a.kind==='target'||a.kind==='witness';
const area=(a:SceneActor)=>a.width*a.height;

export function resolveQingmingHit(world:Point,scale:number,size:Size,actors:readonly SceneActor[]):SceneActor|null{
 const contains=(a:SceneActor,pad:boolean)=>Math.abs(world.x-a.x*size.width)<=Math.max(a.width*size.width,pad?44/scale:0)/2&&Math.abs(world.y-a.y*size.height)<=Math.max(a.height*size.height,pad?44/scale:0)/2;
 const direct=actors.filter(a=>contains(a,false));
 // A verified face/body point cannot be stolen by a small sign, basket or
 // neighbouring rectangle. Overlapping cores choose the nearest actual point.
 const coreDistance=(a:SceneActor)=>{
  const point=points.get(a.id);if(!point)return Infinity;
  const rx=Math.min(18,Math.max(4,a.width*size.width*.28));
  const ry=Math.min(20,Math.max(5,a.height*size.height*.12));
  return ((world.x-point[0])/rx)**2+((world.y-point[1])/ry)**2;
 };
 const cores=actors.filter(a=>isPerson(a)&&coreDistance(a)<=1);
 if(cores.length)return cores.sort((a,b)=>coreDistance(a)-coreDistance(b)||a.id.localeCompare(b.id))[0];
 if(direct.length){
  // Similar adjacent bodies must not always lose to the shorter figure.
  const bodyDistance=(a:SceneActor)=>((world.x-a.x*size.width)/(a.width*size.width/2))**2+((world.y-a.y*size.height)/(a.height*size.height/2))**2;
  const people=direct.filter(isPerson).sort((a,b)=>bodyDistance(a)-bodyDistance(b)||a.id.localeCompare(b.id));
  const objects=direct.filter(a=>!isPerson(a)).sort((a,b)=>area(a)-area(b)||a.id.localeCompare(b.id));
  if(!people.length)return objects[0];
  if(!objects.length)return people[0];
  // Small explicit goods/signs remain clickable inside a person's wider body
  // bounds; broad shop/boat/bridge regions yield to the individual body.
  return area(objects[0])<area(people[0])?objects[0]:people[0];
 }
 const distance=(a:SceneActor)=>Math.hypot(world.x-a.x*size.width,world.y-a.y*size.height);
 return actors.filter(a=>contains(a,true)).sort((a,b)=>distance(a)-distance(b)||a.id.localeCompare(b.id))[0]??null;
}

/** A narrow detail may borrow a few screen pixels from its broad background,
 * but never from another person's body or a different small painted object. */
export function resolveQingmingDetailHit(world:Point,scale:number,size:Size,actors:readonly SceneActor[],detailIds:readonly string[]):SceneActor|null{
 // Collective observation boxes describe a subject, not a painted surface.
 // Otherwise the "crew" rectangle captures taps on the hull and cabin too.
 const paintedActors=actors.filter(a=>a.id!=='bridge-boat'&&a.id!=='bridge-people');
 const selected=resolveQingmingHit(world,scale,size,paintedActors);
 if(selected&&(isPerson(selected)||detailIds.includes(selected.id)))return selected;
 const near=paintedActors.filter(a=>detailIds.includes(a.id)&&!isPerson(a)).map(a=>{
  const dx=Math.max(0,Math.abs(world.x-a.x*size.width)-a.width*size.width/2)*scale;
  const dy=Math.max(0,Math.abs(world.y-a.y*size.height)-a.height*size.height/2)*scale;
  return {actor:a,distance:Math.hypot(dx,dy)};
 }).filter(({actor:a,distance})=>distance<=10&&(a.width*size.width*scale<44||a.height*size.height*scale<44)&&(!selected||area(selected)>area(a)*3));
 near.sort((a,b)=>a.distance-b.distance||area(a.actor)-area(b.actor));
 return near[0]?.actor??selected;
}

// The observation names a collective detail. Individual people keep their
// own response while also satisfying the observation of that same group.
export function qingmingObservationId(id:string,required:readonly string[],actors:readonly SceneActor[]):string|null{
 if(required.includes(id))return id;
 if(id==='incense-goods'&&required.includes('incense-sign'))return 'incense-sign';
 if(id==='extra-object-river-032'&&required.includes('bridge-stalls'))return 'bridge-stalls';
 const actor=actors.find(a=>a.id===id);if(!actor)return null;
 for(const groupId of ['bridge-people','bridge-boat']){
  if(!required.includes(groupId)||!isPerson(actor))continue;
  const group=actors.find(a=>a.id===groupId);
  if(group&&Math.abs(actor.x-group.x)<=group.width/2&&Math.abs(actor.y-group.y)<=group.height/2)return groupId;
 }
 return null;
}
