import { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, CircleHelp, Coffee, Feather, Lightbulb, Move, RotateCcw, X, ZoomIn } from 'lucide-react';
import { ScrollScene } from './components/ScrollScene.tsx';
import type { SceneHint } from './components/ScrollScene.tsx';
import { level } from './game/level.ts';
import type { SceneActor } from './game/level.ts';
import { createGame, reduceGame } from './game/state.ts';

type Dialogue = { title: string; subtitle: string; text: string; kind: 'clue' | 'notice' | 'guide' };

export default function App() {
  const [game, dispatch] = useReducer(reduceGame, undefined, createGame);
  const [ready, setReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [hint, setHint] = useState<SceneHint | null>(null);
  const hintCounts = useRef<Record<string, number>>({});
  const hintToken = useRef(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const clues = level.actors.filter(actor => actor.kind === 'witness');
  const isPlaying = game.phase === 'exploring';
  const finished = game.phase === 'complete';

  useEffect(() => {
    if (dialogue && !dialog.current?.open) dialog.current?.showModal();
    if (!dialogue && dialog.current?.open) dialog.current?.close();
  }, [dialogue]);

  const begin = () => {
    dispatch({type: game.phase === 'intro' ? 'start' : 'restart'});
    setDialogue(null); setHint(null); hintCounts.current = {};
    setResetKey(key => key + 1);
  };
  const inspect = (id: string) => {
    const actor = level.actors.find(a => a.id === id);
    if (!actor || !isPlaying) return;
    dispatch({type: 'inspect', id});
    if (actor.kind === 'witness') {
      setDialogue({title: actor.name, subtitle: game.clues.includes(id) ? '重讀證詞' : '尋得一條線索', text: actor.quote!, kind: 'clue'});
      setHint(null);
    } else if (game.clues.length < 2) {
      setDialogue({title: '先打聽，再尋人', subtitle: '線索尚未齊備', text: '先找持筆的抄榜人與提茶壺的掌櫃，聽聽他們怎麼說。', kind: 'notice'});
    } else if (actor.kind !== 'target') {
      setDialogue({title: '再仔細看看', subtitle: '似乎還不是他', text: '他的特徵與線索還未完全吻合。把兩條證詞合起來，再找找看。', kind: 'notice'});
    } else {
      setHint({actorId: id, level: 2, token: ++hintToken.current});
    }
  };
  const showHint = () => {
    const id = clues.find(a => !game.clues.includes(a.id))?.id ?? 'scholar-target';
    hintCounts.current[id] = Math.min(2, (hintCounts.current[id] ?? 0) + 1);
    setHint({actorId: id, level: hintCounts.current[id], token: ++hintToken.current});
  };
  const readClue = (actor: SceneActor) => {
    if (game.clues.includes(actor.id)) setDialogue({title: actor.name, subtitle: '線索簿 · 證詞', text: actor.quote!, kind: 'clue'});
  };
  const guide = () => setDialogue({title: '觀畫有法，尋人有據', subtitle: '遊玩指南', text: '拖曳畫卷，滾輪或雙指放大。先點擊持筆抄榜的人與提茶壺的掌櫃，取得兩條證詞；再結合線索，點出橋邊的考生。需要幫忙時，可用「提示」先縮小範圍。', kind: 'guide'});
  const currentStep = finished ? 3 : game.clues.length === 2 ? 2 : isPlaying ? 1 : 0;

  return <div className="app-shell">
    <header className="site-header">
      <a className="brand" href="/" aria-label="畫中有案首頁"><span className="brand-seal">畫</span><span>畫中有案<span className="brand-subtitle">循線入畫 · 尋人於卷</span></span></a>
      <div className="header-right"><span className="edition">一卷一案</span><span className="header-separator"/><button className="text-button guide-button" onClick={guide}><CircleHelp size={16}/><span>遊玩指南</span></button></div>
    </header>

    <main>
      <section className="chapter-heading">
        <div><div className="eyebrow"><span className="eyebrow-line"/>第一卷<span className="eyebrow-dot">·</span>市井尋蹤</div><div className="title-row"><h1>{level.title}</h1><span className="title-stamp">放榜日</span></div><p className="chapter-subtitle">人海之中，線索藏在細處。</p></div>
        <div className="chapter-details"><div className="journey" aria-label="遊戲進度">{['展卷', '問訊', '尋人'].map((step, index) => <span key={step} className={`journey-step ${currentStep === index ? 'is-current' : ''} ${currentStep > index ? 'is-done' : ''}`}><span className="step-number">{currentStep > index ? <Check size={11}/> : `0${index + 1}`}</span>{step}{index < 2 && <span className="step-line"/>}</span>)}</div><span className="chapter-note">約兩分鐘的畫中小案</span></div>
      </section>

      <section className={`playfield-shell ${game.phase === 'intro' ? 'is-intro' : ''}`} aria-label="遊戲畫卷">
        <ScrollScene image={level.image} actors={level.actors} active={game.phase !== 'intro'} blocked={Boolean(dialogue) || finished} resetKey={resetKey} hint={hint} onInspect={inspect} onReady={setReady}/>

        {game.phase === 'intro' && <div className="intro-card"><span className="card-kicker">一紙委託 · 兩條線索</span><h2>展卷，入畫。</h2><p>{level.introduction}</p><button className="primary-button" onClick={begin} disabled={!ready}><span>{ready ? '入畫尋人' : '等待畫卷展開'}</span><ArrowRight size={18}/></button><span className="intro-footnote">點擊問訊，結合線索，再從人群中尋人。</span></div>}

        {finished && <div className="ending-card" role="status"><div className="ending-seal">尋得</div><span className="card-kicker">此案已解</span><h2>人海相逢</h2><p>{level.ending}</p><button className="primary-button" onClick={begin}><span>再展此卷</span><RotateCcw size={16}/></button><span className="intro-footnote">故事雖小，一次相逢便是結局。</span></div>}
      </section>

      <section className="evidence-section" aria-label="線索簿">
        <div className="evidence-heading"><span className="evidence-label"><BookOpen size={17}/><span>線索簿</span><span className="clue-count">{game.clues.length}<span>/ 2</span></span></span><button className="text-button hint-button" disabled={!isPlaying || !ready || Boolean(dialogue)} onClick={showHint}><Lightbulb size={16}/>給我一點提示</button></div>
        <div className="clue-grid">{clues.map((actor, index) => {
          const collected = game.clues.includes(actor.id);
          return <button key={actor.id} className={`clue-card ${collected ? 'is-collected' : ''}`} disabled={!collected} onClick={() => readClue(actor)}><span className="clue-icon">{index === 0 ? <Feather size={22}/> : <Coffee size={22}/>}</span><span className="clue-content"><span className="clue-kicker">線索{index === 0 ? '一' : '二'}<span className="clue-source">{collected ? actor.name : '待尋'}</span></span><span className="clue-title">{collected ? actor.clueTitle : actor.search}</span><span className="clue-description">{collected ? actor.quote : '在畫中找到他，點擊聽取證詞。'}</span></span><span className={`clue-status ${collected ? 'is-collected' : ''}`}>{collected ? <Check size={13}/> : '·'}</span></button>;
        })}</div>
        <p className={`objective ${game.clues.length === 2 ? 'is-ready' : ''}`} aria-live="polite">{finished ? '兩條線索，一次相逢。此卷的故事告一段落。' : game.clues.length === 2 ? '線索齊了。把兩段證詞合起來，試着找回考生。' : '先問訊，再尋人。每個細節，都可能是下一步的方向。'}</p>
      </section>
    </main>

    <footer className="site-footer"><span>虛構科舉放榜日 · 原創長卷</span><span className="footer-controls"><Move size={13}/>拖曳移動<ZoomIn size={13}/>滾輪／雙指縮放</span><span className="footer-brand">畫中有案</span></footer>

    <dialog ref={dialog} className="dialogue" onCancel={() => setDialogue(null)} onClose={() => setDialogue(null)} aria-labelledby="dialogue-title">
      {dialogue && <><button className="dialogue-close" aria-label="關閉對話" onClick={() => setDialogue(null)}><X size={19}/></button><span className="card-kicker">{dialogue.subtitle}</span><h2 id="dialogue-title">{dialogue.title}</h2><p className={dialogue.kind === 'clue' ? 'witness-quote' : ''}>{dialogue.text}</p><button className="primary-button" onClick={() => {setDialogue(null); dispatch({type: 'dismiss-feedback'});}}><span>{dialogue.kind === 'clue' ? '記下，繼續尋人' : '回到畫卷'}</span><ArrowRight size={17}/></button></>}
    </dialog>
  </div>;
}
