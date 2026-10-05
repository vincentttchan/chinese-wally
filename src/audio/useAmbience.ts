import { useEffect, useRef, useState } from 'react';

type SoundState = 'off' | 'loading' | 'on' | 'error';
type Engine = {
  context: AudioContext; master: GainNode; sources: Set<AudioBufferSourceNode>;
  controller: AbortController; timer: number | null; started: boolean;
  ready: Promise<{ crowd: AudioBuffer; tea: AudioBuffer }>;
};

/** Three quiet layers. Audio starts only from the player's sound button. */
export function useAmbience(quiet: boolean) {
  const [state, setState] = useState<SoundState>('off');
  const engine = useRef<Engine | null>(null);
  const wanted = useRef(false);
  const quietRef = useRef(quiet);
  quietRef.current = quiet;

  const level = (item: Engine) => {
    const volume = wanted.current && !document.hidden ? (quietRef.current ? .16 : .42) : 0;
    item.master.gain.setTargetAtTime(volume, item.context.currentTime, .35);
  };
  useEffect(() => { if (engine.current) level(engine.current); }, [quiet]);
  useEffect(() => {
    const visibility = () => { if (engine.current) level(engine.current); };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      wanted.current = false;
      const item = engine.current;
      if (!item) return;
      item.controller.abort();
      if (item.timer !== null) window.clearInterval(item.timer);
      item.sources.forEach(source => { try { source.stop(); } catch { /* already ended */ } });
      void item.context.close();
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
        const decode = async (url: string) => {
          const response = await fetch(url, {signal: controller.signal});
          if (!response.ok) throw new Error('Audio unavailable');
          return context.decodeAudioData(await response.arrayBuffer());
        };
        const ready = Promise.all([decode('/audio/crowd.ogg'), decode('/audio/tea.ogg')])
          .then(([crowd, tea]) => ({crowd, tea}));
        engine.current = {context, master, controller, ready, sources: new Set(), timer: null, started: false};
      }
      const item = engine.current;
      // Resume immediately within the click gesture, before waiting for downloads.
      await item.context.resume();
      const buffers = await item.ready;
      if (engine.current !== item || !wanted.current) return;
      if (!item.started) {
        const ctx = item.context;
        const play = (buffer: AudioBuffer, volume: number, pan: number, when = ctx.currentTime, loop = false, cutoff = 1500) => {
          const source = ctx.createBufferSource();
          source.buffer = buffer; source.loop = loop;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass'; filter.frequency.value = cutoff;
          const gain = ctx.createGain();
          gain.gain.value = loop ? volume : 0;
          if (!loop) {
            gain.gain.setValueAtTime(0, when);
            gain.gain.linearRampToValueAtTime(volume, when + Math.min(.12, buffer.duration / 4));
            gain.gain.setValueAtTime(volume, when + buffer.duration * .8);
            gain.gain.linearRampToValueAtTime(0, when + buffer.duration);
          }
          const stereo = ctx.createStereoPanner(); stereo.pan.value = pan;
          source.connect(filter); filter.connect(gain); gain.connect(stereo); stereo.connect(item.master);
          item.sources.add(source);
          source.onended = () => {item.sources.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); stereo.disconnect();};
          source.start(when);
        };
        // Low-pass and low gain make recorded voices a distant, indistinct murmur.
        play(buffers.crowd, .36, -.12, ctx.currentTime, true, 850);
        const footstep = ctx.createBuffer(1, Math.round(ctx.sampleRate * .22), ctx.sampleRate);
        const samples = footstep.getChannelData(0);
        for (let i = 0; i < samples.length; i++) {
          const t = i / ctx.sampleRate;
          samples[i] = ((Math.random() * 2 - 1) * .3 + Math.sin(t * Math.PI * 2 * 145) * .7) * Math.exp(-t * 29);
        }
        let nextSteps = ctx.currentTime + 3;
        let nextTea = ctx.currentTime + 7;
        item.timer = window.setInterval(() => {
          if (!wanted.current || document.hidden || ctx.state !== 'running') return;
          if (ctx.currentTime >= nextSteps) {
            for (let i = 0; i < 5; i++) play(footstep, .09, -.45 + i * .16, ctx.currentTime + i * .57, false, 1000);
            nextSteps = ctx.currentTime + 12 + Math.random() * 8;
          }
          if (ctx.currentTime >= nextTea) {
            play(buffers.tea, .13, .25);
            nextTea = ctx.currentTime + 28 + Math.random() * 12;
          }
        }, 1000);
        item.started = true;
      }
      level(item);
      setState('on');
    } catch {
      if (!wanted.current) return;
      wanted.current = false;
      const item = engine.current;
      engine.current = null;
      if (item) {item.controller.abort(); if (item.timer !== null) window.clearInterval(item.timer); void item.context.close();}
      setState('error');
    }
  };
  return {state, toggle};
}
