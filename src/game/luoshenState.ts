import {luoshenSteps,luoshenEnding,luoshenCollectibles} from './luoshen.ts';
export type LuoshenPhase='intro'|'search'|'found'|'observe'|'interpret'|'ending'|'complete';
export type LuoshenState={phase:LuoshenPhase;index:number;observation:number;ending:number;endingSeen:boolean;focusPreference?:boolean;resumePhase?:Exclude<LuoshenPhase,'intro'>;origins:Record<string,string>};
export const luoshenSaveKey='painting-luoshen-v1';
export function initialLuoshen():LuoshenState{
 const state:LuoshenState={phase:'intro',index:0,observation:0,ending:0,endingSeen:false,focusPreference:true,origins:{}};
 try{
  const saved=JSON.parse(localStorage.getItem(luoshenSaveKey)||'null');
  if(saved?.version===1||saved?.version===2){
   state.index=Number.isInteger(saved.index)&&saved.index>=0&&saved.index<=6?saved.index:0;
   state.ending=state.index===6&&Number.isInteger(saved.ending)&&saved.ending>=0&&saved.ending<=luoshenEnding.length?saved.ending:0;
   state.origins=Object.fromEntries(Object.entries(saved.origins??{}).filter(([k,v])=>typeof v==='string'&&luoshenCollectibles.some(a=>a.category===k&&a.id===v))) as Record<string,string>;
   state.focusPreference=typeof saved.focusPreference==='boolean'?saved.focusPreference:true;
   if(saved.version===2){
    if(state.index<6){
     state.observation=Number.isInteger(saved.observation)&&saved.observation>=0&&saved.observation<luoshenSteps[state.index].observations.length?saved.observation:0;
     state.resumePhase=['search','found','observe','interpret'].includes(saved.phase)?saved.phase:'search';
    }else{
     state.resumePhase=state.ending===luoshenEnding.length?'complete':'ending';
     state.endingSeen=state.ending<luoshenEnding.length&&saved.endingSeen===true;
    }
   }
  }
 }catch{/* Storage unavailable: play in memory. */}
 return state;
}
export type LuoshenAction={type:'focus';value:boolean}|{type:'begin'}|{type:'find';id:string}|{type:'look'}|{type:'observe';id:string;step:number;observation:number}|{type:'next'}|{type:'end-observe';id:string;step:number}|{type:'end-next'}|{type:'collect';category:string;actorId:string}|{type:'restart'};
export function luoshenReducer(state:LuoshenState,action:LuoshenAction):LuoshenState{
 switch(action.type){
 case 'focus':return {...state,focusPreference:action.value};
 case 'begin':return state.phase==='intro'?{...state,phase:state.resumePhase??(state.index===6?(state.ending===luoshenEnding.length?'complete':'ending'):'search'),resumePhase:undefined}:state;
 case 'find':return state.phase==='search'&&luoshenSteps[state.index]?.id===action.id?{...state,phase:'found'}:state;
 case 'look':return state.phase==='found'?{...state,phase:'observe',observation:0}:state;
 case 'observe':{if(state.phase!=='observe'||action.step!==state.index||action.observation!==state.observation)return state;const items=luoshenSteps[state.index].observations;if(items[state.observation]?.id!==action.id)return state;return state.observation+1===items.length?{...state,phase:'interpret'}:{...state,observation:state.observation+1};}
 case 'next':return state.phase==='interpret'?{...state,index:state.index+1,observation:0,phase:state.index===5?'ending':'search'}:state;
 case 'end-observe':return state.phase==='ending'&&action.step===state.ending&&luoshenEnding[state.ending]?.observation.id===action.id?{...state,endingSeen:true}:state;
 case 'end-next':return state.phase==='ending'&&state.endingSeen?{...state,ending:state.ending+1,endingSeen:false,phase:state.ending===luoshenEnding.length-1?'complete':'ending'}:state;
 case 'collect':return state.origins[action.category]?state:{...state,origins:{...state.origins,[action.category]:action.actorId}};
 case 'restart':return {phase:'intro',index:0,observation:0,ending:0,endingSeen:false,focusPreference:state.focusPreference,origins:state.origins};
 }
}
export function saveLuoshen(s:LuoshenState){
 try{localStorage.setItem(luoshenSaveKey,JSON.stringify({version:2,index:s.index,phase:s.phase==='intro'?(s.resumePhase??(s.index===6?(s.ending===luoshenEnding.length?'complete':'ending'):'search')):s.phase,observation:s.observation,ending:s.ending,endingSeen:s.endingSeen,focusPreference:s.focusPreference??true,origins:s.origins}));return true;}
 catch{return false;}
}
