import {qingmingStages,qingmingFindings,actorById} from './qingming.ts';
export type QingmingSave={origins:Record<string,string>;read:string[]};
export type QingmingMode='intro'|'search'|'found'|'study'|'conclusion'|'relay'|'epilogue'|'complete';
export type QingmingState={mode:QingmingMode;index:number;step:number;observed:boolean;found:string[];origins:Record<string,string>;read:string[];epilogue:number};
export type QingmingAction={type:'begin'}|{type:'inspect';id:string}|{type:'look'}|{type:'continue'}|{type:'next'}|{type:'collect';id:string;actorId:string}|{type:'restart'}|{type:'finish'}|{type:'review'};
const key='chinese-wally:qingming-shanghe:v1';
export function loadQingming():QingmingSave{
 try{
  const raw=JSON.parse(localStorage.getItem(key)??'null');
  if(!raw||typeof raw!=='object')return {origins:{},read:[]};
  const origins:Record<string,string>={};
  for(const f of qingmingFindings){const id=raw.origins?.[f.id];if(typeof id==='string'&&f.actorIds.includes(id))origins[f.id]=id;}
  return {origins,read:Array.isArray(raw.read)?raw.read.filter((id:unknown)=>typeof id==='string'&&qingmingStages.some(s=>s.id===id&&s.steps.some(x=>x.kind==='source'))):[]};
 }catch{return {origins:{},read:[]};}
}
export function saveQingming(state:QingmingSave){try{localStorage.setItem(key,JSON.stringify({origins:state.origins,read:state.read}));}catch{/* Current play stays available without persistent storage. */}}
export function initialQingming(save:QingmingSave=loadQingming()):QingmingState{return {mode:'intro',index:0,step:0,observed:false,found:[],origins:save.origins,read:save.read,epilogue:0};}
export function qingmingReducer(state:QingmingState,action:QingmingAction):QingmingState{
 const stage=qingmingStages[state.index],step=stage.steps[state.step];
 switch(action.type){
  case 'begin':return state.mode==='intro'?{...state,mode:'search'}:state;
  case 'inspect':
   if(state.mode==='search'&&action.id===stage.subjectId)return {...state,mode:'found',found:stage.personId&&!state.found.includes(stage.personId)?[...state.found,stage.personId]:state.found};
   if(state.mode==='study'&&step?.kind==='observe'&&step.ids.includes(action.id))return {...state,observed:true};
   return state;
  case 'look':return state.mode==='found'?{...state,mode:'study',step:0,observed:false}:state;
  case 'continue':{
   if(state.mode!=='study'||!step||step.kind==='observe'&&!state.observed)return state;
   const read=step.kind==='source'&&!state.read.includes(stage.id)?[...state.read,stage.id]:state.read;
   return {...state,read,step:Math.min(state.step+1,stage.steps.length-1),observed:false,mode:state.step+1<stage.steps.length?'study':'conclusion'};
  }
  case 'next':
   if(state.mode==='conclusion')return {...state,mode:'relay'};
   if(state.mode==='relay')return state.index+1<qingmingStages.length?{...state,index:state.index+1,mode:'search',step:0,observed:false}:{...state,mode:'epilogue',epilogue:0};
   if(state.mode==='epilogue')return {...state,epilogue:Math.min(2,state.epilogue+1)};
   return state;
  case 'collect':{
   const f=qingmingFindings.find(f=>f.id===action.id);
   if(!f||!f.actorIds.includes(action.actorId)||state.origins[f.id]||!actorById(action.actorId))return state;
   return {...state,origins:{...state.origins,[f.id]:action.actorId}};
  }
  case 'restart':return {...initialQingming(state),mode:'search'};
  case 'finish':return state.mode==='epilogue'&&state.epilogue===2?{...state,mode:'complete'}:state;
  case 'review':return state.mode==='complete'?{...state,mode:'epilogue',epilogue:0}:state;
 }
}
