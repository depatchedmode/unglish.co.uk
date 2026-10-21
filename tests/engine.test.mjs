import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { ENGINE_ID, generate } from '../assets/engines/current.mjs';
import { DEFAULT_ENGINE_ID, ENGINES } from '../assets/engines/registry.mjs';

const snapshot = new URL(`../assets/engines/${ENGINE_ID}/`, import.meta.url);

test('shared seed examples keep their spelling and intended pronunciation', () => {
  const examples = [
    [{ seed: 'unglish' }, 'sochede', 'ˈsɔ.tʃi:d'],
    [{ seed: 'literature' }, 'overinor', 'ˈəʊ.vɚˌhɪnˌɚ'],
    [{ seed: 'teapot' }, 'siggond', 'ˌsɪgˈʌnd'],
    [{ seed: '👂' }, 'unsland', 'ˌʌn.slɑnd'],
    [{ seed: 'unglish', syllables: 3, morphology: false }, 'atteakeas', 'æˈtʰɛkˌi:z'],
    [{ seed: 'unglish', mode: 'text' }, 'blas', 'blɑz'],
    [{ seed: 'unglish', morphology: false }, 'matoons', 'ˈmɑ.tʰunz'],
  ];
  for (const [options, spelling, pronunciation] of examples) {
    const word = generate(options);
    assert.equal(word.written.clean, spelling);
    assert.equal(word.pronunciation, pronunciation);
  }
});

test('generating other words cannot change a shared word, and generation needs no ambient randomness', () => {
  const before = generate({ seed: 'repeatable' });
  const random = Math.random;
  Math.random = () => { throw new Error('Seeded generation accessed Math.random'); };
  try {
    for (let index = 0; index < 40; index++) generate({ seed: `intervening-${index}` });
    assert.deepEqual(generate({ seed: 'repeatable' }), before);
    assert.deepEqual(generate({ seed: 'repeatable', morphology: true, mode: 'lexicon' }), before);
  } finally {
    Math.random = random;
  }
});

test('syllable controls request the final count with and without affixes', () => {
  for (const morphology of [true, false]) {
    for (let syllables = 1; syllables <= 7; syllables++) {
      for (let index = 0; index < 16; index++) {
        const word = generate({ seed: `syllable-${index}`, syllables, morphology });
        assert.equal(word.syllables.length, syllables, JSON.stringify({ index, syllables, morphology }));
        assert.ok(word.written.clean.length > 0);
        assert.ok(word.pronunciation.length > 0);
      }
    }
  }
});

test('seed and generation controls affect output', () => {
  const baseline = generate({ seed: 'unglish' });
  for (const options of [
    { seed: 'another-seed' },
    { seed: 'unglish', mode: 'text' },
    { seed: 'unglish', morphology: false },
    { seed: 'unglish', syllables: 7 },
  ]) assert.notDeepEqual(generate(options), baseline);
});

test('invalid options are rejected at the adapter boundary', () => {
  for (const seed of ['', 1, null, 'x'.repeat(129), '👂'.repeat(129)]) {
    assert.throws(() => generate({ seed }), RangeError);
  }
  assert.doesNotThrow(() => generate({ seed: '👂'.repeat(128) }));
  for (const syllables of [0, 8, -1, 2.5, NaN, Infinity, '2', null]) {
    assert.throws(() => generate({ seed: 'seed', syllables }), RangeError);
  }
  assert.throws(() => generate({ seed: 'seed', morphology: 'false' }), TypeError);
  assert.throws(() => generate({ seed: 'seed', mode: 'dictionary' }), RangeError);
});

test('the version registry resolves the default and the immutable module', async () => {
  assert.equal(DEFAULT_ENGINE_ID, ENGINE_ID);
  assert.equal(ENGINES.get(ENGINE_ID).generate, generate);
  assert.equal(ENGINES.has('unknown-future-version'), false);
  const archived = await import(new URL('engine.mjs', snapshot));
  assert.equal(archived.ENGINE_ID, ENGINE_ID);
  assert.deepEqual(archived.generate({ seed: 'archive' }), generate({ seed: 'archive' }));
});

test('snapshot archive matches its recorded hashes and contains its original license and sources', async () => {
  const provenance = JSON.parse(await readFile(new URL('provenance.json', snapshot), 'utf8'));
  assert.equal(provenance.engineId, ENGINE_ID);
  assert.equal(provenance.revision, 'fd5ded6dc245054a85ca353887b94b503d234e6c');
  assert.deepEqual(provenance.sourceChanges, []);
  assert.ok(provenance.files['source/src/index.ts']);
  assert.ok(provenance.files['recipe.mjs']);
  assert.match(await readFile(new URL('LICENSE', snapshot), 'utf8'), /MIT License/);
  for (const [path, entry] of Object.entries(provenance.files)) {
    const contents = await readFile(new URL(path, snapshot));
    assert.equal(contents.length, entry.bytes, path);
    assert.equal(createHash('sha256').update(contents).digest('hex'), entry.sha256, path);
  }
  const archivedPaths = (await readdir(snapshot, { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile()).length;
  assert.equal(archivedPaths, Object.keys(provenance.files).length + 1);
});

test('every browser module import is a local, complete JavaScript URL', async () => {
  const visited = new Set();
  async function visit(url) {
    if (visited.has(url.href)) return;
    visited.add(url.href);
    const source = await readFile(url, 'utf8');
    for (const [, specifier] of source.matchAll(/^(?:import|export\s+(?:\*|\{))[^;]*?\bfrom\s+["']([^"']+)["']/gm)) {
      assert.match(specifier, /^\.{1,2}\/.+\.js$/, `${url}: ${specifier}`);
      const next = new URL(specifier, url);
      assert.ok(next.href.startsWith(snapshot.href), `Import escapes snapshot: ${next}`);
      await visit(next);
    }
  }
  await visit(new URL('engine.mjs', snapshot));
  assert.ok(visited.size > 1);
});
