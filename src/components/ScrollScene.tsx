import React, { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Maximize, Minus, Plus, RotateCcw } from 'lucide-react';
import { LivingPainting } from './LivingPainting.tsx';
import { clampView, fitView, zoomAt } from '../game/geometry.ts';
import type { Point, Size, View } from '../game/geometry.ts';
import type { SceneActor } from '../game/level.ts';

export type SceneHint = { actorId: string; level: number; token: number };
type Props = {
  image: string; actors: SceneActor[]; active: boolean; blocked: boolean;
  resetKey: number; hint: SceneHint | null; onInspect: (id: string, anchor?: Point) => void;
  motion?: boolean;
  onReady: (ready: boolean) => void;
};

export function ScrollScene({image, actors, active, blocked, resetKey, hint, onInspect, onReady, motion = true}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<Size>({width: 1000, height: 450});
  const picture = useRef<Size>({width: 3072, height: 1024});
  const current = useRef<View>({scale: 1, x: 0, y: 0});
  const [view, setView] = useState(current.current);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [dimensions, setDimensions] = useState(picture.current);
  const [frameSize, setFrameSize] = useState(frame.current);
  const [highlight, setHighlight] = useState<SceneHint | null>(null);
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, Point>());
  const start = useRef<Point | null>(null);
  const moved = useRef(false);

  const applyView = (next: View) => {
    const bounded = clampView(next, frame.current, picture.current);
    current.current = bounded;
    setView(bounded);
  };
  const coverScale = () => Math.max(frame.current.width / picture.current.width, frame.current.height / picture.current.height);
  const limits = () => {
    const min = fitView(frame.current, picture.current).scale;
    return {min, max: Math.max(min * 8, coverScale() * 3)};
  };
  const zoom = (factor: number, point: Point = {x: frame.current.width / 2, y: frame.current.height / 2}) => {
    applyView(zoomAt(current.current, factor, point, limits()));
  };
  const fullView = () => applyView(fitView(frame.current, picture.current));
  const point = (x: number, y: number): Point => {
    const bounds = root.current!.getBoundingClientRect();
    return {x: x - bounds.left, y: y - bounds.top};
  };

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const size = {width: entry.contentRect.width, height: entry.contentRect.height};
      if (!size.width || !size.height) return;
      frame.current = size;
      setFrameSize(size);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    pointers.current.clear();
    setDragging(false);
    const scale = coverScale() * (active ? 1.04 : 1);
    applyView({scale, x: frame.current.width / 2 - picture.current.width * .28 * scale, y: frame.current.height / 2 - picture.current.height * .52 * scale});
    setHighlight(null);
    // A restart or resize establishes a new safe viewport; dialogs do not reset it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, loaded, frameSize.width, frameSize.height]);

  useEffect(() => {
    setHighlight(null);
    if (!hint || !loaded) return;
    const actor = actors.find(a => a.id === hint.actorId);
    if (!actor) return;
    const base = fitView(frame.current, picture.current);
    const scale = Math.max(coverScale() * 1.08, base.scale * 2.7);
    applyView({scale, x: frame.current.width / 2 - actor.x * picture.current.width * scale, y: frame.current.height / 2 - actor.y * picture.current.height * scale});
    setHighlight(hint);
    const timer = window.setTimeout(() => setHighlight(null), 6500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hint?.token, loaded]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      if (!loaded || blocked) return;
      event.preventDefault();
      zoom(Math.exp(-event.deltaY * .0018), point(event.clientX, event.clientY));
    };
    node.addEventListener('wheel', wheel, {passive: false});
    return () => node.removeEventListener('wheel', wheel);
  }, [loaded, blocked]);

  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (blocked || !loaded || event.button !== 0) return;
    const p = point(event.clientX, event.clientY);
    pointers.current.set(event.pointerId, p);
    if (pointers.current.size === 1) { start.current = p; moved.current = false; }
    else moved.current = true;
    root.current!.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId) || blocked) return;
    const before = [...pointers.current.values()];
    const oldPoint = pointers.current.get(event.pointerId)!;
    const p = point(event.clientX, event.clientY);
    pointers.current.set(event.pointerId, p);
    if (start.current && Math.hypot(p.x - start.current.x, p.y - start.current.y) > 7) moved.current = true;
    if (pointers.current.size === 1) {
      applyView({...current.current, x: current.current.x + p.x - oldPoint.x, y: current.current.y + p.y - oldPoint.y});
    } else {
      const after = [...pointers.current.values()];
      const distance = (points: Point[]) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const midpoint = (points: Point[]) => ({x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2});
      const previousMiddle = midpoint(before);
      const nextMiddle = midpoint(after);
      const factor = distance(before) > 0 ? distance(after) / distance(before) : 1;
      const next = zoomAt(current.current, factor, previousMiddle, limits());
      applyView({...next, x: next.x + nextMiddle.x - previousMiddle.x, y: next.y + nextMiddle.y - previousMiddle.y});
    }
  };
  const up = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    const p = point(event.clientX, event.clientY);
    const isTap = !moved.current && pointers.current.size === 1;
    pointers.current.delete(event.pointerId);
    if (root.current?.hasPointerCapture(event.pointerId)) root.current.releasePointerCapture(event.pointerId);
    if (!pointers.current.size) setDragging(false);
    if (!isTap || !active || blocked || event.type === 'pointercancel') return;
    const world = {x: (p.x - current.current.x) / current.current.scale, y: (p.y - current.current.y) / current.current.scale};
    const selected = actors
      .filter(a => Math.abs(world.x - a.x * picture.current.width) <= Math.max(a.width * picture.current.width, 44 / current.current.scale) / 2 && Math.abs(world.y - a.y * picture.current.height) <= Math.max(a.height * picture.current.height, 44 / current.current.scale) / 2)
      .sort((a, b) => Math.hypot(world.x - a.x * picture.current.width, world.y - a.y * picture.current.height) - Math.hypot(world.x - b.x * picture.current.width, world.y - b.y * picture.current.height))[0];
    if (selected) inspectActor(selected);
  };

  const inspectActor = (actor: SceneActor) => {
    const bounds = root.current!.getBoundingClientRect();
    onInspect(actor.id, {x: bounds.left + current.current.x + actor.x * picture.current.width * current.current.scale, y: bounds.top + current.current.y + actor.y * picture.current.height * current.current.scale});
  };

  const focusedActor = highlight && actors.find(a => a.id === highlight.actorId);
  return <div className="scroll-frame">
    <div className={`scroll-viewport ${dragging ? 'is-dragging' : ''}`} ref={root} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="可拖曳與放大的科舉放榜日長卷">
      <div className="painting-world" style={{width: dimensions.width, height: dimensions.height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`}}>
        <img className="painting" src={`${image}${attempt ? `?retry=${attempt}` : ''}`} alt="原創科舉放榜日長卷，榜牆、茶攤與橋邊的人群" draggable={false} onLoad={event => {
          const next = {width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight};
          picture.current = next; setDimensions(next); setLoaded(true); setFailed(false); onReady(true);
        }} onError={() => {setFailed(true); setLoaded(false); onReady(false);}} />
        {loaded && <LivingPainting image={image} enabled={motion}/>}
        {active && actors.map(actor => <button key={actor.id} type="button" className="actor-hitbox" data-actor={actor.id} aria-label={`查看${actor.name}`} disabled={blocked} style={{left: actor.x * dimensions.width, top: actor.y * dimensions.height, width: Math.max(actor.width * dimensions.width, 44 / view.scale), height: Math.max(actor.height * dimensions.height, 44 / view.scale), '--outline-width': `${2 / view.scale}px`} as React.CSSProperties} onFocus={event => {
          if (!event.currentTarget.matches(':focus-visible')) return;
          const scale = Math.max(current.current.scale, Math.max(coverScale(), limits().min * 2));
          applyView({scale, x: frame.current.width / 2 - actor.x * picture.current.width * scale, y: frame.current.height / 2 - actor.y * picture.current.height * scale});
        }} onClick={event => { if (event.detail === 0 && !blocked) inspectActor(actor); }} />)}
        {focusedActor && <div className={`hint-ring hint-level-${highlight.level}`} style={{left: focusedActor.x * dimensions.width, top: focusedActor.y * dimensions.height, width: dimensions.width * (highlight.level === 1 ? .13 : .043), height: dimensions.height * (highlight.level === 1 ? .40 : .145), borderWidth: 2 / view.scale}} />}
      </div>
      {!loaded && <div className="scene-status" role="status">{failed ? <><span>畫卷暫時未能展開</span><button className="small-button" onClick={() => {setFailed(false); setAttempt(a => a + 1);}}><RotateCcw size={15}/>重新載入</button></> : <><span className="loading-seal">卷</span><span>正在展開畫卷…</span></>}</div>}
    </div>
    <div className="view-tools" onPointerDown={e => e.stopPropagation()}>
      <button aria-label="放大畫卷" title="放大" disabled={!loaded || blocked} onClick={() => zoom(1.35)}><Plus size={18}/></button>
      <span className="zoom-value">{Math.round(view.scale / (limits().min || 1) * 100)}%</span>
      <button aria-label="縮小畫卷" title="縮小" disabled={!loaded || blocked} onClick={() => zoom(1 / 1.35)}><Minus size={18}/></button>
      <span className="tools-divider"/>
      <button aria-label="返回全景" title="覽全卷" disabled={!loaded || blocked} onClick={fullView}><Maximize size={17}/></button>
    </div>
  </div>;
}
