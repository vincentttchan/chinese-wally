import { level } from './level.ts';
import type { GameLevel } from './level.ts';
import { knowledge } from './knowledge.ts';
import { templeFair, templeKnowledge } from './templeFair.ts';
import type { Point } from './geometry.ts';

export type IntroStep = {title: string; text: string; action: string};
export type ChapterId = 'examination' | 'temple-fair';
export type Chapter = {
  id: ChapterId;
  available?: boolean;
  scene: GameLevel;
  intro: IntroStep[];
  footer: string;
  mission: string;
  evidenceWord: string;
  instruction: string;
  objectives: {exploring: string; ready: string; complete: string};
  guide: string;
  alt: string;
  endingTitle: string;
  knowledgeLabel: string;
  knowledge: typeof knowledge;
  steam?: Point;
  hints: Record<string, {messages: [string, string, string]; region: Point}>;
};

export const chapters: Record<ChapterId, Chapter> = {
  examination: {
    id: 'examination', scene: level,
    intro: [
      {title: '科舉放榜日', text: '今日放榜。\n榜牆前，人聲漸起。', action: '走進此日'},
      {title: '人潮之中', text: '書童回過頭，\n同行的考生已不見蹤影。', action: '聽他的委託'},
      {title: '一樁委託', text: '「請替我找到他。」\n畫中有人，或許見過他的身影。', action: '入畫尋人'},
    ],
    footer: '一卷市井，藏着一場相逢。',
    mission: '替書童尋回考生', evidenceWord: '證詞',
    instruction: '點選畫中人物，聽取證詞。左右拖曳探索，放大可看清細節。',
    objectives: {
      exploring: '有人見過他的身影。觀察畫中人的動作，點選人物聽取證詞。',
      ready: '證詞已錄齊。結合衣着、隨身之物與約定之處，辨認畫中人。',
      complete: '書童與考生，終於相逢。',
    },
    guide: '替書童找回走散的考生。觀察畫中人物，點選問訊；收錄三條證詞後，結合線索辨認考生。',
    alt: '原創科舉放榜日全景古畫，左側榜牆、中央茶攤、右側橋頭與人群',
    endingTitle: '人海相逢', knowledgeLabel: '科舉小知識', knowledge, steam: {x: .406, y: .273},
    hints: {
      copyist: {messages: ['忙於記錄的人，或許比匆匆過客更留意身旁。', '榜文附近，除了抬頭張望的人，也有人低頭忙碌。', '已展開榜牆一帶。留意正伏案持筆的人。'], region: {x: .14, y: .43}},
      'tea-keeper': {messages: ['歇腳買茶的人，常會與招呼客人的人說上幾句。', '沿街看看哪裏有人停下喝茶；招呼客人的人可能記得他。', '已展開茶攤一帶。留意正在提壺招呼客人的掌櫃。'], region: {x: .47, y: .4}},
      'board-observer': {messages: ['擠在人潮裏的人，或許聽過別人離開前說的話。', '榜牆前有人忙着記錄，也有人一邊看、一邊與旁人交談。', '已展開看榜的人群。留意榜文右端、舉手的赭衣人。'], region: {x: .23, y: .29}},
      'scholar-target': {messages: ['衣着、隨身之物與約定之處，三條證詞要一同考慮。', '畫中哪些地方有石欄，適合等候同行的人？', '已展開石橋一帶。將衣衫與隨身物件一同辨認。'], region: {x: .84, y: .55}},
    },
  },
  'temple-fair': {
    id: 'temple-fair', scene: templeFair, available: false,
    intro: [
      {title: '廟會正盛', text: '戲棚開唱，貨郎叫賣。\n滿街都是趕會的人。', action: '走進此日'},
      {title: '便服之中', text: '今日，皇帝也混在人群裏。\n隨行的人都換了尋常衣裳。', action: '聽他的委託'},
      {title: '悄悄尋君', text: '「請替我辨認陛下，別驚動百姓。」\n傳信侍從向你低聲求助。', action: '入畫尋君'},
    ],
    footer: '一場廟會，藏着一位尋常衣着的天子。',
    mission: '悄悄辨認微服的皇帝', evidenceWord: '線索',
    instruction: '點選人物、攤上的物件或看客的動作。左右拖曳探索，放大可看清細節。',
    objectives: {
      exploring: '廟會裏的人與物，或許留下他的痕跡。觀察動作，也留意攤上的小物件。',
      ready: '三條線索已錄。比對衣袖、摺扇，以及看客彼此之間的關係。',
      complete: '你已在人群裏，悄悄辨認出天子。',
    },
    guide: '替傳信侍從辨認微服的皇帝。點選人物問訊、查看物件，並觀察看客的動作。收錄三條線索後，交叉比對衣袖、摺扇與人物關係。',
    alt: '原創城鎮廟會古畫，餅攤、補扇攤、廟門和戲棚之間擠滿趕會的人',
    endingTitle: '人群中的天子', knowledgeLabel: '廟會小知識', knowledge: templeKnowledge,
    hints: {
      'cake-seller': {messages: ['留下痕跡的小事，攤主常會記得。', '看看有人買點心、孩子玩耍的地方。', '已展開食攤一帶，留意做餅的婆婆。'], region: {x: .17, y: .5}},
      'fan-sample': {messages: ['一件修補過的物品，會留下甚麼痕跡？', '手藝人的桌上，或許擺着供客人查看的樣本。', '已展開補扇攤一帶，看看桌上的摺扇。'], region: {x: .47, y: .48}},
      watchers: {messages: ['看戲的人，目光應該落在哪裏？', '戲棚前，留意側頭看向別處的人。', '已展開戲棚附近，觀察看客的目光。'], region: {x: .78, y: .58}},
      'emperor-target': {messages: ['衣袖、摺扇和看客的視線，要放在一起判斷。', '找到相似衣袖與扇子後，再看看誰在暗中留意他。', '已展開看戲的人群，將三條線索交叉比對。'], region: {x: .78, y: .58}},
    },
  },
};

export const chapterFromHash = (hash: string): ChapterId => hash === '#temple-fair' ? 'temple-fair' : 'examination';
export const chapterHref = (id: ChapterId) => id === 'temple-fair' ? '#temple-fair' : '#examination';
