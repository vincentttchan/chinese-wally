import test from 'node:test';
import assert from 'node:assert/strict';
import { fitView, clampView, zoomAt } from '../src/game/geometry.ts';

test('full view fits and centers a panoramic scroll', () => {
  assert.deepEqual(fitView({width: 900, height: 400}, {width: 3000, height: 1000}), {scale: .3, x: 0, y: 50});
});
test('phone full view retains the whole scroll', () => {
  const view = fitView({width: 360, height: 500}, {width: 3000, height: 1000});
  assert.equal(view.scale, .12);
  assert.equal(view.y, 190);
});
test('zoom keeps the chosen image point under the pointer', () => {
  const view = zoomAt({x: -100, y: -50, scale: 1}, 2, {x: 150, y: 100}, {min: .2, max: 5});
  assert.deepEqual(view, {x: -350, y: -200, scale: 2});
});
test('zoom obeys lower and upper scale limits', () => {
  assert.equal(zoomAt({x: 0, y: 0, scale: 1}, 100, {x: 0, y: 0}, {min: .3, max: 5}).scale, 5);
  assert.equal(zoomAt({x: 0, y: 0, scale: 1}, .01, {x: 0, y: 0}, {min: .3, max: 5}).scale, .3);
});
test('pan bounds prevent losing a magnified painting', () => {
  assert.deepEqual(clampView({x: 200, y: -2000, scale: 1}, {width: 900, height: 400}, {width: 3000, height: 1000}), {x: 0, y: -600, scale: 1});
});
test('smaller images remain centered rather than drifting', () => {
  assert.deepEqual(clampView({x: 300, y: -500, scale: .2}, {width: 900, height: 400}, {width: 3000, height: 1000}), {x: 150, y: 100, scale: .2});
});
