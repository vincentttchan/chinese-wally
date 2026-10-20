import type {Size} from './geometry.ts';
export type LuoshenPanelRect={left:number;top:number;width:number;height:number};
export const samePanelRect=(a:LuoshenPanelRect|null,b:LuoshenPanelRect|null)=>a===b||Boolean(a&&b&&Math.abs(a.left-b.left)<1&&Math.abs(a.top-b.top)<1&&Math.abs(a.width-b.width)<1&&Math.abs(a.height-b.height)<1);
/** Keep the existing quiet notice in free painting space, outside reading controls. */
export function luoshenNoticePlacement(frame:Size,note:LuoshenPanelRect|null){
 if(frame.height<500&&note){
  const freeLeft=note.left-24,freeRight=frame.width-note.left-note.width-24;
  const width=Math.max(160,Math.min(340,Math.max(freeLeft,freeRight)));
  return {left:freeLeft>=freeRight?16:frame.width-width-16,top:null,bottom:88,width};
 }
 if(note&&note.top>frame.height*.4)return {left:16,top:72,bottom:null,width:Math.min(340,frame.width-32)};
 return {left:(frame.width-Math.min(340,frame.width-32))/2,top:null,bottom:100,width:Math.min(340,frame.width-32)};
}
