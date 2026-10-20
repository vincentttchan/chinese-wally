import {clampView,coverView} from './geometry.ts';
import type {Size} from './geometry.ts';
import {luoshenSize} from './luoshen.ts';
/** Include motion and the old figure's mask, rather than just the face or streamer. */
export const figureBounds={left:8*1995+690,right:8*1995+980,top:350,bottom:720};
export function luoshenFigureLayout(frame:Size){
 const stacked=frame.width<700&&frame.height>=500&&frame.height>=frame.width;
 const base=coverView(frame,luoshenSize).scale,noteWidth=Math.min(288,frame.width-32);
 const availableWidth=stacked?frame.width-24:Math.max(1,frame.width-noteWidth-72);
 const scaleRatio=Math.max(1,Math.min(stacked?1.45:1.6,availableWidth/((figureBounds.right-figureBounds.left)*base)));
 const region={x:(8*1995+835)/luoshenSize.width,y:535/943};
 const screenAnchor={x:stacked?.5:(24+availableWidth/2)/frame.width,y:stacked?.30:.5};
 const scale=base*scaleRatio;
 const view=clampView({scale,x:frame.width*screenAnchor.x-region.x*luoshenSize.width*scale,y:frame.height*screenAnchor.y-535*scale},frame,luoshenSize);
 const bottom=view.y+figureBounds.bottom*scale;
 // The clamped camera is authoritative: reserve paper below the actual hem.
 const noteMaxHeight=stacked?Math.max(96,Math.min(240,Math.floor(frame.height-16-bottom-12))):Math.max(96,frame.height-166);
 return {stacked,region,screenAnchor,scaleRatio,view,noteMaxHeight};
}
