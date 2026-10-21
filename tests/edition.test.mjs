import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { artifact, generateEdition } from '../assets/editions/a/engine.mjs';

const archive = await readFile(new URL('../assets/editions/a/original.html', import.meta.url));
const originalScripts = [...archive.toString('utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map(match => new vm.Script(match[1]));

// This test-only DOM records what the unchanged artwork renders and publishes.
// Production generation does not import the archive, use a VM, or emulate a DOM.
function runOriginal({ hash, tokenId, curated = false }) {
  let originalWord;
  let renderedHTML;
  const classes = new Set();
  const root = { style: { cssText: '' } };
  const container = {
    classList: { add: name => classes.add(name) },
    prepend: element => { renderedHTML = element.innerHTML; },
  };
  const query = new URLSearchParams({
    h: hash, tid: tokenId, ic: curated ? '1' : '0', a: '0x0', c: '1',
    s: '100', ms: '1', mi: '1', bh: '0x0', bn: '1', wa: '0x0',
    t: '1700000000', gp: '1', gu: '1',
  });
  const context = vm.createContext({
    URLSearchParams,
    location: { search: `?${query}` },
    console: {
      info: (...args) => {
        const candidate = args.find(value => value && typeof value === 'object' && value.written && value.analysis);
        if (candidate) originalWord = candidate;
      },
    },
    document: {
      documentElement: root,
      getElementsByClassName: name => name === 'container' ? [container] : [],
      createElement: () => ({ innerHTML: '' }),
      addEventListener: () => {},
    },
    getComputedStyle: () => ({
      getPropertyValue: property => property === '--border-style' ? root.style.cssText.split(':')[1].trim() : '',
    }),
  });
  context.window = context;
  for (const script of originalScripts) script.runInContext(context, { timeout: 1000 });
  assert.ok(originalWord, 'The original script must expose its generated word in its original console output.');
  assert.ok(renderedHTML, 'The original script must render its specimen.');
  const melody = [...renderedHTML.matchAll(/class="note" style="height: ([\d.]+)vh; flex-grow: ([\d.]+) "/g)]
    .map(match => ({ pitch: Number(match[1]), rate: Number(match[2]) }));
  return JSON.parse(JSON.stringify({
    word: originalWord.written.clean,
    pronunciation: originalWord.pronunciation,
    written: originalWord.written,
    syllables: originalWord.syllables,
    analysis: originalWord.analysis,
    melody,
    noteCount: melody.length,
    common: classes.has('common-english'),
    pleasantness: classes.has('most-vulgar'),
    border: context.$hl.token.traits.border,
    traits: context.$hl.token.traits,
  }));
}

test('the complete historical artifact remains byte-identical', () => {
  assert.equal(createHash('sha256').update(archive).digest('hex'), artifact.sourceSHA256);
  assert.equal(artifact.sourceSHA256, '6f0d391d5be73349b08559baee80af4d0c7a10ca500033ee2ec5a20fa43c699f');
});

const fixtures = [
  [0, 'durerk'],
  [1, 'strur'],
  [2, 'bask'],
  [4, 'fill'],
  [5, 'gouthgreerw'],
  [7, 'plitche'],
  [9, 'whem'],
  [36, 'thounkear'],
  [47, 'dreermfraityain'],
];

for (const [seed, expectedWord] of fixtures) {
  test(`edition a reproduces archived specimen ${seed}: ${expectedWord}`, () => {
    const input = { hash: `0x${seed.toString(16).padStart(64, '0')}`, tokenId: '0' };
    const original = runOriginal(input);
    assert.equal(original.word, expectedWord);
    assert.deepEqual(generateEdition(input), original);
  });
}

test('exact token strings and curated inputs reproduce the original seeding semantics', () => {
  const hash = `0x${'1234567890abcdef'.repeat(4)}`;
  const samples = [
    { hash, tokenId: '42' },
    { hash, tokenId: '042' },
    { hash: hash.toUpperCase(), tokenId: '42' },
    { hash, tokenId: '42', curated: true },
    { hash, tokenId: '042', curated: true },
  ];
  for (const input of samples) assert.deepEqual(generateEdition(input), runOriginal(input));
  assert.notDeepEqual(generateEdition(samples[0]), generateEdition(samples[1]));
  assert.deepEqual(generateEdition(samples[3]), generateEdition(samples[4]));
});

test('generating another specimen does not change a reproducible specimen', () => {
  const input = { hash: `0x${'f'.repeat(64)}`, tokenId: '1' };
  const first = generateEdition(input);
  generateEdition({ hash: `0x${'a'.repeat(64)}`, tokenId: '999' });
  assert.deepEqual(generateEdition(input), first);
});

test('omitted or coerced seed inputs are rejected rather than producing an irreproducible word', () => {
  assert.throws(() => generateEdition({ hash: 'seed', tokenId: 0 }), TypeError);
  assert.throws(() => generateEdition({ hash: '', tokenId: '0' }), TypeError);
  assert.throws(() => generateEdition({ hash: 'seed', tokenId: '' }), TypeError);
  assert.throws(() => generateEdition({ hash: 'seed', tokenId: '0', curated: '1' }), TypeError);
});
