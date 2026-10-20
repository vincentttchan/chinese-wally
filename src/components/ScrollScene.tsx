import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { RotateCcw } from './ArtIcons.tsx';
import { LivingPainting } from './LivingPainting.tsx';
import { clampView, coverView, zoomAt } from '../game/geometry.ts';
import type { Point, Size, View } from '../game/geometry.ts';
import type { PaintingTile, SceneActor } from '../game/level.ts';

export type SceneHint = {region: Point; token: number};
export type SceneSelection = {actorId: string; kind: 'wrong' | 'found' | 'clue'; token: number};
export type StudyCommand = {
  region: Point; scaleRatio?: number; token: number;
  screenAnchor?: Point;
  transition?: 'pan' | 'crossfade';
  onSettled?: () => void;
};
export type SceneViewport = {view: View; frame: Size};
export type SceneCommand = {type: 'in' | 'out' | 'overview'; token: number};
export type SceneHitResolver = (world: Point, scale: number, size: Size, actors: SceneActor[]) => SceneActor | null;
type Props = {
  hitResolver?: SceneHitResolver;
  image: string; tiles?: PaintingTile[]; actors: SceneActor[]; active: boolean; blocked: boolean;
  resetKey: number; hint: SceneHint | null; selection?: SceneSelection | null;
  command?: SceneCommand | null; onInspect: (id: string, anchor?: Point) => void;
  onExplore?: () => void; motion?: boolean; onReady: (ready: boolean) => void;
  title?: string; description?: string; steam?: Point | null;
  initialRegion?: Point;
  focusing?: boolean;
  artworkSize?: Size;
  requireTiles?: boolean;
  keyboardNavigation?: boolean;
  onMiss?: () => void;
  onViewChange?: (window: {left: number; width: number}) => void;
  initialFocus?: Point;
  study?: {region: Point; monochrome: boolean; height: number} | null;
  studyCommand?: StudyCommand | null;
  zoomStops?: readonly number[];
  onViewportChange?: (viewport: SceneViewport) => void;
};
const defaultZoomStops = [1, 1.1, 1.25, 1.5, 1.75];

export function ScrollScene({image, tiles, actors, active, blocked, resetKey, hint, selection, command, onInspect, onExplore, onReady, motion = true, title = '科舉放榜日', description = '原創科舉放榜日全景古畫，左側榜牆、中央茶攤、右側橋頭與人群', steam, initialRegion, focusing = true, artworkSize, requireTiles = false, hitResolver, onMiss, onViewChange, initialFocus, study, studyCommand, onViewportChange,zoomStops=defaultZoomStops,keyboardNavigation=false}: Props) {
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
  const [departingView, setDepartingView] = useState<View | null>(null);
  const departingLayer = useRef<HTMLDivElement>(null);
  const [focusPoint, setFocusPoint] = useState<Point>(initialFocus ?? {x: .5, y: .48});
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
  const limits = () => ({min: baseScale(), max: baseScale() * zoomStops[zoomStops.length-1]});
  const applyView = (next: View) => {
    const range = limits();
    const scale = Math.max(range.min, Math.min(range.max, next.scale));
    const covered = zoomAt(next, scale / next.scale, {x: frame.current.width / 2, y: frame.current.height / 2}, range);
    const bounded = clampView(covered, frame.current, picture.current);
    current.current = bounded; setView(bounded);
    onViewportChange?.({view: bounded, frame: {...frame.current}});
    onViewChange?.({left: -bounded.x / (picture.current.width * scale), width: Math.min(1, frame.current.width / (picture.current.width * scale))});
  };
  const animateView = (next: View, duration = 550, onSettled?: () => void, review = false) => {
    stopAnimation();
    const target = clampView(next, frame.current, picture.current);
    if (review ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : reduced()) {applyView(target); onSettled?.(); return;}
    const from = {...current.current}; const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      applyView({x: from.x + (target.x - from.x) * ease, y: from.y + (target.y - from.y) * ease, scale: from.scale + (target.scale - from.scale) * ease});
      if (progress < 1) animation.current = requestAnimationFrame(tick);
      else {animation.current = null; onSettled?.();}
    };
    animation.current = requestAnimationFrame(tick);
  };
  // The observation position belongs to the player and uses viewport coordinates.
  const moveFocus = (p: Point) => setFocusPoint({x: Math.max(0, Math.min(1, p.x / frame.current.width)), y: Math.max(0, Math.min(1, p.y / frame.current.height))});
  useEffect(() => {
    if (!focusing || !active || blocked || !loaded) return;
    stopAnimation();
    for (const id of pointers.current.keys()) if (root.current?.hasPointerCapture(id)) root.current.releasePointerCapture(id);
    pointers.current.clear(); setDragging(false);
    root.current?.focus({preventScroll: true});
  }, [focusing, active, blocked, loaded]);
  const point = (x: number, y: number): Point => {const bounds = root.current!.getBoundingClientRect(); return {x: x - bounds.left, y: y - bounds.top};};
  const zoomStep = (direction: number, anchor = {x: frame.current.width / 2, y: frame.current.height / 2}) => {
    onExploreRef.current?.();
    const ratio = current.current.scale / baseScale();
    const next = direction > 0 ? zoomStops.find(stop => stop > ratio + .02) ?? zoomStops[zoomStops.length-1] : [...zoomStops].reverse().find(stop => stop < ratio - .02) ?? 1;
    animateView(zoomAt(current.current, baseScale() * next / current.current.scale, anchor, limits()), 180);
  };

  const tilesReady = (tiles ?? []).every(tile => requireTiles ? tileStatus[tile.image] === 'loaded' : Boolean(tileStatus[tile.image]));
  const tileFailed = requireTiles && (tiles ?? []).some(tile => tileStatus[tile.image] === 'failed');
  useEffect(() => {onReady(loaded && tilesReady);}, [loaded, tilesReady, onReady]);

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
      const opening = coverView(frame.current, picture.current);
      applyView(initialRegion && active ? {...opening,
        x: frame.current.width / 2 - initialRegion.x * picture.current.width * opening.scale,
        y: frame.current.height / 2 - initialRegion.y * picture.current.height * opening.scale,
      } : opening);
      setMark(null); setFocusPoint(initialFocus ?? {x: .5, y: .48});
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
    if (!studyCommand || !loaded) return;
    // Review compositions reserve a stable reading area without shrinking the artwork.
    const scale = studyCommand.scaleRatio ? baseScale() * studyCommand.scaleRatio : current.current.scale;
    const anchor = studyCommand.screenAnchor ?? {x: .5, y: .5};
    const target = {scale, x: frame.current.width * anchor.x - studyCommand.region.x * picture.current.width * scale,
      y: frame.current.height * anchor.y - studyCommand.region.y * picture.current.height * scale};
    let cancelled = false;
    let fade: Animation | undefined;
    let raf: number | undefined;
    const settled = () => {if (!cancelled) studyCommand.onSettled?.();};
    if (studyCommand.transition === 'crossfade' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stopAnimation();
      setDepartingView({...current.current});
      applyView(target);
      raf = requestAnimationFrame(() => {
        if (!departingLayer.current) {setDepartingView(null); settled(); return;}
        fade = departingLayer.current.animate([{opacity: 1}, {opacity: 0}], {duration: 440, easing: 'ease-in-out', fill: 'forwards'});
        void fade.finished.then(() => {if (!cancelled) {setDepartingView(null); settled();}}, () => {});
      });
    } else animateView(target, 600, settled, Boolean(studyCommand.transition));
    return () => {
      cancelled = true;
      if (raf !== undefined) cancelAnimationFrame(raf);
      fade?.cancel(); stopAnimation(); setDepartingView(null);
    };
  }, [studyCommand?.token, loaded, frameSize.width, frameSize.height]);
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
    if (command.type === 'overview') {
      onExploreRef.current?.();
      const opening = coverView(frame.current, picture.current);
      animateView(initialRegion ? {...opening, x: frame.current.width / 2 - initialRegion.x * picture.current.width * opening.scale, y: frame.current.height / 2 - initialRegion.y * picture.current.height * opening.scale} : opening);
    }
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
    if (focusing) moveFocus(p);
    pointers.current.set(event.pointerId, p);
    if (pointers.current.size === 1) {start.current = p; moved.current = false; pinched.current = false; pinchMiddle.current = null; velocity.current = {x: 0, y: 0, time: performance.now()};}
    else {moved.current = true; pinched.current = true;}
    root.current!.setPointerCapture(event.pointerId); setDragging(true);
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (blocked || !loaded) return;
    const position = point(event.clientX, event.clientY);
    if (focusing && (event.pointerType === 'mouse' || pointers.current.size <= 1)) moveFocus(position);
    if (!pointers.current.has(event.pointerId)) return;
    const before = [...pointers.current.values()]; const old = pointers.current.get(event.pointerId)!;
    const p = point(event.clientX, event.clientY); pointers.current.set(event.pointerId, p);
    if (start.current && Math.hypot(p.x - start.current.x, p.y - start.current.y) > 7) {moved.current = true; onExploreRef.current?.();}
    if (pointers.current.size === 1) {
      // Touch observation moves the light; two fingers retain canvas navigation.
      if (focusing && event.pointerType !== 'mouse') return;
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
      if (focusing && event.pointerType !== 'mouse' && !pinched.current) return;
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
    // Resolve the painted bounds before touch padding, so an adjacent small
    // child cannot lose a direct tap to an adult's expanded touch rectangle.
    const contains = (a: SceneActor, padded: boolean) =>
      Math.abs(world.x - a.x * picture.current.width) <= Math.max(a.width * picture.current.width, padded ? 44 / current.current.scale : 0) / 2 &&
      Math.abs(world.y - a.y * picture.current.height) <= Math.max(a.height * picture.current.height, padded ? 44 / current.current.scale : 0) / 2;
    const painted = actors.filter(a => contains(a, false));
    const selected = hitResolver ? hitResolver(world, current.current.scale, picture.current, actors) : (painted.length ? painted : actors.filter(a => contains(a, true)))
      .sort((a, b) => {
        // Specific painted objects take precedence over broad people/stall regions.
        const priority = (id: string) => id === 'finding-fish' ? 3 : id.startsWith('finding-lamp-') || id === 'finding-standing-lamp' ? 2 : 0;
        return priority(b.id)-priority(a.id) || Math.hypot(world.x - a.x * picture.current.width, world.y - a.y * picture.current.height) - Math.hypot(world.x - b.x * picture.current.width, world.y - b.y * picture.current.height);})[0];
    if (selected) inspectActor(selected); else onMiss?.();
  };
  const observing = focusing && active && loaded && !blocked;
  const studyStyle = study ? {'--focus-x': `${view.x + study.region.x * dimensions.width * view.scale}px`,
    '--focus-y': `${view.y + study.region.y * dimensions.height * view.scale}px`,
    '--focus-radius': `${Math.max(100, study.height * dimensions.height * view.scale * .85)}px`} as React.CSSProperties : undefined;
  const focusStyle = {'--focus-x': `${focusPoint.x * 100}%`, '--focus-y': `${focusPoint.y * 100}%`, '--focus-radius': `${Math.min(210, Math.min(frameSize.width, frameSize.height) * .31)}px`} as React.CSSProperties;
  const marked = mark && actors.find(a => a.id === mark.actorId);
  return <div className={`scroll-frame ${loaded ? 'is-ready' : ''}`} data-assets-ready={loaded && tilesReady ? 'true' : 'false'} style={{backgroundImage: `url("${image}")`}}>
    <div className={`scroll-viewport ${dragging ? 'is-dragging' : ''} ${observing ? 'is-focusing' : ''}`} ref={root} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={event => {
      if (blocked || !loaded) return;
      if (observing && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const distance = event.shiftKey ? 60 : 28;
        moveFocus({x: focusPoint.x * frame.current.width + (event.key === 'ArrowLeft' ? -distance : event.key === 'ArrowRight' ? distance : 0), y: focusPoint.y * frame.current.height + (event.key === 'ArrowUp' ? -distance : event.key === 'ArrowDown' ? distance : 0)});
      }
      if (event.key === '+' || event.key === '=') {event.preventDefault(); zoomStep(1);}
      if (event.key === '-') {event.preventDefault(); zoomStep(-1);}
      if (event.key === 'Home') {
        event.preventDefault(); const opening = coverView(frame.current, picture.current);
        animateView(initialRegion ? {...opening, x: frame.current.width / 2 - initialRegion.x * picture.current.width * opening.scale, y: frame.current.height / 2 - initialRegion.y * picture.current.height * opening.scale} : opening);
      }
      if(keyboardNavigation&&!focusing&&active&&!blocked&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();onExploreRef.current?.();applyView({...current.current,x:current.current.x+(event.key==='ArrowLeft'?100:-100)});}
    }} aria-label={`可拖曳與放大的${title}長卷`} tabIndex={active ? 0 : -1}>
      <div className="painting-world" style={{width: dimensions.width, height: dimensions.height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`}}>
        <img className="painting" src={`${image}${attempt ? `?retry=${attempt}` : ''}`} alt={description} draggable={false} onLoad={event => {
          const next = artworkSize ?? {width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight};
          picture.current = next; setDimensions(next); setLoaded(true); setFailed(false);
        }} onError={() => {setFailed(true); setLoaded(false); onReady(false);}}/>
        {tiles?.map(tile => <img key={tile.image} className="painting-detail-tile" src={`${tile.image}${attempt ? `?retry=${attempt}` : ''}`} alt="" aria-hidden="true" draggable={false} style={{left: `${tile.x * 100}%`, top: `${(tile.y ?? 0) * 100}%`, width: `${tile.width * 100}%`, height: `${(tile.height ?? 1) * 100}%`, transform: tile.transform, transformOrigin: '0 0', visibility: tileStatus[tile.image] === 'failed' ? 'hidden' : undefined}} onLoad={() => setTileStatus(previous => ({...previous, [tile.image]: 'loaded'}))} onError={() => setTileStatus(previous => ({...previous, [tile.image]: 'failed'}))}/>)}
        {loaded && <LivingPainting enabled={motion} steam={steam}/>}
        {active && actors.map(actor => <button key={actor.id} type="button" className="actor-hitbox" data-actor={actor.id} aria-label={`查看${actor.name}`} disabled={blocked} style={{left: actor.x * dimensions.width, top: actor.y * dimensions.height, width: Math.max(actor.width * dimensions.width, 44 / view.scale), height: Math.max(actor.height * dimensions.height, 44 / view.scale), '--outline-width': `${2 / view.scale}px`} as React.CSSProperties} onFocus={event => {
          if (!event.currentTarget.matches(':focus-visible')) return;
          const x = actor.x * picture.current.width * current.current.scale + current.current.x;
          const y = actor.y * picture.current.height * current.current.scale + current.current.y;
          if (x < 30 || x > frame.current.width - 30 || y < 100 || y > frame.current.height - 60) applyView({...current.current, x: frame.current.width / 2 - actor.x * picture.current.width * current.current.scale, y: frame.current.height / 2 - actor.y * picture.current.height * current.current.scale});
          if (focusing) moveFocus({x: actor.x * picture.current.width * current.current.scale + current.current.x, y: actor.y * picture.current.height * current.current.scale + current.current.y});
        }} onClick={event => {if (event.detail === 0 && !blocked) inspectActor(actor);}}/>)}
        {marked && <div className={`character-mark mark-${mark.kind}`} style={{left: marked.x * dimensions.width, top: (marked.y - marked.height / 2) * dimensions.height - 10 / view.scale, transform: `translate(-50%, -100%) scale(${1 / view.scale})`}} role="status">{mark.kind === 'wrong' ? '似乎不是他……' : mark.kind === 'found' ? '尋得' : '記下'}</div>}
      </div>
      {departingView && <div ref={departingLayer} className="painting-world painting-departing" aria-hidden="true" style={{width: dimensions.width, height: dimensions.height, transform: `translate(${departingView.x}px, ${departingView.y}px) scale(${departingView.scale})`}}>
        <img className="painting" src={image} alt="" draggable={false}/>
        {tiles?.map(tile => <img key={tile.image} className="painting-detail-tile" src={tile.image} alt="" draggable={false} style={{left: `${tile.x * 100}%`, top: `${(tile.y ?? 0) * 100}%`, width: `${tile.width * 100}%`, height: `${(tile.height ?? 1) * 100}%`, transform: tile.transform, transformOrigin: '0 0', visibility: tileStatus[tile.image] === 'failed' ? 'hidden' : undefined}}/>)}
      </div>}
      {!study && focusing && <div className="observation-light" style={focusStyle} aria-hidden="true"><div className="observation-shade"/>{observing && <div className="observation-warmth"/>}</div>}
      {study && <div className={`observation-light lantern-study-light ${study.monochrome ? 'is-monochrome' : 'is-colour'}`} style={studyStyle} aria-hidden="true"><div className="lantern-study-grayscale"/><div className="observation-shade"/></div>}
      {(!loaded || (requireTiles && !tilesReady)) && <div className="scene-status" role="status">{failed || tileFailed ? <><span>畫卷暫時未能展開</span><button className="small-button" onPointerDown={e => e.stopPropagation()} onClick={() => {setFailed(false); setTileStatus({}); setAttempt(a => a + 1);}}><RotateCcw size={15}/>重新載入</button></> : <><span className="loading-seal">卷</span><span>正在展開畫卷…</span></>}</div>}
    </div>
  </div>;
}
