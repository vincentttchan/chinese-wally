import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, reduceGameForLevel } from '../src/game/state.ts';
import { templeFair } from '../src/game/templeFair.ts';
import { level } from '../src/game/level.ts';
import { chapterFromHash } from '../src/game/chapters.ts';

test('either observer gives the same evidence, which is counted once', () => {
  let state = reduceGameForLevel(createGame(), {type: 'start'}, templeFair);
  for (const id of ['watcher-right', 'watchers', 'fan-sample', 'cake-seller']) {
    state = reduceGameForLevel(state, {type: 'inspect', id}, templeFair);
  }
  assert.deepEqual(state.clues, ['watchers', 'fan-sample', 'cake-seller']);
  assert.equal(state.phase, 'exploring');
  state = reduceGameForLevel(state, {type: 'inspect', id: 'emperor-target'}, templeFair);
  assert.equal(state.phase, 'complete');
});

test('temple target needs witness, object and observation evidence in any order', () => {
  for (const ids of [
    ['cake-seller', 'fan-sample', 'watchers'],
    ['watchers', 'cake-seller', 'fan-sample'],
    ['fan-sample', 'watcher-right', 'cake-seller'],
  ]) {
    let state = reduceGameForLevel(createGame(), {type: 'start'}, templeFair);
    for (const id of ids) {
      state = reduceGameForLevel(state, {type: 'inspect', id: 'emperor-target'}, templeFair);
      assert.equal(state.phase, 'exploring');
      state = reduceGameForLevel(state, {type: 'inspect', id}, templeFair);
    }
    for (const id of ['visitor-fan', 'visitor-flour', 'visitor-merchant']) {
      state = reduceGameForLevel(state, {type: 'inspect', id}, templeFair);
      assert.equal(state.feedback, 'mismatch');
      assert.equal(state.phase, 'exploring');
      assert.equal(state.clues.length, 3);
    }
    state = reduceGameForLevel(state, {type: 'inspect', id: 'emperor-target'}, templeFair);
    assert.equal(state.phase, 'complete');
    state = reduceGameForLevel(state, {type: 'restart'}, templeFair);
    assert.deepEqual(state, {phase: 'exploring', clues: [], feedback: null});
  }
});

test('evidence from a different chapter cannot unlock the temple target', () => {
  let state = reduceGameForLevel(createGame(), {type: 'start'}, level);
  for (const id of ['copyist', 'tea-keeper', 'board-observer']) {
    state = reduceGameForLevel(state, {type: 'inspect', id}, level);
  }
  state = reduceGameForLevel(state, {type: 'inspect', id: 'emperor-target'}, templeFair);
  assert.equal(state.phase, 'exploring');
  assert.equal(state.feedback, 'need-clues');
  const newChapter = createGame();
  assert.deepEqual(newChapter.clues, []);
  assert.equal(newChapter.phase, 'intro');
});

test('direct chapter links keep the original default and open the new independent case', () => {
  assert.equal(chapterFromHash(''), 'examination');
  assert.equal(chapterFromHash('#unknown'), 'examination');
  assert.equal(chapterFromHash('#examination'), 'examination');
  assert.equal(chapterFromHash('#temple-fair'), 'temple-fair');
});
