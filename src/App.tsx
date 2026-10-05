import { useEffect, useReducer, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, BookOpen, Check, ChevronUp, CircleHelp, Coffee, Feather, Lightbulb, Maximize, Minimize, Move, RotateCcw, Volume2, VolumeX, Waves, X } from 'lucide-react';
import { ScrollScene } from './components/ScrollScene.tsx';
import type { SceneHint } from './components/ScrollScene.tsx';
import { useAmbience } from './audio/useAmbience.ts';
import { level } from './game/level.ts';
import type { SceneActor } from './game/level.ts';
import type { Point } from './game/geometry.ts';
import { createGame, reduceGame } from './game/state.ts';

type Dialogue = { title: string; subtitle: string; text: string; kind: 'clue' | 'notice' | 'guide'; anchor?: Point };

export default function App() {
  const [game, dispatch] = useReducer(reduceGame, undefined, createGame);
  const [ready, setReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [journal, setJournal] = useState(false);
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState('');
  const [hint, setHint] = useState<SceneHint | null>(null);
  const hintCounts = useRef<Record<string, number>>({});
  const hintToken = useRef(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const clues = level.actors.filter(actor => actor.kind === 'witness');
  const isPlaying = game.phase === 'exploring';
  const finished = game.phase === 'complete';
  const sound = useAmbience(Boolean(dialogue) || journal || !isPlaying);
  const soundLabel = sound.state === 'on' ? '市井聲音已開啟' : sound.state === 'loading' ? '聲音載入中，點擊取消' : sound.state === 'error' ? '聲音未能載入，點擊重試' : '開啟市井聲音';

  useEffect(() => {
    if ((dialogue || journal) && !dialog.current?.open) dialog.current?.showModal();
    if (!dialogue && !journal && dialog.current?.open) dialog.current?.close();
  }, [dialogue, journal]);
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(!preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!fullscreenNotice) return;
    const timeout = window.setTimeout(() => setFullscreenNotice(''), 4500);
    return () => window.clearTimeout(timeout);
  }, [fullscreenNotice]);

  const close = () => {setDialogue(null); setJournal(false); dispatch({type: 'dismiss-feedback'});};
  const begin = () => {
    dispatch({type: game.phase === 'intro' ? 'start' : 'restart'});
    setDialogue(null); setJournal(false); setHint(null); hintCounts.current = {};
    setResetKey(key => key + 1);
  };
  const inspect = (id: string, anchor?: Point) => {
    const actor = level.actors.find(a => a.id === id);
    if (!actor || !isPlaying) return;
    dispatch({type: 'inspect', id});
    if (actor.kind === 'witness') {
      setDialogue({title: actor.name, subtitle: game.clues.includes(id) ? '重讀證詞' : '尋得一條線索', text: actor.quote!, kind: 'clue', anchor});
      setHint(null);
    } else if (game.clues.length < 2) {
      setDialogue({title: '先打聽，再尋人', subtitle: '線索尚未齊備', text: '先找持筆的抄榜人與提茶壺的掌櫃，聽聽他們怎麼說。', kind: 'notice', anchor});
    } else if (actor.kind !== 'target') {
      setDialogue({title: '再仔細看看', subtitle: '似乎還不是他', text: '他的特徵與線索還未完全吻合。把兩條證詞合起來，再找找看。', kind: 'notice', anchor});
    } else setHint({actorId: id, level: 2, token: ++hintToken.current});
  };
  const showHint = () => {
    const id = clues.find(a => !game.clues.includes(a.id))?.id ?? 'scholar-target';
    hintCounts.current[id] = Math.min(2, (hintCounts.current[id] ?? 0) + 1);
    setHint({actorId: id, level: hintCounts.current[id], token: ++hintToken.current});
  };
  const readClue = (actor: SceneActor) => {
    if (game.clues.includes(actor.id)) {setJournal(false); setDialogue({title: actor.name, subtitle: '線索簿 · 證詞', text: actor.quote!, kind: 'clue'});}
  };
  const guide = () => {setJournal(false); setDialogue({title: '觀畫有法，尋人有據', subtitle: '遊玩指南', text: '拖曳畫卷，滾輪或雙指放大。先點擊持筆抄榜的人與提茶壺的掌櫃，取得兩條證詞；再結合線索，點出橋邊的考生。線索簿可重讀證詞，提示可縮小尋找範圍。右上角可開啟市井聲音、切換微動；「覽全卷」可查看整幅古畫。', kind: 'guide'});};
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setFullscreenNotice('這個瀏覽器未提供全螢幕；畫卷已鋪滿視窗。');
    } catch { setFullscreenNotice('未能切換全螢幕；畫卷已鋪滿視窗。'); }
  };
  const objective = finished ? '書童與考生，終於相逢。' : game.clues.length === 2 ? '結合兩條證詞，尋找橋邊的考生。' : '向抄榜人與茶攤掌櫃問訊。';
  const anchor = dialogue?.anchor;
  const placement = anchor && window.innerWidth > 650 ? {
    '--dialog-x': `${anchor.x < window.innerWidth * .58 ? anchor.x + 45 : anchor.x - 395}px`,
    '--dialog-y': `${anchor.y - 120}px`,
  } as CSSProperties : undefined;

  return <main className={`immersive-game phase-${game.phase}`} aria-label="榜下尋人遊戲">
    <ScrollScene image={level.image} actors={level.actors} active={game.phase !== 'intro'} blocked={Boolean(dialogue) || journal || finished} resetKey={resetKey} hint={hint} onInspect={inspect} onReady={setReady} motion={motion}/>
    <div className="scene-vignette" aria-hidden="true"/>

    <header className="scene-hud">
      <div className="mission"><span className="mini-seal">畫</span><div><span className="mission-chapter">{level.subtitle}</span><h1>{game.phase === 'intro' ? level.title : '替書童找回走散的考生'}</h1>{game.phase !== 'intro' && <p aria-live="polite">{objective}</p>}</div></div>
      <nav className="scene-settings" aria-label="場景設定">
        <button className={`hud-button sound-button ${sound.state === 'on' ? 'is-on' : ''}`} aria-label={soundLabel} title={soundLabel} aria-pressed={sound.state === 'on' || sound.state === 'loading'} onClick={() => void sound.toggle()}>{sound.state === 'on' ? <Volume2 size={19}/> : <VolumeX size={19}/>}<span>{sound.state === 'loading' ? '載入中' : sound.state === 'on' ? '聲音開' : sound.state === 'error' ? '重試聲音' : '聲音關'}</span></button>
        <button className="hud-button icon-only" aria-label={motion ? '關閉畫卷微動' : '開啟畫卷微動'} title={motion ? '關閉微動' : '開啟微動'} aria-pressed={motion} onClick={() => setMotion(value => !value)}><Waves size={19}/></button>
        <button className="hud-button icon-only fullscreen-button" aria-label={fullscreen ? '離開全螢幕' : '進入全螢幕'} title={fullscreen ? '離開全螢幕' : '全螢幕'} onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}</button>
        <button className="hud-button icon-only" aria-label="遊玩指南" title="遊玩指南" onClick={guide}><CircleHelp size={19}/></button>
      </nav>
    </header>

    {game.phase === 'intro' && <section className="intro-card" aria-labelledby="intro-title"><span className="card-kicker">一紙委託</span><h2 id="intro-title">人海茫茫，<br/>故人何處？</h2><p>{level.introduction}</p><button className="primary-button" onClick={begin} disabled={!ready}><span>{ready ? '入畫尋人' : '等待畫卷展開'}</span><ArrowRight size={18}/></button><span className="intro-footnote">兩條線索，一次相逢。約兩分鐘。</span></section>}

    {finished && <section className="ending-card" role="status"><div className="ending-seal">尋得</div><span className="card-kicker">此案已解</span><h2>人海相逢</h2><p>{level.ending}</p><button className="primary-button" onClick={begin}><span>再展此卷</span><RotateCcw size={16}/></button></section>}

    <div className="bottom-hud">
      {game.phase !== 'intro' ? <button className="notebook-toggle" onClick={() => {setDialogue(null); setJournal(true);}} aria-haspopup="dialog" aria-label={`打開線索簿，已找到${game.clues.length}條線索`}><BookOpen size={19}/><span>線索簿</span><span className="notebook-count" key={game.clues.length}>{game.clues.length}<small>/ 2</small></span><ChevronUp size={14}/></button> : <span className="scroll-signature">畫中有案<span>第一卷</span></span>}
      {isPlaying && <span className="gesture-note"><Move size={13}/>拖曳觀畫，點人問訊</span>}
      {isPlaying && <button className="hint-button hud-button" disabled={!ready || Boolean(dialogue) || journal} onClick={showHint}><Lightbulb size={18}/><span>提示</span></button>}
    </div>
    {(fullscreenNotice || sound.state === 'error') && <p className="scene-toast" role="status">{fullscreenNotice || '聲音暫時未能載入，可點擊右上角重試。'}</p>}

    <dialog ref={dialog} className={`dialogue ${journal ? 'notebook-dialog' : ''} ${anchor ? 'witness-dialog' : ''}`} style={placement} onCancel={close} onClose={() => {setDialogue(null); setJournal(false);}} aria-labelledby="dialogue-title">
      <button className="dialogue-close" aria-label="關閉對話" onClick={close}><X size={19}/></button>
      {journal ? <><span className="card-kicker">隨身筆記</span><h2 id="dialogue-title">線索簿 <span className="journal-count">{game.clues.length} / 2</span></h2><div className="clue-list">{clues.map((actor, index) => {
        const collected = game.clues.includes(actor.id);
        return <button key={actor.id} className={`clue-card ${collected ? 'is-collected' : ''}`} disabled={!collected} onClick={() => readClue(actor)}><span className="clue-icon">{index === 0 ? <Feather size={20}/> : <Coffee size={20}/>}</span><span className="clue-content"><span className="clue-kicker">{collected ? actor.name : `線索${index === 0 ? '一' : '二'} · 待尋`}</span><span className="clue-title">{collected ? actor.clueTitle : actor.search}</span><span className="clue-description">{collected ? actor.quote : '在畫中找到他，點擊聽取證詞。'}</span></span>{collected && <Check size={16}/>}</button>;
      })}</div><p className="journal-objective">{objective}</p><button className="primary-button" onClick={close}><span>收起，繼續觀畫</span><ArrowRight size={17}/></button></> : dialogue && <><span className="card-kicker">{dialogue.subtitle}</span><h2 id="dialogue-title">{dialogue.title}</h2><p className={dialogue.kind === 'clue' ? 'witness-quote' : ''}>{dialogue.text}</p><button className="primary-button" onClick={close}><span>{dialogue.kind === 'clue' ? '記下，繼續尋人' : '回到畫卷'}</span><ArrowRight size={17}/></button></>}
    </dialog>
  </main>;
}
