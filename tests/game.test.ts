import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, reduceGame } from '../src/game/state.ts';

test('start enters exploration with no clues', () => {
  const state = reduceGame(createGame(), { type: 'start' });
  assert.equal(state.phase, 'exploring');
  assert.deepEqual(state.clues, []);
});

test('optional witness visits may be made in either order', () => {
  for (const ids of [['copyist', 'board-observer'], ['board-observer', 'copyist']]) {
    let state = reduceGame(createGame(), { type: 'start' });
    for (const id of ids) state = reduceGame(state, { type: 'inspect', id });
    assert.deepEqual([...state.clues].sort(), ['board-observer', 'copyist']);
    assert.equal(state.phase, 'exploring');
  }
});

test('repeated witness visits preserve one copy of each clue', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  state = reduceGame(state, { type: 'inspect', id: 'copyist' });
  state = reduceGame(state, { type: 'inspect', id: 'copyist' });
  assert.deepEqual(state.clues, ['copyist']);
});

test('finding the pictured target succeeds with zero or partial clues', () => {
  for (const ids of [[], ['copyist'], ['copyist', 'board-observer']]) {
    let state = reduceGame(createGame(), { type: 'start' });
    for (const id of ids) state = reduceGame(state, {type: 'inspect', id});
    state = reduceGame(state, { type: 'inspect', id: 'scholar-target' });
    assert.equal(state.phase, 'complete');
    assert.equal(state.feedback, null);
    assert.deepEqual(state.clues, ids);
  }
});

test('wrong candidates retain evidence and never complete the case', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  for (const id of ['copyist', 'board-observer', 'scholar-scroll', 'scholar-brown']) {
    state = reduceGame(state, { type: 'inspect', id });
  }
  assert.equal(state.phase, 'exploring');
  assert.equal(state.feedback, 'mismatch');
  assert.deepEqual(state.clues, ['copyist', 'board-observer']);
});

test('wrong candidates give mismatch feedback before any clue is collected', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  state = reduceGame(state, {type: 'inspect', id: 'scholar-scroll'});
  assert.equal(state.phase, 'exploring');
  assert.equal(state.feedback, 'mismatch');
  assert.deepEqual(state.clues, []);
});

test('the optional tea witness records evidence directly and repeated visits do not duplicate it', () => {
  let state = reduceGame(createGame(), {type: 'start'});
  state = reduceGame(state, {type: 'inspect', id: 'tea-keeper'});
  assert.deepEqual(state.clues, ['tea-keeper']);
  assert.equal(state.phase, 'exploring');
  state = reduceGame(state, {type: 'inspect', id: 'tea-keeper'});
  assert.deepEqual(state.clues, ['tea-keeper']);
  state = reduceGame(state, {type: 'inspect', id: 'scholar-target'});
  assert.equal(state.phase, 'complete');
});

test('restart clears progress and returns to the pre-game portrait', () => {
  let state = reduceGame(createGame(), { type: 'start' });
  for (const id of ['copyist', 'tea-keeper', 'board-observer', 'scholar-target']) {
    state = reduceGame(state, { type: 'inspect', id });
  }
  state = reduceGame(state, { type: 'restart' });
  assert.deepEqual(state, { phase: 'intro', clues: [], feedback: null });
  assert.deepEqual(reduceGame(state, {type: 'inspect', id: 'scholar-target'}), state);
  state = reduceGame(state, {type: 'start'});
  assert.equal(state.phase, 'exploring');
});

test('unknown IDs and inactive-scene clicks cannot alter progress', () => {
  const initial = createGame();
  assert.deepEqual(reduceGame(initial, { type: 'inspect', id: 'copyist' }), initial);
  const playing = reduceGame(initial, { type: 'start' });
  assert.deepEqual(reduceGame(playing, { type: 'inspect', id: 'unknown' }), playing);
});
