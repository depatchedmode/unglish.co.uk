#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const recipeVersion = 1;
const compilerVersion = '4.9.5';
const compilerOptions = { target: 'ES2022', module: 'ES2022', removeComments: false };
const scriptPath = fileURLToPath(import.meta.url);
const siteRoot = resolve(dirname(scriptPath), '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const portablePath = path => path.split(sep).join('/');

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return filesIn(path);
    if (entry.isFile()) return [path];
    throw new Error(`Refusing to archive non-regular file: ${path}`);
  }));
  return nested.flat().sort();
}

function sourceDigest(files) {
  return sha256(json([...files].map(([path, contents]) => [path, sha256(contents)])));
}

function adapter(id) {
  return `import { generateWord } from './js/index.js';

export const ENGINE_ID = ${JSON.stringify(id)};

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
`;
}

async function loadCompiler(directory) {
  const ts = (await import(pathToFileURL(resolve(directory, 'lib/typescript.js')).href)).default;
  if (ts.version !== compilerVersion) {
    throw new Error(`This recipe requires TypeScript ${compilerVersion}; found ${ts.version}.`);
  }
  return ts;
}

function compile(ts, sources, id) {
  const outputs = new Map();
  for (const [path, contents] of sources) {
    if (!path.startsWith('src/') || !path.endsWith('.ts')) continue;
    const result = ts.transpileModule(contents.toString('utf8'), {
      fileName: path,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ES2022,
        removeComments: false,
      },
      reportDiagnostics: true,
    });
    const errors = result.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error) ?? [];
    if (errors.length) {
      throw new Error(`${path}: ${errors.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n')}`);
    }
    outputs.set(path.replace(/^src\//, 'js/').replace(/\.ts$/, '.js'), Buffer.from(result.outputText));
  }
  outputs.set('engine.mjs', Buffer.from(adapter(id)));
  outputs.set('package.json', Buffer.from(json({ type: 'module', private: true })));

  // Native browser modules cannot resolve bare or extensionless imports.
  for (const [path, contents] of outputs) {
    if (!/\.(?:mjs|js)$/.test(path)) continue;
    const module = ts.createSourceFile(path, contents.toString('utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    for (const statement of module.statements) {
      if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
      const specifier = statement.moduleSpecifier?.text;
      if (!specifier) continue;
      if (!specifier.startsWith('.') || !specifier.endsWith('.js')) {
        throw new Error(`Non-browser import in ${path}: ${specifier}`);
      }
      const target = portablePath(relative('/snapshot', resolve('/snapshot', dirname(path), specifier)));
      if (!outputs.has(target)) throw new Error(`Missing import in ${path}: ${specifier}`);
    }
  }
  return outputs;
}

async function checkFiles(directory, expected) {
  const actualNames = (await filesIn(directory)).map(path => portablePath(relative(directory, path)));
  const expectedNames = [...expected.keys()].sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    throw new Error(`File inventory differs in immutable snapshot ${directory}.`);
  }
  for (const [path, contents] of expected) {
    if (!contents.equals(await readFile(resolve(directory, path)))) {
      throw new Error(`Refusing to change immutable snapshot file ${path}. Use a new recipe version.`);
    }
  }
}

async function verify(directory, typescriptDirectory) {
  const provenance = JSON.parse(await readFile(resolve(directory, 'provenance.json'), 'utf8'));
  const sources = new Map();
  for (const path of Object.keys(provenance.files).filter(path => path.startsWith('source/')).sort()) {
    sources.set(path.slice('source/'.length), await readFile(resolve(directory, path)));
  }
  if (sourceDigest(sources) !== provenance.sourceDigest) throw new Error('Archived source digest mismatch.');
  const expected = compile(await loadCompiler(typescriptDirectory), sources, provenance.engineId);
  for (const [path, contents] of sources) expected.set(`source/${path}`, contents);
  expected.set('LICENSE', sources.get('LICENSE'));
  expected.set('recipe.mjs', await readFile(scriptPath));
  expected.set('README.md', Buffer.from(snapshotReadme(provenance.engineId)));
  for (const [path, contents] of expected) {
    if (sha256(contents) !== provenance.files[path]?.sha256) {
      throw new Error(`Rebuilt ${path} differs from the recorded snapshot.`);
    }
  }
  expected.set('provenance.json', Buffer.from(json(provenance)));
  await checkFiles(directory, expected);
  console.log(`Verified ${provenance.engineId}: archived source, compiled modules, adapter and file hashes match.`);
}

function snapshotReadme(id) {
  return `# ${id}

An immutable browser snapshot of @unglish/word-generator. Do not edit it in place:
old discovery links depend on the exact generation rules and seed mapping here.

\`engine.mjs\` exposes \`ENGINE_ID\` and \`generate({seed, syllables?, morphology?, mode?})\`.
Seeds contain 1–128 Unicode code points; their exact UTF-16 code units are hashed
with FNV-1a to the engine's 32-bit Mulberry32 seed. No Unicode normalization occurs.
Different strings can share a 32-bit hash. Defaults are morphology=true and mode=lexicon.
Syllables, when supplied, are the final word's requested count (1–7).

\`js/\` contains unbundled native ES2022 modules emitted by TypeScript ${compilerVersion}.
There are no third-party runtime imports. \`source/\` contains the original production
TypeScript and JSON data, package metadata, configuration, README and MIT license.
Tests, demo, evaluation tooling and third-party packages are outside this archive.
\`provenance.json\` records the revision, source state and each file's SHA-256 hash.
The precise snapshot recipe is archived as \`recipe.mjs\`.

To verify the archive without its original repository or any network access:

\`\`\`sh
node assets/engines/${id}/recipe.mjs --verify assets/engines/${id} --typescript /path/to/typescript
\`\`\`

Provide an existing TypeScript ${compilerVersion} installation. The compiler is a build
tool, not a website dependency. Rebuilding does not modify the archive.
`;
}

async function snapshot(sourceDirectory, typescriptDirectory) {
  const git = (...args) => execFileSync('git', ['-C', sourceDirectory, ...args], { encoding: 'utf8' }).trim();
  const sourcePaths = (await filesIn(resolve(sourceDirectory, 'src')))
    .map(path => portablePath(relative(sourceDirectory, path)))
    .filter(path => /\.(?:ts|json)$/.test(path) && !/\.(?:test|bench)\.ts$/.test(path));
  sourcePaths.push('LICENSE', 'README.md', 'package.json', 'tsconfig.json');
  sourcePaths.sort();
  const sources = new Map(await Promise.all(sourcePaths.map(async path => [path, await readFile(resolve(sourceDirectory, path))])));
  const packageMetadata = JSON.parse(sources.get('package.json').toString('utf8'));
  const revision = git('rev-parse', 'HEAD');
  const sourceChanges = git('status', '--short', '--untracked-files=all', '--', ...sourcePaths);
  const digest = sourceDigest(sources);
  const id = `${packageMetadata.IDGAFversion}-${revision.slice(0, 8)}-v${recipeVersion}${sourceChanges ? `-dirty-${digest.slice(0, 8)}` : ''}`;
  const outputs = compile(await loadCompiler(typescriptDirectory), sources, id);
  for (const [path, contents] of sources) outputs.set(`source/${path}`, contents);
  outputs.set('LICENSE', sources.get('LICENSE'));
  outputs.set('recipe.mjs', await readFile(scriptPath));
  outputs.set('README.md', Buffer.from(snapshotReadme(id)));
  const provenance = {
    engineId: id,
    package: packageMetadata.name,
    packageVersion: packageMetadata.version,
    repository: git('remote', 'get-url', 'origin'),
    revision,
    sourceDigest: digest,
    sourceChanges: sourceChanges ? sourceChanges.split('\n') : [],
    sourceState: sourceChanges ? 'modified inputs archived exactly' : 'archived inputs match the recorded revision',
    recipeVersion,
    compiler: { name: 'typescript', version: compilerVersion, options: compilerOptions },
    files: Object.fromEntries([...outputs].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([path, contents]) => [path, { bytes: contents.length, sha256: sha256(contents) }])),
  };
  outputs.set('provenance.json', Buffer.from(json(provenance)));
  const directory = resolve(siteRoot, 'assets/engines', id);
  let exists = true;
  try { await access(directory); } catch (error) { if (error.code === 'ENOENT') exists = false; else throw error; }
  if (exists) {
    await checkFiles(directory, outputs);
  } else {
    await mkdir(directory, { recursive: true });
    for (const [path, contents] of outputs) {
      await mkdir(dirname(resolve(directory, path)), { recursive: true });
      await writeFile(resolve(directory, path), contents, { flag: 'wx' });
    }
  }
  const bytes = [...outputs.values()].reduce((total, contents) => total + contents.length, 0);
  console.log(`${exists ? 'Verified existing' : 'Created'} ${id}: ${outputs.size} files, ${bytes} bytes.`);
  console.log(`Add this version to assets/engines/registry.mjs without removing older entries.`);
}

const args = process.argv.slice(2);
const compilerFlag = args.indexOf('--typescript');
let typescriptDirectory;
if (compilerFlag !== -1) {
  if (!args[compilerFlag + 1]) throw new Error('--typescript requires an installation directory.');
  typescriptDirectory = resolve(args[compilerFlag + 1]);
  args.splice(compilerFlag, 2);
}
if (args[0] === '--verify' && args.length === 2 && typescriptDirectory) {
  await verify(resolve(args[1]), typescriptDirectory);
} else if (args.length === 1 && !args[0].startsWith('-')) {
  const sourceDirectory = resolve(args[0]);
  await snapshot(sourceDirectory, typescriptDirectory ?? resolve(sourceDirectory, 'node_modules/typescript'));
} else {
  throw new Error('Usage: node scripts/snapshot-generator.mjs SOURCE_REPO [--typescript DIR]\n       node RECIPE --verify SNAPSHOT_DIR --typescript DIR');
}
