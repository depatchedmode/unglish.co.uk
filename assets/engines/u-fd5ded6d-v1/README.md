# u-fd5ded6d-v1

An immutable browser snapshot of @unglish/word-generator. Do not edit it in place:
old discovery links depend on the exact generation rules and seed mapping here.

`engine.mjs` exposes `ENGINE_ID` and `generate({seed, syllables?, morphology?, mode?})`.
Seeds contain 1–128 Unicode code points; their exact UTF-16 code units are hashed
with FNV-1a to the engine's 32-bit Mulberry32 seed. No Unicode normalization occurs.
Different strings can share a 32-bit hash. Defaults are morphology=true and mode=lexicon.
Syllables, when supplied, are the final word's requested count (1–7).

`js/` contains unbundled native ES2022 modules emitted by TypeScript 4.9.5.
There are no third-party runtime imports. `source/` contains the original production
TypeScript and JSON data, package metadata, configuration, README and MIT license.
Tests, demo, evaluation tooling and third-party packages are outside this archive.
`provenance.json` records the revision, source state and each file's SHA-256 hash.
The precise snapshot recipe is archived as `recipe.mjs`.

To verify the archive without its original repository or any network access:

```sh
node assets/engines/u-fd5ded6d-v1/recipe.mjs --verify assets/engines/u-fd5ded6d-v1 --typescript /path/to/typescript
```

Provide an existing TypeScript 4.9.5 installation. The compiler is a build
tool, not a website dependency. Rebuilding does not modify the archive.
