import {useEffect,useRef} from 'react';
import type {CSSProperties,ReactNode} from 'react';
import {placeLanternReply} from '../game/lanternReply.ts';
import {qingmingSize,qingmingPeople,qingmingNeighbours} from '../game/qingming.ts';
import type {SceneActor} from '../game/level.ts';
import type {SceneViewport} from './ScrollScene.tsx';

/** Chapter content inside the existing silk note, with the artwork reserved on its left. */
export function QingmingNote({viewport,label,title,children,busy=false}:{viewport:SceneViewport;label:string;title:string;children:ReactNode;busy?:boolean}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{if(!busy)ref.current?.focus({preventScroll:true});},[title,busy]);
 const width=Math.min(viewport.frame.width>=1000?400:350,viewport.frame.width-32);
 const style={'--note-x':`${Math.max(16,viewport.frame.width-width-24)}px`,'--note-y':`${Math.max(130,Math.min(180,viewport.frame.height-540))}px`,'--note-width':`${width}px`} as CSSProperties;
 return <section ref={ref} tabIndex={-1} className={`lantern-observation-note ${busy?'is-changing':''}`} style={style} aria-label={title} aria-busy={busy} inert={busy}><p className="lantern-observation-eyebrow">{label}</p><h2>{title}</h2>{children}</section>;
}

/** Same live character bubble and tail as the approved chapter, with independent coordinates. */
export function QingmingSpeech({actor,viewport,text,action,onAction}:{actor:SceneActor;viewport:SceneViewport;text:string;action?:string;onAction?:()=>void}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{if(action)ref.current?.focus({preventScroll:true});},[text,action]);
 const x=viewport.view.x+actor.x*qingmingSize.width*viewport.view.scale;
 const y=viewport.view.y+actor.y*qingmingSize.height*viewport.view.scale;
 if(x<0||x>viewport.frame.width||y<0||y>viewport.frame.height)return null;
 const people=[...qingmingPeople.map(p=>p.actor),...qingmingNeighbours.map(p=>p.actor)];
 const p=placeLanternReply(actor,people,viewport.view,viewport.frame,text,0,action?18:16,action?50:0,qingmingSize);
 return <section ref={ref} tabIndex={-1} className="lantern-emperor-speech" aria-label="畫中人物 · 遊戲虛構對白" style={{left:p.left,top:p.top,width:p.width}}>
  <div className={`lantern-character-reply ${action?'has-finding emperor-speech-bubble':''} tail-${p.tailSide}`} style={{'--reply-tail-x':`${p.tailX}px`,'--reply-tail-y':`${p.tailY}px`} as CSSProperties}>
   <p role="status">{text}</p>{action&&<button className="emperor-speech-action" onClick={onAction}>{action}<span aria-hidden="true"> →</span></button>}
  </div>
 </section>;
}
