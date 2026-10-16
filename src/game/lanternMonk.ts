import {lanternLocation} from './lanternFestival.ts';
import {lanternFindings} from './lanternCollection.ts';
export const lanternMonkFocus=lanternLocation(7,465,660);
export const lanternMonkRegions=[[405,590,115,145]].map(([x,y,w,h])=>({points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([px,py])=>lanternLocation(7,px,py))}));
export const lanternMonkFinding=lanternFindings.find(finding=>finding.id==='costume')!;
