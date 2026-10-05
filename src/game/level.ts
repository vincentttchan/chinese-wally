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
  image: '/art/examination-scroll.png',
  introduction: '放榜的人潮沖散了書童與考生。循着兩條線索，替他們找到彼此。',
  ending: '原來他避開榜前的人潮，到橋邊等書童。隔着熙攘人海，兩人終於會合了。',
  actors: [
    { id: 'copyist', kind: 'witness', name: '抄榜人', x: .151, y: .734, width: .052, height: .18, quote: '與書童同行的那位考生，穿青色長衫。', search: '找正在持筆抄榜的人', clueTitle: '一襲青衫' },
    { id: 'tea-keeper', kind: 'witness', name: '茶攤掌櫃', x: .430, y: .672, width: .044, height: .272, quote: '那人背着方形書箱，方才往橋邊去了。', search: '找提着茶壺的掌櫃', clueTitle: '書箱與去向' },
    { id: 'scholar-scroll', kind: 'candidate', name: '候選考生一', x: .690, y: .739, width: .045, height: .275 },
    { id: 'scholar-brown', kind: 'candidate', name: '候選考生二', x: .785, y: .669, width: .043, height: .24 },
    { id: 'scholar-target', kind: 'target', name: '候選考生三', x: .881, y: .631, width: .035, height: .215 },
  ] satisfies SceneActor[],
};
