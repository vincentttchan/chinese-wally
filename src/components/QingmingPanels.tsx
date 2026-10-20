import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {CSSProperties,ReactNode} from 'react';
import {placeLanternReply} from '../game/lanternReply.ts';
import {qingmingSize,qingmingIndividualActors} from '../game/qingming.ts';
import type {SceneActor} from '../game/level.ts';
import type {SceneViewport} from './ScrollScene.tsx';

/** Chapter content inside the existing silk note, with the artwork reserved on its left. */
export function QingmingNote({viewport,label,title,children,busy=false,folded=false,onFoldChange,foldedLabel='查看題箋',compact=true,className='',preview,showTitle=false}:{viewport:SceneViewport;label:string;title:string;children:ReactNode;busy?:boolean;folded?:boolean;onFoldChange?:(folded:boolean)=>void;foldedLabel?:string;compact?:boolean;className?:string;preview?:ReactNode;showTitle?:boolean}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{if(!busy&&!folded)ref.current?.focus({preventScroll:true});},[title,busy,folded]);
 const width=Math.min(viewport.frame.width>=1000?400:350,viewport.frame.width-32);
 const style={'--note-x':`${Math.max(16,viewport.frame.width-width-24)}px`,'--note-y':`${Math.max(130,Math.min(180,viewport.frame.height-540))}px`,'--note-width':`${width}px`} as CSSProperties;
 if(folded&&onFoldChange)return <button className="lantern-quiet-button qingming-note-reopen" aria-label={`展開題箋：${title}`} aria-expanded={false} disabled={busy} onClick={()=>onFoldChange(false)}>{foldedLabel}</button>;
 return <section ref={ref} tabIndex={-1} className={`lantern-observation-note ${busy?'is-changing':''} ${compact?'qingming-compact-note':''} ${className}`} style={style} aria-label={title} aria-busy={busy} inert={busy}>{onFoldChange&&<button className="lantern-text-button qingming-note-fold" aria-label="收起題箋，先看原畫" aria-expanded={true} onClick={()=>onFoldChange(true)}>收起題箋</button>}<p className="lantern-observation-eyebrow">{label}</p>{preview}<h2 className={compact&&!showTitle?'sr-only':undefined}>{title}</h2>{children}</section>;
}

/** Same live character bubble and tail as the approved chapter, with independent coordinates. */
export function QingmingSpeech({actor,viewport,text,action,onAction,avoidNote=false}:{actor:SceneActor;viewport:SceneViewport;text:string;action?:string;onAction?:()=>void;avoidNote?:boolean}){
 const ref=useRef<HTMLElement>(null);
 const [reserved,setReserved]=useState<{left:number;top:number;width:number;height:number}[]>([]);
 useEffect(()=>{if(action)ref.current?.focus({preventScroll:true});},[text,action]);
 useLayoutEffect(()=>{
  if(!avoidNote){setReserved([]);return;}
  const main=ref.current?.closest('main'),note=main?.querySelector<HTMLElement>('.lantern-observation-note');
  if(!main||!note)return;
  const measure=()=>{const root=main.getBoundingClientRect(),rect=note.getBoundingClientRect();setReserved([{left:rect.left-root.left,top:rect.top-root.top,width:rect.width,height:rect.height}]);};
  measure();const observer=new ResizeObserver(measure);observer.observe(note);return()=>observer.disconnect();
 },[avoidNote,viewport,text]);
 const x=viewport.view.x+actor.x*qingmingSize.width*viewport.view.scale;
 const y=viewport.view.y+actor.y*qingmingSize.height*viewport.view.scale;
 // A clipped speaker must still expose the required continuation action.
 if(!action&&(x<0||x>viewport.frame.width||y<0||y>viewport.frame.height))return null;
 const p=placeLanternReply(actor,qingmingIndividualActors,viewport.view,viewport.frame,text,0,action?18:16,action?50:0,qingmingSize,reserved);
 const label=actor.kind==='witness'||actor.kind==='target'?'畫中人物 · 遊戲虛構對白':'畫中細節 · 原畫觀察提示';
 return <section ref={ref} tabIndex={-1} className="lantern-emperor-speech" data-speaker={actor.id} aria-label={`${actor.name} · ${label}`} style={{left:p.left,top:p.top,width:p.width}}>
  <div className={`lantern-character-reply ${action?'has-finding emperor-speech-bubble':''} tail-${p.tailSide}`} style={{'--reply-tail-x':`${p.tailX}px`,'--reply-tail-y':`${p.tailY}px`} as CSSProperties}>
   <p role="status">{text}</p>{action&&<button className="emperor-speech-action" onClick={onAction}>{action}<span aria-hidden="true"> →</span></button>}
  </div>
 </section>;
}
