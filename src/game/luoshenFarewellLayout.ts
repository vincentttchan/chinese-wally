import {clampView,coverView} from './geometry.ts';
import type {Size} from './geometry.ts';
import {luoshenSize} from './luoshen.ts';
import {luoshenFacePoints} from './luoshenHit.ts';
export type FarewellStage='goddess'|'cao'|'pair';
/** Original detail-4: keep both complete figures in their actual positions in the final view. */
export const farewellEvidence={left:8000,right:8610,top:480,bottom:842};
export function luoshenFarewellLayout(frame:Size,stage:FarewellStage){
 const stacked=frame.width<700&&frame.height>=frame.width,pair=stage==='pair';
 const width=Math.min(288,frame.width-32),right=frame.width<700?16:24;
 const noteMaxHeight=pair?148:Math.min(frame.height-94,frame.height<540?216:244);
 const note={left:frame.width-right-width,top:78,width,height:noteMaxHeight};
 const base=coverView(frame,luoshenSize).scale;
 const face=luoshenFacePoints[stage==='cao'?'C3':'L8'],hairTop=stage==='cao'?480:550;
 const scale=pair?Math.min(base*1.4,(stacked?frame.width-48:note.left-48)/(farewellEvidence.right-farewellEvidence.left)):base*1.5;
 const region=pair?{x:(farewellEvidence.left+farewellEvidence.right)/2/luoshenSize.width,y:(farewellEvidence.top+farewellEvidence.bottom)/2/luoshenSize.height}:{x:face.x/luoshenSize.width,y:face.y/luoshenSize.height};
 const faceY=stacked?Math.min(frame.height-116,Math.max((note.top+note.height+12+frame.height-110)/2,note.top+note.height+12+(face.y-hairTop)*scale)):frame.height*.52;
 const screenAnchor={x:stacked?.5:(16+(note.left-24)/2)/frame.width,y:pair?.55:faceY/frame.height};
 const view=clampView({scale,x:frame.width*screenAnchor.x-region.x*luoshenSize.width*scale,y:frame.height*screenAnchor.y-region.y*luoshenSize.height*scale},frame,luoshenSize);
 return {stacked,pair,region,screenAnchor,view,note,noteMaxHeight,right,scaleRatio:scale/base,minimumScaleRatio:Math.min(1,scale/base),artHeight:frame.height<540?60:84,face,hairTop};
}
