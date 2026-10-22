import {coverView} from './geometry.ts';
import type {Size} from './geometry.ts';
import type {SceneActor} from './level.ts';
import {luoshenSize} from './luoshen.ts';
export const luoshenDetailReplies:Record<string,string>={
 'sleeve-C1':'曹植向兩側展袖，從隊伍中顯出來。','sleeve-attendant':'同行者收攏衣袖，與曹植的姿態不同。',
 'observe-L7':'神女來到坐榻前，與坐榻上的曹植相對。','dragon-link':'龍形在車前相連，帶出牽引車駕的關係。',
 'observe-C4':'曹植在樓船上層，身旁另有同行者。','observe-boatman-left':'舟人在下層操船，與上層乘舟者各有位置。','boat-oar':'長桿伸向水面，連著舟人的動作一起看。',
};
export function luoshenDetailLayout(frame:Size,actor:SceneActor,noteHeight=164){
 const stacked=frame.width<700&&frame.height>=frame.width,note={left:frame.width-Math.min(288,frame.width-32)-16,top:78,width:Math.min(288,frame.width-32),height:noteHeight};
 const area=stacked?{left:16,right:frame.width-16,top:note.top+note.height+12,bottom:frame.height-94}:{left:16,right:note.left-16,top:78,bottom:frame.height-94};
 const base=coverView(frame,luoshenSize).scale,scale=Math.min(base*1.5,(area.right-area.left)/(actor.width*luoshenSize.width+64),(area.bottom-area.top)/(actor.height*luoshenSize.height+64));
 return {note,region:{x:actor.x,y:actor.y},screenAnchor:{x:(area.left+area.right)/2/frame.width,y:(area.top+area.bottom)/2/frame.height},scaleRatio:scale/base,minimumScaleRatio:Math.min(1,scale/base)};
}
