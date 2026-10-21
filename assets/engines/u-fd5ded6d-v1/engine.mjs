import { generateWord } from './js/index.js';

export const ENGINE_ID = "u-fd5ded6d-v1";

// Version 1 hashes the exact UTF-16 code units with FNV-1a (32 bit).
// Keep this mapping and its defaults fixed: existing links depend on them.
function numericSeed(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index++) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

export function generate({ seed, syllables, morphology = true, mode = 'lexicon' }) {
  if (typeof seed !== 'string' || [...seed].length < 1 || [...seed].length > 128) {
    throw new RangeError('The seed must contain 1–128 characters.');
  }
  if (syllables !== undefined && (!Number.isInteger(syllables) || syllables < 1 || syllables > 7)) {
    throw new RangeError('The syllable count must be an integer from 1 to 7.');
  }
  if (typeof morphology !== 'boolean') throw new TypeError('Morphology must be a boolean.');
  if (mode !== 'lexicon' && mode !== 'text') throw new RangeError('Unknown generation mode.');
  return generateWord({ seed: numericSeed(seed), syllableCount: syllables, morphology, mode });
}
