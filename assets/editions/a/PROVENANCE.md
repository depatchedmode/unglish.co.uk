# Unglish a — fixed generation snapshot

`original.html` is the complete, byte-for-byte copy of `iterations/a-preview.html` from this website before its presentation was modernised. The source file was last changed in website commit `daee8e6b97700c26e3996c531f05728350ef2150` (10 January 2024). It was archived here on 20 October 2026.

- Source repository: <https://github.com/depatchedmode/unglish.co.uk>
- Source path: `iterations/a-preview.html`
- SHA-256: `6f0d391d5be73349b08559baee80af4d0c7a10ca500033ee2ec5a20fa43c699f`
- Artifact identifier: `unglish-a-6f0d391d5be7`

The archive is historical executable HTML, including its original presentation and browser-speech code. The current website does not need to execute it. Keep it unchanged; a changed generator requires a new artifact identifier and directory.

## Adapter

`engine.mjs` extracts the original word generator, phoneme data, spelling rules, English word list, analysis, melody constants and melody-generation expressions verbatim. It extracts the original `xmur3`, `sfc32` and `random` implementation from the embedded **Highlight Generative Art Script 0.1.2**. The adapter removes the DOM presentation and speech controls, then returns their generated data for a new presentation.

Random calls retain the original order: melody length, word and its analysis, melody notes, then border style. Voice selection originally happened after those values were complete. Voice choice depends on the browser's installed voices and is intentionally outside this generation adapter. Nothing in the original word rules or melody rules has been corrected or updated.

Rebuild with `node scripts/snapshot-edition.mjs`; verify extraction with `node scripts/snapshot-edition.mjs --check`. The script refuses a changed archive checksum. `node --test tests/edition.test.mjs` executes the original scripts in an isolated test context and compares their actual output with the adapter, including complete word structure, analysis, melody and Highlight traits.

## Inputs and outputs

`generateEdition({ hash, tokenId, curated = false })` takes nonempty strings for the original `h` and `tid` query parameters. Preserve those strings exactly, including case and leading zeroes. In the original non-curated mode (`ic=0` or absent), the seed is `hash + tokenId`, concatenated with no separator. In curated mode (`ic=1`) only `hash` enters the seed; `tokenId` does not affect generated output. The adapter requires explicit inputs instead of generating random metadata for omitted query parameters.

The original random implementation calls `sfc32(seed(), seed(), seed(), seed())()` for every draw. This is not the same as creating a single continuing `sfc32` sequence.

`word` is the clean spelling. `written.hyphenated` contains the original literal `&shy;` entities; a presentation can convert those to Unicode soft hyphens without treating the spelling as HTML. `pronunciation` is the original IPA. `melody` is an ordered array of `{ pitch, rate }`, and `noteCount` is its length. The original player advanced notes every 500 ms (120 beats per minute).

`common` reproduces membership in the archived English word list. `pleasantness` preserves the original Highlight trait, `analysis.vulgarity <= 0.5`; the original visual class called this “most vulgar”. The numerical analysis is part of this artwork's rules, not a profanity detector. `border` and `traits` preserve the other generated presentation attributes. No definitions are supplied.

The four chain versions of Unglish a share these generation rules. Chain identity is not an input to this generator.

## Licensing

This snapshot includes the first-party Unglish artwork and its embedded Highlight helper. The historical HTML contains a version/attribution header for Highlight but no license grant. No repository-wide license file was present in the website checkout when this archive was made. Accordingly, this archive does **not** assert an MIT or other blanket license over the historical bundle, its embedded helper, or its word list. The modern word-generator repository's license does not by itself establish a license for this older artifact. Confirm the historical source and dependency licenses before redistributing it under a new license.

## The minted artwork

`minted/` holds the artwork exactly as minted: `index.html`, `style.css` and `bundle.js` from the Arweave bundle each token's metadata names. All four collections point at Arweave manifests whose files are byte-identical. `minted/mints.json` records, for every token on every chain, the exact render query from its on-chain `tokenURI` metadata (`animation_url`) and the traits Highlight recorded. Checksums and the Arweave manifest IDs are in that file. Refresh it with `node scripts/snapshot-mints.mjs`; the website itself never contacts a chain, Highlight or Arweave.

On 21 October 2026 the four contracts reported 14 (Arbitrum), 62 (Base), 32 (Optimism) and 46 (Zora) tokens, 154 in all.

**`original.html` is not the minted code.** It is the website's preview, last changed on 10 January 2024, four days after release. Its generator is identical, but one trait differs. The minted bundle publishes `pleasantness` as the raw vulgarity score (for example `1.9406…`), which is what the token metadata records. The later website copy publishes `vulgarity <= .5` as true or false. Words, pronunciations, melodies, borders and the red "vulgar" styling are the same in both.

`tests/mints.test.mjs` runs the unchanged minted bundle with each token's recorded query and checks that it reproduces that token's on-chain traits exactly, and that `engine.mjs` produces the same word. All 154 tokens pass.

Licensing for `minted/` is as described below for the historical bundle.
