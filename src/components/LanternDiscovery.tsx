import {useEffect,useRef,useState} from 'react';
import type {LanternTarget} from '../game/lanternFestival.ts';
import {lanternActors,lanternJourneyClues,lanternTargets} from '../game/lanternFestival.ts';
import {lanternPlatformRegion,lanternCourtyardRegion,lanternRobeRegion} from '../game/lanternStudy.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import {LanternEmperorSpeech} from './LanternEmperorSpeech.tsx';
import {LanternPaintingTarget} from './LanternPaintingTarget.tsx';
import {LanternPaintingNote} from './LanternPaintingNote.tsx';
import '../lantern-observation.css';

type Props={target:LanternTarget;number:number;viewport:SceneViewport;onNext:()=>void;onLook:(index:number,near:boolean,settled?:()=>void)=>void;onAppearance:(index:number,monochrome:boolean)=>void;onPlaceLook:(place:'platform'|'court'|'compare',settled:()=>void)=>void};
export function LanternDiscovery({number,viewport,onNext,onLook,onAppearance,onPlaceLook}:Props){
  const [observing,setObserving]=useState(false),[completed,setCompleted]=useState(false),[hearingClue,setHearingClue]=useState(false);
  const [monochrome,setMonochrome]=useState(false),[busy,setBusy]=useState(false);
  const [places,setPlaces]=useState<string[]>([]);
  const [placePrompt,setPlacePrompt]=useState<'platform'|'court'>('platform');
  const [reminder,setReminder]=useState(false);
  useEffect(()=>{if(!reminder)return;const timer=window.setTimeout(()=>setReminder(false),2400);return()=>window.clearTimeout(timer);},[reminder]);
  const action=useRef<HTMLButtonElement>(null),note=useRef<HTMLElement>(null);
  useEffect(()=>{if(observing&&!busy)(number===1?action.current:note.current)?.focus({preventScroll:true});},[observing,busy,number]);
  const actor=lanternActors.find(item=>item.id===lanternTargets[number-1].id)!;
  const enter=()=>{if(number===3){onNext();return;}setObserving(true);setBusy(true);onLook(number-1,true,()=>setBusy(false));};
  const inspectPlace=(id:'platform'|'court')=>{if(busy||places.includes(id))return;setBusy(true);onPlaceLook(id,()=>{setPlaces(previous=>[...new Set([...previous,id])]);setBusy(false);});};
  if(!observing)return <LanternEmperorSpeech actor={actor} viewport={viewport} progress={number}
    text={['庭前的爆竹，你也來看看？','宮中也有買賣，你可曾留意？','這一卷裡，你已三次尋得朕。'][number-1]}
    actionLabel={number===3?'回看這一卷':number===1?'近看衣紋':'近看庭院'} onContinue={enter}/>;
  if(hearingClue&&lanternJourneyClues[number-1])return <LanternEmperorSpeech actor={actor} viewport={viewport}
    text={number===1?'宮裡擺起買賣，朕也去看看。':'再往前看看，還有獻藝的熱鬧。'} actionLabel="循線尋人" onContinue={onNext}/>;
  return <>
    {!busy&&number===1&&<div className="lantern-painting-miss" onClick={()=>setReminder(true)} aria-hidden="true"/>}
    {!busy&&number===1&&<LanternPaintingTarget region={lanternRobeRegion} viewport={viewport} label="點擊皇帝衣袍，比較彩色與灰階" hint={completed?undefined:'輕點他的衣袍'} buttonRef={action} pressed={monochrome} onClick={()=>{const next=!monochrome;setMonochrome(next);onAppearance(number-1,next);setCompleted(true);setReminder(false);}}/>}
    {!busy&&number===2&&!places.includes(placePrompt)&&<LanternPaintingTarget
      region={placePrompt==='platform'?lanternPlatformRegion:lanternCourtyardRegion} viewport={viewport}
      label={placePrompt==='platform'?'觀察皇帝所在的高台':'觀察下方庭院的人物'}
      hint={placePrompt==='platform'?'輕點皇帝所在的高台':'輕點下方庭院'} onClick={()=>inspectPlace(placePrompt)}/>}
    <LanternPaintingNote noteRef={note} index={number-1} viewport={viewport} busy={busy} label={`畫法觀察 · ${number} / 3`} title={number===1?'衣紋與設色':'高台與庭院'}>
      <p className="lantern-note-body" aria-live="polite">{number===1?(completed?'顏色淡去，衣紋仍清楚可見。\n細線勾勒出衣褶與紋樣。':'輕點他的衣袍，讓畫面轉為灰階。\n看看顏色淡去後，還留下甚麼。'):(completed?'高台上，有人觀看。\n庭院裡，有人活動。':placePrompt==='platform'?(places.includes('platform')?'皇帝與侍從站在高台上。\n欄杆分隔了觀看與活動的位置。':'先輕點皇帝所在的高台。\n看看欄杆旁站着哪些人。'):(places.includes('court')?'庭院裡的人物散布在不同位置。\n與高台上的觀看者，有甚麼不同？':'再輕點下方的庭院。\n看看人物在哪裡活動。'))}</p>
      {number===2&&places.includes('platform')&&placePrompt==='platform'&&<button className="lantern-note-next" onClick={()=>{setPlacePrompt('court');setBusy(true);onLook(1,true,()=>setBusy(false));}}>再看下方庭院 <span aria-hidden="true">→</span></button>}
      {number===2&&places.includes('court')&&!completed&&<button className="lantern-note-next" onClick={()=>{setBusy(true);onPlaceLook('compare',()=>{setBusy(false);setCompleted(true);});}}>退後一步，比較兩處 <span aria-hidden="true">→</span></button>}
      {reminder&&<p className="lantern-note-caption" role="status">試試點他的衣袍。</p>}
      {number===1&&completed&&<p className="lantern-note-caption">再點衣袍，可恢復{monochrome?'彩色':'灰階'}比較。</p>}
      {completed&&<button className="lantern-note-next" onClick={()=>{setHearingClue(true);setMonochrome(false);onAppearance(number-1,false);}}>聽聽他怎麼說 <span aria-hidden="true">→</span></button>}
    </LanternPaintingNote>
  </>;
}
