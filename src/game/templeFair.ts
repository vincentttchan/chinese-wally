import { assetPath } from './assets.ts';
import type { GameLevel } from './level.ts';

/** Draft normalized coordinates; align with generated art before making this chapter available. */
export const templeFair: GameLevel = {
  title: '廟會尋蹤',
  subtitle: '微服出巡',
  image: assetPath('/art/temple-fair/scroll.png'),
  introduction: '在趕會的人群裏，從人物、物件與目光中，悄悄辨認微服的皇帝。',
  ending: '青線補過的摺扇、沾粉的右袖，以及兩名看客的目光，都指向這位青灰衣人。你悄悄示意，傳信侍從上前行禮。他收起摺扇，仍低聲問着攤主今日的生意。',
  actors: [
    {id: 'cake-seller', kind: 'witness', name: '餅攤婆婆', x: .15, y: .48, width: .032, height: .14,
      clueTitle: '沾粉的衣袖', quote: '方才有位拿摺扇的客人，替孩子撿起滾到攤下的竹球。右邊袖口沾了麵粉，也沒有急着撣掉。那扇子像是剛補過。'},
    {id: 'fan-sample', kind: 'object', name: '補扇樣本', x: .47, y: .57, width: .036, height: .065,
      clueTitle: '青線補痕', quote: '桌上的白色摺扇，一根扇骨纏了青線。這是攤主的補扇樣本；修補過的摺扇會留下同樣的小痕。'},
    {id: 'watchers', kind: 'observation', name: '戲棚旁的看客', x: .72, y: .64, width: .026, height: .135,
      clueTitle: '目光所向', quote: '戲正唱到熱鬧處，這位看客卻側頭望向人群。另一邊也有一人如此；兩人的目光留意着同一位客人。'},
    {id: 'watcher-right', evidenceId: 'watchers', kind: 'observation', name: '另一名側頭的看客', x: .85, y: .62, width: .026, height: .135,
      clueTitle: '目光所向', quote: '戲正唱到熱鬧處，這位看客卻側頭望向人群。另一邊也有一人如此；兩人的目光留意着同一位客人。'},
    {id: 'visitor-fan', kind: 'candidate', name: '持扇的青衣人', x: .38, y: .76, width: .027, height: .14,
      mismatch: '這柄摺扇沒有青線補痕。再看看物件線索。'},
    {id: 'visitor-flour', kind: 'candidate', name: '食攤邊的客人', x: .25, y: .72, width: .027, height: .14,
      mismatch: '袖上也沾了粉，但摺扇與看客的視線還未吻合。'},
    {id: 'visitor-merchant', kind: 'candidate', name: '帶僕從的商人', x: .62, y: .8, width: .027, height: .14,
      mismatch: '有人跟隨，仍要核對衣袖和摺扇上的小痕。'},
    {id: 'emperor-target', kind: 'target', name: '看戲的青灰衣人', x: .78, y: .65, width: .027, height: .14},
  ],
};

export const templeKnowledge = {
  title: '廟會裏，除了上香還有甚麼？',
  scope: '從廟會的日常生活看起',
  paragraphs: [
    '廟會往往依託祠廟，在特定時日舉行。人們聚在一起，除了祭祀祈福，也可能交易貨物、欣賞表演。',
    '以上海龍華廟會為例，小食與娛樂表演都是重要內容。攤販售賣當地食品，人們也可看皮影戲、花鼓戲等表演。',
    '因此，畫中的香客、餅攤、手藝人與戲棚，可以同在一場廟會裏。各地廟會的時節與習俗有所不同，內容也會隨時代改變。',
  ],
  note: '本關廟會、皇帝與尋人案件均為虛構，畫風參照《清明上河圖》。閱讀以實際廟會資料介紹民間生活，並非還原某位皇帝的行程。',
  question: {
    prompt: '依照文章，哪一組活動可能同時出現在廟會裏？',
    options: ['只有上香，沒有其他活動', '祈福、買賣貨物與欣賞表演', '只有科舉考試與公布榜文'],
    correctIndex: 1,
    explanation: '廟會可包含祭祀祈福、商貿與娛樂活動。畫中的香客、攤販和看戲的人，正好呈現不同活動聚在一起的景象。',
    retryHints: ['再看看第一、二段：祈福之外，人們還會做甚麼？', '', '科舉放榜是另一卷的故事。這裏有香客、攤販和戲棚。'],
  },
  sources: [
    {title: '中國非物質文化遺產網｜上海龍華廟會', url: 'https://www.ihchina.cn/project_details/15122/'},
    {title: '中國民俗學網｜小田〈「廟會」界說〉', url: 'https://www.chinesefolklore.org.cn/upload/news/Attach-20101028160008.pdf'},
  ],
};
