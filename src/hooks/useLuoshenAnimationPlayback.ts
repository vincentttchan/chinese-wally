import {useEffect,useRef,useState} from 'react';
export type LuoshenAnimationKind='bird'|'ribbon'|'dragon';
export type LuoshenPlaybackMode='idle'|'offered'|'preparing'|'playing'|'still'|'failed';
type Playback={scope:string|null;kind:LuoshenAnimationKind|null;mode:LuoshenPlaybackMode;ticket:number};
/** A single transient owner: switching animations invalidates callbacks from its predecessor. */
export function useLuoshenAnimationPlayback(scope:string|null,cameraBusy:boolean,pendingCollections:number){
 const sequence=useRef(0);
 const [state,setState]=useState<Playback>({scope,kind:null,mode:'idle',ticket:0});
 useEffect(()=>{setState({scope,kind:null,mode:'idle',ticket:++sequence.current});},[scope]);
 useEffect(()=>{if(state.scope===scope&&state.mode==='preparing'&&!cameraBusy&&!pendingCollections)setState(old=>old.ticket===state.ticket?{...old,mode:'playing'}:old);},[scope,state,cameraBusy,pendingCollections]);
 const replace=(kind:LuoshenAnimationKind|null,mode:LuoshenPlaybackMode)=>{if(scope!==null||kind===null)setState({scope,kind,mode,ticket:++sequence.current});};
 const settle=(mode:'still'|'failed',ticket?:number)=>setState(old=>old.scope===scope&&old.kind&&(ticket===undefined||ticket===old.ticket)&&(old.mode==='playing'||old.mode==='preparing')?{...old,mode}:old);
 const current=state.scope===scope?state:{scope,kind:null,mode:'idle' as const,ticket:state.ticket};
 return {...current,offer:(kind:LuoshenAnimationKind)=>replace(kind,'offered'),play:(kind:LuoshenAnimationKind)=>replace(kind,'preparing'),showOriginal:(kind:LuoshenAnimationKind)=>replace(kind,'still'),original:()=>setState(old=>old.scope===scope&&old.kind?{...old,mode:'still'}:old),finish:(ticket?:number)=>settle('still',ticket),fail:(ticket?:number)=>settle('failed',ticket),close:()=>replace(null,'idle')};
}
