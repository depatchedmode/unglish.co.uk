import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { generateEdition } from '../assets/editions/a/engine.mjs';

const directory = new URL('../assets/editions/a/minted/', import.meta.url);
const archive = JSON.parse(await readFile(new URL('mints.json', directory), 'utf8'));
const files = Object.fromEntries(await Promise.all(Object.keys(archive.files).map(async file => [file, await readFile(new URL(file, directory))])));
const helper = new vm.Script(files['index.html'].toString('utf8').match(/<script id="fxhash-snippet">([\s\S]*?)<\/script>/)[1]);
const bundle = new vm.Script(files['bundle.js'].toString('utf8'));

// A test-only DOM: just enough for the unchanged minted bundle to generate and publish its word and traits.
function runMinted(query) {
  let word;
  const root = { style: { cssText: '' } };
  const element = () => ({ innerHTML: '', classList: { add() {} }, prepend() {}, addEventListener() {}, style: {} });
  const context = vm.createContext({
    URLSearchParams,
    location: { search: `?${query}` },
    console: { info: (...args) => { word ??= args.find(value => value?.written && value?.analysis); }, log() {} },
    document: {
      documentElement: root,
      getElementsByClassName: () => [element()],
      querySelector: element,
      querySelectorAll: () => [],
      createElement: element,
      addEventListener() {},
    },
    getComputedStyle: () => ({ getPropertyValue: property => property === '--border-style' ? root.style.cssText.split(':')[1].trim() : '' }),
    addEventListener() {},
    dispatchEvent() {},
    Event: class {},
    setTimeout() {},
  });
  context.window = context;
  helper.runInContext(context, { timeout: 1000 });
  bundle.runInContext(context, { timeout: 1000 });
  return { word: word?.written.clean, traits: JSON.parse(JSON.stringify(context.$hl.token.traits)) };
}

test('the minted bundle is archived byte for byte', () => {
  for (const [file, digest] of Object.entries(archive.files)) {
    assert.equal(createHash('sha256').update(files[file]).digest('hex'), digest, file);
  }
});

test('every minted token regenerates the traits recorded on-chain', () => {
  let count = 0;
  for (const { dialect, chainId, supply, tokens } of archive.collections) {
    assert.equal(tokens.length, supply, dialect);
    for (const { tokenId, query, traits } of tokens) {
      const params = new URLSearchParams(query);
      assert.equal(params.get('tid'), String(tokenId));
      assert.equal(params.get('c'), String(chainId));
      const minted = runMinted(query);
      assert.deepEqual(minted.traits, traits, `${dialect} #${tokenId}`);
      assert.equal(generateEdition({ hash: params.get('h'), tokenId: params.get('tid') }).word, minted.word, `${dialect} #${tokenId}`);
      count += 1;
    }
  }
  assert.equal(count, 154);
});
