import { level } from './level.ts';
import type { GameLevel, PaintingCrop } from './level.ts';
import { knowledge } from './knowledge.ts';
import type { Point } from './geometry.ts';
import { assetPath } from './assets.ts';

export type IntroStep = {title: string; text: string; action: string};
export type ChapterId = 'examination';
export type Chapter = {
  id: ChapterId;
  available?: boolean;
  scene: GameLevel;
  intro: IntroStep[];
  footer: string;
  mission: string;
  targetDescription: string;
  targetPortrait: string;
  targetPortraitCrop?: PaintingCrop;
  initialRegion: Point;
  evidenceWord: string;
  instruction: string;
  objectives: {exploring: string; complete: string};
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
      {title: '記住這個人', text: '「請替我找到圖片中的考生。」\n他穿青衫，帶着方形書箱。', action: '記住了，開始尋人'},
    ],
    footer: '一卷市井，藏着一場相逢。',
    mission: '替書童尋回考生', evidenceWord: '線索',
    targetDescription: '青色長衫，帶着方形書箱。',
    targetPortrait: assetPath('art/portraits/scholar-cutout-v1.png'),
    initialRegion: {x: .70, y: .5},
    instruction: '回想開始前的人物圖，左右拖曳、放大畫卷，找到後點選他。找不到時按「看看提示」，也可以向畫中人問訊。',
    objectives: {
      exploring: '回想剛才的人物圖，找回考生，找到便可完成。問訊與線索都可選，不必收齊。',
      complete: '書童與考生，終於相逢。',
    },
    guide: '開始前先看清考生的人物圖，準備好才按「記住了，開始尋人」。入畫後人物圖會收起，請回想他的樣子，找到後點選便完成，無需收集線索。找不到時，可按「看看提示」逐步查看文字描述、地標與區域，也可向抄榜人、榜前圍觀者或茶攤掌櫃問訊。預設凝神模式可自行移動觀察範圍，仔細看畫中人物與細節；覺得太難可按右上「彩色」轉為全彩，亦可再切回凝神；所有問訊和觀察都是可選的幫助。',
    alt: '原創科舉放榜日全景古畫，左側榜牆、中央茶攤、右側橋頭與人群',
    endingTitle: '人海相逢', knowledgeLabel: '科舉小知識', knowledge, steam: {x: .406, y: .273},
    hints: {
      copyist: {messages: ['忙於記錄的人，或許比匆匆過客更留意身旁。', '榜文附近，除了抬頭張望的人，也有人低頭忙碌。', '已展開榜牆一帶。留意正伏案持筆的人。'], region: {x: .14, y: .43}},
      'tea-keeper': {messages: ['買茶的人歇腳時，掌櫃也留意了他們的行李。', '沿街看看茶攤，找一位正在招呼客人的掌櫃。', '已展開茶攤一帶。問問掌櫃，聽聽考生隨身帶着甚麼。'], region: {x: .47, y: .49}},
      'board-observer': {messages: ['擠在人潮裏的人，或許聽過別人離開前說的話。', '榜牆前有人忙着記錄，也有人一邊看、一邊與旁人交談。', '已展開看榜的人群。留意榜文右端、舉手的赭衣人。'], region: {x: .23, y: .29}},
      'scholar-target': {messages: ['還記得剛才的考生嗎？他穿青色長衫，身旁有一只方形書箱。', '往畫卷右側找找。他在有石欄的橋邊等候，留意附近穿青衫的人。', '已帶你到石橋一帶。找找穿青衫、帶着方形書箱的人，再點選他。'], region: {x: .84, y: .55}},
    },
  },

};

export const chapterFromHash = (_hash: string): ChapterId => 'examination';
export const chapterHref = (_id: ChapterId) => '#examination';
