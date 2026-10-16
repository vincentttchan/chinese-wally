import {assetPath} from './assets.ts';
import {lanternLocation,lanternSize} from './lanternFestival.ts';
import type {LanternFinding} from './lanternCollection.ts';

export const lanternStoveFocus=lanternLocation(15,200,400);
export const lanternStoveRegions=[[5,307,143,175],[253,307,147,175],[94,363,194,149]].map(([x,y,w,h])=>({points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([px,py])=>lanternLocation(15,px,py))}));
const location=lanternLocation(15,200,400);
export const lanternStoveFinding:LanternFinding={
  id:'stove',court:1,title:'爐旁取暖',teaser:'熱鬧之外的一點暖意',
  crop:{image:assetPath('art/lantern-festival/detail-15.jpg'),sourceWidth:1296,rect:[0,295,405,225]},
  actor:{id:'finding-stove',kind:'observation',name:'爐旁取暖',x:location.x,y:location.y,width:400*location.scale/lanternSize.width,height:220*location.scale/lanternSize.height},
  quote:'先暖暖手，再去看燈。',observe:'看看兩位童子伸出的雙手，以及他們之間的火爐。',
  note:'原畫裡，兩位童子朝同一座火爐伸手。這一處安靜的小動作，與庭院中的買賣、遊戲並置。',
  next:'再看看附近的人，手裡拿着甚麼。',
  collectible:{image:assetPath('art/collectibles/lantern-stove-v2.png'),title:'爐旁取暖',caption:'收藏圖樣 · 依畫中火爐摹繪'},
};
