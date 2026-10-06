import { useState } from 'react';
import { ArrowRight } from './ArtIcons.tsx';
import { chapterHref, chapters as cases } from '../game/chapters.ts';
import type { ChapterId, IntroStep } from '../game/chapters.ts';

const defaultSteps = [
  {title: '科舉放榜日', text: '今日放榜。\n榜牆前，人聲漸起。', action: '走進此日'},
  {title: '人潮之中', text: '書童回過頭，\n同行的考生已不見蹤影。', action: '聽他的委託'},
  {title: '一樁委託', text: '「請替我找到他。」\n畫中有人，或許見過他的身影。', action: '入畫尋人'},
];

export function Introduction({ready, leaving, onBegin, steps = defaultSteps, title = '榜下尋人', footer = '一卷市井，藏着一場相逢。', chapterId = 'examination'}: {ready: boolean; leaving: boolean; onBegin: () => void; steps?: IntroStep[]; title?: string; footer?: string; chapterId?: ChapterId}) {
  const [chapter, setChapter] = useState(0);
  const current = steps[chapter];
  const last = chapter === steps.length - 1;
  return <section className={`introduction ${leaving ? 'is-leaving' : ''}`} aria-label={`${title}引言`} aria-hidden={leaving} inert={leaving}>
    <div className="intro-brand"><span/>畫中有案</div>
    <button className="intro-skip" onClick={onBegin} disabled={!ready} aria-label="略過引言，直接入畫">略過引言</button>
    <div className="intro-content">
      <div className="intro-copy">
        <div className="intro-narrative" aria-live="polite" aria-atomic="true"><div className="intro-lines" key={chapter}><p className="intro-chapter">{current.title}</p><p className="intro-story">{current.text}</p></div></div>
        <button className="intro-enter" onClick={() => last ? onBegin() : setChapter(value => value + 1)} disabled={last && !ready}><span>{last && !ready ? '正在展卷' : current.action}</span><ArrowRight size={23}/></button>
        <div className="intro-sequence"><button className="intro-back" style={{visibility: chapter ? 'visible' : 'hidden'}} disabled={!chapter} onClick={() => setChapter(value => value - 1)}>前一幕</button><div className="intro-progress" role="img" aria-label={`引言第${chapter + 1}幕，共${steps.length}幕`}>{steps.map((_, index) => <span key={index} className={index <= chapter ? 'is-read' : ''}/>)}</div></div>
      </div>
      <div className="intro-title"><h1>{title}</h1><span className="intro-seal" aria-hidden="true">入畫</span></div>
    </div>
    <div className="intro-footer"><p>{footer}</p><nav className="chapter-links" aria-label="選擇畫卷">{Object.values(cases).map((item, index) => <span key={item.id}>{item.available === false ? <span className="chapter-pending" aria-disabled="true"><span>{index === 0 ? '卷一' : '卷二'}</span>{item.scene.title} · 待展</span> : <a href={chapterHref(item.id)} aria-current={item.id === chapterId ? 'page' : undefined}><span>{index === 0 ? '卷一' : '卷二'}</span>{item.scene.title}</a>}</span>)}</nav></div>
  </section>;
}
