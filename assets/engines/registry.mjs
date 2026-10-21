import { ENGINE_ID, generate } from './u-fd5ded6d-v1/engine.mjs';

export const DEFAULT_ENGINE_ID = ENGINE_ID;

// Add new versions here. Keep old entries and snapshots so shared words survive upgrades.
export const ENGINES = new Map([
  [ENGINE_ID, { generate, label: 'Unglish u · 0.6.0' }],
]);
