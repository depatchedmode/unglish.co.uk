import { attachSpeech } from './speech.mjs';
import { freshEdition, readEditionLink, editionURL } from './edition-link.mjs';
import { generateEdition } from './editions/a/engine.mjs';

const root = document.querySelector('[data-edition]');
const word = root.querySelector('[data-word]');
const pronunciation = root.querySelector('[data-pronunciation]');
const status = root.querySelector('[data-generation-status]');
const permalink = root.querySelector('[data-permalink]');
const another = root.querySelector('[data-another]');
const copy = root.querySelector('[data-copy]');
const recovery = root.querySelector('[data-recovery]');
let specimen;
let speech;

function render(state, historyMode) {
  const generated = generateEdition(state);
  specimen = generated;
  speech?.stop();
  word.textContent = generated.word;
  pronunciation.textContent = `/${generated.pronunciation}/`;
  const url = editionURL(location.href, state);
  if (historyMode) {
    const address = new URL(url);
    if (historyMode === 'replaceState') address.hash = location.hash;
    history[historyMode](null, '', address);
  }
  permalink.href = url.href;
  permalink.hidden = false;
  another.disabled = false;
  copy.disabled = false;
  status.textContent = '';
  recovery.hidden = true;
  const melody = document.querySelector('[data-melody]');
  const common = document.querySelector('[data-common]');
  if (melody) melody.textContent = `${generated.noteCount} notes, 120 beats per minute`;
  if (common) common.textContent = generated.common ? 'Yes — found in the original list' : 'Not found in the original list';
  document.title = `${specimen.word} — Unglish a`;
  speech ??= attachSpeech(root, () => specimen);
}

function restore(historyMode) {
  try {
    render(readEditionLink(location.search) ?? freshEdition(), historyMode);
  } catch (error) {
    specimen = undefined;
    speech?.stop();
    word.textContent = 'Word unavailable';
    pronunciation.textContent = '';
    status.textContent = error.message;
    recovery.hidden = false;
    permalink.hidden = true;
    for (const button of root.querySelectorAll('button')) button.disabled = true;
  }
}

restore('replaceState');
window.addEventListener('popstate', () => restore());
another.addEventListener('click', () => render(freshEdition(), 'pushState'));
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(permalink.href);
    status.textContent = 'Word link copied.';
  } catch {
    status.textContent = 'Use “Link to this word” to open or copy the address.';
    permalink.focus();
  }
});
