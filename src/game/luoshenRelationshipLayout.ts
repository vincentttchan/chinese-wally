import {clampView,coverView} from './geometry.ts';
import type {Size} from './geometry.ts';
import {luoshenSize} from './luoshen.ts';
/** Verified original faces and the seated/standing relation, not the full decorative garments. */
export const relationshipEvidence={left:11580,right:12080,top:315,bottom:700};
const shortPhoneEvidence={left:11610,right:11990,top:315,bottom:650};
export function luoshenRelationshipLayout(frame:Size){
 const stacked=frame.width<700&&frame.height>=500&&frame.height>=frame.width;
 const evidence=stacked&&frame.height<700?shortPhoneEvidence:relationshipEvidence;
 const center=(evidence.left+evidence.right)/2;
 const base=coverView(frame,luoshenSize).scale,available=stacked?frame.width-24:Math.max(80,frame.width-Math.min(288,frame.width-32)-72);
 const scale=Math.min(base*1.25,(available-16)/(evidence.right-evidence.left));
 const region={x:center/luoshenSize.width,y:490/luoshenSize.height};
 const screenAnchor={x:stacked?.5:(24+available/2)/frame.width,y:stacked?.30:.46};
 const view=clampView({scale,x:frame.width*screenAnchor.x-center*scale,y:frame.height*screenAnchor.y-490*scale},frame,luoshenSize);
 const noteMaxHeight=stacked?Math.max(180,Math.min(220,Math.floor(frame.height-28-(view.y+evidence.bottom*scale)))):Math.max(180,frame.height-166);
 return {stacked,evidence,region,screenAnchor,view,noteMaxHeight,scaleRatio:scale/base,minimumScaleRatio:Math.min(1,scale/base)};
}
