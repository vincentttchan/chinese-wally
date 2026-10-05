export type PaintingTile = {id: string; image: string; x: number; width: number};

export type SceneActor = {
  id: string;
  kind: 'witness' | 'candidate' | 'target';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  quote?: string;
  search?: string;
  clueTitle?: string;
};

export const level = {
  title: '榜下尋人',
  subtitle: '科舉放榜日',
  image: '/art/examination-dense-scroll-v3.png',
  detailTiles: [
    {id: 'board', image: '/art/hd/board.png', x: 0, width: 1 / 3},
    {id: 'tea', image: '/art/hd/tea.png', x: 1 / 3, width: 1 / 3},
    {id: 'bridge', image: '/art/hd/bridge-v2.png', x: 2 / 3, width: 1 / 3},
  ] satisfies PaintingTile[],
  introduction: '放榜的人潮沖散了書童與考生。循着兩條線索，替他們找到彼此。',
  ending: '原來他避開榜前的人潮，到橋邊等書童。隔着熙攘人海，兩人終於會合了。',
  actors: [
    { id: 'copyist', kind: 'witness', name: '抄榜人', x: .0525, y: .395, width: .029, height: .112, quote: '與書童同行的那位考生，穿青色長衫。', search: '找正在持筆抄榜的人', clueTitle: '一襲青衫' },
    { id: 'tea-keeper', kind: 'witness', name: '茶攤掌櫃', x: .413, y: .275, width: .026, height: .125, quote: '那人帶着方形書箱，方才往橋頭去了。', search: '找提着茶壺的掌櫃', clueTitle: '書箱與去向' },
    { id: 'scholar-scroll', kind: 'candidate', name: '候選考生一', x: .721, y: .805, width: .022, height: .155 },
    { id: 'scholar-brown', kind: 'candidate', name: '候選考生二', x: .762, y: .243, width: .020, height: .145 },
    { id: 'scholar-target', kind: 'target', name: '候選考生三', x: .792, y: .725, width: .022, height: .162 },
  ] satisfies SceneActor[],
};
