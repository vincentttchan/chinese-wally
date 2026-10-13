import type {CategoryId,TileId} from './examinationStreetLife.ts';
export type Origin={instanceId:string;partId:string;tile:TileId;x:number;y:number};
export type Phase='intro'|'exploring'|'found'|'observing'|'comparison-done'|'ending'|'complete';
export type State={phase:Phase;seen:('read'|'write')[];collected:Partial<Record<CategoryId,Origin>>;visits:Record<string,number>;hint:number};
export type Action={type:'begin'|'found'|'observe'|'return-bridge'|'finish'|'hint'|'restart'}|{type:'compare';kind:'read'|'write'}|{type:'collect';category:CategoryId;origin:Origin}|{type:'visit';id:string};
export const initialState=(collected:State['collected']={}):State=>({phase:'intro',seen:[],collected,visits:{},hint:0});
export function examinationReducer(s:State,a:Action):State {
 switch(a.type){
 case 'begin':return s.phase==='intro'?{...s,phase:'exploring'}:s;
 case 'found':return s.phase==='exploring'?{...s,phase:'found'}:s;
 case 'observe':return s.phase==='found'?{...s,phase:'observing'}:s;
 case 'compare':{if(s.phase!=='observing'||s.seen.includes(a.kind))return s;const seen=[...s.seen,a.kind];return {...s,seen,phase:seen.length===2?'comparison-done':'observing'};}
 case 'return-bridge':return s.phase==='comparison-done'?{...s,phase:'ending'}:s;
 case 'finish':return s.phase==='ending'?{...s,phase:'complete'}:s;
 case 'collect':return s.collected[a.category]?s:{...s,collected:{...s.collected,[a.category]:a.origin}};
 case 'visit':return {...s,visits:{...s.visits,[a.id]:(s.visits[a.id]??0)+1}};
 case 'hint':return {...s,hint:Math.min(3,s.hint+1)};
 case 'restart':return {...initialState(s.collected),phase:'exploring'};
 }
}
