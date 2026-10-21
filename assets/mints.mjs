// Shows each minted Unglish a token in the archived minted artwork, with its original on-chain render inputs.
import { generateEdition } from './editions/a/engine.mjs';

const root = document.querySelector('[data-mints]');
const form = root.querySelector('[data-mint-controls]');
const frame = root.querySelector('[data-mint-frame]');
const status = root.querySelector('[data-mint-status]');
const facts = root.querySelector('[data-mint-facts]');
const permalink = root.querySelector('[data-mint-link]');
const arweave = root.querySelector('[data-mint-arweave]');
const artwork = new URL('editions/a/minted/index.html', import.meta.url);
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

try {
  const response = await fetch(new URL('editions/a/minted/mints.json', import.meta.url));
  if (!response.ok) throw new Error(response.statusText);
  const { collections } = await response.json();
  for (const collection of collections) {
    for (const token of collection.tokens) {
      const params = new URLSearchParams(token.query);
      token.word = generateEdition({ hash: params.get('h'), tokenId: params.get('tid') }).word;
      token.minted = new Date(Number(params.get('t')) * 1000);
      token.block = params.get('bn');
    }
  }
  const byDialect = new Map(collections.map(collection => [collection.dialect, collection]));

  form.elements.dialect.replaceChildren(...collections.map(({ dialect, chain, supply }) => new Option(`${dialect} a — ${chain} (${supply})`, dialect)));

  function fillTokens(collection) {
    form.elements.token.replaceChildren(...collection.tokens.map(({ tokenId, word }) => new Option(`#${tokenId} — ${word}`, tokenId)));
  }

  function show(dialect, tokenId, { updateAddress = true } = {}) {
    const collection = byDialect.get(dialect);
    const token = collection.tokens.find(candidate => candidate.tokenId === tokenId);
    if (form.elements.dialect.value !== dialect || form.elements.token.options.length !== collection.tokens.length) {
      form.elements.dialect.value = dialect;
      fillTokens(collection);
    }
    form.elements.token.value = String(tokenId);
    frame.src = `${artwork.href}?${token.query}`;
    frame.title = `${dialect} a #${tokenId}, “${token.word}”, in the minted artwork`;
    status.textContent = `${dialect} a #${tokenId} of ${collection.supply}: “${token.word}”.`;
    const { traits } = token;
    facts.replaceChildren(...[
      ['Chain', `${collection.chain}, block ${Number(token.block).toLocaleString('en-GB')}`],
      ['Minted', dateFormat.format(token.minted)],
      ['Syllables', traits.syllables],
      ['Complexity', traits.complexity],
      ['Sonority', traits.sonority],
      ['Melody', `${traits.melodyLength} notes`],
      ['Border', traits.border],
      ['Pleasantness', Number(traits.pleasantness).toFixed(3)],
    ].flatMap(([term, value]) => [Object.assign(document.createElement('dt'), { textContent: term }), Object.assign(document.createElement('dd'), { textContent: value })]));
    const address = new URL(location.href);
    address.search = new URLSearchParams({ dialect, token: tokenId }).toString();
    address.hash = '';
    if (updateAddress) history.replaceState(null, '', address);
    permalink.href = address.href;
    arweave.href = `https://arweave.net/${token.arweave}/index.html?${token.query}`;
  }

  function step(offset) {
    const collection = byDialect.get(form.elements.dialect.value);
    const index = collection.tokens.findIndex(token => token.tokenId === Number(form.elements.token.value));
    const next = collection.tokens[(index + offset + collection.tokens.length) % collection.tokens.length];
    show(collection.dialect, next.tokenId);
  }

  function anyMint() {
    const everything = collections.flatMap(collection => collection.tokens.map(token => [collection.dialect, token.tokenId]));
    show(...everything[Math.floor(Math.random() * everything.length)]);
  }

  form.elements.dialect.addEventListener('change', () => show(form.elements.dialect.value, byDialect.get(form.elements.dialect.value).tokens[0].tokenId));
  form.elements.token.addEventListener('change', () => show(form.elements.dialect.value, Number(form.elements.token.value)));
  root.querySelector('[data-previous]').addEventListener('click', () => step(-1));
  root.querySelector('[data-next]').addEventListener('click', () => step(1));
  root.querySelector('[data-any]').addEventListener('click', anyMint);

  const requested = new URLSearchParams(location.search);
  const collection = byDialect.get(requested.get('dialect'));
  const tokenId = Number(requested.get('token'));
  if (collection?.tokens.some(token => token.tokenId === tokenId)) show(collection.dialect, tokenId, { updateAddress: false });
  else anyMint();
  form.querySelector('fieldset').disabled = false;
} catch {
  status.textContent = 'The minted words could not be loaded. Reload the page to try again.';
}
