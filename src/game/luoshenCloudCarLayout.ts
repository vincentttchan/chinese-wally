import {coverView,clampView} from './geometry.ts';
import type {Size} from './geometry.ts';
import {luoshenSize} from './luoshen.ts';
export function luoshenCloudCarLayout(frame:Size){
 const stacked=frame.width<700&&frame.height>=frame.width;
 const note={left:frame.width-Math.min(288,frame.width-32)-16,top:78,width:Math.min(288,frame.width-32),height:164};
 const evidence={left:6050,right:6550,top:100,bottom:675};
 const available=stacked?{left:16,right:frame.width-16,top:note.top+note.height+12,bottom:frame.height-94}:{left:16,right:note.left-16,top:78,bottom:frame.height-94};
 const scale=Math.min((available.right-available.left)/(evidence.right-evidence.left),(available.bottom-available.top)/(evidence.bottom-evidence.top));
 const region={x:(evidence.left+evidence.right)/2/luoshenSize.width,y:(evidence.top+evidence.bottom)/2/luoshenSize.height};
 const screenAnchor={x:(available.left+available.right)/2/frame.width,y:(available.top+available.bottom)/2/frame.height};
 const view=clampView({scale,x:frame.width*screenAnchor.x-region.x*luoshenSize.width*scale,y:frame.height*screenAnchor.y-region.y*luoshenSize.height*scale},frame,luoshenSize);
 view.y=frame.height*screenAnchor.y-region.y*luoshenSize.height*scale;
 return {stacked,note,evidence,view,region,screenAnchor,scaleRatio:scale/coverView(frame,luoshenSize).scale,minimumScaleRatio:Math.min(1,scale/coverView(frame,luoshenSize).scale)};
}
