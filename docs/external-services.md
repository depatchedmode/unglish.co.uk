# External links and optional speech research

Checked 20 October 2026. This is a dated implementation note, not an on-site development journal. External services can change independently of this website.

## Unglish a: recovered collection links

All four old Highlight links in `iterations/a.html` failed because the current API rejects their 24-character identifiers. The collection pages still exist under chain/contract references. Each replacement below was loaded in the browser and checked against Highlight's collection API for its name, blockchain, and creator address `0x76963ee4c482fa4f9e125ea3c9cc2ea81fe8e8c6`.

| Edition | Chain | Working collection page | Status observed |
| --- | --- | --- | --- |
| arbiglish a | Arbitrum, 42161 | [View arbiglish a](https://highlight.xyz/mint/42161:0x082daac1b2c74197d50341cbbeb9da7fc4a59930:0) | Page says “Mint ended.” All returned sales have ended; public sale ended 1 April 2024. |
| baglish a | Base, 8453 | [View or mint baglish a](https://highlight.xyz/mint/8453:0x5cdcb4d420c4bc244910b50a9874b2eb12890969:0) | Public sale is live in the API, unpaused, with no end date. Page displays a sign-in sale at 0.001 ETH; fees are separate. |
| optiglish a | Optimism, 10 | [View optiglish a](https://highlight.xyz/mint/10:0x35f93761726c142d759053adf9d4eecf6a0f7429:0) | Page says “Mint ended.” All returned sales have ended; public sale ended 1 April 2024. |
| zorglish a | Zora, 7777777 | [View zorglish a](https://highlight.xyz/mint/7777777:0xa62fb8b864e14b53e47bee2c612f4408512d3858:0) | Page says “Mint ended.” All returned sales have ended; public sale ended 1 July 2024. |

Use chain-specific viewing CTAs for ended sales. Only baglish currently supports a mint-oriented CTA. Avoid a set-wide “currently minting” claim, hard-coded prices, supply claims, or a simulated mint control. No wallet was connected and no transaction was attempted; a visible live sale does not establish transaction success.

The current [creator profile](https://highlight.xyz/user/0x76963ee4c482fa4f9e125ea3c9cc2ea81fe8e8c6) works. The old `@depatchedmode.eth` profile route fails validation. The working profile currently lists collected tokens, so it is not a replacement for the site's set overview.

### Identifiers and evidence

| Edition | Old identifier | Current Highlight UUID |
| --- | --- | --- |
| arbiglish a | `659a72b341fad46b6bc0e14d` | `019f5de1-1c84-76ba-b775-b9ffee96d567` |
| baglish a | `659a722663f21afad4091378` | `019f5ddf-1730-77ed-a9c5-c2f3fc613aae` |
| optiglish a | `659a71c063f21afad4091374` | `019f5de0-ff43-710a-a844-c243bf4e7825` |
| zorglish a | `659a72fe63f21afad409137a` | `019f5de0-5a35-706f-95b4-e7956be18261` |

Primary records used:

- [Arbiglish collection API](https://api.highlight.xyz/collection/42161:0x082daac1b2c74197d50341cbbeb9da7fc4a59930:0), [baglish collection API](https://api.highlight.xyz/collection/8453:0x5cdcb4d420c4bc244910b50a9874b2eb12890969:0), [optiglish collection API](https://api.highlight.xyz/collection/10:0x35f93761726c142d759053adf9d4eecf6a0f7429:0), and [zorglish collection API](https://api.highlight.xyz/collection/7777777:0xa62fb8b864e14b53e47bee2c612f4408512d3858:0).
- [Creator profile API](https://api.highlight.xyz/user/0x76963ee4c482fa4f9e125ea3c9cc2ea81fe8e8c6/profile) and its public collected-token records supplied the Base and Zora collection UUIDs.
- [Arbitrum token search](https://arbitrum.blockscout.com/api/v2/search?q=unglish) supplied the Arbitrum contract. Highlight independently confirmed its edition name and creator.
- [Optimism token holdings](https://explorer.optimism.io/api/v2/addresses/0x76963ee4c482fa4f9e125ea3c9cc2ea81fe8e8c6/tokens?type=ERC-721) supplied the Optimism contract. The creator's [deployment transaction](https://explorer.optimism.io/tx/0xe0d375887b7b39e76f804170dc547e208803618f88391aa7ab89d4271305a566) and Highlight record corroborate it.

The browser normalizes colons in these URLs to `%3A`; both forms resolve. Prefer the chain/contract reference over another opaque database UUID.

Highlight now displays July 2026 as the creation date for these records. Their sale start/end dates, deployment records, and the existing Unglish site establish their earlier history. This appears to be a service migration date, not the artwork release date. Preserve the project's January 2024 release date. Highlight's Arbitrum and Optimism pages also show a collection size of zero despite historical mints; do not copy those counts onto the website.

### Historical code archive references

The collection API records these Arweave locations as successful archives of each collection's code directory:

- [Arbiglish code](https://arweave.net/01WUCcug0jNUiaZMqtMEfjHEFyD-JaOpRI7tKVR417k)
- [Baglish code](https://arweave.net/GntTG0Ht890gCsTxjvxI1xYhVjZIJD4NMEtBY-6d16I)
- [Optiglish code](https://arweave.net/quSXxFIB_a5wxHNJSCopfHS_jOSPPPylP5r3NfBk3YU)
- [Zorglish code](https://arweave.net/Im23pLhitSPsXjr4LLFvwlVc-zJLq7uJKDZ8zzhp5gI)

These are provenance leads. This research did not download and compare the archives with one another or with `a-preview.html`; it does not establish byte identity. The local preview snapshot remains independently identifiable.

## Optional speech: no production candidate selected

Keep browser speech synthesis as the default. The optional-engine exception requires explicit opt-in, fully local synthesis, a complete download below 100 MB, suitable licenses, an archival path, and a useful improvement over native voices. For evaluation, count the engine, runtime, voice/model, phoneme data, and glue together, using the conservative limit of 100,000,000 bytes. A model file below the limit is not enough.

Research supports the following shortlist. None has yet passed an Unglish pronunciation comparison or a complete browser delivery test, so none should be advertised as better speech or downloaded by the prototype.

### eSpeak NG: strongest lead for phonetic control

The upstream [browser port](https://github.com/espeak-ng/espeak-ng/blob/master/emscripten/README.md) documents offline synthesis through a Web Worker and Web Audio, GPLv3 licensing, and a historical 3.2 MB build including voices. Its dated wrapper is not itself a modern integration choice.

The newer [espeak-ng-wasm project](https://github.com/classical-cat-dh-lab/espeak-ng-wasm) supplies a pinned build, source, checksums, and direct IPA input. Its [v0.1.1 release API](https://api.github.com/repos/classical-cat-dh-lab/espeak-ng-wasm/releases/tags/v0.1.1) reports eight artifacts totaling **1,158,775 bytes**, including license and manifest. That is the sum of published artifact sizes, not a measured network transfer or memory footprint. Its [citation file](https://github.com/classical-cat-dh-lab/espeak-ng-wasm/blob/v0.1.1/CITATION.cff) records GPL-3.0-or-later and a Zenodo DOI, providing an explicit archival lead.

The [driver contract](https://github.com/classical-cat-dh-lab/espeak-ng-wasm/blob/v0.1.1/INTERFACE.md) accepts IPA, pitch, and rate, but its supplied phoneme mapping and default voice are **Latin**. Unglish needs an English mapping and matching voice data, including stress, diphthongs, rhotic sounds, and every generated symbol. Unmapped symbols are rejected. The release operates on the main thread; verify responsiveness before adoption. Upstream [voice files](https://github.com/espeak-ng/espeak-ng/blob/master/docs/voices.md) allow formant and other voicing adjustments beyond ordinary browser pitch/rate controls.

This is a plausible improvement in pronunciation control, not established improvement in naturalness. It would need a mapped phoneme test set, listening comparison with native voices, and a complete rebuilt artifact manifest. Preserve corresponding source and notices when archiving the GPL build.

### Piper: promising size, unresolved complete browser package

The [current Piper engine](https://github.com/OHF-Voice/piper1-gpl) is GPLv3; the older MIT [rhasspy repository](https://github.com/rhasspy/piper) is archived and points to that successor. Voice licensing is separate. The [voice documentation](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md) explicitly requires reviewing each voice's model card.

For scale, [Alan low](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alan/low) has a 63.1 MB ONNX model, but its [model card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_GB/alan/low/MODEL_CARD) delegates dataset licensing to another repository and notes that it was fine-tuned from Ryan. That is insufficient evidence here to treat the entire voice provenance as cleared. An inference runtime, phonemizer, and glue still need to fit beside the model. The reviewed official engine documentation does not establish a complete browser delivery under 100 MB. No Piper browser build or phoneme-input integration was tested.

### Kokoro: browser support, little size headroom

The official [Kokoro JavaScript implementation](https://github.com/hexgrad/kokoro/blob/main/kokoro.js/README.md) supports fully local browser inference through Transformers.js and offers voice selection. The [model](https://huggingface.co/hexgrad/Kokoro-82M) and [code](https://github.com/hexgrad/kokoro) use Apache 2.0. The core [model API](https://github.com/hexgrad/kokoro/blob/main/kokoro/model.py) accepts phonemes and a style vector; this does not establish an equivalent ready-made phoneme API in the JavaScript wrapper.

The [ONNX file listing](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/main/onnx) reports 86 MB for `model_q8f16.onnx` and 92.4 MB for `model_quantized.onnx`. Those exclude the runtime, selected voice, tokenizer/configuration, and application glue. The listed four-bit files are larger, so their names do not imply compliance. A complete compatible package below the limit remains unverified, as does pronunciation quality for invented words. Public source and downloadable weights offer an archival route, but the exact chosen files and all transitive licenses would need a pinned manifest.

### Evidence needed before an opt-in voice ships

1. Build one complete, self-hosted artifact set with source, licenses, hashes, and reproducible build instructions; measure its total size.
2. Map the full Unglish phoneme inventory without silently dropping or approximating unsupported symbols.
3. Compare the same generated words using the native voice and the candidate. Evaluate pronunciation fidelity separately from naturalness, and let the user hear the result.
4. Verify download cancellation, retry, offline reuse, playback stopping, and browser/device support. Fetch nothing before the visitor opts in.

This work belongs in the associated code repositories. The public website only needs a verified feature when one is ready.
