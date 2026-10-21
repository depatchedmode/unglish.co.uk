import { readWordLink, wordURL, randomSeed } from './word-link.mjs';
import { attachSpeech } from './speech.mjs';

const root = document.querySelector('[data-discovery]');
const word = root.querySelector('[data-word]');
const pronunciation = root.querySelector('[data-pronunciation]');
const message = root.querySelector('[data-generation-status]');
const another = root.querySelector('[data-another]');
const permalink = root.querySelector('[data-permalink]');
const recovery = root.querySelector('[data-recovery]');
const form = document.querySelector('[data-generator-form]');
let state;
let speech;
let specimen;

try {
  const { DEFAULT_ENGINE_ID, ENGINES } = await import('./engines/registry.mjs');
  function render(next, historyMode) {
    const generated = ENGINES.get(next.engine).generate(next);
    state = next;
    specimen = { word: generated.written.clean };
    speech?.stop();
    word.textContent = specimen.word;
    pronunciation.textContent = `/${generated.pronunciation}/`;
    const url = wordURL(location.href, state);
    if (historyMode) {
      const address = new URL(url);
      if (historyMode === 'replaceState') address.hash = location.hash;
      history[historyMode](null, '', address);
    }
    permalink.href = url.href;
    permalink.hidden = false;
    root.querySelector('[data-copy]').disabled = false;
    another.disabled = false;
    recovery.hidden = true;
    message.textContent = '';
    const experiment = root.querySelector('[data-experiment]');
    if (experiment) experiment.href = wordURL(new URL('generator.html', location.href), state).href;
    if (form) {
      form.elements.seed.value = state.seed;
      form.elements.syllables.value = state.syllables ?? 'auto';
      form.elements.morphology.checked = state.morphology;
      form.elements.mode.value = state.mode;
      form.querySelector('[data-settings]').disabled = false;
      document.querySelector('[data-engine-label]').textContent = ENGINES.get(state.engine).label;
    }
    document.title = `${specimen.word} — Unglish${form ? ' generator' : ''}`;
    speech ??= attachSpeech(root, () => specimen);
  }
  function restore(historyMode) {
    try {
      const saved = readWordLink(location.search, ENGINES);
      render(saved ?? { engine: DEFAULT_ENGINE_ID, seed: randomSeed(), morphology: true, mode: 'lexicon' }, historyMode);
    } catch (error) {
      specimen = undefined;
      speech?.stop();
      word.textContent = 'Word unavailable';
      pronunciation.textContent = '';
      message.textContent = error.message;
      recovery.hidden = false;
      permalink.hidden = true;
      another.disabled = true;
      root.querySelector('[data-copy]').disabled = true;
      root.querySelector('[data-listen]').disabled = true;
      if (form) form.querySelector('[data-settings]').disabled = true;
    }
  }
  restore('replaceState');
  window.addEventListener('popstate', () => restore());
  another.addEventListener('click', () => render({ ...state, seed: randomSeed() }, 'pushState'));
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const seed = form.elements.seed.value || randomSeed();
    if ([...seed].length > 128) {
      message.textContent = 'Use a seed of at most 128 characters.';
      form.elements.seed.focus();
      return;
    }
    try {
      render({ engine: state.engine, seed,
        syllables: form.elements.syllables.value === 'auto' ? undefined : Number(form.elements.syllables.value),
        morphology: form.elements.morphology.checked, mode: form.elements.mode.value,
      }, 'pushState');
    } catch {
      message.textContent = 'This combination could not generate a word. Try another seed or choose automatic syllables.';
    }
  });
} catch {
  word.textContent = 'Word unavailable';
  message.textContent = 'The generator could not load. Reload the page to try again.';
  recovery.hidden = false;
}
root.querySelector('[data-copy]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(permalink.href);
    message.textContent = 'Word link copied.';
  } catch {
    message.textContent = 'Use “Link to this word” to open or copy the address.';
    permalink.focus();
  }
});
