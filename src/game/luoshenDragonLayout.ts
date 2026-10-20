import {clampView,coverView} from './geometry.ts';
import type {Size} from './geometry.ts';
import {luoshenSize} from './luoshen.ts';
export const dragonBounds={left:8*1995+1055,right:8*1995+1375,top:155,bottom:450};
export const dragonContextBounds={...dragonBounds,top:40};
export const dragonBirdBounds={left:8*1995+1120,right:8*1995+1330,top:50,bottom:152};
export function luoshenDragonLayout(frame:Size){
 const stacked=frame.width<700&&frame.height>=500&&frame.height>=frame.width,base=coverView(frame,luoshenSize).scale;
 const available=stacked?frame.width-24:Math.max(1,frame.width-Math.min(288,frame.width-32)-72);
 const scaleRatio=Math.max(1,Math.min(stacked?1.5:1.8,available/((dragonBounds.right-dragonBounds.left)*base),(frame.height-24)/((dragonContextBounds.bottom-dragonContextBounds.top)*base)));
 const scale=base*scaleRatio,region={x:(8*1995+1215)/luoshenSize.width,y:245/943};
 // Include both birds. A small shared back control replaces the banner over their wings.
 const screenAnchor={x:stacked?.5:(24+available/2)/frame.width,y:stacked?(12+(245-dragonContextBounds.top)*scale)/frame.height:.5};
 const view=clampView({scale,x:frame.width*screenAnchor.x-region.x*luoshenSize.width*scale,y:frame.height*screenAnchor.y-245*scale},frame,luoshenSize);
 const noteMaxHeight=stacked?Math.max(96,Math.min(240,Math.floor(frame.height-16-(view.y+dragonBounds.bottom*scale)-12))):Math.max(96,frame.height-166);
 return {stacked,region,screenAnchor,scaleRatio,view,noteMaxHeight};
}
