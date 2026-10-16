import {lanternLocation} from './lanternFestival.ts';
import {lanternFindings} from './lanternCollection.ts';
import type {LanternFinding} from './lanternCollection.ts';

export const lanternTheatreFocus=lanternLocation(7,480,701);
export const lanternTheatreRegions=[[244,650,100,150],[410,685,145,150],[640,485,104,260]].map(([x,y,w,h])=>({points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([px,py])=>lanternLocation(7,px,py))}));
// The theatre sample collects the specific monk motif, shared with the main journal.
export const lanternTheatreFinding:LanternFinding=lanternFindings.find(finding=>finding.id==='costume')!;
