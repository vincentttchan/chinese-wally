import {LanternCollectionImage} from './LanternCollectionImage.tsx';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ArtCrop } from './ArtCrop.tsx';
import { lanternFindings, lanternJournalItems } from '../game/lanternCollection.ts';
import type { LanternFinding } from '../game/lanternCollection.ts';
import type { SceneViewport } from './ScrollScene.tsx';
import { lanternSize } from '../game/lanternFestival.ts';
import { assetPath } from '../game/assets.ts';
import '../lantern-field-journal.css';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const courts = ['爆竹庭院','宮中街市','表演庭院'];

function CollectionIllustration({finding,locked=false}:{finding:LanternFinding;locked?:boolean}) {
  const item=lanternJournalItems[finding.id];
  return <span className={`collection-illustration ${locked?'is-locked':''}`} role="img"
    aria-label={locked?'尚未收下的收藏輪廓':`${item.title} · 依原畫創作的收藏插畫`}
    style={{'--atlas-left':`${-(item.index%3)*100}%`,'--atlas-top':`${-Math.floor(item.index/3)*100}%`} as CSSProperties}>
    <LanternCollectionImage findingId={finding.id}/>
  </span>;
}

export function LanternJournal({collected,onClose,onLook,compact,findings=lanternFindings,sessionOnly=false}: {
  collected: string[]; findings?: LanternFinding[]; sessionOnly?:boolean; onClose: () => void;
  onLook: (finding: LanternFinding, onSettled: () => void) => void; compact: boolean;
}) {
  const [selected,setSelected] = useState<string | null>(null);
  const [souvenir,setSouvenir] = useState(false);
  const [moving,setMoving] = useState(false);
  const [closing,setClosing] = useState(false);
  const [looking,setLooking] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const pages = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const request = useRef(0);
  const selection = useRef(selected); selection.current = selected;
  const look = useRef(onLook); look.current = onLook;
  const closeAction = useRef(onClose); closeAction.current = onClose;
  const count = collected.length;
  const finding = findings.find(item => item.id === selected);
  const available = findings.filter(item=>collected.includes(item.id));
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus({preventScroll:true});
    return () => {window.clearTimeout(timer.current); request.current++; if(previous?.isConnected)previous.focus({preventScroll:true});};
  }, []);
  useEffect(() => {
    const current = findings.find(item=>item.id===selection.current);
    if(!current || closing)return;
    const token = ++request.current;
    window.clearTimeout(timer.current);
    setMoving(true);
    look.current(current,()=>{if(token===request.current)setMoving(false);});
  }, [compact]);
  useEffect(()=>{pages.current?.scrollTo({top:0});setLooking(false);ref.current?.focus({preventScroll:true});},[selected,souvenir]);
  useEffect(()=>{ref.current?.focus({preventScroll:true});},[looking]);
  const close = () => {
    if(closing)return;
    window.clearTimeout(timer.current); request.current++; setMoving(false); setClosing(true);
    timer.current=window.setTimeout(()=>closeAction.current(),reducedMotion()?0:320);
  };
  const select = (id:string) => {
    if(moving || closing || id===selected && !souvenir)return;
    const next = findings.find(item=>item.id===id);
    if(!next || !collected.includes(id))return;
    const token = ++request.current;
    setMoving(true);setLooking(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(()=>{
      look.current(next,()=>{
        if(token!==request.current)return;
        setSelected(id);setSouvenir(false);setMoving(false);
      });
    },reducedMotion()?0:180);
  };
  const overview = (showSouvenir=false) => {
    if(moving || closing)return;
    const token=++request.current;setMoving(true);setLooking(false);
    timer.current=window.setTimeout(()=>{
      if(token!==request.current)return;
      setSelected(null);setSouvenir(showSouvenir);setMoving(false);
    },reducedMotion()?0:160);
  };
  const step = (direction:number) => {
    if(!available.length)return;
    const current = available.findIndex(item=>item.id===selected);
    select(available[(current+direction+available.length)%available.length].id);
  };
  const lookInPainting = () => {
    if(!finding || moving || closing)return;
    const token=++request.current;setMoving(true);
    look.current(finding,()=>{if(token===request.current){setLooking(true);setMoving(false);}});
  };
  return <section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="元宵見聞冊"
    className={`lantern-journal-layer lantern-field-journal ${selected&&!souvenir?'is-detail':'is-overview'} ${moving?'is-moving':''} ${looking?'is-looking':''} ${closing?'is-closing':''}`}
    style={{'--journal-texture':`url("${assetPath('art/ui/reading-paper.png')}")`} as CSSProperties}
    onKeyDown={event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(looking)setLooking(false);else close();return;}
      if(event.key!=='Tab')return;
      const controls=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], summary')??[]).filter(node=>!node.closest('[inert]')&&node.getClientRects().length>0);
      const first=controls[0],last=controls[controls.length-1];
      if(!first){event.preventDefault();return;}
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){event.preventDefault();first.focus();}
    }}>
    <div className="collection-paper" aria-hidden="true"/>
    <div className="collection-reading" inert={looking}>
      <header className="collection-header">
        <p className="collection-kicker">畫中拾趣</p>
        <div className="collection-title-row"><h1>元宵見聞冊</h1><span>已收下 {count}／{findings.length}</span></div>
        <button className="collection-close" onClick={close} aria-label="合上見聞冊">×</button>
      </header>
      <div ref={pages} className="collection-pages" inert={moving||closing} aria-busy={moving}>
        {!selected&&!souvenir&&<div className="collection-overview">
          <p className="collection-introduction">把偶然看見的細節，收成自己的元宵。</p>
          <div className="collection-grid">{findings.map(item=>{
            const found=collected.includes(item.id);
            const art=lanternJournalItems[item.id];
            return <button className={`collection-item ${found?'is-collected':'is-undiscovered'}`} key={item.id} disabled={!found} onClick={()=>select(item.id)} aria-label={found?`翻閱${art.title}`:`未發現：${art.mystery}`}>
              <CollectionIllustration finding={item} locked={!found}/>
              <span className="collection-item-name">{found?art.title:art.mystery}</span>
              <span className="collection-item-state" aria-hidden="true">{found?'已收下':''}</span>
            </button>;
          })}</div>
          {count===findings.length&&<button className="collection-souvenir-link" onClick={()=>overview(true)}>翻開我的宮廷元宵見聞 <span aria-hidden="true">→</span></button>}
        </div>}
        {finding&&!souvenir&&<article className="collection-detail" key={finding.id}>
          <button className="collection-back" onClick={()=>overview()}>← 全部收藏</button>
          <div className="collection-detail-heading"><p>{courts[finding.court]}</p><h2>{lanternJournalItems[finding.id].title}</h2></div>
          <figure className="collection-detail-art"><CollectionIllustration finding={finding}/><figcaption>依原畫創作的收藏圖樣</figcaption></figure>
          <p className="collection-observe">{finding.observe}</p>
          <p className="collection-body">{finding.note}</p>
          <button className="collection-look" onClick={lookInPainting}>看看畫中位置 <span aria-hidden="true">↗</span></button>
          <p className="collection-next"><span>再留意一處</span>{finding.next}</p>
          <details className="collection-source"><summary>畫作資料</summary><p>{finding.id==='costume'?'左側為原畫；收藏圖樣沿用動畫的創作姿勢，完整衣袍含補繪部分，不作為原畫被遮擋處的依據。':'左側為原畫，收藏圖樣為依畫中細節製作的插畫。'}</p><a href="https://www.chnmuseum.cn/portals/0/web/zt/202102yuaxiao/" target="_blank" rel="noreferrer">中國國家博物館 · 畫作與節俗資料</a><p>{sessionOnly?'樣段收藏只在本次預覽保留。':'收藏保存在此瀏覽器，重新尋人仍保留。'}</p></details>
          {available.length>1&&<nav className="collection-detail-nav" aria-label="已收藏見聞"><button aria-label="上一則已收藏見聞" onClick={()=>step(-1)}>←</button><span>{available.findIndex(item=>item.id===selected)+1}／{available.length}</span><button aria-label="下一則已收藏見聞" onClick={()=>step(1)}>→</button></nav>}
        </article>}
        {souvenir&&<article className="collection-souvenir">
          <button className="collection-back" onClick={()=>overview()}>← 全部收藏</button>
          <h2>我的宮廷元宵見聞</h2>
          <div className="collection-souvenir-art">{findings.map(item=><CollectionIllustration key={item.id} finding={item}/>)}</div>
          <p className="collection-body">從一點火光、一盞花燈，到貨郎擔與表演者，你已看見皇帝身邊的元宵。</p>
          <p className="collection-observe">人物的動作、器物的細線、節慶的祝願，都藏在這一卷裡。</p>
          <p className="collection-source">《憲宗元宵行樂圖》 · 中國國家博物館藏</p>
        </article>}
      </div>
      {!selected&&!souvenir&&<footer className="collection-footer">{count?'點選已收下的圖樣，回看畫中的發現。':'回到長卷，點一盞燈、問一位畫中人。'}</footer>}
    </div>
    <button className="collection-return" onClick={close}>← 回到長卷</button>
    {looking&&<button className="collection-resume" onClick={()=>setLooking(false)}>繼續閱讀 →</button>}
  </section>;
}

export function LanternEncounter({finding,collected,viewport,onCollect,onClose}: {
  finding: LanternFinding; collected: boolean; viewport: SceneViewport; onCollect: () => void; onClose: () => void;
}) {
  const [observing,setObserving] = useState(collected);
  const ref = useRef<HTMLElement>(null);
  useEffect(()=>{ref.current?.focus({preventScroll:true});},[observing]);
  const {view,frame}=viewport;
  const x=view.x+finding.actor.x*lanternSize.width*view.scale;
  const y=view.y+finding.actor.y*lanternSize.height*view.scale;
  const width=Math.min(280,frame.width-48);
  const gap=Math.max(48,finding.actor.width*lanternSize.width*view.scale*.5+16);
  const left=Math.max(24,Math.min(frame.width-width-24,x+gap+width<frame.width-24?x+gap:x-gap-width));
  const top=Math.max(190,Math.min(frame.height- (observing?440:210),y-90));
  const offscreen=x < -60 || x > frame.width+60 || y < -100 || y > frame.height+100;
  return <section ref={ref} tabIndex={-1} className={`lantern-encounter ${offscreen?'is-offscreen':''}`} style={{left,top,width,'--encounter-crop-width':`${Math.min(220,130*finding.crop.rect[2]/finding.crop.rect[3])}px`} as CSSProperties} aria-label="偶遇一則見聞" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}}}>
    <header><span>{observing ? collected ? '已收下的見聞' : '看看這一處' : '畫中人的話 · 遊戲虛構'}</span><button onClick={onClose} aria-label="繼續探索畫卷">×</button></header>
    {!observing ? <><p className="encounter-quote">「{finding.quote}」</p><button className="encounter-action" onClick={()=>setObserving(true)}>看仔細些 <span aria-hidden="true">→</span></button></>
      : <><ArtCrop crop={finding.crop} label={`原畫局部：${finding.title}`} className="encounter-crop"/><h2>{finding.title}</h2><p className="encounter-observe">{collected?finding.note:finding.observe}</p><button className="encounter-action" onClick={collected?onClose:onCollect}>{collected?'繼續探索':'收下這則見聞'} <span aria-hidden="true">→</span></button></>}
  </section>;
}
