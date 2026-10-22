import {clampView,coverView} from './geometry.ts';
import type {Size} from './geometry.ts';
import {luoshenSize} from './luoshen.ts';
import {luoshenFacePoints} from './luoshenHit.ts';

/** Reserve the same paper area before/after a discovery so revealing art never moves the camera. */
export function luoshenHairLayout(frame:Size,observation:number){
 const stacked=frame.width<700&&frame.height>=frame.width;
 const width=Math.min(288,frame.width-32),right=frame.width<700?16:24;
 const noteMaxHeight=stacked?Math.min(224,Math.max(216,Math.floor(frame.height*.38))):Math.min(272,frame.height-94);
 const note={left:frame.width-right-width,top:stacked?frame.height-90-noteMaxHeight:78,width,height:noteMaxHeight};
 const id=observation===1?'L1':'L7',face=luoshenFacePoints[id],hairTop=id==='L1'?362:326;
 const region={x:face.x/luoshenSize.width,y:(hairTop+face.y)/2/luoshenSize.height};
 const screenAnchor={x:stacked?.5:(16+(note.left-24)/2)/frame.width,y:stacked?(74+note.top-38)/2/frame.height:(78+frame.height-16)/2/frame.height};
 const base=coverView(frame,luoshenSize).scale,scaleRatio=1.5;
 const view=clampView({scale:base*scaleRatio,x:frame.width*screenAnchor.x-region.x*luoshenSize.width*base*scaleRatio,y:frame.height*screenAnchor.y-region.y*luoshenSize.height*base*scaleRatio},frame,luoshenSize);
 return {stacked,note,noteMaxHeight,right,region,screenAnchor,scaleRatio,view,hairTop,face};
}
