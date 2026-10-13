import { assetPath } from './assets.ts';
export type PaintingTile = {id: string; image: string; x: number; width: number; y?: number; height?: number; transform?: string};
/** Normalized top-left rectangle in the unchanged full painting. */
export type PaintingCrop = {x: number; y: number; width: number; height: number};

export type SceneActor = {
  id: string;
  kind: 'witness' | 'object' | 'observation' | 'candidate' | 'target';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  portrait?: PaintingCrop;
  quote?: string;
  clueTitle?: string;
  evidenceId?: string;
  /** Extra story notes, listed separately from the main optional hints. */
  optional?: boolean;
  mismatch?: string;
};

export type GameLevel = {
  title: string;
  subtitle: string;
  image: string;
  detailTiles?: PaintingTile[];
  introduction: string;
  ending: string;
  actors: SceneActor[];
};

export const isEvidence = (actor: SceneActor) => ['witness', 'object', 'observation'].includes(actor.kind);
export const evidenceId = (actor: SceneActor) => actor.evidenceId ?? actor.id;
export const getEvidenceActors = (scene: GameLevel) => scene.actors.filter(actor => isEvidence(actor) && evidenceId(actor) === actor.id);
export const getMainEvidenceActors = (scene: GameLevel) => getEvidenceActors(scene).filter(actor => !actor.optional);
export const evidenceLabel = (actor: SceneActor) => actor.kind === 'object' ? '物件細節' : actor.kind === 'observation' ? '現場觀察' : '人物證詞';

export const level = {
  title: '榜下尋人',
  subtitle: '科舉放榜日',
  image: assetPath('/art/examination-dense-scroll-v3.png'),
  detailTiles: [
    {id: 'board', image: assetPath('/art/hd/board.png'), x: 0, width: 1 / 3},
    {id: 'tea', image: assetPath('/art/hd/tea.png'), x: 1 / 3, width: 1 / 3},
    {id: 'bridge', image: assetPath('/art/hd/bridge-v2.png'), x: 2 / 3, width: 1 / 3},
  ] satisfies PaintingTile[],
  introduction: '放榜的人潮沖散了書童與考生。開始前先記住人物圖，入畫後找回走散的考生；需要幫忙時，可以問訊或查看文字提示。',
  ending: '原來他避開榜前的人潮，到橋邊等書童。隔着熙攘人海，兩人終於會合了。',
  actors: [
    { id: 'copyist', kind: 'witness', name: '抄榜人', x: .0525, y: .395, width: .029, height: .112, quote: '與書童同行的那位考生，穿青色長衫。', clueTitle: '一襲青衫' },
    { id: 'tea-keeper', kind: 'witness', name: '茶攤掌櫃', x: .413, y: .275, width: .026, height: .125, quote: '那位考生買茶時，隨身帶着一只方形書箱。', clueTitle: '隨身書箱' },
    { id: 'board-observer', kind: 'witness', name: '榜前圍觀者', x: .196, y: .218, width: .029, height: .145, quote: '方才有個考生嫌這裏擠，說要到有石欄的地方等同行的人。', clueTitle: '石欄之約' },
    { id: 'scholar-scroll', kind: 'candidate', name: '候選考生一', x: .721, y: .805, width: .022, height: .155, mismatch: '他拿着長卷。剛才圖中的考生帶着方形書箱，再找找看。' },
    { id: 'scholar-brown', kind: 'candidate', name: '候選考生二', x: .762, y: .243, width: .020, height: .145, mismatch: '他的衣衫顏色不同。剛才圖中的考生穿青色長衫，再找找看。' },
    { id: 'scholar-target', kind: 'target', name: '候選考生三', x: .792, y: .725, width: .022, height: .162 },
  ] satisfies SceneActor[],
};

export const witnesses = level.actors.filter(actor => actor.kind === 'witness');
