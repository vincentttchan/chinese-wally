import { assetPath } from './assets.ts';

/** Historical paintings have their own runtimes; practice chapters keep their existing model. */
export const historicalChapters = [
  {id:'luoshen',title:'洛水之間',painting:'宋摹本 · 洛神賦圖',href:'#luoshen',status:'可玩初版',description:'追尋曹植與洛神的六處身影，從原畫觀察讀出相遇、離別與追懷。',image:assetPath('art/luoshen/cover.jpg'),imageAlt:'洛神賦圖宋摹本局部：曹植與同行者在岸上初見神女'},
  {id:'lantern-festival',title:'宮中鬧元宵',painting:'明代 · 憲宗元宵行樂圖',href:'#lantern-festival',status:'已完成',description:'循着人物的樣貌，看看宮中的元宵遊戲與節慶活動。',image:assetPath('art/lantern-festival/detail-9.jpg'),imageAlt:'憲宗元宵行樂圖局部：黃帳旁的皇帝與庭院中的節慶活動'},
  {id:'kangqu-listening',title:'在人群中聽樂',painting:'清代 · 康衢駢慶',href:'#kangqu-listening',status:'新章節',description:'尋找四位畫中人，從樂隊、儀仗與彩牆讀懂萬壽慶典。',image:assetPath('chapters/kangqu-listening/art/overview.jpg'),imageAlt:'康衢駢慶原畫局部：亭內樂隊、儀仗隊列與吉祥彩牆'},
  {id:'qingming-shanghe',title:'清明上河圖',painting:'北宋 · 張擇端',href:'#qingming-shanghe',status:'新章節',description:'由五位畫中人接力引路，對讀原畫與《東京夢華錄》，看船運、店舖與城市服務。',image:assetPath('art/qingming/cover.jpg'),imageAlt:'清明上河圖局部：酒樓門面、店招與街市人群'},
] as const;

export const kangquChapterDocument = assetPath('chapters/kangqu-listening/index.html');

/** Local files enter the saved chapter directly; web hosting uses the router. */
export function historicalChapterHref(chapter:{id:string;href:string}) {
  return typeof window!=='undefined'&&window.location.protocol==='file:'&&chapter.id==='kangqu-listening'
    ? kangquChapterDocument : chapter.href;
}
