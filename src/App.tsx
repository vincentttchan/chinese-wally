import { useEffect, useReducer, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronUp, CircleHelp, Maximize, Minimize, MoreHorizontal, RotateCcw, Volume2, VolumeX, Waves, X, ZoomIn, ZoomOut } from './components/ArtIcons.tsx';
import { PaintedPortrait } from './components/PaintedPortrait.tsx';
import { ScrollScene } from './components/ScrollScene.tsx';
import type { SceneCommand, SceneHint, SceneSelection } from './components/ScrollScene.tsx';
import { useAmbience } from './audio/useAmbience.ts';
import { level } from './game/level.ts';
import { knowledge } from './game/knowledge.ts';
import type { SceneActor } from './game/level.ts';
import type { Point } from './game/geometry.ts';
import { createGame, reduceGame } from './game/state.ts';

type Dialogue = {title: string; subtitle: string; text: string; anchor?: Point};

export default function App() {
  const [game, dispatch] = useReducer(reduceGame, undefined, createGame);
  const [ready, setReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [journal, setJournal] = useState(false);
  const [journalPresent, setJournalPresent] = useState(false);
  const [menu, setMenu] = useState(false);
  const [missionOpen, setMissionOpen] = useState(true);
  const [instruction, setInstruction] = useState(true);
  const [endingVisible, setEndingVisible] = useState(false);
  const [reading, setReading] = useState<'knowledge' | 'guide' | null>(null);
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const [hint, setHint] = useState<SceneHint | null>(null);
  const [selection, setSelection] = useState<SceneSelection | null>(null);
  const [command, setCommand] = useState<SceneCommand | null>(null);
  const [hintText, setHintText] = useState('');
  const token = useRef(0);
  const hintCounts = useRef<Record<string, number>>({});
  const explored = useRef(false);
  const collapseTimer = useRef<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const notebookButton = useRef<HTMLButtonElement>(null);
  const paperButton = useRef<HTMLButtonElement>(null);
  const witnessClose = useRef<HTMLButtonElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  const notebook = useRef<HTMLElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const witness = useRef<HTMLElement>(null);
  const clues = level.actors.filter(actor => actor.kind === 'witness');
  const playing = game.phase === 'exploring';
  const finished = game.phase === 'complete';
  const reduced = !motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sound = useAmbience(Boolean(dialogue) || journal || Boolean(reading) || !playing);
  const soundLabel = sound.state === 'on' ? '關閉市井聲音' : sound.state === 'loading' ? '聲音載入中，點擊取消' : sound.state === 'error' ? '重試市井聲音' : '開啟市井聲音';

  useEffect(() => {
    if (journal) {setJournalPresent(true); return;}
    const timer = window.setTimeout(() => setJournalPresent(false), reduced ? 0 : 380);
    return () => window.clearTimeout(timer);
  }, [journal, reduced]);
  useEffect(() => {
    if (reading && !dialog.current?.open) dialog.current?.showModal();
    if (!reading && dialog.current?.open) dialog.current?.close();
  }, [reading]);
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionUpdate = () => setMotion(!preference.matches);
    preference.addEventListener('change', motionUpdate);
    return () => {document.removeEventListener('fullscreenchange', update); preference.removeEventListener('change', motionUpdate); if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current);};
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    if (!ready || !instruction) return;
    const timer = window.setTimeout(() => setInstruction(false), 6200);
    return () => window.clearTimeout(timer);
  }, [ready, instruction]);
  useEffect(() => {
    if (!finished) {setEndingVisible(false); return;}
    const timeout = window.setTimeout(() => setEndingVisible(true), reduced ? 250 : 1750);
    return () => window.clearTimeout(timeout);
  }, [finished, reduced]);
  useEffect(() => {
    if (!hintText) return;
    const timeout = window.setTimeout(() => setHintText(''), 4200);
    return () => window.clearTimeout(timeout);
  }, [hintText, hint?.token]);
  useEffect(() => {if (dialogue) witnessClose.current?.focus({preventScroll: true});}, [dialogue]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      const node = event.target as Node;
      if (menu && !menuPanel.current?.contains(node) && !moreButton.current?.contains(node)) setMenu(false);
      if (journal && !notebook.current?.contains(node) && !notebookButton.current?.contains(node)) setJournal(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || reading) return;
      if (dialogue) {setDialogue(null); paperButton.current?.focus({preventScroll: true});}
      if (journal) {setJournal(false); notebookButton.current?.focus({preventScroll: true});}
      if (menu) {setMenu(false); moreButton.current?.focus({preventScroll: true});}
    };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => {document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape);};
  }, [menu, journal, dialogue, reading]);

  const closeWitness = () => {setDialogue(null); dispatch({type: 'dismiss-feedback'}); paperButton.current?.focus({preventScroll: true});};
  const begin = () => {
    dispatch({type: game.phase === 'intro' ? 'start' : 'restart'});
    setDialogue(null); setJournal(false); setMenu(false); setReading(null); setHint(null); setSelection(null); setHintText('');
    hintCounts.current = {}; explored.current = false; setMissionOpen(true); setResetKey(key => key + 1);
    if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current);
  };
  const explore = () => {
    setInstruction(false);
    if (!playing) return;
    if (explored.current) return;
    explored.current = true;
    collapseTimer.current = window.setTimeout(() => setMissionOpen(false), 2000);
  };
  const inspect = (id: string, anchor?: Point) => {
    const actor = level.actors.find(a => a.id === id);
    if (!actor || !playing) return;
    setMenu(false); setJournal(false);
    dispatch({type: 'inspect', id});
    if (actor.kind === 'witness') {
      setDialogue({title: actor.name, subtitle: game.clues.includes(id) ? '重讀證詞' : '線索已錄', text: actor.quote!, anchor});
      if (!game.clues.includes(id)) setSelection({actorId: id, kind: 'clue', token: ++token.current});
      setHint(null); setHintText('');
    } else if (game.clues.length < 2) {
      setNotice('先向抄榜人與茶攤掌櫃問訊，再把兩條證詞合起來。');
    } else if (actor.kind !== 'target') {
      setSelection({actorId: id, kind: 'wrong', token: ++token.current});
    } else {
      setDialogue(null); setHint(null); setHintText('');
      setSelection({actorId: id, kind: 'found', token: ++token.current});
    }
  };
  const showHint = () => {
    const id = clues.find(a => !game.clues.includes(a.id))?.id ?? 'scholar-target';
    const count = (hintCounts.current[id] ?? 0) + 1;
    hintCounts.current[id] = count;
    const messages: Record<string, string[]> = {
      copyist: ['榜牆前，有人正伏案記下榜上的名字。', '留意榜牆下的小桌，持筆的人或許知道些甚麼。'],
      'tea-keeper': ['茶攤前的掌櫃，可能見過匆匆經過的考生。', '找找中央茶攤，誰正提着茶壺招呼客人？'],
      'scholar-target': ['把「青色長衫」與「方形書箱」合起來，再看看橋頭。', '橋頭附近，有人背着書箱等候；留意他的衣衫。'],
    };
    setHintText(messages[id][Math.min(count - 1, 1)]);
    setHint({actorId: id, level: Math.min(count, 2), token: ++token.current});
  };
  const readClue = (actor: SceneActor) => {if (game.clues.includes(actor.id)) {setJournal(false); setDialogue({title: actor.name, subtitle: '線索簿 · 證詞', text: actor.quote!});}};
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setNotice('畫卷已鋪滿視窗；此瀏覽器未提供全螢幕。');
    } catch {setNotice('未能切換全螢幕；畫卷已鋪滿視窗。');}
  };
  const sceneCommand = (type: SceneCommand['type']) => {setMenu(false); setCommand({type, token: ++token.current});};
  const toggleMission = () => {if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current); setMissionOpen(value => !value);};
  const objective = finished ? '書童與考生，終於相逢。' : game.clues.length === 2 ? '結合兩條證詞，尋找橋邊的考生。' : '向抄榜人與茶攤掌櫃問訊。';
  const anchor = dialogue?.anchor;
  const placement = anchor ? {'--dialog-x': `${anchor.x < window.innerWidth * .58 ? anchor.x + 36 : anchor.x - 386}px`, '--dialog-y': `${anchor.y - 100}px`} as CSSProperties : undefined;

  return <main className={`immersive-game phase-${game.phase} ${ready ? 'scene-loaded' : ''} ${reduced ? 'reduced-motion' : ''} ${endingVisible ? 'ending-visible' : ''}`} aria-label="榜下尋人遊戲">
    <h1 className="sr-only">榜下尋人 · 科舉放榜日</h1>
    <ScrollScene image={level.image} actors={level.actors} active={game.phase !== 'intro'} blocked={Boolean(dialogue) || Boolean(reading) || finished} resetKey={resetKey} hint={hint} selection={selection} command={command} onInspect={inspect} onExplore={explore} onReady={setReady} motion={motion}/>
    <div className="scene-vignette" aria-hidden="true"/>
    <header className="scene-hud">
      <section className={`mission ${missionOpen ? 'is-expanded' : 'is-collapsed'}`} aria-label="尋人任務">
        <button ref={paperButton} className="mission-summary" aria-expanded={missionOpen} aria-controls="mission-details" onClick={toggleMission}>
          <span className="mini-seal">畫</span><span className="mission-heading"><span className="mission-chapter">{level.subtitle}</span><strong>替書童找回走散的考生</strong><span className="mission-objective" aria-live="polite">{objective}</span></span><span className="mission-count" key={game.clues.length}><b>{game.clues.length}</b> / 2</span><ChevronDown size={14} className="mission-chevron"/>
        </button>
        <div className="mission-details" id="mission-details" hidden={!missionOpen}>{game.phase === 'intro' ? <><p>{level.introduction}</p><button className="primary-button" onClick={begin} disabled={!ready}><span>{ready ? '入畫尋人' : '正在展卷'}</span><ArrowRight size={17}/></button></> : <p>先取得兩條證詞，再從人群中找出符合特徵的考生。全景已可點人，放大能看清細節。</p>}</div>
      </section>
      <nav className="scene-settings" aria-label="場景設定">
        <button className={`round-control ${sound.state === 'on' ? 'is-on' : ''}`} aria-label={soundLabel} title={soundLabel} aria-pressed={sound.state === 'on' || sound.state === 'loading'} onClick={() => void sound.toggle()}>{sound.state === 'on' ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button>
        <button className="round-control" aria-label={fullscreen ? '離開全螢幕' : '進入全螢幕'} title="全螢幕" onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}</button>
        <button ref={moreButton} className="round-control" aria-label="更多觀畫設定" aria-expanded={menu} aria-controls="scene-menu" title="更多" onClick={() => setMenu(value => !value)}><MoreHorizontal size={21}/></button>
      </nav>
    </header>
    {menu && <div className="settings-paper" id="scene-menu" ref={menuPanel} role="region" aria-label="觀畫設定"><span className="card-kicker">觀畫有法</span><button onClick={() => setMotion(value => !value)} aria-pressed={motion}><Waves size={17}/>{motion ? '關閉畫卷微動' : '開啟畫卷微動'}</button><button onClick={() => sceneCommand('in')}><ZoomIn size={17}/>放大畫卷</button><button onClick={() => sceneCommand('out')}><ZoomOut size={17}/>縮小畫卷</button><button onClick={() => sceneCommand('overview')}><Maximize size={17}/>覽全卷</button><button onClick={() => {setMenu(false); setReading('guide');}}><CircleHelp size={17}/>遊玩指南</button></div>}

    <div className="bottom-hud"><button ref={notebookButton} className="notebook-toggle" disabled={game.phase === 'intro'} aria-expanded={journal} aria-controls="clue-notebook" onClick={() => {setDialogue(null); setJournal(value => !value);}} aria-label={`線索簿，已找到${game.clues.length}條線索`}><BookOpen size={19}/><span>線索簿</span><span className="notebook-count" key={game.clues.length}>{game.clues.length}<small>/ 2</small></span>{journal ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}</button><span className={`gesture-note ${instruction ? '' : 'is-dismissed'}`}>拖曳探索 · 滾動縮放</span>{playing && <button className="hint-button" disabled={!ready || Boolean(dialogue) || Boolean(reading)} onClick={showHint}><CircleHelp size={19}/><span>尋人錦囊</span></button>}</div>
    {journalPresent && <aside ref={notebook} className={`notebook-paper ${journal ? '' : 'is-closing'}`} aria-hidden={!journal} inert={!journal} id="clue-notebook" aria-label="線索簿內容"><button className="paper-close" aria-label="收起線索簿" onClick={() => {setJournal(false); notebookButton.current?.focus({preventScroll: true});}}><X size={18}/></button><span className="card-kicker">隨身筆記</span><h2>線索簿 <span className="journal-count">{game.clues.length} / 2</span></h2><div className="clue-list">{clues.map((actor, index) => <button key={actor.id} className={`clue-card ${game.clues.includes(actor.id) ? 'is-collected' : ''}`} disabled={!game.clues.includes(actor.id)} onClick={() => readClue(actor)} style={{'--clue-delay': `${index * 50}ms`} as CSSProperties}><PaintedPortrait actor={actor} image={level.image}/><span className="clue-content"><span className="clue-kicker">{game.clues.includes(actor.id) ? actor.name : `線索${index === 0 ? '一' : '二'} · 待尋`}</span><span className="clue-title">{game.clues.includes(actor.id) ? actor.clueTitle : actor.search}</span><span className="clue-description">{game.clues.includes(actor.id) ? actor.quote : '在畫中找到他，點擊聽取證詞。'}</span></span>{game.clues.includes(actor.id) && <Check size={15}/>}</button>)}</div><p className="journal-objective">{objective}</p></aside>}
    {dialogue && <section ref={witness} className={`witness-paper ${anchor ? 'is-anchored' : ''}`} style={placement} role="dialog" aria-modal="false" aria-labelledby="witness-title"><button ref={witnessClose} className="paper-close" aria-label="關閉證詞" onClick={closeWitness}><X size={18}/></button><span className="card-kicker">{dialogue.subtitle}</span><h2 id="witness-title">{dialogue.title}</h2><p className="witness-quote">{dialogue.text}</p><button className="primary-button" onClick={closeWitness}><span>記下，繼續尋人</span><ArrowRight size={17}/></button></section>}
    {hintText && <aside className="hint-paper" role="status"><span className="card-kicker">尋人錦囊</span><p>{hintText}</p></aside>}
    {(notice || sound.state === 'error') && <p className="scene-toast" role="status">{notice || '聲音未能載入，可點擊右上角重試。'}</p>}
    {finished && !endingVisible && <button className="skip-ending" onClick={() => setEndingVisible(true)}>略過，查看結局</button>}
    {finished && endingVisible && <section className="ending-card" role="status"><span className="card-kicker">此案已解</span><h2>人海相逢</h2><p>{level.ending}</p><button className="primary-button" onClick={() => setReading('knowledge')}><span>讀一則科舉小知識</span><BookOpen size={17}/></button><button className="replay-button" onClick={begin}><RotateCcw size={15}/>再展此卷</button></section>}

    <dialog ref={dialog} className="reading-paper" onCancel={() => setReading(null)} onClose={() => setReading(null)} aria-labelledby="reading-title"><button className="paper-close" aria-label="關閉閱讀" onClick={() => setReading(null)}><X size={19}/></button>{reading === 'knowledge' ? <><span className="card-kicker">科舉小知識 · 約一分鐘</span><h2 id="reading-title">{knowledge.title}</h2><span className="knowledge-scope">{knowledge.scope}</span>{knowledge.paragraphs.map(text => <p key={text}>{text}</p>)}<div className="knowledge-note">{knowledge.note}</div><div className="knowledge-sources"><span>延伸閱讀與來源</span>{knowledge.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowRight size={13}/></a>)}</div><button className="primary-button" onClick={() => setReading(null)}><span>返回畫卷</span><ArrowRight size={17}/></button></> : <><span className="card-kicker">遊玩指南</span><h2 id="reading-title">觀畫有法，尋人有據</h2><p>先點擊持筆抄榜的人與提茶壺的掌櫃，取得兩條證詞；再結合線索，點出橋邊的考生。</p><p>全景已可點人。拖曳移動，滾輪或雙指縮放；鍵盤 Tab 可選人物，Enter 問訊。畫卷獲得焦點時，＋／－縮放，Home 返回全景。</p><p>左下線索簿可重讀證詞，右下尋人錦囊提供方向。右上可開啟聲音、進入全螢幕；微動與其他觀畫工具放在「⋯」內。</p><button className="primary-button" onClick={() => setReading(null)}><span>回到畫卷</span><ArrowRight size={17}/></button></>}</dialog>
  </main>;
}
