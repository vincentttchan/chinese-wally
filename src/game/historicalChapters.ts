import { assetPath } from './assets.ts';

/** Historical paintings have their own runtimes; practice chapters keep their existing model. */
export const historicalChapters = [
  {id:'lantern-festival',title:'宮中鬧元宵',painting:'明代 · 憲宗元宵行樂圖',href:'#lantern-festival',status:'已完成',description:'循着人物的樣貌，看看宮中的元宵遊戲與節慶活動。',image:assetPath('art/lantern-festival/detail-9.jpg'),imageAlt:'憲宗元宵行樂圖局部：黃帳旁的皇帝與庭院中的節慶活動'},
  {id:'kangqu-listening',title:'在人群中聽樂',painting:'清代 · 康衢駢慶',href:'#kangqu-listening',status:'新章節',description:'尋找四位畫中人，從樂隊、儀仗與彩牆讀懂萬壽慶典。',image:assetPath('chapters/kangqu-listening/art/overview.jpg'),imageAlt:'康衢駢慶原畫局部：亭內樂隊、儀仗隊列與吉祥彩牆'},
] as const;

export const kangquChapterDocument = assetPath('chapters/kangqu-listening/index.html');

/** Local files enter the saved chapter directly; web hosting uses the router. */
export function historicalChapterHref(chapter:{id:string;href:string}) {
  return typeof window!=='undefined'&&window.location.protocol==='file:'&&chapter.id==='kangqu-listening'
    ? kangquChapterDocument : chapter.href;
}
