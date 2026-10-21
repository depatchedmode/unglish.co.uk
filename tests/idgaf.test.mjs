import test from 'node:test';
import assert from 'node:assert/strict';
import { idgaf } from '../assets/idgaf.mjs';

test('base IDGAF follows the published sequence and keeps counting', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 10, 11].map(idgaf), ['a', 'e', 'i', 'o', 'u', 'ab', 'eb', 'ub', 'ac']);
  assert.equal(idgaf(110), 'uz');
  assert.equal(idgaf(111), 'aba');
  assert.equal(idgaf(5 + 5 * 21 + 5 * 21 * 5), 'uzu');
  assert.equal(idgaf(5 + 5 * 21 + 5 * 21 * 5 + 1), 'abab');
});

test('every count has its own base IDGAF spelling', () => {
  const seen = new Set();
  for (let count = 1; count <= 20000; count += 1) seen.add(idgaf(count));
  assert.equal(seen.size, 20000);
});

test('base IDGAF has no zero', () => {
  for (const count of [0, -1, 1.5, Number.NaN]) assert.throws(() => idgaf(count), RangeError);
});
