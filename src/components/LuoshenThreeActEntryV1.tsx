import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {luoshenImage,luoshenSize,luoshenTiles} from '../game/luoshen.ts';
import {assetPath} from '../game/assets.ts';
import {LuoshenPortrait} from './LuoshenPanels.tsx';
import type {SceneViewport} from './ScrollScene.tsx';
import './luoshen-three-act-entry-v1.css';

export const luoshenEntryScenesV1=[
  {
    "label": "洛水相逢",
    "caption": "第一幕 · 洛水相逢",
    "action": "看看這一卷",
    "groups": [
      {
        "lines": [
          "三國時，曹植寫下《洛神賦》，",
          "描繪一場人與神的相遇。",
          "故事裡，他行經洛水，",
          "在水岸之間，遇見神女洛神。",
          "行旅的腳步，就此停留，",
          "目光所及，多了她的身影。",
          "一段故事，從這片水岸展開。"
        ],
        "kind": ""
      }
    ]
  },
  {
    "label": "一卷藏時",
    "caption": "第二幕 · 一卷藏時",
    "action": "循賦入畫",
    "groups": [
      {
        "lines": [
          "眼前這卷《洛神賦圖》，",
          "將賦中的故事繪成長卷。",
          "原本相傳為顧愷之作，",
          "此卷是北京故宮所藏宋摹本。",
          "山水之間，熟悉的身影再現，",
          "衣冠相似，姿態卻有不同。",
          "他們之間，又發生了甚麼？"
        ],
        "kind": ""
      }
    ]
  },
  {
    "label": "循賦入畫",
    "caption": "第三幕 · 循賦入畫",
    "action": "看看曹植的樣子",
    "groups": [
      {
        "lines": [
          "你是循賦入畫的年輕書生，",
          "帶著《洛神賦》，展開此卷。",
          "先認清岸上曹植的面貌，",
          "找到他，再細看他的衣袖。",
          "循著身影，留意姿態與位置，",
          "看過細節，再翻開相應賦文，",
          "讓文字與畫面，慢慢連在一起。"
        ],
        "kind": ""
      }
    ]
  }
] as const;

export function LuoshenThreeActEntryV1({ready,leaving,onBegin,onPrepared,onRevealed,targetId,targetName,appearance,continuing,initialCenterX=.885}:{ready:boolean;leaving:boolean;onBegin:(viewport:SceneViewport)=>void;onPrepared:()=>void;onRevealed:()=>void;targetId:string;targetName:string;appearance:string;continuing:boolean;initialCenterX?:number}) {
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
  pauseRef.current=paused;leaveRef.current=leaving||portraitEntering;loadRef.current=loaded&&fontReady&&opening&&!reduced;
  const scene=luoshenEntryScenesV1[stage];
  const columns=useMemo(()=>{
    let offset=0;
    return scene.groups.flatMap(group=>group.lines.map(line=>{
      const characters=Array.from(line),start=offset;offset+=characters.length;
      return {kind:group.kind,characters,start};
    }));
  },[scene]);
  const characters=useMemo(()=>columns.flatMap(column=>column.characters.map((character,index)=>({character,columnEnd:index===column.characters.length-1}))),[columns]);
  const revealing=!reduced&&shown<characters.length;
  const entryReady=loaded&&fontReady&&ready;
  const artwork=retry?`${luoshenImage}?entryRetry=${retry}`:luoshenImage;
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
    if(!entryReady||revealed)return;
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
      const scale=Math.max(height/luoshenSize.height,width/luoshenSize.width);
      const origin=Math.max(width-luoshenSize.width*scale,Math.min(0,width*.5-luoshenSize.width*scale*initialCenterX)),travel=Math.min(560,width*.48,-origin);
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
    if(stage<luoshenEntryScenesV1.length-1)changeStage(stage+1);
    else if(portraitFailed){setPortraitFailed(false);setPortraitRetry(value=>value+1);}
    else if(portraitReady){setPortraitEntering(true);schedule(()=>setPortraitVisible(true),reduced?0:1100);}
  };
  const visibleCount=finished.current?characters.length:shown;
  return <section ref={root} className={`luoshen-entry-v1 entry ${opening||failed?'is-opening':''} ${revealed?'has-arrived':''} ${leaving?'is-leaving':''} ${portraitEntering?'is-previewing-person':''} ${portraitVisible?'has-portrait':''}`} aria-label="洛水之間三幕入場" inert={(!revealed&&!failed)||leaving}>
    <div className="art-window" aria-hidden="true"><div ref={world} className="art-world">
      <img className="full-painting" src={artwork} width={luoshenSize.width} height={luoshenSize.height} draggable={false} alt="" onLoad={()=>{setLoaded(true);setFailed(false);}} onError={()=>{setLoaded(false);setFailed(true);}}/>
      {luoshenTiles.slice(7).map(tile=><img key={tile.id} className="detail-tile" src={tile.image} style={{left:tile.x*luoshenSize.width,width:tile.width*luoshenSize.width,height:luoshenSize.height}} alt="" draggable={false}/>)}
    </div></div><div className="shade" aria-hidden="true"/>
    <header className="entry-header" inert={portraitEntering}><p className="chapter-name">洛水之間<span>洛神賦圖 · 北京故宮博物院藏</span></p><button className="quiet-button" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?'繼續展卷':'暫停畫卷'}</button></header>
    {!entryReady?<div className="load-status" role="status">{failed?<div>畫卷未能載入。<button onClick={()=>{setFailed(false);setRetry(value=>value+1);}}>重新展卷</button></div>:'畫卷正徐徐展開……'}</div>:<>
      <section hidden={portraitVisible} inert={portraitEntering} className={`narrative ${changing?'is-changing':''}`} aria-label="入場引言" onClick={()=>{if(!changing)showAll();}}>
        <div className="vertical-copy" aria-hidden="true">{columns.map((column,index)=><p className={`passage ${column.kind}`} key={`${stage}-${index}`}>{column.characters.map((character,glyph)=><span className={`glyph ${reduced||column.start+glyph<visibleCount?'is-visible':''}`} key={glyph}>{character}</span>)}</p>)}</div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{scene.groups.flatMap(group=>group.lines).join('\n')}</p>
      </section>
      <nav className="entry-controls" aria-label="引言操作" hidden={portraitVisible} inert={portraitEntering}><div className="sequence"><button className="quiet-button" disabled={stage===0||changing} onClick={()=>changeStage(stage-1)}>前一幕</button><span className="progress" role="img" aria-label={`引言第${stage+1}幕，共三幕`}>{luoshenEntryScenesV1.map((_,index)=><i className={index===stage?'current':''} key={index}/>)}</span></div>
        <button className="enter-button" disabled={changing||(!revealing&&stage===2&&!portraitReady&&!portraitFailed)} onClick={next}><span>{revealing?'顯示全文':stage===2&&portraitFailed?'重新載入樣貌':stage===2&&!portraitReady?'正在準備樣貌':stage===2&&continuing?`看看${targetName}的樣子`:scene.action}</span><svg viewBox="0 0 32 20" width="32" height="20" aria-hidden="true"><path d="M2 10c8-.8 17-.5 27 0M23 3l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </nav>
    </>}
    <section className="handover" aria-label={`${targetName}樣貌提示`} hidden={!portraitVisible}>
      <div className="target"><LuoshenPortrait id={targetId} label={`${targetName}的去背樣貌摹繪`}/><img className="portrait-preload" src={portraitRetry?`${assetPath(`art/luoshen/head-${targetId}-cutout.png`)}?portraitRetry=${portraitRetry}`:assetPath(`art/luoshen/head-${targetId}-cutout.png`)} alt="" aria-hidden="true" onLoad={()=>{setPortraitReady(true);setPortraitFailed(false);}} onError={()=>{setPortraitReady(false);setPortraitFailed(true);}}/><div><p>先看樣貌，再入畫尋找</p><h1>先記住這張面孔</h1><p>{appearance}</p><small>樣貌摹繪，原畫為準</small></div></div>
      <p className="handover-note">{continuing?'循著熟悉的身影，接著看這一卷。':'先尋岸上的曹植，找到後再細看衣袖。'}</p>
      <nav className="entry-controls portrait-controls" aria-label="樣貌提示操作"><button className="quiet-button" onClick={()=>{setPortraitEntering(false);setPortraitVisible(false);}}>前一幕</button><button ref={portraitButton} className="enter-button" disabled={!ready||leaving} onClick={()=>onBegin(viewport.current)}><span>{ready?continuing?'繼續這一卷':'入畫尋人':'正在展卷'}</span><span aria-hidden="true">⟶</span></button></nav>
    </section>
    <footer className="entry-footer"><span>{portraitVisible?'先看樣貌，再入畫尋找':scene.caption}</span><span className="sample-note">年輕書生身份為遊戲設定。</span></footer>
  </section>;
}
