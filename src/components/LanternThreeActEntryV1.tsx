import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {assetPath} from '../game/assets.ts';
import {lanternFullScroll,lanternSize,lanternTiles} from '../game/lanternFestival.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import './lantern-three-act-entry-v1.css';

export const lanternEntryScenesV1=[
  {label:'宮中元宵',caption:'明代 · 宮中元宵',action:'看看這一卷',groups:[
    {kind:'kicker',lines:['宮中元宵']},
    {kind:'',lines:['明代，宮中正逢元宵。','庭院裡張燈設戲，','一場節慶，鋪展在長卷之中。']},
    {kind:'closing',lines:['今夜，你也將走入畫裡。']}
  ]},
  {label:'畫中元宵',caption:'憲宗元宵行樂圖 · 中國國家博物館藏',action:'聽候囑咐',groups:[
    {kind:'kicker',lines:['畫中元宵']},
    {kind:'',lines:['《憲宗元宵行樂圖》，','是明代的絹本設色長卷。','作者姓名未詳，','現藏中國國家博物館。']},
    {kind:'closing',lines:['畫中以紅牆分隔庭院，','留下宮中慶賞元宵的場景。']}
  ]},
  {label:'初次隨行',caption:'你的身份 · 初次隨行的小內侍',action:'入畫尋人',groups:[
    {kind:'kicker',lines:['初次隨行']},
    {kind:'',lines:['你是初次隨行入宮的小內侍。','眼前的人與事，樣樣新鮮。']},
    {kind:'quote',lines:['帶你的內侍低聲囑咐：','「先認清陛下的眉眼與鬍鬚，','待會兒，跟上他的身影。」']}
  ]}
] as const;

export function LanternThreeActEntryV1({ready,leaving,onBegin,onPrepared,onRevealed}:{ready:boolean;leaving:boolean;onBegin:(viewport:SceneViewport)=>void;onPrepared:()=>void;onRevealed:()=>void}) {
  const root=useRef<HTMLElement>(null),world=useRef<HTMLDivElement>(null);
  const [stage,setStage]=useState(0),[shown,setShown]=useState(0),[loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(false),[retry,setRetry]=useState(0),[fontReady,setFontReady]=useState(false);
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused,setPaused]=useState(reduced),[changing,setChanging]=useState(false);
  const [opening,setOpening]=useState(false),[revealed,setRevealed]=useState(false);
  const viewport=useRef<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
  const drift=useRef(0),pauseRef=useRef(paused),leaveRef=useRef(leaving),loadRef=useRef(false);
  const timers=useRef(new Set<number>()),changingRef=useRef(false),finished=useRef(false);
  pauseRef.current=paused;leaveRef.current=leaving;loadRef.current=loaded&&fontReady&&opening;
  const scene=lanternEntryScenesV1[stage];
  const columns=useMemo(()=>{
    let offset=0;
    return scene.groups.flatMap(group=>group.lines.map(line=>{
      const characters=Array.from(line),start=offset;offset+=characters.length;
      return {kind:group.kind,characters,start};
    }));
  },[scene]);
  const characters=useMemo(()=>columns.flatMap(column=>column.characters.map((character,index)=>({character,columnEnd:index===column.characters.length-1}))),[columns]);
  const revealing=!reduced&&shown<characters.length;
  const entryReady=loaded&&fontReady;
  const artwork=retry?`${lanternFullScroll}?entryRetry=${retry}`:lanternFullScroll;
  useEffect(()=>{
    let cancelled=false;
    void document.fonts.load('24px LanternEntryWenKai').then(()=>{if(!cancelled)setFontReady(true);},()=>{if(!cancelled)setFontReady(true);});
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{setReduced(media.matches);setPaused(media.matches);};
    media.addEventListener('change',change);
    return()=>{cancelled=true;media.removeEventListener('change',change);timers.current.forEach(timer=>window.clearTimeout(timer));};
  },[]);
  useEffect(()=>{
    if((!entryReady&&!failed)||revealed)return;
    if(reduced){setOpening(true);onPrepared();setRevealed(true);onRevealed();return;}
    const frame=requestAnimationFrame(()=>{setOpening(true);onPrepared();});
    const timer=window.setTimeout(()=>{setRevealed(true);onRevealed();},1050);
    return()=>{cancelAnimationFrame(frame);window.clearTimeout(timer);};
  },[entryReady,failed,revealed,reduced,onPrepared,onRevealed]);
  useLayoutEffect(()=>{
    const node=root.current;if(!node)return;
    let raf=0,last=0;
    const paint=()=>{
      const width=node.clientWidth,height=node.clientHeight;
      const scale=Math.max(height/lanternSize.height,width/lanternSize.width);
      const origin=width-lanternSize.width*scale,travel=Math.min(560,width*.48,-origin);
      const x=origin+travel*drift.current;
      viewport.current={view:{x,y:0,scale},frame:{width,height}};
      if(world.current)world.current.style.transform=`translate3d(${x}px,0,0) scale(${scale})`;
    };
    const tick=(time:number)=>{
      if(last&&loadRef.current&&!pauseRef.current&&!leaveRef.current&&!document.hidden)drift.current=Math.min(1,drift.current+Math.min(time-last,80)/52000);
      last=time;paint();raf=requestAnimationFrame(tick);
    };
    const resize=new ResizeObserver(paint);resize.observe(node);paint();raf=requestAnimationFrame(tick);
    return()=>{resize.disconnect();cancelAnimationFrame(raf);};
  },[]);
  useEffect(()=>{
    if(!loaded||!fontReady||!revealed||changing||leaving)return;
    finished.current=false;
    if(reduced){setShown(characters.length);return;}
    let raf=0,last=0,index=0,wait=500;
    const tick=(time:number)=>{
      if(finished.current)return;
      if(last&&!document.hidden){
        wait-=Math.min(time-last,80);
        if(wait<=0){
          const glyph=characters[index++];setShown(index);
          wait=110+(/[，。！？：；、」]/u.test(glyph.character)?240:0)+(glyph.columnEnd?180:0);
        }
      }
      last=time;if(index<characters.length)raf=requestAnimationFrame(tick);
    };
    setShown(0);raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[characters,loaded,fontReady,revealed,reduced,changing,leaving]);
  // Completing a paragraph stops its animation without restarting the effect.
  const showAll=()=>{finished.current=true;setShown(characters.length);};
  const schedule=(callback:()=>void,ms:number)=>{
    const timer=window.setTimeout(()=>{timers.current.delete(timer);callback();},ms);timers.current.add(timer);
  };
  const changeStage=(next:number)=>{
    if(changingRef.current||leaving)return;
    changingRef.current=true;setChanging(true);
    schedule(()=>{setStage(next);setShown(0);schedule(()=>{changingRef.current=false;setChanging(false);},reduced?0:420);},reduced?0:420);
  };
  const next=()=>{
    if(leaving||changingRef.current)return;
    if(revealing){showAll();return;}
    if(stage<lanternEntryScenesV1.length-1)changeStage(stage+1);
    else if(ready)onBegin(viewport.current);
  };
  const visibleCount=finished.current?characters.length:shown;
  return <section ref={root} className={`lantern-entry-v1 entry ${opening?'is-opening':''} ${revealed?'has-arrived':''} ${leaving?'is-leaving':''}`} aria-label="宮中鬧元宵三幕入場" inert={!revealed||leaving}>
    <div className="art-window" aria-hidden="true"><div ref={world} className="art-world">
      <img className="full-painting" src={artwork} width={lanternSize.width} height={lanternSize.height} draggable={false} alt="" onLoad={()=>{setLoaded(true);setFailed(false);}} onError={()=>{setLoaded(false);setFailed(true);}}/>
      {loaded&&lanternTiles.map(tile=><img key={tile.id} className="detail-tile" src={tile.image} width={tile.width*lanternSize.width} height={(tile.height??1)*lanternSize.height} style={{transform:tile.transform}} alt="" draggable={false}/>)}
    </div></div><div className="shade" aria-hidden="true"/>
    <header className="entry-header"><p className="chapter-name">宮中鬧元宵<span>憲宗元宵行樂圖</span></p><button className="quiet-button" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?'繼續展卷':'暫停畫卷'}</button></header>
    {!entryReady?<div className="load-status" role="status">{failed?<div>畫卷未能載入。<button onClick={()=>{setFailed(false);setRetry(value=>value+1);}}>重新展卷</button></div>:'畫卷正徐徐展開……'}</div>:<>
      <section className={`narrative ${changing?'is-changing':''}`} aria-label="入場引言" onClick={()=>{if(!changing)showAll();}}>
        <div className="vertical-copy" aria-hidden="true">{columns.map((column,index)=><p className={`passage ${column.kind}`} key={`${stage}-${index}`}>{column.characters.map((character,glyph)=><span className={`glyph ${reduced||column.start+glyph<visibleCount?'is-visible':''}`} key={glyph}>{character}</span>)}</p>)}</div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{scene.groups.flatMap(group=>group.lines).join('\n')}</p>
      </section>
      <nav className="entry-controls" aria-label="引言操作"><div className="sequence"><button className="quiet-button" disabled={stage===0||changing} onClick={()=>changeStage(stage-1)}>前一幕</button><span className="progress" role="img" aria-label={`引言第${stage+1}幕，共三幕`}>{lanternEntryScenesV1.map((_,index)=><i className={index===stage?'current':''} key={index}/>)}</span></div>
        <button className="enter-button" disabled={changing||(!revealing&&stage===2&&!ready)} onClick={next}><span>{revealing?'顯示全文':stage===2&&!ready?'正在展卷':scene.action}</span><svg viewBox="0 0 32 20" width="32" height="20" aria-hidden="true"><path d="M2 10c8-.8 17-.5 27 0M23 3l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </nav>
    </>}
    <footer className="entry-footer"><span>{scene.caption}</span><span className="sample-note">小內侍身份及對白為遊戲虛構</span></footer>
  </section>;
}
