const fields = ['v', 'e', 'seed', 'n', 'm', 'mode'];

export function randomSeed() {
  return Array.from(crypto.getRandomValues(new Uint32Array(2)), n => n.toString(16).padStart(8, '0')).join('');
}

export function readWordLink(search, engines) {
  const params = new URLSearchParams(search);
  if (!fields.some(field => params.has(field))) return null;
  if (fields.some(field => params.getAll(field).length !== 1)) {
    throw new Error('This word link is incomplete or has repeated settings. Use the complete link, or start a new word.');
  }
  if (params.get('v') !== '1') throw new Error('This word link uses an unsupported link format. Start a new word to continue.');
  const engine = params.get('e');
  if (!engines.has(engine)) throw new Error('The generator saved in this link is not available here. Start a new word to continue.');
  const seed = params.get('seed');
  if ([...seed].length < 1 || [...seed].length > 128) throw new Error('A seed must contain between 1 and 128 characters.');
  const count = params.get('n');
  if (!/^(auto|[1-7])$/.test(count)) throw new Error('The syllable setting in this link is invalid. Choose automatic or 1–7 syllables.');
  const morphology = params.get('m');
  if (!['0', '1'].includes(morphology)) throw new Error('The affix setting in this word link is invalid.');
  const mode = params.get('mode');
  if (!['lexicon', 'text'].includes(mode)) throw new Error('The generation mode in this word link is invalid.');
  return { engine, seed, syllables: count === 'auto' ? undefined : Number(count), morphology: morphology === '1', mode };
}

export function wordURL(base, state) {
  const url = new URL(base);
  url.search = new URLSearchParams({
    v: '1', e: state.engine, seed: state.seed,
    n: state.syllables === undefined ? 'auto' : String(state.syllables),
    m: state.morphology ? '1' : '0', mode: state.mode,
  }).toString();
  url.hash = '';
  return url;
}
