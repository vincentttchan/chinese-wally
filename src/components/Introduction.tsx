import { useState } from 'react';
import { ArrowRight } from './ArtIcons.tsx';
import { ChapterLinks } from './ChapterLinks.tsx';
import type { ChapterId, IntroStep } from '../game/chapters.ts';
import type {PaintingCrop} from '../game/level.ts';
import {paintingCropStyle} from './paintingCropStyle.ts';

const defaultSteps = [
  {title: '科舉放榜日', text: '今日放榜。\n榜牆前，人聲漸起。', action: '走進此日'},
  {title: '人潮之中', text: '書童回過頭，\n同行的考生已不見蹤影。', action: '聽他的委託'},
  {title: '一樁委託', text: '「請替我找到他。」\n畫中有人，或許見過他的身影。', action: '入畫尋人'},
];

export function Introduction({ready, leaving, onBegin, reference, initialStep = 0, steps = defaultSteps, title = '榜下尋人', footer = '一卷市井，藏着一場相逢。', chapterId = 'examination'}: {ready: boolean; leaving: boolean; onBegin: () => void; reference?: {portrait: string; description: string; crop?: PaintingCrop}; initialStep?: number; steps?: IntroStep[]; title?: string; footer?: string; chapterId?: ChapterId}) {
  const [chapter, setChapter] = useState(initialStep);
  const [portraitRetry, setPortraitRetry] = useState(0);
  const portraitSrc = reference && (portraitRetry
    ? `${reference.portrait}${reference.portrait.includes('?') ? '&' : '?'}retry=${portraitRetry}`
    : reference.portrait);
  const [portraitResult, setPortraitResult] = useState<{source: string; status: 'loaded' | 'error'} | null>(null);
  const portraitStatus = portraitResult && portraitResult.source === portraitSrc ? portraitResult.status : 'loading';
  const requiresPortrait = Boolean(reference);
  const entryReady = ready && (!requiresPortrait || portraitStatus === 'loaded');
  const current = steps[chapter];
  const last = chapter === steps.length - 1;
  return <section className={`introduction ${leaving ? 'is-leaving' : ''}`} aria-label={`${title}引言`} aria-hidden={leaving} inert={leaving}>
    <div className="intro-brand"><span/>畫中有案</div>
    {!last && <button className="intro-skip" onClick={() => setChapter(steps.length - 1)} aria-label="略過故事，先看人物圖">略過故事</button>}
    <div className="intro-content">
      <div className="intro-copy">
        <div className="intro-narrative" aria-live="polite" aria-atomic="true"><div className="intro-lines" key={chapter}><p className="intro-chapter">{current.title}</p><p className="intro-story">{current.text}</p>{last && reference && !leaving && <div className="intro-reference" role="img" aria-label={`要找的人物：${reference.description}`}><span className={`intro-target-cutout ${reference.crop ? 'is-source-crop' : ''}`}><img key={portraitSrc} src={portraitSrc} style={reference.crop ? paintingCropStyle(reference.crop) : undefined} onLoad={() => setPortraitResult({source: portraitSrc!, status: 'loaded'})} onError={() => setPortraitResult({source: portraitSrc!, status: 'error'})} alt="" width={reference.crop ? 2172 : 1076} height={reference.crop ? 724 : 1461} draggable={false}/></span><p>記住他的樣子。<br/>入畫後會收起人物圖。<br/>找不到時，可查看文字提示。</p></div>}</div></div>
        {last && requiresPortrait && !leaving && portraitStatus !== 'loaded' && <div className="intro-portrait-status" role="status">{portraitStatus === 'error' ? <><span>人物圖未能載入。</span><button className="intro-portrait-retry" onClick={() => setPortraitRetry(value => value + 1)}>重新載入人物圖</button></> : '人物圖載入中…'}</div>}
        <button className={`intro-enter ${last ? 'is-ready-to-search' : ''}`} onClick={() => last ? onBegin() : setChapter(value => value + 1)} disabled={last && !entryReady}><span>{last && !entryReady ? !ready ? '正在展卷' : '正在載入人物圖' : current.action}</span><ArrowRight size={23}/></button>
        <div className="intro-sequence"><button className="intro-back" style={{visibility: chapter ? 'visible' : 'hidden'}} disabled={!chapter} onClick={() => setChapter(value => value - 1)}>前一幕</button><div className="intro-progress" role="img" aria-label={`引言第${chapter + 1}幕，共${steps.length}幕`}>{steps.map((_, index) => <span key={index} className={index <= chapter ? 'is-read' : ''}/>)}</div></div>
      </div>
      <div className="intro-title"><h1>{title}</h1><span className="intro-seal" aria-hidden="true">入畫</span></div>
    </div>
    <div className="intro-footer"><p>{footer}</p><ChapterLinks current={chapterId}/></div>
  </section>;
}
