// Archives the minted Unglish a artwork and every minted token's original render inputs.
// Run once per refresh: node scripts/snapshot-mints.mjs
// The website reads only the files this writes; it never contacts a chain, Highlight or Arweave.
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const directory = new URL('../assets/editions/a/minted/', import.meta.url);
const CHAINS = [
  { dialect: 'arbiglish', chain: 'Arbitrum', chainId: 42161, rpc: 'https://arb1.arbitrum.io/rpc', contract: '0x082daac1b2c74197d50341cbbeb9da7fc4a59930' },
  { dialect: 'baglish', chain: 'Base', chainId: 8453, rpc: 'https://mainnet.base.org', contract: '0x5cdcb4d420c4bc244910b50a9874b2eb12890969' },
  { dialect: 'optiglish', chain: 'Optimism', chainId: 10, rpc: 'https://mainnet.optimism.io', contract: '0x35f93761726c142d759053adf9d4eecf6a0f7429' },
  { dialect: 'zorglish', chain: 'Zora', chainId: 7777777, rpc: 'https://rpc.zora.energy', contract: '0xa62fb8b864e14b53e47bee2c612f4408512d3858' },
];
const FILES = ['index.html', 'style.css', 'bundle.js'];

async function retry(task, attempts = 4) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise(resolve => setTimeout(resolve, 750 * attempt));
    }
  }
}

async function ethCall({ rpc, contract }, data) {
  return retry(async () => {
    const response = await fetch(rpc, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: contract, data }, 'latest'] }),
      signal: AbortSignal.timeout(20000),
    });
    const { result, error } = await response.json();
    if (error) throw new Error(`${rpc}: ${error.message}`);
    return Buffer.from(result.slice(2), 'hex');
  });
}

const word = value => value.toString(16).padStart(64, '0');
const decodeString = bytes => bytes.subarray(64, 64 + Number(bytes.readBigUInt64BE(56))).toString('utf8');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

async function fetchBytes(url) {
  return retry(async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  });
}

const collections = [];
const bundles = new Map();
for (const collection of CHAINS) {
  const supply = Number((await ethCall(collection, '0x18160ddd')).readBigUInt64BE(24));
  const tokens = [];
  for (let tokenId = 1; tokenId <= supply; tokenId += 1) {
    const tokenURI = decodeString(await ethCall(collection, `0xc87b56dd${word(tokenId)}`));
    const metadata = JSON.parse((await fetchBytes(tokenURI)).toString('utf8'));
    const render = new URL(metadata.animation_url);
    if (render.searchParams.get('tid') !== String(tokenId)) throw new Error(`${collection.dialect} #${tokenId}: metadata names token ${render.searchParams.get('tid')}.`);
    if (Number(render.searchParams.get('c')) !== collection.chainId) throw new Error(`${collection.dialect} #${tokenId}: metadata names chain ${render.searchParams.get('c')}.`);
    const manifest = render.pathname.split('/')[1];
    if (!bundles.has(manifest)) {
      const files = {};
      for (const file of FILES) files[file] = await fetchBytes(`https://arweave.net/${manifest}/${file}`);
      bundles.set(manifest, files);
    }
    tokens.push({
      tokenId,
      arweave: manifest,
      query: render.search.replace(/^\?&?/, ''),
      traits: Object.fromEntries(metadata.attributes.map(({ trait_type, value }) => [trait_type, value])),
    });
    process.stdout.write(`\r${collection.dialect} ${tokenId}/${supply}`);
  }
  process.stdout.write('\n');
  const { rpc, ...recorded } = collection;
  collections.push({ ...recorded, supply, tokens });
}

const [reference, ...others] = [...bundles.values()];
for (const files of others) {
  for (const file of FILES) {
    if (!files[file].equals(reference[file])) throw new Error(`Arweave copies of ${file} differ; archive each bundle separately.`);
  }
}

await mkdir(directory, { recursive: true });
for (const file of FILES) await writeFile(new URL(file, directory), reference[file]);
const archive = {
  checked: new Date().toISOString().slice(0, 10),
  files: Object.fromEntries(FILES.map(file => [file, sha256(reference[file])])),
  arweave: [...bundles.keys()],
  collections,
};
await writeFile(new URL('mints.json', directory), `${JSON.stringify(archive, null, 1)}\n`);
console.log(`Archived ${collections.reduce((sum, { supply }) => sum + supply, 0)} mints from ${bundles.size} identical Arweave bundles.`);
