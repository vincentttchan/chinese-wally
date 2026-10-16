import {assetPath} from './assets.ts';
import {lanternLocation,lanternSize} from './lanternFestival.ts';
import type {LanternFinding} from './lanternCollection.ts';
export const lanternZhongKuiFocus=lanternLocation(11,830,1110);
export const lanternZhongKuiRegions=[[752,965,150,290],[627,934,119,244],[615,1123,138,178],[882,899,108,348]].map(([x,y,w,h])=>({points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([px,py])=>lanternLocation(11,px,py))}));
const location=lanternZhongKuiFocus;
export const lanternZhongKuiFinding:LanternFinding={
  id:'zhongkui',court:2,title:'鍾馗戲裝',teaser:'鍾馗提袖，小鬼相應',
  crop:{image:assetPath('art/lantern-festival/detail-11.jpg'),sourceWidth:1276,rect:[600,885,410,430]},
  actor:{id:'finding-zhongkui',kind:'observation',name:'鍾馗戲裝',x:location.x,y:location.y,width:150*location.scale/lanternSize.width,height:290*location.scale/lanternSize.height},
  quote:'看我這身戲裝，可認得出來？',
  observe:'留意鍾馗的藍袍與長鬚，再看左側小鬼的俯身、右側小鬼的持杖動作。',
  note:'這位鍾馗裝扮人物身穿藍袍、留着長鬚，與其他化裝人物並列。樣段將鍾馗的轉頭提袖，與三位小鬼的俯身、點頭及持杖動作連成一次呼應。這是遊戲的情景演繹；原畫呈現的是固定姿勢。',
  next:'再看看附近的演出者，衣飾與道具有甚麼不同。',
  collectible:{image:assetPath('art/collectibles/lantern-zhongkui-v1.png'),title:'鍾馗戲裝',caption:'收藏圖樣 · 依畫中鍾馗裝扮創作'},
};
