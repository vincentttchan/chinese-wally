import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { RotateCcw } from './ArtIcons.tsx';
import { LivingPainting } from './LivingPainting.tsx';
import { clampView, coverView, zoomAt } from '../game/geometry.ts';
import type { Point, Size, View } from '../game/geometry.ts';
import type { PaintingTile, SceneActor } from '../game/level.ts';

export type SceneHint = {region: Point; token: number};
export type SceneSelection = {actorId: string; kind: 'wrong' | 'found' | 'clue'; token: number};
export type SceneCommand = {type: 'in' | 'out' | 'overview'; token: number};
type Props = {
  image: string; tiles?: PaintingTile[]; actors: SceneActor[]; active: boolean; blocked: boolean;
  resetKey: number; hint: SceneHint | null; selection?: SceneSelection | null;
  command?: SceneCommand | null; onInspect: (id: string, anchor?: Point) => void;
  onExplore?: () => void; motion?: boolean; onReady: (ready: boolean) => void;
};
const zoomStops = [1, 1.1, 1.25, 1.5, 1.75];

export function ScrollScene({image, tiles, actors, active, blocked, resetKey, hint, selection, command, onInspect, onExplore, onReady, motion = true}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<Size>({width: 1280, height: 800});
  const picture = useRef<Size>({width: 2172, height: 724});
  const current = useRef<View>({scale: 1, x: 0, y: 0});
  const [view, setView] = useState(current.current);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tileStatus, setTileStatus] = useState<Record<string, 'loaded' | 'failed'>>({});
  const [attempt, setAttempt] = useState(0);
  const [dimensions, setDimensions] = useState(picture.current);
  const [frameSize, setFrameSize] = useState(frame.current);
  const [mark, setMark] = useState<SceneSelection | null>(null);
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, Point>());
  const start = useRef<Point | null>(null);
  const moved = useRef(false);
  const pinched = useRef(false);
  const pinchMiddle = useRef<Point | null>(null);
  const animation = useRef<number | null>(null);
  const velocity = useRef({x: 0, y: 0, time: 0});
  const wheelSum = useRef(0);
  const lastLayout = useRef<{frame: Size; picture: Size; resetKey: number} | null>(null);
  const onExploreRef = useRef(onExplore); onExploreRef.current = onExplore;
  const reduced = () => !motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stopAnimation = () => {if (animation.current !== null) cancelAnimationFrame(animation.current); animation.current = null;};
  const baseScale = () => coverView(frame.current, picture.current).scale;
  const limits = () => ({min: baseScale(), max: baseScale() * 1.75});
  const applyView = (next: View) => {
    const range = limits();
    const scale = Math.max(range.min, Math.min(range.max, next.scale));
    const covered = zoomAt(next, scale / next.scale, {x: frame.current.width / 2, y: frame.current.height / 2}, range);
    const bounded = clampView(covered, frame.current, picture.current);
    current.current = bounded; setView(bounded);
  };
  const animateView = (next: View, duration = 550) => {
    stopAnimation();
    const target = clampView(next, frame.current, picture.current);
    if (reduced()) {applyView(target); return;}
    const from = {...current.current}; const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      applyView({x: from.x + (target.x - from.x) * ease, y: from.y + (target.y - from.y) * ease, scale: from.scale + (target.scale - from.scale) * ease});
      if (progress < 1) animation.current = requestAnimationFrame(tick); else animation.current = null;
    };
    animation.current = requestAnimationFrame(tick);
  };
  const point = (x: number, y: number): Point => {const bounds = root.current!.getBoundingClientRect(); return {x: x - bounds.left, y: y - bounds.top};};
  const zoomStep = (direction: number, anchor = {x: frame.current.width / 2, y: frame.current.height / 2}) => {
    onExploreRef.current?.();
    const ratio = current.current.scale / baseScale();
    const next = direction > 0 ? zoomStops.find(stop => stop > ratio + .02) ?? 1.75 : [...zoomStops].reverse().find(stop => stop < ratio - .02) ?? 1;
    animateView(zoomAt(current.current, baseScale() * next / current.current.scale, anchor, limits()), 180);
  };

  useEffect(() => {onReady(loaded && (tiles ?? []).every(tile => Boolean(tileStatus[tile.image])));}, [loaded, tiles, tileStatus, onReady]);

  useEffect(() => {
    const node = root.current; if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const size = {width: entry.contentRect.width, height: entry.contentRect.height};
      if (!size.width || !size.height) return;
      frame.current = size; setFrameSize(size);
    });
    observer.observe(node); return () => {observer.disconnect(); stopAnimation();};
  }, []);
  useLayoutEffect(() => {
    if (!loaded) return;
    stopAnimation(); pointers.current.clear(); setDragging(false);
    const previous = lastLayout.current;
    const reset = !previous || previous.resetKey !== resetKey || previous.picture.width !== picture.current.width || previous.picture.height !== picture.current.height;
    if (reset) {
      applyView(coverView(frame.current, picture.current));
      setMark(null);
    } else {
      // Preserve the place being explored when the website viewport changes size.
      const ratio = current.current.scale / coverView(previous.frame, previous.picture).scale;
      const center = {x: (previous.frame.width / 2 - current.current.x) / current.current.scale, y: (previous.frame.height / 2 - current.current.y) / current.current.scale};
      const scale = baseScale() * ratio;
      const atStart = current.current.x >= -.5;
      const atEnd = previous.picture.width * current.current.scale + current.current.x <= previous.frame.width + .5;
      const x = atStart ? 0 : atEnd ? frame.current.width - picture.current.width * scale : frame.current.width / 2 - center.x * scale;
      applyView({scale, x, y: frame.current.height / 2 - center.y * scale});
    }
    lastLayout.current = {frame: {...frame.current}, picture: {...picture.current}, resetKey};
  }, [resetKey, loaded, frameSize.width, frameSize.height, dimensions.width, dimensions.height]);
  useEffect(() => {if (blocked && selection?.kind !== 'found') stopAnimation();}, [blocked]);
  useEffect(() => {if (reduced()) stopAnimation();}, [motion]);
  useEffect(() => {
    if (!hint || !loaded || blocked) return;
    // Only the explicitly requested final hint moves the camera to a broad district.
    animateView({...current.current, x: frame.current.width / 2 - hint.region.x * picture.current.width * current.current.scale, y: frame.current.height / 2 - hint.region.y * picture.current.height * current.current.scale});
  }, [hint?.token, loaded]);
  useEffect(() => {
    setMark(null); if (!selection || !loaded) return;
    const actor = actors.find(a => a.id === selection.actorId); if (!actor) return;
    if (selection.kind === 'found' && !reduced()) {
      const scale = Math.min(limits().max, current.current.scale * 1.035);
      animateView({scale, x: frame.current.width / 2 - actor.x * picture.current.width * scale, y: frame.current.height / 2 - actor.y * picture.current.height * scale});
    }
    const show = window.setTimeout(() => setMark(selection), selection.kind === 'found' && !reduced() ? 550 : 0);
    const hide = window.setTimeout(() => setMark(null), selection.kind === 'found' ? 2100 : 1700);
    return () => {window.clearTimeout(show); window.clearTimeout(hide);};
  }, [selection?.token, loaded]);
  useEffect(() => {
    if (!command || !loaded || blocked) return;
    if (command.type === 'overview') {onExploreRef.current?.(); animateView(coverView(frame.current, picture.current));}
    else zoomStep(command.type === 'in' ? 1 : -1);
  }, [command?.token]);
  useEffect(() => {
    const node = root.current; if (!node) return;
    const wheel = (event: WheelEvent) => {
      if (!loaded || blocked) return;
      event.preventDefault(); wheelSum.current += event.deltaY;
      if (Math.abs(wheelSum.current) < 35) return;
      const direction = wheelSum.current < 0 ? 1 : -1; wheelSum.current = 0;
      zoomStep(direction, point(event.clientX, event.clientY));
    };
    node.addEventListener('wheel', wheel, {passive: false});
    return () => node.removeEventListener('wheel', wheel);
  }, [loaded, blocked, motion]);

  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (blocked || !loaded || event.button !== 0) return;
    stopAnimation(); const p = point(event.clientX, event.clientY);
    pointers.current.set(event.pointerId, p);
    if (pointers.current.size === 1) {start.current = p; moved.current = false; pinched.current = false; pinchMiddle.current = null; velocity.current = {x: 0, y: 0, time: performance.now()};}
    else {moved.current = true; pinched.current = true;}
    root.current!.setPointerCapture(event.pointerId); setDragging(true);
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId) || blocked) return;
    const before = [...pointers.current.values()]; const old = pointers.current.get(event.pointerId)!;
    const p = point(event.clientX, event.clientY); pointers.current.set(event.pointerId, p);
    if (start.current && Math.hypot(p.x - start.current.x, p.y - start.current.y) > 7) {moved.current = true; onExploreRef.current?.();}
    if (pointers.current.size === 1) {
      const now = performance.now(); const elapsed = Math.max(8, now - velocity.current.time);
      velocity.current = {x: (p.x - old.x) / elapsed, y: (p.y - old.y) / elapsed, time: now};
      applyView({...current.current, x: current.current.x + p.x - old.x, y: current.current.y + p.y - old.y});
    } else {
      const after = [...pointers.current.values()];
      const distance = (ps: Point[]) => Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      const middle = (ps: Point[]) => ({x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2});
      const a = middle(before), b = middle(after); pinchMiddle.current = b;
      const next = zoomAt(current.current, distance(before) > 0 ? distance(after) / distance(before) : 1, a, limits());
      applyView({...next, x: next.x + b.x - a.x, y: next.y + b.y - a.y});
      onExploreRef.current?.();
    }
  };
  const inspectActor = (actor: SceneActor) => {
    const bounds = root.current!.getBoundingClientRect();
    onInspect(actor.id, {x: bounds.left + current.current.x + actor.x * picture.current.width * current.current.scale, y: bounds.top + current.current.y + actor.y * picture.current.height * current.current.scale});
  };
  const up = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    const p = point(event.clientX, event.clientY); const isTap = !moved.current && pointers.current.size === 1;
    const single = pointers.current.size === 1;
    pointers.current.delete(event.pointerId);
    if (root.current?.hasPointerCapture(event.pointerId)) root.current.releasePointerCapture(event.pointerId);
    if (!pointers.current.size) setDragging(false);
    if (event.type === 'pointercancel' || blocked) return;
    if (!isTap) {
      if (!pointers.current.size && pinched.current) {
        const ratio = current.current.scale / baseScale();
        const nearest = zoomStops.reduce((a, b) => Math.abs(a - ratio) < Math.abs(b - ratio) ? a : b);
        animateView(zoomAt(current.current, baseScale() * nearest / current.current.scale, pinchMiddle.current ?? p, limits()), 180);
        return;
      }
      if (single && !pointers.current.size && !reduced() && performance.now() - velocity.current.time < 60) {
        const cap = (v: number) => Math.max(-28, Math.min(28, v * 55));
        animateView({...current.current, x: current.current.x + cap(velocity.current.x), y: current.current.y + cap(velocity.current.y)}, 220);
      }
      return;
    }
    if (!active) return;
    const world = {x: (p.x - current.current.x) / current.current.scale, y: (p.y - current.current.y) / current.current.scale};
    const selected = actors.filter(a => Math.abs(world.x - a.x * picture.current.width) <= Math.max(a.width * picture.current.width, 44 / current.current.scale) / 2 && Math.abs(world.y - a.y * picture.current.height) <= Math.max(a.height * picture.current.height, 44 / current.current.scale) / 2)
      .sort((a, b) => Math.hypot(world.x - a.x * picture.current.width, world.y - a.y * picture.current.height) - Math.hypot(world.x - b.x * picture.current.width, world.y - b.y * picture.current.height))[0];
    if (selected) inspectActor(selected);
  };
  const marked = mark && actors.find(a => a.id === mark.actorId);
  return <div className={`scroll-frame ${loaded ? 'is-ready' : ''}`} style={{backgroundImage: `url("${image}")`}}>
    <div className={`scroll-viewport ${dragging ? 'is-dragging' : ''}`} ref={root} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={event => {
      if (blocked || !loaded) return;
      if (event.key === '+' || event.key === '=') {event.preventDefault(); zoomStep(1);}
      if (event.key === '-') {event.preventDefault(); zoomStep(-1);}
      if (event.key === 'Home') {event.preventDefault(); animateView(coverView(frame.current, picture.current));}
    }} aria-label="可拖曳與放大的科舉放榜日長卷" tabIndex={active ? 0 : -1}>
      <div className="painting-world" style={{width: dimensions.width, height: dimensions.height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`}}>
        <img className="painting" src={`${image}${attempt ? `?retry=${attempt}` : ''}`} alt="原創科舉放榜日全景古畫，左側榜牆、中央茶攤、右側橋頭與人群" draggable={false} onLoad={event => {
          const next = {width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight};
          picture.current = next; setDimensions(next); setLoaded(true); setFailed(false);
        }} onError={() => {setFailed(true); setLoaded(false); onReady(false);}}/>
        {tiles?.map(tile => <img key={tile.image} className="painting-detail-tile" src={tile.image} alt="" aria-hidden="true" draggable={false} style={{left: `${tile.x * 100}%`, width: `${tile.width * 100}%`, visibility: tileStatus[tile.image] === 'failed' ? 'hidden' : undefined}} onLoad={() => setTileStatus(previous => ({...previous, [tile.image]: 'loaded'}))} onError={() => setTileStatus(previous => ({...previous, [tile.image]: 'failed'}))}/>)}
        {loaded && <LivingPainting enabled={motion}/>}
        {active && actors.map(actor => <button key={actor.id} type="button" className="actor-hitbox" data-actor={actor.id} aria-label={`查看${actor.name}`} disabled={blocked} style={{left: actor.x * dimensions.width, top: actor.y * dimensions.height, width: Math.max(actor.width * dimensions.width, 44 / view.scale), height: Math.max(actor.height * dimensions.height, 44 / view.scale), '--outline-width': `${2 / view.scale}px`} as React.CSSProperties} onFocus={event => {
          if (!event.currentTarget.matches(':focus-visible')) return;
          const x = actor.x * picture.current.width * current.current.scale + current.current.x;
          const y = actor.y * picture.current.height * current.current.scale + current.current.y;
          if (x < 30 || x > frame.current.width - 30 || y < 100 || y > frame.current.height - 60) applyView({...current.current, x: frame.current.width / 2 - actor.x * picture.current.width * current.current.scale, y: frame.current.height / 2 - actor.y * picture.current.height * current.current.scale});
        }} onClick={event => {if (event.detail === 0 && !blocked) inspectActor(actor);}}/>)}
        {marked && <div className={`character-mark mark-${mark.kind}`} style={{left: marked.x * dimensions.width, top: (marked.y - marked.height / 2) * dimensions.height - 10 / view.scale, transform: `translate(-50%, -100%) scale(${1 / view.scale})`}} role="status">{mark.kind === 'wrong' ? '似乎不是他……' : mark.kind === 'found' ? '尋得' : '記下'}</div>}
      </div>
      {!loaded && <div className="scene-status" role="status">{failed ? <><span>畫卷暫時未能展開</span><button className="small-button" onPointerDown={e => e.stopPropagation()} onClick={() => {setFailed(false); setAttempt(a => a + 1);}}><RotateCcw size={15}/>重新載入</button></> : <><span className="loading-seal">卷</span><span>正在展開畫卷…</span></>}</div>}
    </div>
  </div>;
}
