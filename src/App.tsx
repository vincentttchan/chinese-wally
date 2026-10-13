import { useEffect, useReducer, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronUp, CircleHelp, Maximize, Minimize, MoreHorizontal, RotateCcw, Volume2, VolumeX, Waves, X, ZoomIn, ZoomOut } from './components/ArtIcons.tsx';
import { PaintedPortrait } from './components/PaintedPortrait.tsx';
import { Introduction } from './components/Introduction.tsx';
import { ScrollScene } from './components/ScrollScene.tsx';
import type { SceneCommand, SceneHint, SceneSelection } from './components/ScrollScene.tsx';
import { useAmbience } from './audio/useAmbience.ts';
import { evidenceId, evidenceLabel, getEvidenceActors, getMainEvidenceActors, isEvidence } from './game/level.ts';
import { chapterFromHash, chapters } from './game/chapters.ts';
import type { Chapter } from './game/chapters.ts';
import { KnowledgeReading } from './components/KnowledgeReading.tsx';
import type { SceneActor } from './game/level.ts';
import type { Point } from './game/geometry.ts';
import { createGame, reduceGameForLevel } from './game/state.ts';
import type { GameState, GameAction } from './game/state.ts';

type Dialogue = {title: string; subtitle: string; text: string; anchor?: Point; continueLabel?: string};
const availableChapter = (hash: string) => {
  const id = chapterFromHash(hash);
  return chapters[id].available === false ? 'examination' : id;
};

export default function App() {
  const [chapterId, setChapterId] = useState(() => availableChapter(window.location.hash));
  useEffect(() => {
    const selectChapter = () => setChapterId(availableChapter(window.location.hash));
    window.addEventListener('hashchange', selectChapter);
    return () => window.removeEventListener('hashchange', selectChapter);
  }, []);
  useEffect(() => {document.title = `${chapters[chapterId].scene.title} · 畫中有案`;}, [chapterId]);
  return <ChapterGame key={chapterId} chapter={chapters[chapterId]}/>;
}

function ChapterGame({chapter}: {chapter: Chapter}) {
  const level = chapter.scene;
  const [game, dispatch] = useReducer((state: GameState, action: GameAction) => reduceGameForLevel(state, action, level), undefined, createGame);
  const [ready, setReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [journal, setJournal] = useState(false);
  const [journalPresent, setJournalPresent] = useState(false);
  const [menu, setMenu] = useState(false);
  const [missionOpen, setMissionOpen] = useState(false);
  const [introPresent, setIntroPresent] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const [instruction, setInstruction] = useState(true);
  const [endingVisible, setEndingVisible] = useState(false);
  const [reading, setReading] = useState<'knowledge' | 'guide' | null>(null);
  const [knowledgeComplete, setKnowledgeComplete] = useState(false);
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const [hint, setHint] = useState<SceneHint | null>(null);
  const [selection, setSelection] = useState<SceneSelection | null>(null);
  const [focusing, setFocusing] = useState(true);
  const [command, setCommand] = useState<SceneCommand | null>(null);
  const [hintText, setHintText] = useState('');
  const [hintStage, setHintStage] = useState(0);
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
  const target = level.actors.find(actor => actor.kind === 'target')!;
  const clues = getMainEvidenceActors(level);
  const supportClues = getEvidenceActors(level).filter(actor => actor.optional);
  const coreClueCount = clues.filter(actor => game.clues.includes(actor.id)).length;
  const supportClueCount = supportClues.filter(actor => game.clues.includes(actor.id)).length;
  const nextHintId = target.id;
  const nextHintStage = Math.min((hintCounts.current[nextHintId] ?? 0) + 1, 3);
  const hintLabel = nextHintStage === 1 ? '找不到？看看提示' : nextHintStage === 2 ? '再給些方向' : '帶我看區域';
  const playing = game.phase === 'exploring';
  const finished = game.phase === 'complete';
  const reduced = !motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sound = useAmbience(Boolean(dialogue) || focusing || journal || Boolean(reading) || !playing);
  const soundLabel = sound.state === 'on' ? '關閉古風音樂' : sound.state === 'loading' ? '音樂載入中，點擊取消' : sound.state === 'error' ? '重試古風音樂' : '開啟古風音樂';

  useEffect(() => {
    if (game.phase === 'intro') {setIntroPresent(true); return;}
    const timer = window.setTimeout(() => {setIntroPresent(false); paperButton.current?.focus({preventScroll: true});}, reduced ? 0 : 600);
    return () => window.clearTimeout(timer);
  }, [game.phase, reduced]);

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
    if (!ready || !instruction || !playing) return;
    const timer = window.setTimeout(() => setInstruction(false), 6200);
    return () => window.clearTimeout(timer);
  }, [ready, instruction, playing]);
  useEffect(() => {
    if (!finished) {setEndingVisible(false); return;}
    const timeout = window.setTimeout(() => setEndingVisible(true), reduced ? 250 : 1750);
    return () => window.clearTimeout(timeout);
  }, [finished, reduced]);
  useEffect(() => {
    if (dialogue) witnessClose.current?.focus({preventScroll: true});
  }, [dialogue]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      const node = event.target as Node;
      if (menu && !menuPanel.current?.contains(node) && !moreButton.current?.contains(node)) setMenu(false);
      if (journal && !notebook.current?.contains(node) && !notebookButton.current?.contains(node)) setJournal(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat && playing && !reading && !dialogue && !journal && !menu) {event.preventDefault(); setFocusing(value => !value); return;}
      if (event.key !== 'Escape' || reading) return;
      if (dialogue) {setDialogue(null); paperButton.current?.focus({preventScroll: true}); return;}
      if (journal) {setJournal(false); notebookButton.current?.focus({preventScroll: true}); return;}
      if (menu) {setMenu(false); moreButton.current?.focus({preventScroll: true}); return;}
      if (focusing && playing) {setFocusing(false); paperButton.current?.focus({preventScroll: true});}
    };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => {document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape);};
  }, [menu, journal, dialogue, reading, focusing, playing]);

  const closeWitness = () => {setDialogue(null); dispatch({type: 'dismiss-feedback'}); paperButton.current?.focus({preventScroll: true});};
  const resetGame = (type: 'start' | 'restart') => {
    dispatch({type});
    setDialogue(null); setJournal(false); setMenu(false); setReading(null); setHint(null); setSelection(null); setHintText(''); setHintStage(0); setKnowledgeComplete(false); setNotice('');
    setFocusing(true);
    hintCounts.current = {}; explored.current = false; setMissionOpen(false); setInstruction(true); setResetKey(key => key + 1);
    if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current);
  };
  const begin = () => resetGame('start');
  const replay = () => {setIntroStep(chapter.intro.length - 1); resetGame('restart');};
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
    if (isEvidence(actor)) {
      const collected = game.clues.includes(evidenceId(actor));
      const source = chapter.id === 'examination' ? '證詞' : evidenceLabel(actor);
      setDialogue({title: actor.name, subtitle: collected ? `重讀${actor.optional ? '補充見聞' : source}` : actor.optional ? '補充見聞 · 已錄（可選）' : `${source} · 線索已錄`, text: actor.quote!, anchor});
      if (!collected) setSelection({actorId: id, kind: 'clue', token: ++token.current});
      setHint(null); setHintText('');
    } else if (actor.kind !== 'target') {
      setSelection({actorId: id, kind: 'wrong', token: ++token.current});
      setNotice(actor.mismatch ?? '回想剛才人物圖裏的衣着與手中物件。需要幫忙時，可查看文字提示。');
    } else {
      setDialogue(null); setHint(null); setHintText(''); setNotice('');
      setSelection({actorId: id, kind: 'found', token: ++token.current});
    }
  };
  const showHint = (id = target.id) => {
    const suggestion = chapter.hints[id];
    if (!suggestion) return;
    setJournal(false); setDialogue(null);
    const count = Math.min((hintCounts.current[id] ?? 0) + 1, 3);
    hintCounts.current[id] = count;
    setHintStage(count);
    setHintText(suggestion.messages[count - 1]);
    setHint(count === 3 ? {region: suggestion.region, token: ++token.current} : null);
  };
  const readClue = (actor: SceneActor) => {if (game.clues.includes(actor.id)) {setJournal(false); setDialogue({title: actor.name, subtitle: `線索簿 · ${actor.optional ? '補充見聞（可選）' : chapter.id === 'examination' ? '證詞' : evidenceLabel(actor)}`, text: actor.quote!});}};
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setNotice('畫卷已鋪滿視窗；此瀏覽器未提供全螢幕。');
    } catch {setNotice('未能切換全螢幕；畫卷已鋪滿視窗。');}
  };
  const sceneCommand = (type: SceneCommand['type']) => {setMenu(false); setCommand({type, token: ++token.current});};
  const toggleMission = () => {if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current); setMissionOpen(value => !value);};
  const objective = finished ? chapter.objectives.complete : chapter.objectives.exploring;
  const nextStep = finished ? chapter.endingTitle : '找出剛才圖中的人，點選他便可完成。';
  const anchor = dialogue?.anchor;
  const placement = anchor ? {'--dialog-x': `${anchor.x < window.innerWidth * .58 ? anchor.x + 36 : anchor.x - 386}px`, '--dialog-y': `${anchor.y - 100}px`} as CSSProperties : undefined;

  const renderClue = (actor: SceneActor, index: number) => {
    const collected = game.clues.includes(actor.id);
    const word = actor.optional ? '見聞' : chapter.evidenceWord;
    return <button key={actor.id} className={`clue-card ${collected ? 'is-collected' : ''}`} disabled={!collected && !chapter.hints[actor.id]} onClick={() => collected ? readClue(actor) : showHint(actor.id)} style={{'--clue-delay': `${index * 50}ms`} as CSSProperties}>
      <PaintedPortrait actor={actor} image={level.image} tiles={level.detailTiles}/>
      <span className="clue-content">
        {chapter.id !== 'examination' && collected && <span className="evidence-source">{actor.optional ? '補充見聞 · 可選' : evidenceLabel(actor)}</span>}
        <span className="clue-kicker">{actor.name} · {collected ? '已記錄' : '可選'}</span>
        <span className="clue-title">{collected ? actor.clueTitle : chapter.hints[actor.id] ? '點此查看尋找方向' : `可自由探索的${word}`}</span>
        <span className="clue-description">{collected ? actor.quote : '需要幫忙時再找，不必收集也能完成尋人。'}</span>
      </span>
      {collected && <Check size={15}/>}
    </button>;
  };

  return <main className={`immersive-game chapter-${chapter.id} phase-${game.phase} ${ready ? 'scene-loaded' : ''} ${reduced ? 'reduced-motion' : ''} ${endingVisible ? 'ending-visible' : ''}`} aria-label={`${level.title}遊戲`}>
    {game.phase !== 'intro' && <h1 className="sr-only">{level.title} · {level.subtitle}</h1>}
    <ScrollScene image={level.image} tiles={level.detailTiles} actors={level.actors} focusing={focusing && !finished} active={game.phase !== 'intro'} blocked={game.phase === 'intro' || Boolean(dialogue) || Boolean(reading) || finished} resetKey={resetKey} hint={hint} selection={selection} command={command} initialRegion={chapter.initialRegion} onInspect={inspect} onExplore={explore} onReady={setReady} motion={motion} title={level.subtitle} description={chapter.alt} steam={chapter.steam ?? null}/>
    <div className="scene-vignette" aria-hidden="true"/>
    {introPresent && <Introduction steps={chapter.intro} initialStep={introStep} title={level.title} footer={chapter.footer} chapterId={chapter.id} ready={ready} leaving={game.phase !== 'intro'} reference={{portrait: chapter.targetPortrait, description: chapter.targetDescription, crop: chapter.targetPortraitCrop}} onBegin={begin}/>}
    {game.phase !== 'intro' && <header className="scene-hud">
      <section className={`mission memory-mission ${missionOpen ? 'is-expanded' : 'is-collapsed'}`} aria-label="尋人任務">
        <button ref={paperButton} className="mission-summary" aria-expanded={missionOpen} aria-controls="mission-details" onClick={toggleMission}>
          <span className="mission-heading"><span className="mission-chapter">{finished ? '已找到' : chapter.mission}</span><span className="mission-objective" aria-live="polite">{nextStep}</span></span><ChevronDown size={14} className="mission-chevron"/>
        </button>
        <div className="mission-details" id="mission-details" hidden={!missionOpen}><strong>{chapter.id === 'examination' ? '替書童找回走散的考生' : chapter.mission}</strong><p>{objective}</p><p>{chapter.instruction}</p></div>
      </section>
      <nav className="scene-settings" aria-label="場景設定">
        {playing && <button className={`round-control focus-control ${focusing ? 'is-on' : ''}`} aria-label={focusing ? '切換至彩色模式' : '切換至凝神模式'} title={focusing ? '目前為凝神模式 · 點此轉為彩色 · F 切換' : '目前為彩色模式 · 點此返回凝神 · F 切換'} aria-pressed={focusing} disabled={!ready || Boolean(dialogue) || Boolean(reading)} onClick={() => {setJournal(false); setMenu(false); setHintText(''); setHint(null); setFocusing(value => !value);}}>{focusing ? '彩色' : '凝神'}</button>}
        <button className={`round-control ${sound.state === 'on' ? 'is-on' : ''}`} aria-label={soundLabel} title={soundLabel} aria-pressed={sound.state === 'on' || sound.state === 'loading'} onClick={() => void sound.toggle()}>{sound.state === 'on' ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button>
        <button className="round-control" aria-label={fullscreen ? '離開全螢幕' : '進入全螢幕'} title="全螢幕" onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}</button>
        <button ref={moreButton} className="round-control" aria-label="更多觀畫設定" aria-expanded={menu} aria-controls="scene-menu" title="更多" onClick={() => setMenu(value => !value)}><MoreHorizontal size={21}/></button>
      </nav>
    </header>}
    {menu && <div className="settings-paper" id="scene-menu" ref={menuPanel} role="region" aria-label="觀畫設定"><span className="card-kicker">觀畫有法</span><button onClick={() => setMotion(value => !value)} aria-pressed={motion}><Waves size={17}/>{motion ? '關閉畫卷微動' : '開啟畫卷微動'}</button><button onClick={() => sceneCommand('in')}><ZoomIn size={17}/>放大畫卷</button><button onClick={() => sceneCommand('out')}><ZoomOut size={17}/>縮小畫卷</button><button onClick={() => sceneCommand('overview')}><Maximize size={17}/>回到卷首</button><button onClick={() => {setMenu(false); setReading('guide');}}><CircleHelp size={17}/>遊玩指南</button><button onClick={() => {setMenu(false); setReading('knowledge');}}><BookOpen size={17}/>{chapter.knowledgeLabel}{knowledgeComplete ? ' · 已完成' : ''}</button></div>}

    {game.phase !== 'intro' && <div className="bottom-hud"><button ref={notebookButton} className="notebook-toggle" aria-expanded={journal} aria-controls="clue-notebook" onClick={() => {setDialogue(null); setJournal(value => !value);}} aria-label={`可選線索簿，已記錄${game.clues.length}條線索`}><BookOpen size={19}/><span>線索簿 · 可選</span>{game.clues.length > 0 && <span className="notebook-count" key={game.clues.length}>{game.clues.length}<small>已錄</small></span>}{journal ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}</button><span className={`gesture-note ${instruction ? '' : 'is-dismissed'}`}>回想人物樣子 · 拖曳探索 · 滾動放大</span>{playing && <button className="hint-button" disabled={!ready || Boolean(dialogue) || Boolean(reading)} onClick={() => showHint()}><CircleHelp size={19}/><span>{hintLabel}</span></button>}</div>}
    {journalPresent && <aside ref={notebook} className={`notebook-paper ${journal ? '' : 'is-closing'}`} aria-hidden={!journal} inert={!journal} id="clue-notebook" aria-label="線索簿內容">
      <button className="paper-close" aria-label="收起線索簿" onClick={() => {setJournal(false); notebookButton.current?.focus({preventScroll: true});}}><X size={18}/></button>
      <span className="card-kicker">隨身筆記</span>
      <h2>線索簿 <span className="journal-count">可選 · 已錄 {coreClueCount}</span></h2>
      <p className="journal-section-note">回想開始前的人物圖，找到便完成；需要幫忙時，再問訊或觀察。不必收齊線索。</p>
      <div className="clue-list">{clues.map(renderClue)}</div>
      <p className="journal-objective">{objective}</p>
      {supportClues.length > 0 && <section className="supplementary-clues" aria-labelledby="support-clues-title">
        <h3 id="support-clues-title">其他見聞 <span>可選 · 已錄 {supportClueCount}</span></h3>
        <p className="journal-section-note">幫你縮小範圍、印證線索；不必找齊，也能完成此案。</p>
        <div className="clue-list">{supportClues.map(renderClue)}</div>
      </section>}
    </aside>}
    {dialogue && <section ref={witness} className={`witness-paper ${anchor ? 'is-anchored' : ''}`} style={placement} role="dialog" aria-modal="false" aria-labelledby="witness-title"><button ref={witnessClose} className="paper-close" aria-label="關閉證詞" onClick={closeWitness}><X size={18}/></button><span className="card-kicker">{dialogue.subtitle}</span><h2 id="witness-title">{dialogue.title}</h2><p className="witness-quote">{dialogue.text}</p><button className="primary-button" onClick={closeWitness}><span>{dialogue.continueLabel ?? '記下，繼續尋人'}</span><ArrowRight size={17}/></button></section>}
    {playing && focusing && !dialogue && !reading && !journal && !menu && <p className="focus-instruction" role="status"><span className="focus-desktop">凝神模式 · 移動滑鼠觀察 · 太難可按右上「彩色」</span><span className="focus-touch">凝神模式 · 拖動光區 · 太難可按右上「彩色」</span></p>}
    {hintText && <aside className="hint-paper" role="status"><button className="paper-close" aria-label="收起提示" onClick={() => setHintText('')}><X size={16}/></button><span className="card-kicker">尋人提示 · 可選</span><span className="hint-stage">{hintStage} / 3</span><p>{hintText}</p></aside>}
    {(notice || sound.state === 'error') && <p className="scene-toast" role="status">{notice || '音樂未能載入，可點擊右上角重試。'}</p>}
    {finished && !endingVisible && <button className="skip-ending" onClick={() => setEndingVisible(true)}>略過，查看結局</button>}
    {finished && endingVisible && <section className="ending-card" role="status"><span className="card-kicker">此案已解</span><h2>{chapter.endingTitle}</h2><p>{level.ending}</p><button className="primary-button" onClick={() => setReading('knowledge')}><span>讀一則{chapter.knowledgeLabel}</span><BookOpen size={17}/></button><button className="replay-button" onClick={replay}><RotateCcw size={15}/>再展此卷</button></section>}

    <dialog ref={dialog} className="reading-paper" onCancel={() => setReading(null)} onClose={() => setReading(null)} aria-labelledby="reading-title"><button className="paper-close" aria-label={reading === 'knowledge' && !knowledgeComplete ? '稍後再讀' : '關閉閱讀'} onClick={() => setReading(null)}><X size={19}/></button>{reading === 'knowledge' ? <KnowledgeReading article={chapter.knowledge} label={chapter.knowledgeLabel} completed={knowledgeComplete} onComplete={() => setKnowledgeComplete(true)} onReturn={() => setReading(null)}/> : <><span className="card-kicker">遊玩指南</span><h2 id="reading-title">記住樣子，找出畫中人</h2><p>{chapter.guide}</p><p>畫作鋪滿視窗，左右拖曳探索並點選人物。滾輪或雙指縮放；鍵盤 Tab 可選人物，Enter 問訊或確認。畫卷獲得焦點時，＋／－縮放，Home 回到卷首。</p><p>入畫預設為凝神模式：畫卷灰白，只有光區呈淡彩。覺得太難，可按右上「彩色」顯示整幅彩畫，再按「凝神」切回：滑鼠移動光區，手機單指拖動光區、雙指移動或縮放畫卷。仍可點選人物；F 切換模式，方向鍵移動光區，Esc 轉為彩色。光區不會自動標示線索。</p><p>左下線索簿是可選幫助，可查看問訊方向及重讀{chapter.evidenceWord}。右下「看看提示」先提供外觀，再提供地標；選擇「帶我看區域」才會移動畫卷。右上可開啟古風音樂、進入全螢幕；微動與其他工具放在「⋯」內。</p><p className="music-credit">配樂：<a href="https://ende.app/en/song/12393-chinese-restaurant-background-4" target="_blank" rel="noopener noreferrer">Chinese Restaurant Background 4 · Sascha Ende</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p><button className="primary-button" onClick={() => setReading(null)}><span>回到畫卷</span><ArrowRight size={17}/></button></>}</dialog>
  </main>;
}
