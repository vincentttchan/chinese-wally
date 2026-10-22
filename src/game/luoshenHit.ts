import type {SceneActor} from './level.ts';
import type {Point,Size} from './geometry.ts';

/** Visible face points checked in unchanged source tiles on 2026-10-19. */
const tilePoints:Record<string,readonly [number,number,number]>={
 "C1": [
  8,
  1875,
  480
 ],
 "C2": [
  5,
  1990,
  470
 ],
 "C3": [
  4,
  565,
  545
 ],
 "C4": [
  2,
  10,
  400
 ],
 "C5": [
  1,
  855,
  590
 ],
 "C6": [
  0,
  700,
  555
 ],
 "L1": [
  8,
  765,
  430
 ],
 "L2": [
  7,
  1530,
  540
 ],
 "L3": [
  7,
  240,
  550
 ],
 "L4": [
  6,
  1740,
  140
 ],
 "L5": [
  6,
  1210,
  500
 ],
 "L6": [
  6,
  710,
  425
 ],
 "L7": [
  5,
  1660,
  380
 ],
 "L8": [
  4,
  90,
  610
 ],
 "L9": [
  3,
  325,
  405
 ],
 "attendant-opening-left": [
  8,
  1800,
  455
 ],
 "attendant-opening-rear": [
  8,
  1940,
  425
 ],
 "attendant-opening-beard": [
  9,
  20,
  490
 ],
 "attendant-opening-middle": [
  9,
  90,
  450
 ],
 "attendant-opening-green": [
  9,
  155,
  475
 ],
 "attendant-opening-box": [
  9,
  260,
  465
 ],
 "horse-keeper": [
  9,
  1455,
  180
 ],
 "sitting-keeper": [
  9,
  1480,
  580
 ],
 "companion-L3": [
  7,
  480,
  625
 ],
 "companion-L4": [
  6,
  1885,
  190
 ],
 "companion-L6": [
  6,
  790,
  475
 ],
 "attendant-seat-fan": [
  6,
  125,
  455
 ],
 "attendant-seat-front": [
  6,
  165,
  500
 ],
 "attendant-seat-green": [
  6,
  250,
  495
 ],
 "attendant-farewell-back": [
  4,
  635,
  535
 ],
 "attendant-farewell-beard": [
  4,
  695,
  560
 ],
 "attendant-farewell-box": [
  4,
  780,
  550
 ],
 "cloud-companion": [
  3,
  225,
  390
 ],
 "cloud-driver": [
  2,
  1950,
  350
 ],
 "boat-companion-one": [
  2,
  80,
  390
 ],
 "boat-companion-two": [
  2,
  140,
  395
 ],
 "boatman-left": [
  1,
  1920,
  640
 ],
 "boatman-right": [
  2,
  320,
  650
 ],
 "shore-attendant": [
  1,
  925,
  500
 ],
 "shore-standing": [
  1,
  610,
  480
 ],
 "carriage-front": [
  0,
  650,
  520
 ],
 "carriage-horse-left": [
  0,
  235,
  410
 ],
 "carriage-horse-right": [
  0,
  1100,
  610
 ],
 "carriage-driver": [
  0,
  590,
  605
 ],
 "carriage-rear": [
  0,
  595,
  412
 ],
 "drummer": [
  5,
  90,
  315
 ],
 "wind-spirit": [
  5,
  1350,
  110
 ],
 "water-attendant": [
  5,
  1060,
  640
 ],
 "floating-woman": [
  5,
  750,
  340
 ],
 "held-object-goddess": [
  7,
  1260,
  180
 ]
};
export const luoshenFacePoints=Object.fromEntries(Object.entries(tilePoints).map(([id,[tile,x,y]])=>[id,{x:tile*1995+x,y}]));
export function resolveLuoshenHit(world:Point,scale:number,size:Size,actors:readonly SceneActor[],observation?:SceneActor):SceneActor|null{
 const hit=(a:SceneActor,pad=false)=>Math.abs(world.x-a.x*size.width)<=Math.max(a.width*size.width,pad?44/scale:0)/2&&Math.abs(world.y-a.y*size.height)<=Math.max(a.height*size.height,pad?44/scale:0)/2;
 // Only the painted observation bounds take immediate priority. Touch padding
 // must not complete an observation when the player taps a neighbouring face.
 if(observation&&hit(observation))return observation;
 const faceDistance=(a:SceneActor)=>{const p=luoshenFacePoints[a.id];return p?((world.x-p.x)/16)**2+((world.y-p.y)/20)**2:Infinity;};
 const faces=actors.filter(a=>a.kind!=='object'&&faceDistance(a)<=1).sort((a,b)=>faceDistance(a)-faceDistance(b));
 if(faces.length)return faces[0];
 const exact=actors.filter(a=>hit(a));
 if(!exact.length&&observation&&hit(observation,true))return observation;
 const pool=exact.length?exact:actors.filter(a=>hit(a,true));
 const rank=(a:SceneActor)=>a.kind==='object'&&a.id!=='boat-0'?0:a.kind==='object'?2:1;
 const distance=(a:SceneActor)=>((world.x-a.x*size.width)/(a.width*size.width/2))**2+((world.y-a.y*size.height)/(a.height*size.height/2))**2;
 return pool.sort((a,b)=>exact.length?rank(a)-rank(b)||distance(a)-distance(b):Math.hypot(world.x-a.x*size.width,world.y-a.y*size.height)-Math.hypot(world.x-b.x*size.width,world.y-b.y*size.height))[0]??null;
}
