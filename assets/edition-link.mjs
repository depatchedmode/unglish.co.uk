import { artifact } from './editions/a/engine.mjs';

export function freshEdition() {
  const hash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
  return { hash, tokenId: '1', curated: false };
}

export function readEditionLink(search) {
  const params = new URLSearchParams(search);
  const fields = ['v', 'e', 'h', 'tid', 'ic'];
  if (!fields.some(field => params.has(field))) return null;
  if (!params.has('v') && !params.has('e')) {
    if (['h', 'tid', 'ic'].some(field => params.getAll(field).length > 1)) throw new Error('This preview link has repeated generation inputs. Use the original link or start a new preview.');
    const hash = params.get('h');
    const curated = params.get('ic') === '1';
    const tokenId = params.get('tid') || (curated ? '1' : '');
    if (hash && hash.length <= 256 && tokenId && tokenId.length <= 128) return { hash, tokenId, curated };
    throw new Error('This older preview link does not record enough information to recover its word. Start a new preview to create a complete word link.');
  }
  if (fields.some(field => params.getAll(field).length !== 1)) throw new Error('This edition link is incomplete or has repeated settings. Start a new preview, or use the complete word link.');
  if (params.get('v') !== '1' || params.get('e') !== artifact.id) throw new Error('This link names an edition snapshot that is not available here.');
  const hash = params.get('h');
  const tokenId = params.get('tid');
  if (!hash || hash.length > 256 || !tokenId || tokenId.length > 128 || !['0', '1'].includes(params.get('ic'))) {
    throw new Error('This edition link contains invalid generation inputs. Start a new preview to continue.');
  }
  return { hash, tokenId, curated: params.get('ic') === '1' };
}

export function editionURL(base, state) {
  const url = new URL(base);
  url.search = new URLSearchParams({ v: '1', e: artifact.id, h: state.hash, tid: state.tokenId, ic: state.curated ? '1' : '0' }).toString();
  url.hash = '';
  return url;
}
