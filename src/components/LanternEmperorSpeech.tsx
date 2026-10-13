import {useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {lanternActors} from '../game/lanternFestival.ts';
import {LanternNotice} from './LanternNotice.tsx';
import {placeLanternReply} from '../game/lanternReply.ts';
import type {SceneActor} from '../game/level.ts';
import type {SceneViewport} from './ScrollScene.tsx';

/** Fictional speech shares the same paper and pointer as the other people. */
export function LanternEmperorSpeech({actor,viewport,text,progress,actionLabel,onContinue}: {
  actor:SceneActor;viewport:SceneViewport;text:string;progress?:number;actionLabel:string;onContinue:()=>void;
}) {
  const [showProgress,setShowProgress]=useState(Boolean(progress));
  useEffect(()=>{
    setShowProgress(Boolean(progress));
    const timer=window.setTimeout(()=>setShowProgress(false),2800);
    return ()=>window.clearTimeout(timer);
  },[progress]);
  const ref=useRef<HTMLElement>(null);
  useEffect(()=>{ref.current?.focus({preventScroll:true});},[text]);
  const placement=placeLanternReply(actor,lanternActors,viewport.view,viewport.frame,text,0,18,50);
  return <>
    {progress&&showProgress&&<LanternNotice duration={2800} text={`尋得第${['一','二','三'][progress-1]}處身影`} detail={`${progress}／3`}/>}
    <section ref={ref} tabIndex={-1} className="lantern-emperor-speech" aria-label="明憲宗的遊戲虛構對白"
    style={{left:placement.left,top:placement.top,width:placement.width} as CSSProperties}
    onKeyDown={event=>{if(event.key==='Tab'){event.preventDefault();ref.current?.querySelector('button')?.focus();}}}>

    <div className={`lantern-character-reply has-finding emperor-speech-bubble tail-${placement.tailSide}`}
      style={{'--reply-tail-x':`${placement.tailX}px`,'--reply-tail-y':`${placement.tailY}px`} as CSSProperties}>
      <p role="status">{text}</p>
      <button className="emperor-speech-action" onClick={onContinue}>{actionLabel}<span aria-hidden="true"> →</span></button>
    </div>
  </section></>;
}
