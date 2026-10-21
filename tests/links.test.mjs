import test from 'node:test';
import assert from 'node:assert/strict';
import { readWordLink, wordURL } from '../assets/word-link.mjs';
import { readEditionLink, editionURL } from '../assets/edition-link.mjs';
import { ENGINES } from '../assets/engines/registry.mjs';
import { ENGINE_ID, generate } from '../assets/engines/u-fd5ded6d-v1/engine.mjs';
import { artifact, generateEdition } from '../assets/editions/a/engine.mjs';

const wordBase = 'https://unglish.co.uk/generator.html?old=discard#settings';
const editionBase = 'https://unglish.co.uk/iterations/a-preview.html?old=discard#preview';
const wordState = { engine: ENGINE_ID, seed: 'unglish', syllables: undefined, morphology: true, mode: 'lexicon' };
const editionState = { hash: `0x${'1234567890abcdef'.repeat(4)}`, tokenId: '042', curated: false };

test('a shared word reproduces the complete engine result for every generation choice', () => {
  for (const syllables of [undefined, 1, 2, 3, 4, 5, 6, 7]) {
    for (const morphology of [true, false]) {
      for (const mode of ['lexicon', 'text']) {
        const state = { ...wordState, syllables, morphology, mode };
        const expected = generate(state);
        const link = wordURL(wordBase, state);
        const restored = readWordLink(link.search, ENGINES);
        assert.deepEqual(restored, state);
        assert.deepEqual(ENGINES.get(restored.engine).generate(restored), expected);
        assert.equal(link.origin, 'https://unglish.co.uk');
        assert.equal(link.pathname, '/generator.html');
        assert.equal(link.hash, '');
        assert.equal(link.searchParams.has('old'), false);
      }
    }
  }
});

test('word links preserve Unicode, whitespace and URL punctuation exactly', () => {
  for (const seed of [
    '👂', '👂'.repeat(128), 'é', 'e\u0301', '  English &?=+#/% words  ',
    '日本語', 'line\nnext\tword', '\u0000',
  ]) {
    const state = { ...wordState, seed };
    const restored = readWordLink(wordURL(wordBase, state).search, ENGINES);
    assert.equal(restored.seed, seed);
    assert.deepEqual(generate(restored), generate(state));
  }
  assert.notDeepEqual(generate({ seed: 'é' }), generate({ seed: 'e\u0301' }));
});

test('an old shared word selects its immutable engine when a newer default is available', () => {
  const state = { ...wordState, seed: 'archive me', syllables: 4, morphology: false, mode: 'text' };
  const expected = generate(state);
  const saved = wordURL(wordBase, state);
  const futureDefault = 'u-future-v1';
  const upgradedRegistry = new Map([
    [futureDefault, { generate: () => { throw new Error('The new engine must not generate an archived word.'); } }],
    ...ENGINES,
  ]);
  const restored = readWordLink(saved.search, upgradedRegistry);
  assert.equal(restored.engine, 'u-fd5ded6d-v1');
  assert.notEqual(restored.engine, futureDefault);
  assert.equal(upgradedRegistry.get(restored.engine).generate, generate);
  assert.deepEqual(upgradedRegistry.get(restored.engine).generate(restored), expected);
});

test('missing or repeated word settings are rejected instead of silently changing a shared word', () => {
  const complete = wordURL(wordBase, wordState).searchParams;
  for (const field of ['v', 'e', 'seed', 'n', 'm', 'mode']) {
    const missing = new URLSearchParams(complete);
    missing.delete(field);
    assert.throws(() => readWordLink(missing, ENGINES), Error, `Missing ${field}`);
    for (const value of [complete.get(field), 'different']) {
      const repeated = new URLSearchParams(complete);
      repeated.append(field, value);
      assert.throws(() => readWordLink(repeated, ENGINES), Error, `Repeated ${field}`);
    }
  }
});

test('unknown word formats, engines and invalid settings cannot resolve to a different specimen', () => {
  const invalid = {
    v: ['', '0', '2', '01'],
    e: ['', 'current', 'future-version', '__proto__', 'constructor', 'toString', 'hasOwnProperty'],
    seed: ['', 'x'.repeat(129), '👂'.repeat(129)],
    n: ['', '0', '8', '-1', '2.5', '01', '1e0', 'NaN', 'Infinity', 'AUTO', ' 2'],
    m: ['', 'true', 'false', '2', '00'],
    mode: ['', 'dictionary', 'LEXICON', 'text '],
  };
  for (const [field, values] of Object.entries(invalid)) {
    for (const value of values) {
      const params = wordURL(wordBase, wordState).searchParams;
      params.set(field, value);
      assert.throws(() => readWordLink(params, ENGINES), Error, `${field}=${JSON.stringify(value)}`);
    }
  }
});

test('ordinary page URLs are distinguished from incomplete word links', () => {
  assert.equal(readWordLink('', ENGINES), null);
  assert.equal(readWordLink('?utm_source=example', ENGINES), null);
  assert.throws(() => readWordLink('?seed=unglish', ENGINES));
});

test('edition links preserve exact historical inputs and the complete generated word and melody', () => {
  for (const state of [
    editionState,
    { ...editionState, tokenId: '42' },
    { ...editionState, hash: editionState.hash.toUpperCase() },
    { ...editionState, curated: true },
    { hash: 'a hash &?=+#/% é👂', tokenId: ' 0042 &?=+#/% ', curated: false },
    { hash: 'h'.repeat(256), tokenId: '0'.repeat(128), curated: true },
  ]) {
    const expected = generateEdition(state);
    const link = editionURL(editionBase, state);
    const restored = readEditionLink(link.search);
    assert.deepEqual(restored, state);
    assert.deepEqual(generateEdition(restored), expected);
    assert.equal(link.origin, 'https://unglish.co.uk');
    assert.equal(link.pathname, '/iterations/a-preview.html');
    assert.equal(link.searchParams.get('v'), '1');
    assert.equal(link.searchParams.get('e'), artifact.id);
    assert.equal(link.hash, '');
    assert.equal(link.searchParams.has('old'), false);
  }
});

test('incomplete or repeated edition settings are rejected without substituting a fresh preview', () => {
  const complete = editionURL(editionBase, editionState).searchParams;
  for (const field of ['v', 'e', 'h', 'tid', 'ic']) {
    const missing = new URLSearchParams(complete);
    missing.delete(field);
    assert.throws(() => readEditionLink(missing), Error, `Missing ${field}`);
    for (const value of [complete.get(field), 'different']) {
      const repeated = new URLSearchParams(complete);
      repeated.append(field, value);
      assert.throws(() => readEditionLink(repeated), Error, `Repeated ${field}`);
    }
  }
});

test('invalid or unknown edition inputs cannot open a different historical specimen', () => {
  const invalid = {
    v: ['', '0', '2', '01'],
    e: ['', 'a', 'future-edition', '__proto__', 'constructor', 'toString'],
    h: ['', 'x'.repeat(257)],
    tid: ['', '1'.repeat(129)],
    ic: ['', 'true', 'false', '2', '00'],
  };
  for (const [field, values] of Object.entries(invalid)) {
    for (const value of values) {
      const params = editionURL(editionBase, editionState).searchParams;
      params.set(field, value);
      assert.throws(() => readEditionLink(params), Error, `${field}=${JSON.stringify(value)}`);
    }
  }
  assert.equal(readEditionLink(''), null);
  assert.equal(readEditionLink('?utm_source=example'), null);
  assert.throws(() => readEditionLink('?h=hash'));
});

test('old Highlight preview links retain historical inputs when upgraded to complete edition links', () => {
  for (const [inputs, expected] of [
    [{ h: editionState.hash, tid: '042', ic: '0' }, editionState],
    [{ h: editionState.hash, tid: '0' }, { ...editionState, tokenId: '0' }],
    [{ h: editionState.hash, tid: '042', ic: '1' }, { ...editionState, curated: true }],
    [{ h: editionState.hash, ic: '1' }, { ...editionState, tokenId: '1', curated: true }],
  ]) {
    const legacy = new URLSearchParams({ ...inputs, a: '0x0', c: '8453', t: '1700000000' });
    const restored = readEditionLink(legacy);
    assert.deepEqual(restored, expected);
    const canonical = editionURL(editionBase, restored);
    assert.deepEqual(readEditionLink(canonical.search), expected);
    assert.deepEqual(generateEdition(readEditionLink(canonical.search)), generateEdition(expected));
    assert.equal(canonical.searchParams.get('v'), '1');
    assert.equal(canonical.searchParams.get('e'), artifact.id);
  }
});

test('ambiguous and insufficient old preview links do not silently generate a replacement', () => {
  for (const search of ['?h=hash', '?tid=42', '?ic=1', '?h=&tid=42', '?h=hash&tid=', '?h=hash&ic=0']) {
    assert.throws(() => readEditionLink(search), Error, search);
  }
  for (const field of ['h', 'tid', 'ic']) {
    const repeated = new URLSearchParams({ h: editionState.hash, tid: '042', ic: '0' });
    repeated.append(field, repeated.get(field));
    assert.throws(() => readEditionLink(repeated), Error, `Repeated legacy ${field}`);
  }
});
