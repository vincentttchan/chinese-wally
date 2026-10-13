import {useEffect,useState} from 'react';
import type {Ref} from 'react';
import type {PaintingRegion} from '../game/lanternStudy.ts';
import {lanternSize} from '../game/lanternFestival.ts';
import type {SceneViewport} from './ScrollScene.tsx';

/** An invisible, keyboard-accessible action registered to the original painting. */
export function LanternPaintingTarget({region,viewport,label,onClick,monochrome=false,pressed,buttonRef,hint}: {
  region:PaintingRegion;viewport:SceneViewport;label:string;onClick:()=>void;
  monochrome?:boolean;pressed?:boolean;buttonRef?:Ref<HTMLButtonElement>;hint?:string;
}) {
  const [showHint,setShowHint]=useState(false);
  useEffect(()=>{setShowHint(false);const timer=window.setTimeout(()=>setShowHint(true),7000);return()=>window.clearTimeout(timer);},[label]);
  const points=region.points.map(point=>({x:viewport.view.x+point.x*lanternSize.width*viewport.view.scale,y:viewport.view.y+point.y*lanternSize.height*viewport.view.scale}));
  const left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y));
  const width=Math.max(1,Math.max(...points.map(p=>p.x))-left),height=Math.max(1,Math.max(...points.map(p=>p.y))-top);
  const clipPath=`polygon(${points.map(p=>`${(p.x-left)/width*100}% ${(p.y-top)/height*100}%`).join(',')})`;
  return <>
    <button ref={buttonRef} type="button" className={`lantern-painting-target ${monochrome?'is-monochrome':''}`} aria-label={label} aria-pressed={pressed}
      style={{left,top,width,height,clipPath}} onClick={onClick}/>
    {hint&&showHint&&<span className="lantern-painting-hint" aria-hidden="true" style={{left:Math.max(20,Math.min(viewport.frame.width-140,left+width/2-50)),top:Math.min(viewport.frame.height-44,Math.max(20,top+height+10))}}>{hint}</span>}
  </>;
}
