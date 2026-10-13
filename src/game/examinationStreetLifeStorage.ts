import {categories,objects} from './examinationStreetLife.ts';
import type {State,Origin} from './examinationStreetLifeState.ts';
const key='chinese-wally.examination-street-life.collection.v1';
export function loadExaminationCollection():State['collected'] {
 try {const raw=JSON.parse(localStorage.getItem(key)??'{}');const result:State['collected']={};
 for(const c of categories){const v=raw?.[c.id] as Origin|undefined;if(!v)continue;const o=objects.find(o=>o.id===v.instanceId&&o.category===c.id&&o.tile===v.tile);const p=o?.parts.find((p,i)=>v.partId===o.id+':'+i&&p.x===v.x&&p.y===v.y);if(p)result[c.id]=v;}
 return result;}catch{return {};}
}
export function saveExaminationCollection(value:State['collected']):boolean {try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
