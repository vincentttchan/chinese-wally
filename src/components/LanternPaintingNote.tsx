import type {CSSProperties,ReactNode,Ref} from 'react';
import {lanternActors,lanternSize,lanternTargets} from '../game/lanternFestival.ts';
import type {SceneViewport} from './ScrollScene.tsx';

export function LanternPaintingNote({index,viewport,label,title,children,busy=false,noteRef}: {
  index:number;viewport:SceneViewport;label:string;title:string;children:ReactNode;busy?:boolean;noteRef?:Ref<HTMLElement>;
}) {
  const actor=lanternActors.find(item=>item.id===lanternTargets[index].id)!;
  const {view,frame}=viewport;
  const x=view.x+actor.x*lanternSize.width*view.scale,y=view.y+actor.y*lanternSize.height*view.scale;
  const width=Math.min(frame.width>=1000?400:350,frame.width-32),gap=Math.max(28,actor.width*lanternSize.width*view.scale*.65);
  const rightFits=x+gap+width<frame.width-20;
  const leftFits=x-gap-width>20;
  const desiredLeft=x<0||x>frame.width?24:leftFits?x-gap-width:rightFits?x+gap:x-width/2;
  const left=Math.max(16,Math.min(frame.width-width-16,desiredLeft));
  const mobile=frame.width<700;
  const top=mobile?undefined:Math.max(24,Math.min(frame.height-325,y-100));
  const style={'--note-x':`${left}px`,'--note-y':`${top??0}px`,'--note-width':`${width}px`} as CSSProperties;
  return <section ref={noteRef} tabIndex={-1} className={`lantern-observation-note ${busy?'is-changing':''}`} style={style} aria-label={title} aria-busy={busy} inert={busy}>
    <p className="lantern-observation-eyebrow">{label}</p>
    <h2>{title}</h2>{children}
  </section>;
}
