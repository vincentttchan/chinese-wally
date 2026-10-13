import {lanternActors,lanternLocation,lanternTargets} from './lanternFestival.ts';
import type {Point} from './geometry.ts';

export type PaintingRegion = {points:Point[]};
const sourcePolygon = (tile:number,points:number[][]):PaintingRegion => ({points:points.map(([x,y])=>lanternLocation(tile,x,y))});
/** Invisible robe action registered to original pixels; greyscale applies to the whole painting. */
export const lanternRobeRegion=sourcePolygon(9,[[1100,425],[1135,451],[1158,508],[1185,462],[1202,423],[1230,455],[1243,505],[1258,597],[1222,658],[1072,609],[1049,561],[1083,489],[1074,457]]);
export function lanternPersonRegion(index:number):PaintingRegion {
  const actor=lanternActors.find(item=>item.id===lanternTargets[index].id)!;
  return {points:[{x:actor.x-actor.width/2,y:actor.y-actor.height/2},{x:actor.x+actor.width/2,y:actor.y-actor.height/2},{x:actor.x+actor.width/2,y:actor.y+actor.height/2},{x:actor.x-actor.width/2,y:actor.y+actor.height/2}]};
}
export const lanternArchitectureRegion=sourcePolygon(1,[[260,715],[863,715],[865,840],[260,840]]);
export const lanternCourtyardRegion=sourcePolygon(1,[[650,910],[1120,900],[1110,1300],[650,1280]]);

export const lanternPlatformRegion=sourcePolygon(1,[[250,435],[870,435],[870,860],[250,860]]);
export const lanternPlatformFocus=lanternLocation(1,565,660);
export const lanternCourtyardFocus=lanternLocation(1,900,1090);
