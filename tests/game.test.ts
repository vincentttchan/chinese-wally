import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, reduceGame } from '../src/game/state.ts';

test('start enters exploration with no clues', () => {
  const state = reduceGame(createGame(), { type: 'start' });
  assert.equal(state.phase, 'exploring');
  assert.deepEqual(state.clues, []);
});

test('both clue orders produce the same collected evidence', () => {
  for (const ids of [['copyist', 'tea-keeper'], ['tea-keeper', 'copyist']]) {
    let state = reduceGame(createGame(), { type: 'start' });
    for (const id of ids) state = reduceGame(state, { type: 'inspect', id });
    assert.deepEqual([...state.clues].sort(), ['copyist', 'tea-keeper']);
    assert.equal(state.phase, 'exploring');
  }
});

test('repeated witness visits preserve one copy of each clue', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  state = reduceGame(state, { type: 'inspect', id: 'copyist' });
  state = reduceGame(state, { type: 'inspect', id: 'copyist' });
  assert.deepEqual(state.clues, ['copyist']);
});

test('target cannot complete before both clues are collected', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  state = reduceGame(state, { type: 'inspect', id: 'copyist' });
  state = reduceGame(state, { type: 'inspect', id: 'scholar-target' });
  assert.equal(state.phase, 'exploring');
  assert.equal(state.feedback, 'need-clues');
});

test('wrong candidates retain evidence and never complete the case', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  for (const id of ['copyist', 'tea-keeper', 'scholar-scroll', 'scholar-brown']) {
    state = reduceGame(state, { type: 'inspect', id });
  }
  assert.equal(state.phase, 'exploring');
  assert.equal(state.feedback, 'mismatch');
  assert.equal(state.clues.length, 2);
});

test('correct target completes only after both witnesses', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  for (const id of ['copyist', 'tea-keeper', 'scholar-target']) {
    state = reduceGame(state, { type: 'inspect', id });
  }
  assert.equal(state.phase, 'complete');
});

test('restart clears clues, feedback and returns to exploration', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  for (const id of ['copyist', 'tea-keeper', 'scholar-target']) {
    state = reduceGame(state, { type: 'inspect', id });
  }
  state = reduceGame(state, { type: 'restart' });
  assert.deepEqual(state, { phase: 'exploring', clues: [], feedback: null });
});

test('unknown IDs and inactive-scene clicks cannot alter progress', () => {
  const initial = createGame();
  assert.deepEqual(reduceGame(initial, { type: 'inspect', id: 'copyist' }), initial);
  const playing = reduceGame(initial, { type: 'start' });
  assert.deepEqual(reduceGame(playing, { type: 'inspect', id: 'unknown' }), playing);
});
