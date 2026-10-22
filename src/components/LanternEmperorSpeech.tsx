import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {CSSProperties,ReactNode} from 'react';
import {lanternActors} from '../game/lanternFestival.ts';
import {LanternNotice} from './LanternNotice.tsx';
import {placeLanternReply} from '../game/lanternReply.ts';
import type {SceneActor} from '../game/level.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import type {Size} from '../game/geometry.ts';
import type {SpeechGeometry} from '../game/lanternReply.ts';

/** Fictional speech shares the same paper and pointer as the other people. */
export function LanternEmperorSpeech({actor,viewport,text,progress,actionLabel,onContinue,people=lanternActors,artworkSize,speakerLabel='明憲宗的遊戲虛構對白',progressText,extraWidth=0,speechGeometry,caption,children,narration=false,trapFocus=true,stablePlacement=false}: {
  actor:SceneActor;viewport:SceneViewport;text:string;progress?:number;actionLabel?:string;onContinue?:()=>void;
  caption?:string;children?:ReactNode;narration?:boolean;trapFocus?:boolean;stablePlacement?:boolean;
  people?:SceneActor[];artworkSize?:Size;speakerLabel?:string;progressText?:string;extraWidth?:number;speechGeometry?:SpeechGeometry;
}) {
  const [showProgress,setShowProgress]=useState(Boolean(progress));
  useEffect(()=>{
    setShowProgress(Boolean(progress));
    const timer=window.setTimeout(()=>setShowProgress(false),2800);
    return ()=>window.clearTimeout(timer);
  },[progress]);
  const ref=useRef<HTMLElement>(null);
  const [measured,setMeasured]=useState<Size>();
  useLayoutEffect(()=>{
    if(!speechGeometry||!ref.current)return;
    const observer=new ResizeObserver(([entry])=>{const bounds=entry.target.getBoundingClientRect();setMeasured(old=>old?.width===bounds.width&&old?.height===bounds.height?old:{width:bounds.width,height:bounds.height});});
    observer.observe(ref.current);return()=>observer.disconnect();
  },[Boolean(speechGeometry)]);
  useEffect(()=>{if(actionLabel)ref.current?.focus({preventScroll:true});},[text,actionLabel]);
  const placement=placeLanternReply(actor,people,viewport.view,viewport.frame,stablePlacement?'看見衣袖與花朵，請沿着原畫細節觀察。'.repeat(5):text,extraWidth,18,actionLabel?50:0,artworkSize,[],speechGeometry?{...speechGeometry,measured:stablePlacement?{width:Math.min(310,viewport.frame.width-40),height:240}:measured}:undefined);
  return <>
    {progress&&showProgress&&<LanternNotice duration={2800} text={progressText??`尋得第${['一','二','三'][progress-1]}處身影`} detail={`${progress}／3`}/>}
    <section ref={ref} tabIndex={-1} className="lantern-emperor-speech" aria-label={speakerLabel}
    style={{left:placement.left,top:placement.top,width:placement.width} as CSSProperties}
    onKeyDown={event=>{if(event.key!=='Tab'||!trapFocus)return;event.preventDefault();if(!children){ref.current?.querySelector('button')?.focus();return;}const controls=Array.from(ref.current?.querySelectorAll<HTMLElement>('button,a,summary')??[]);const current=controls.indexOf(document.activeElement as HTMLElement);controls[current<0?(event.shiftKey?controls.length-1:0):(current+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();}}>

    <div className={`lantern-character-reply has-finding emperor-speech-bubble tail-${placement.tailSide} ${narration?'is-narration':''}`} 
      style={{'--reply-tail-x':`${placement.tailX}px`,'--reply-tail-y':`${placement.tailY}px`} as CSSProperties}>
      {caption&&<p className="zanhua-dialogue-caption">{caption}</p>}
      <p role="status">{text}</p>
      {children}
      {actionLabel&&<button className="emperor-speech-action" onClick={onContinue}>{actionLabel}<span aria-hidden="true"> →</span></button>}
    </div>
  </section></>;
}
