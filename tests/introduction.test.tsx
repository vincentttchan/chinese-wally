import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Introduction } from '../src/components/Introduction.tsx';
import { chapters } from '../src/game/chapters.ts';

async function setup(ready = true, initialStep = 0) {
  const window = new Window();
  for (const [key, value] of Object.entries({window, document: window.document, navigator: window.navigator, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true})) {
    Object.defineProperty(globalThis, key, {value, configurable: true, writable: true});
  }
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const root = createRoot(container as unknown as HTMLElement);
  const chapter = chapters['temple-fair'];
  let starts = 0;
  const render = async (loaded = ready, leaving = false) => {
    await act(async () => root.render(<Introduction ready={loaded} leaving={leaving} steps={chapter.intro} initialStep={initialStep} reference={{portrait: chapter.targetPortrait, description: chapter.targetDescription}} onBegin={() => starts++}/>));
  };
  await render();
  const click = async (selector: string) => {
    const button = container.querySelector(selector);
    assert.ok(button, `expected ${selector} to exist`);
    await act(async () => button.dispatchEvent(new window.MouseEvent('click', {bubbles: true})));
  };
  return {container, render, click, starts: () => starts, cleanup: async () => {await act(async () => root.unmount()); await window.happyDOM.abort();}};
}

test('skipping the story still shows the portrait before starting', async () => {
  const app = await setup();
  try {
    assert.equal(app.container.querySelector('.intro-reference'), null);
    await app.click('.intro-skip');
    assert.equal(app.starts(), 0);
    assert.ok(app.container.querySelector('.intro-reference'));
    assert.equal(app.container.querySelector('.intro-skip'), null);
    assert.match(app.container.textContent!, /入畫後會收起人物圖/);
    await app.click('.intro-enter');
    assert.equal(app.starts(), 1);
    await app.render(true, true);
    assert.equal(app.container.querySelector('.intro-reference'), null, 'portrait is removed immediately on entry');
  } finally {await app.cleanup();}
});

test('reading the full story leads to the same portrait step', async () => {
  const app = await setup();
  try {
    await app.click('.intro-enter');
    assert.equal(app.container.querySelector('.intro-reference'), null);
    await app.click('.intro-enter');
    assert.ok(app.container.querySelector('.intro-reference'));
    assert.equal(app.starts(), 0);
    await app.click('.intro-enter');
    assert.equal(app.starts(), 1);
  } finally {await app.cleanup();}
});

test('replay starts at the portrait and waits for the painting to load', async () => {
  const app = await setup(false, 2);
  try {
    assert.ok(app.container.querySelector('.intro-reference'));
    assert.equal(app.container.querySelector('.intro-enter')?.hasAttribute('disabled'), true);
    await app.render(true);
    assert.equal(app.container.querySelector('.intro-enter')?.hasAttribute('disabled'), false);
    await app.click('.intro-enter');
    assert.equal(app.starts(), 1);
  } finally {await app.cleanup();}
});
