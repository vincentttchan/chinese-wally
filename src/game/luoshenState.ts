import {luoshenSteps,luoshenEnding,luoshenCollectibles} from './luoshen.ts';
export type LuoshenPhase='intro'|'search'|'found'|'observe'|'interpret'|'ending'|'complete';
export type LuoshenState={phase:LuoshenPhase;index:number;observation:number;ending:number;endingSeen:boolean;detailSeen?:string;cloudCarSeen?:boolean;hairSeen?:boolean;farewellSeen?:boolean;focusPreference?:boolean;resumePhase?:Exclude<LuoshenPhase,'intro'>;origins:Record<string,string>};
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
     if(state.resumePhase==='observe'&&saved.detailSeen===luoshenSteps[state.index].observations[state.observation]?.id)state.detailSeen=saved.detailSeen;
     if(state.index===4&&state.observation===0&&state.resumePhase==='observe'&&saved.cloudCarSeen===true)state.cloudCarSeen=true;
     if(state.index===2&&state.observation<2&&state.resumePhase==='observe'&&saved.hairSeen===true)state.hairSeen=true;
     if(state.index===3&&state.observation<2&&state.resumePhase==='observe'&&saved.farewellSeen===true)state.farewellSeen=true;
    }else{
     state.resumePhase=state.ending===luoshenEnding.length?'complete':'ending';
     state.endingSeen=state.ending<luoshenEnding.length&&saved.endingSeen===true;
    }
   }
  }
 }catch{/* Storage unavailable: play in memory. */}
 return state;
}
export type LuoshenAction={type:'focus';value:boolean}|{type:'begin'}|{type:'find';id:string}|{type:'look'}|{type:'observe'|'notice-detail'|'continue-detail'|'notice-cloudcar'|'continue-cloudcar'|'notice-hair'|'continue-hair'|'notice-farewell'|'continue-farewell';id:string;step:number;observation:number}|{type:'next'}|{type:'end-observe';id:string;step:number}|{type:'end-next'}|{type:'collect';category:string;actorId:string}|{type:'restart'};
export function luoshenReducer(state:LuoshenState,action:LuoshenAction):LuoshenState{
 switch(action.type){
 case 'focus':return {...state,focusPreference:action.value};
 case 'begin':return state.phase==='intro'?{...state,phase:state.resumePhase??(state.index===6?(state.ending===luoshenEnding.length?'complete':'ending'):'search'),resumePhase:undefined}:state;
 case 'find':return state.phase==='search'&&luoshenSteps[state.index]?.id===action.id?{...state,phase:'found'}:state;
 case 'look':return state.phase==='found'?{...state,phase:'observe',observation:0}:state;
 case 'notice-detail':return state.phase==='observe'&&action.step===state.index&&action.observation===state.observation&&luoshenSteps[state.index]?.observations[state.observation]?.id===action.id?{...state,detailSeen:action.id}:state;
 case 'continue-detail':{
  if(state.detailSeen!==action.id)return state;const next=luoshenReducer(state,{...action,type:'observe'});if(next===state)return state;
  const {detailSeen:_,...rest}=next;return rest;
 }
 case 'notice-cloudcar':return state.phase==='observe'&&state.index===4&&state.observation===0&&action.step===4&&action.observation===0&&action.id==='cloud-car'?{...state,cloudCarSeen:true}:state;
 case 'continue-cloudcar':{
  if(!state.cloudCarSeen||state.index!==4||state.observation!==0)return state;
  const next=luoshenReducer(state,{...action,type:'observe'});if(next===state)return state;
  const {cloudCarSeen:_,...rest}=next;return rest;
 }
 case 'notice-hair':return state.phase==='observe'&&state.index===2&&state.observation<2&&action.step===state.index&&action.observation===state.observation&&luoshenSteps[2].observations[state.observation].id===action.id?{...state,hairSeen:true}:state;
 case 'continue-hair':{
  if(!state.hairSeen||state.index!==2||state.observation>=2)return state;
  const next=luoshenReducer(state,{...action,type:'observe'});
  if(next===state)return state;
  const {hairSeen:_,...rest}=next;return rest;
 }
 case 'notice-farewell':return state.phase==='observe'&&state.index===3&&state.observation<2&&action.step===state.index&&action.observation===state.observation&&luoshenSteps[3].observations[state.observation].id===action.id?{...state,farewellSeen:true}:state;
 case 'continue-farewell':{
  if(!state.farewellSeen||state.index!==3||state.observation>=2)return state;
  const next=luoshenReducer(state,{...action,type:'observe'});
  if(next===state)return state;
  const {farewellSeen:_,...rest}=next;return rest;
 }
 case 'observe':{if(state.phase!=='observe'||action.step!==state.index||action.observation!==state.observation)return state;const items=luoshenSteps[state.index].observations;if(items[state.observation]?.id!==action.id)return state;return state.observation+1===items.length?{...state,phase:'interpret'}:{...state,observation:state.observation+1};}
 case 'next':return state.phase==='interpret'?{...state,index:state.index+1,observation:0,phase:state.index===5?'ending':'search'}:state;
 case 'end-observe':return state.phase==='ending'&&action.step===state.ending&&luoshenEnding[state.ending]?.observation.id===action.id?{...state,endingSeen:true}:state;
 case 'end-next':return state.phase==='ending'&&state.endingSeen?{...state,ending:state.ending+1,endingSeen:false,phase:state.ending===luoshenEnding.length-1?'complete':'ending'}:state;
 case 'collect':return state.origins[action.category]?state:{...state,origins:{...state.origins,[action.category]:action.actorId}};
 case 'restart':return {phase:'intro',index:0,observation:0,ending:0,endingSeen:false,focusPreference:state.focusPreference,origins:state.origins};
 }
}
export function saveLuoshen(s:LuoshenState){
 try{localStorage.setItem(luoshenSaveKey,JSON.stringify({version:2,index:s.index,phase:s.phase==='intro'?(s.resumePhase??(s.index===6?(s.ending===luoshenEnding.length?'complete':'ending'):'search')):s.phase,observation:s.observation,ending:s.ending,endingSeen:s.endingSeen,detailSeen:s.detailSeen,cloudCarSeen:s.cloudCarSeen||undefined,hairSeen:s.hairSeen||undefined,farewellSeen:s.farewellSeen||undefined,focusPreference:s.focusPreference??true,origins:s.origins}));return true;}
 catch{return false;}
}
