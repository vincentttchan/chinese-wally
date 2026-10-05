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
  image: '/art/examination-panorama-v2.png',
  introduction: '放榜的人潮沖散了書童與考生。循着兩條線索，替他們找到彼此。',
  ending: '原來他避開榜前的人潮，到橋邊等書童。隔着熙攘人海，兩人終於會合了。',
  actors: [
    { id: 'copyist', kind: 'witness', name: '抄榜人', x: .217, y: .671, width: .069, height: .172, quote: '與書童同行的那位考生，穿青色長衫。', search: '找正在持筆抄榜的人', clueTitle: '一襲青衫' },
    { id: 'tea-keeper', kind: 'witness', name: '茶攤掌櫃', x: .434, y: .624, width: .054, height: .178, quote: '那人背着方形書箱，方才往橋邊去了。', search: '找提着茶壺的掌櫃', clueTitle: '書箱與去向' },
    { id: 'scholar-scroll', kind: 'candidate', name: '候選考生一', x: .653, y: .705, width: .055, height: .226 },
    { id: 'scholar-brown', kind: 'candidate', name: '候選考生二', x: .757, y: .696, width: .066, height: .226 },
    { id: 'scholar-target', kind: 'target', name: '候選考生三', x: .911, y: .676, width: .059, height: .205 },
  ] satisfies SceneActor[],
};
