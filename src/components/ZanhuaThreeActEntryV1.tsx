import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {zanhuaImage,zanhuaSize,zanhuaSteps} from '../game/zanhuaPreview.ts';
import type {SceneViewport} from './ScrollScene.tsx';
import './zanhua-three-act-entry-v1.css';

export const zanhuaEntryScenesV1=[
  {
    "label": "盛裝一刻",
    "caption": "畫中場景 · 盛裝遊賞",
    "action": "看看這一卷",
    "groups": [
      {
        "kind": "kicker",
        "lines": [
          "盛裝一刻"
        ]
      },
      {
        "lines": [
          "畫中，幾位女子盛裝遊賞。",
          "高髻簪花，長裙曳地。",
          "有人拈花，有人在旁執扇。"
        ],
        "kind": ""
      },
      {
        "kind": "closing",
        "lines": [
          "她們的手勢與目光，",
          "留下各不相同的片刻。"
        ]
      }
    ]
  },
  {
    "label": "畫中仕女",
    "caption": "簪花仕女圖 · 傳唐代周昉作",
    "action": "隨師展卷",
    "groups": [
      {
        "kind": "kicker",
        "lines": [
          "畫中仕女"
        ]
      },
      {
        "lines": [
          "眼前的《簪花仕女圖》，",
          "傳為唐代畫家周昉所作，",
          "現藏遼寧省博物館。"
        ],
        "kind": ""
      },
      {
        "kind": "closing",
        "lines": [
          "畫卷留下了她們的樣貌，",
          "畫中卻沒有記下她們的姓名。"
        ]
      }
    ]
  },
  {
    "label": "初學看畫",
    "caption": "你的身份 · 隨師展卷的學畫人",
    "action": "看看她的樣子",
    "groups": [
      {
        "kind": "kicker",
        "lines": [
          "初學看畫"
        ]
      },
      {
        "lines": [
          "你是隨師展卷的學畫人。",
          "師長輕聲囑咐："
        ],
        "kind": ""
      },
      {
        "kind": "quote",
        "lines": [
          "「先認清這位女子的面孔。",
          "找到她，再循着手勢與目光，",
          "看看她正在做甚麼。」"
        ]
      }
    ]
  }
] as const;

export function ZanhuaThreeActEntryV1({ready,leaving,onBegin,onPrepared,onRevealed}:{ready:boolean;leaving:boolean;onBegin:(viewport:SceneViewport)=>void;onPrepared:()=>void;onRevealed:()=>void}) {
  const root=useRef<HTMLElement>(null),world=useRef<HTMLDivElement>(null);
  const portraitButton=useRef<HTMLButtonElement>(null);
  const [stage,setStage]=useState(0),[shown,setShown]=useState(0),[loaded,setLoaded]=useState(false);
  const [portraitEntering,setPortraitEntering]=useState(false),[portraitVisible,setPortraitVisible]=useState(false);
  const [portraitReady,setPortraitReady]=useState(false),[portraitFailed,setPortraitFailed]=useState(false),[portraitRetry,setPortraitRetry]=useState(0);
  const [failed,setFailed]=useState(false),[retry,setRetry]=useState(0),[fontReady,setFontReady]=useState(false);
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused,setPaused]=useState(reduced),[changing,setChanging]=useState(false);
  const [opening,setOpening]=useState(false),[revealed,setRevealed]=useState(false);
  const viewport=useRef<SceneViewport>({view:{x:0,y:0,scale:1},frame:{width:1280,height:800}});
  const drift=useRef(0),pauseRef=useRef(paused),leaveRef=useRef(leaving),loadRef=useRef(false);
  const timers=useRef(new Set<number>()),changingRef=useRef(false),finished=useRef(false);
  pauseRef.current=paused;leaveRef.current=leaving||portraitEntering;loadRef.current=loaded&&fontReady&&opening;
  const scene=zanhuaEntryScenesV1[stage];
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
  const artwork=retry?`${zanhuaImage}?entryRetry=${retry}`:zanhuaImage;
  useEffect(()=>{if(portraitVisible&&!leaving)portraitButton.current?.focus({preventScroll:true});},[portraitVisible,leaving]);
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
      const scale=Math.max(height/zanhuaSize.height,width/zanhuaSize.width);
      const origin=width-zanhuaSize.width*scale,travel=Math.min(560,width*.48,-origin);
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
    if(!loaded||!fontReady||!revealed||changing||leaving||portraitEntering)return;
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
  },[characters,loaded,fontReady,revealed,reduced,changing,leaving,portraitEntering]);
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
    if(stage<zanhuaEntryScenesV1.length-1)changeStage(stage+1);
    else if(portraitFailed){setPortraitFailed(false);setPortraitRetry(value=>value+1);}
    else if(portraitReady){setPortraitEntering(true);schedule(()=>setPortraitVisible(true),reduced?0:1100);}
  };
  const visibleCount=finished.current?characters.length:shown;
  return <section ref={root} className={`zanhua-entry-v1 entry ${opening?'is-opening':''} ${revealed?'has-arrived':''} ${leaving?'is-leaving':''} ${portraitEntering?'is-previewing-person':''} ${portraitVisible?'has-portrait':''}`} aria-label="簪花仕女圖三幕入場" inert={!revealed||leaving}>
    <div className="art-window" aria-hidden="true"><div ref={world} className="art-world">
      <img className="full-painting" src={artwork} width={zanhuaSize.width} height={zanhuaSize.height} draggable={false} alt="" onLoad={()=>{setLoaded(true);setFailed(false);}} onError={()=>{setLoaded(false);setFailed(true);}}/>
    </div></div><div className="shade" aria-hidden="true"/>
    <header className="entry-header" inert={portraitEntering}><p className="chapter-name">簪花仕女圖<span>傳唐代周昉作 · 遼寧省博物館藏</span></p><button className="quiet-button" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?'繼續展卷':'暫停畫卷'}</button></header>
    {!entryReady?<div className="load-status" role="status">{failed?<div>畫卷未能載入。<button onClick={()=>{setFailed(false);setRetry(value=>value+1);}}>重新展卷</button></div>:'畫卷正徐徐展開……'}</div>:<>
      <section hidden={portraitVisible} inert={portraitEntering} className={`narrative ${changing?'is-changing':''}`} aria-label="入場引言" onClick={()=>{if(!changing)showAll();}}>
        <div className="vertical-copy" aria-hidden="true">{columns.map((column,index)=><p className={`passage ${column.kind}`} key={`${stage}-${index}`}>{column.characters.map((character,glyph)=><span className={`glyph ${reduced||column.start+glyph<visibleCount?'is-visible':''}`} key={glyph}>{character}</span>)}</p>)}</div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{scene.groups.flatMap(group=>group.lines).join('\n')}</p>
      </section>
      <nav className="entry-controls" aria-label="引言操作" hidden={portraitVisible} inert={portraitEntering}><div className="sequence"><button className="quiet-button" disabled={stage===0||changing} onClick={()=>changeStage(stage-1)}>前一幕</button><span className="progress" role="img" aria-label={`引言第${stage+1}幕，共三幕`}>{zanhuaEntryScenesV1.map((_,index)=><i className={index===stage?'current':''} key={index}/>)}</span></div>
        <button className="enter-button" disabled={changing||(!revealing&&stage===2&&!portraitReady&&!portraitFailed)} onClick={next}><span>{revealing?'顯示全文':stage===2&&portraitFailed?'重新載入樣貌':stage===2&&!portraitReady?'正在準備樣貌':scene.action}</span><svg viewBox="0 0 32 20" width="32" height="20" aria-hidden="true"><path d="M2 10c8-.8 17-.5 27 0M23 3l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </nav>
    </>}
    <section className="handover" aria-label="第一位女子樣貌提示" hidden={!portraitVisible}>
      <div className="target"><img src={portraitRetry?`${zanhuaSteps[0].portrait}?portraitRetry=${portraitRetry}`:zanhuaSteps[0].portrait} alt="第一位女子的完整髮型與面貌摹繪" onLoad={()=>{setPortraitReady(true);setPortraitFailed(false);}} onError={()=>{setPortraitReady(false);setPortraitFailed(true);}}/><div><p>先看樣貌，再入畫尋找</p><h1>先記住這張面孔</h1><p>她垂着頭，<br/>臉朝左下方。</p><small>樣貌摹繪，原畫為準</small></div></div>
      <p className="handover-note">記住她的樣子，再循着手勢與目光細看。</p>
      <nav className="entry-controls portrait-controls" aria-label="樣貌提示操作"><button className="quiet-button" onClick={()=>{setPortraitEntering(false);setPortraitVisible(false);}}>前一幕</button><button ref={portraitButton} className="enter-button" disabled={!ready||leaving} onClick={()=>onBegin(viewport.current)}><span>{ready?'入畫尋人':'正在展卷'}</span><span aria-hidden="true">⟶</span></button></nav>
    </section>
    <footer className="entry-footer"><span>{portraitVisible?'先看樣貌，再入畫尋找':scene.caption}</span><span className="sample-note">學畫人與師長身份、對白為遊戲虛構。</span></footer>
  </section>;
}
