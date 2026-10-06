import { assetPath } from '../game/assets.ts';
import { useEffect, useRef, useState } from 'react';

type SoundState = 'off' | 'loading' | 'on' | 'error';
type Engine = {
  context: AudioContext;
  master: GainNode;
  sources: Set<AudioBufferSourceNode>;
  controller: AbortController;
  timer: number | null;
  started: boolean;
  ready: Promise<AudioBuffer>;
};

/** A quiet instrumental track, enabled only by a player's sound-button gesture. */
export function useAmbience(quiet: boolean) {
  const [state, setState] = useState<SoundState>('off');
  const engine = useRef<Engine | null>(null);
  const wanted = useRef(false);
  const quietRef = useRef(quiet);
  quietRef.current = quiet;

  const level = (item: Engine) => {
    const volume = wanted.current && !document.hidden ? (quietRef.current ? .07 : .19) : 0;
    item.master.gain.setTargetAtTime(volume, item.context.currentTime, .45);
  };
  const dispose = (item: Engine) => {
    item.controller.abort();
    if (item.timer !== null) window.clearInterval(item.timer);
    item.sources.forEach(source => {try {source.stop();} catch { /* Already ended. */ }});
    void item.context.close();
  };
  useEffect(() => {if (engine.current) level(engine.current);}, [quiet]);
  useEffect(() => {
    const visibility = () => {if (engine.current) level(engine.current);};
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      wanted.current = false;
      if (engine.current) dispose(engine.current);
      engine.current = null;
    };
  }, []);

  const toggle = async () => {
    wanted.current = !wanted.current;
    if (!wanted.current) {
      setState('off');
      if (engine.current) level(engine.current);
      return;
    }
    setState('loading');
    try {
      if (!engine.current) {
        const context = new AudioContext();
        const master = context.createGain();
        master.gain.value = 0;
        master.connect(context.destination);
        const controller = new AbortController();
        const ready = fetch(assetPath('/audio/scroll-music.mp3'), {signal: controller.signal}).then(async response => {
          if (!response.ok) throw new Error('Music unavailable');
          return context.decodeAudioData(await response.arrayBuffer());
        });
        engine.current = {context, master, controller, ready, sources: new Set(), timer: null, started: false};
      }
      const item = engine.current;
      // Unlock audio while the player's click gesture is still active.
      await item.context.resume();
      const music = await item.ready;
      if (engine.current !== item || !wanted.current) return;
      if (!item.started) {
        const ctx = item.context;
        const fade = Math.min(4, music.duration / 4);
        const play = (when: number) => {
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          source.buffer = music;
          gain.gain.setValueAtTime(0, when);
          gain.gain.linearRampToValueAtTime(1, when + fade);
          gain.gain.setValueAtTime(1, when + music.duration - fade);
          gain.gain.linearRampToValueAtTime(0, when + music.duration);
          source.connect(gain);
          gain.connect(item.master);
          item.sources.add(source);
          source.onended = () => {item.sources.delete(source); source.disconnect(); gain.disconnect();};
          source.start(when);
        };
        const first = ctx.currentTime + .05;
        play(first);
        let next = first + music.duration - fade;
        item.timer = window.setInterval(() => {
          if (ctx.state !== 'running') return;
          if (next <= ctx.currentTime + 1.5) {
            const when = Math.max(next, ctx.currentTime + .05);
            play(when);
            next = when + music.duration - fade;
          }
        }, 500);
        item.started = true;
      }
      level(item);
      setState('on');
    } catch {
      if (!wanted.current) return;
      wanted.current = false;
      if (engine.current) dispose(engine.current);
      engine.current = null;
      setState('error');
    }
  };
  return {state, toggle};
}
