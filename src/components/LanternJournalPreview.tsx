import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArtCrop } from './ArtCrop.tsx';
import { ScrollScene } from './ScrollScene.tsx';
import type { StudyCommand } from './ScrollScene.tsx';
import { lanternFindings } from '../game/lanternCollection.ts';
import { lanternFullScroll, lanternSize, lanternTiles } from '../game/lanternFestival.ts';
import '../lantern.css';
import '../lantern-journal-preview.css';

type Layout = 'album' | 'beside';
type Page = 'detail' | 'index';
const courts = ['爆竹庭院', '宮中街市', '表演庭院'];
const initialCollection = ['fireworks', 'fish', 'acrobat'];
const ignore = () => {};

/** A reversible art-direction comparison. No game progress or storage is changed. */
export function LanternJournalPreview() {
  const [layout, setLayout] = useState<Layout>('album');
  const [page, setPage] = useState<Page>('detail');
  const [selected, setSelected] = useState('fireworks');
  const [collected, setCollected] = useState(initialCollection);
  const [present, setPresent] = useState(true);
  const [closing, setClosing] = useState(false);
  const [replay, setReplay] = useState(0);
  const [encounter, setEncounter] = useState<'quote' | 'observe' | null>(null);
  const [flight, setFlight] = useState(false);
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [sceneCommand, setSceneCommand] = useState<StudyCommand | null>(null);
  const [compact, setCompact] = useState(() => window.innerWidth < 760);
  const finding = lanternFindings.find(item => item.id === selected)!;
  const timer = useRef<number | undefined>(undefined);
  const reading = useRef<HTMLElement>(null);
  const encounterNote = useRef<HTMLElement>(null);
  const bookButton = useRef<HTMLButtonElement>(null);
  const activeIndex = lanternFindings.indexOf(finding);
  useEffect(() => {
    const title = document.title; document.title = '見聞冊 A／B 比較 · 畫中尋人';
    const media = window.matchMedia('(max-width: 759px)');
    const resize = () => setCompact(media.matches); media.addEventListener('change', resize);
    return () => {document.title = title; media.removeEventListener('change', resize); window.clearTimeout(timer.current);};
  }, []);
  useEffect(() => {
    setSceneCommand({region: {x: finding.actor.x, y: finding.actor.y}, scaleRatio: 1.38,
      screenAnchor: compact ? {x: .48, y: .3} : {x: .34, y: .49}, transition: 'crossfade', token: performance.now()});
  }, [finding.id, compact, ready]);
  useEffect(() => {
    if (!present || closing) return;
    reading.current?.focus({preventScroll: true});
  }, [present, closing, page, selected]);
  useEffect(() => {if(encounter)encounterNote.current?.focus({preventScroll:true});}, [encounter]);
  const switchLayout = (next: Layout) => {setLayout(next); setClosing(false); setPresent(true); setEncounter(null); setFlight(false); window.clearTimeout(timer.current); setReplay(n => n + 1);};
  const open = () => {setEncounter(null); setClosing(false); setPresent(true); setReplay(n => n + 1);};
  const close = () => {setClosing(true);};
  const finishClose = () => {setPresent(false); setClosing(false); bookButton.current?.focus({preventScroll: true});};
  const select = (id: string) => {setSelected(id); setPage('detail'); setReplay(n => n + 1);};
  const tryFinding = () => {
    const next = lanternFindings.find(item => !collected.includes(item.id)) ?? lanternFindings[1];
    setSelected(next.id); setPresent(false); setClosing(false); setEncounter('quote'); setNotice('');
  };
  const collect = () => {
    setCollected(ids => [...new Set([...ids, finding.id])]); setEncounter(null); setFlight(true);
    setNotice(`收下「${finding.title}」`);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {setFlight(false);}, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 800);
  };
  const detail = <>
    <div className="jp-detail-heading"><span>{courts[finding.court]}</span><h2>{finding.title}</h2></div>
    <p className="jp-body">{finding.note}</p>
    <p className="jp-next"><span>再留意一處</span>{finding.next}</p>
    <a className="jp-source" href="https://www.chnmuseum.cn/portals/0/web/zt/202102yuaxiao/" target="_blank" rel="noreferrer">畫作與節俗資料 · 中國國家博物館</a>
  </>;
  const leaves = <div className="jp-leaves">{lanternFindings.map((item, index) => {
    const found = collected.includes(item.id);
    return <button key={item.id} className={`jp-leaf ${found ? 'is-found' : 'is-hidden'} ${selected === item.id && page === 'detail' ? 'is-selected' : ''}`}
      disabled={!found} onClick={() => select(item.id)} aria-label={found ? `翻閱${item.title}` : `未發現：${item.teaser}`}>
      <span className="jp-leaf-art" style={{'--crop-ratio': item.crop.rect[2] / item.crop.rect[3]} as CSSProperties}>
        {found ? <ArtCrop crop={item.crop} label={item.title}/> : <span className="jp-unseen">待尋</span>}
      </span><span className="jp-leaf-name">{found ? item.title : item.teaser}</span><small>{courts[Math.floor(index / 2)]}</small>
    </button>;
  })}</div>;
  return <main className={`immersive-game lantern-game journal-preview jp-${layout} ${present ? 'has-reading' : ''}`}>
    <div className="jp-painting"><ScrollScene image={lanternFullScroll} tiles={lanternTiles} artworkSize={lanternSize} requireTiles actors={[]}
      active blocked={present || Boolean(encounter)} resetKey={0} hint={null} onInspect={ignore} onReady={setReady} motion={false} steam={null}
      initialRegion={{x: finding.actor.x, y: finding.actor.y}} studyCommand={sceneCommand} focusing={!present && !encounter}
      initialFocus={{x:.34,y:.49}} title="憲宗元宵行樂圖" description="在原畫中比較兩種見聞閱讀體驗"/></div>
    <header className="jp-toolbar">
      <div className="jp-preview-title"><span>版式比較</span><strong>元宵見聞</strong></div>
      <nav aria-label="比較兩種見聞版式"><button aria-pressed={layout === 'album'} onClick={() => switchLayout('album')}><b>A</b>完整畫冊</button><button aria-pressed={layout === 'beside'} onClick={() => switchLayout('beside')}><b>B</b>畫卷旁閱讀</button></nav>
      <a href="#lantern-festival">回到遊戲</a>
    </header>
    {present && <section ref={reading} tabIndex={-1} key={`${layout}-${replay}`} className={`jp-reading ${closing ? 'is-closing' : ''}`} aria-label={layout === 'album' ? 'A 完整見聞畫冊' : 'B 畫卷旁閱讀'} onKeyDown={event => {if(event.key === 'Escape'){event.preventDefault();close();}}}
      onAnimationEnd={event => {if(closing && event.target === event.currentTarget)finishClose();}}>
      <header className="jp-book-header"><div><h1>元宵見聞冊</h1><span>{collected.length}／6 則見聞</span></div><button onClick={close}>合上見聞冊 <span aria-hidden="true">×</span></button></header>
      {page === 'index' ? <div className="jp-index"><div className="jp-index-intro"><h2>在畫中，收下你的發現。</h2><p>有些熱鬧，要走近一點才看得見。</p></div>{leaves}</div>
        : <div className="jp-detail" key={finding.id}>
          {layout === 'album' && <figure className="jp-detail-art" style={{'--crop-ratio': finding.crop.rect[2] / finding.crop.rect[3]} as CSSProperties}><ArtCrop crop={finding.crop} label={`原畫局部：${finding.title}`}/><figcaption>《憲宗元宵行樂圖》原畫局部</figcaption></figure>}
          <article className="jp-detail-copy">{detail}<div className="jp-detail-controls"><button onClick={() => {setPage('index');setReplay(n=>n+1);}}>翻看全部見聞</button><div><button aria-label="上一則已收藏見聞" onClick={() => {for(let i=1;i<=6;i++){const item=lanternFindings[(activeIndex-i+6)%6];if(collected.includes(item.id)){select(item.id);break;}}}}>←</button><button aria-label="下一則已收藏見聞" onClick={() => {for(let i=1;i<=6;i++){const item=lanternFindings[(activeIndex+i)%6];if(collected.includes(item.id)){select(item.id);break;}}}}>→</button></div></div></article>
        </div>}
      {page === 'detail' && <nav className="jp-bookmarks" aria-label="已收藏見聞">{lanternFindings.filter(item=>collected.includes(item.id)).map(item=><button key={item.id} aria-pressed={selected===item.id} onClick={()=>select(item.id)}>{item.title}</button>)}</nav>}
    </section>}
    {encounter && <section ref={encounterNote} tabIndex={-1} key={`${finding.id}-${encounter}`} className="jp-encounter" aria-label="試作發現一則見聞"><span className="jp-encounter-label">{encounter === 'quote' ? '畫中人的話 · 遊戲虛構' : '凝神，再看一眼'}</span><h2>{encounter === 'quote' ? `「${finding.quote}」` : finding.title}</h2><p>{encounter === 'quote' ? '這一處，也藏着元宵的見聞。' : finding.observe}</p><button onClick={encounter === 'quote' ? ()=>setEncounter('observe') : collect}>{encounter === 'quote' ? '看仔細些' : '收入見聞冊'} <span>→</span></button></section>}
    {flight && <div className="jp-collect-flight" aria-hidden="true"><ArtCrop crop={finding.crop} label=""/></div>}
    {!present && <button ref={bookButton} className={`jp-open-book ${flight ? 'is-receiving' : ''}`} onClick={()=>{setPage('detail');open();}}>翻開見聞冊 <span>{collected.length}／6</span></button>}
    {!present && <p className="jp-collected-message" role="status">{notice}</p>}
    <footer className="jp-demo-tools"><span>{layout==='album'?'A · 打開完整畫冊，專心翻閱':'B · 留在原畫，對照細節'}<small>比較用進度，不影響遊戲收藏</small></span><div><button onClick={tryFinding} disabled={!ready || flight}>試收一則見聞</button><button onClick={()=>{if(present){setReplay(n=>n+1);}else open();}} disabled={!ready}>重播開冊轉場</button></div></footer>
    {!ready && <p className="jp-loading" role="status">正在展開原畫…</p>}
  </main>;
}
