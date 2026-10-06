import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollScene } from '../src/components/ScrollScene.tsx';
import type { SceneHint } from '../src/components/ScrollScene.tsx';
import type { SceneActor } from '../src/game/level.ts';

const actors: SceneActor[] = [
  {id: 'copyist', name: '抄榜人', kind: 'witness', x: .15, y: .7, width: .03, height: .15},
  {id: 'target', name: '考生', kind: 'target', x: .9, y: .7, width: .03, height: .15},
];

async function setup(initialHint: SceneHint | null, frame = {width: 900, height: 400}, active = true) {
  const window = new Window();
  for (const [key, value] of Object.entries({window, document: window.document, navigator: window.navigator, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true})) {
    Object.defineProperty(globalThis, key, {value, configurable: true, writable: true});
  }
  // Happy DOM has no layout. Supply the actual observed viewport contract.
  class ViewportObserver {
    callback: (entries: unknown[]) => void;
    constructor(callback: (entries: unknown[]) => void) {this.callback = callback;}
    observe() {this.callback([{contentRect: frame}]);}
    disconnect() {}
  }
  Object.defineProperty(globalThis, 'ResizeObserver', {value: ViewportObserver, configurable: true});
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const root = createRoot(container as unknown as HTMLElement);
  const render = async (hint: SceneHint | null) => {
    await act(async () => root.render(<ScrollScene image="/test-scroll.png" actors={actors} active={active} blocked={false} resetKey={1} hint={hint} motion={false} onInspect={() => {}} onReady={() => {}}/>));
  };
  await render(initialHint);
  const image = container.querySelector('img')!;
  Object.defineProperties(image, {naturalWidth: {value: 3000}, naturalHeight: {value: 1000}});
  await act(async () => {image.dispatchEvent(new window.Event('load'));});
  return {window, container, render, cleanup: async () => {await act(async () => root.unmount()); await window.happyDOM.abort();}};
}

test('a requested region hint moves the view without marking the answer, and clearing preserves the view', async () => {
  const app = await setup({region: {x: .7, y: .5}, token: 1});
  try {
    const world = app.container.querySelector('.painting-world')! as unknown as HTMLElement;
    const position = world.style.transform;
    assert.ok(Number(position.match(/translate\(([-\d.]+)px/)![1]) < 0);
    assert.equal(app.container.querySelectorAll('.hint-ring, .character-mark').length, 0);
    await app.render(null);
    assert.equal(world.style.transform, position);
  } finally {await app.cleanup();}
});

test('phone introduction shows a readable painting instead of a hidden narrow band', async () => {
  const app = await setup(null, {width: 350, height: 440}, false);
  try {
    const world = app.container.querySelector('.painting-world')! as unknown as HTMLElement;
    const scale = Number(world.style.transform.match(/scale\(([-\d.]+)\)/)![1]);
    assert.ok(scale * 1000 >= 440, 'painting must fill the phone introduction vertically');
  } finally {await app.cleanup();}
});

test('keyboard focus reveals an offscreen actor using the managed view', async () => {
  const app = await setup(null);
  try {
    const target = app.container.querySelector('[data-actor="target"]')!;
    const world = app.container.querySelector('.painting-world')! as unknown as HTMLElement;
    const screenX = () => {
      const match = world.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([-\d.]+)\)/)!;
      return Number(match[1]) + .9 * 3000 * Number(match[3]);
    };
    assert.ok(screenX() > 900, 'target begins outside the visible viewport');
    // Emulate keyboard-origin focus-visible; native focus behavior is browser-checked separately.
    const originalMatches = target.matches.bind(target);
    target.matches = selector => selector === ':focus-visible' || originalMatches(selector);
    await act(async () => {target.dispatchEvent(new app.window.FocusEvent('focusin', {bubbles: true}));});
    assert.ok(screenX() >= 0 && screenX() <= 900, 'focused actor must appear within the viewport');
  } finally {await app.cleanup();}
});
