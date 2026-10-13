import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Point } from '../game/geometry.ts';
import type { SceneViewport } from './ScrollScene.tsx';
import '../lantern-dialogue-preview.css';

export type DialogueLayout = 'adjacent' | 'subtitle';
type Props = {layout: DialogueLayout; viewport: SceneViewport; anchor: Point; personWidth: number;
  font?: 'kai' | 'song'; fontSize?: number; speaker?: string; autoFocus?: boolean; lines: readonly string[]; actionLabel: string; onContinue: () => void};

/** Two frameless treatments of the same dialogue, over the unchanged original painting. */
export function LanternDialogue({layout, viewport, anchor, personWidth, font = 'kai', fontSize = 20, speaker = '明憲宗', autoFocus = false, lines, actionLabel, onContinue}: Props) {
  const [actionVisible, setActionVisible] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {if (autoFocus) rootRef.current?.focus({preventScroll: true});}, [autoFocus]);
  const text = lines.join('\n');
  useEffect(() => {
    setActionVisible(false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {setActionVisible(true); return;}
    const timer = window.setTimeout(() => setActionVisible(true), 700);
    return () => window.clearTimeout(timer);
  }, [text, actionLabel]);
  const {frame} = viewport;
  const width = Math.min(fontSize * 12, frame.width - 48);
  const gap = Math.max(44, personWidth * .7);
  const fitsLeft = anchor.x - gap - width >= 24;
  const left = Math.max(24, Math.min(frame.width - width - 24, fitsLeft ? anchor.x - gap - width : anchor.x + gap));
  const top = Math.max(170, Math.min(frame.height - 230, anchor.y - 75));
  const style = {'--dialogue-x': `${left}px`, '--dialogue-y': `${top}px`, '--dialogue-width': `${width}px`, '--dialogue-size': `${fontSize}px`} as CSSProperties;
  const start = {x: fitsLeft ? left + width + 4 : left - 4, y: top + 45};
  const end = {x: anchor.x + (fitsLeft ? -1 : 1) * personWidth * .4, y: anchor.y - 30};
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  return <>
    {layout === 'adjacent' && <div className="lantern-dialogue-leader" aria-hidden="true" style={{left: start.x, top: start.y, width: length, transform: `rotate(${Math.atan2(end.y - start.y, end.x - start.x)}rad)`}}/>}
    <section ref={rootRef} tabIndex={autoFocus ? -1 : undefined} className={`lantern-dialogue dialogue-${layout} font-${font}`} style={style} aria-label={layout === 'adjacent' ? '人物旁短對白' : '畫面下方字幕'}>
      <p className="lantern-dialogue-speaker">{speaker}</p>
      <blockquote aria-live="polite" aria-atomic="true">{lines.map((line, index) => <span key={index}>{line}</span>)}</blockquote>
      <div className="lantern-dialogue-action-space">{actionVisible && <button className="lantern-dialogue-continue" onClick={onContinue}>{actionLabel}<span aria-hidden="true">→</span></button>}</div>
    </section>
  </>;
}
