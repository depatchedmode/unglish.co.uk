# Prototype verification — 20 October 2026

## Automated checks

`node --test tests/*.test.mjs`: 32 passing tests. The tests exercise generation results, not HTML snapshots.

- Current browser snapshot: fixed word/IPA examples, deterministic generation independent of ambient randomness, final syllable counts with and without affixes, options and input validation, registry resolution, archive checksums, and complete local import graph.
- Snapshot preparation also compared 96 complete Word results with the local original TypeScript API, including Unicode seeds and control combinations. The archived recipe rebuilds offline using the recorded existing TypeScript 4.9.5 compiler.
- Historical adapter: complete original artifact checksum and output comparisons against execution of the archived scripts, including every melody length (2/3/4/8/16/128), common-word classifications, syllable variation, exact token strings and curated seeds.
- Shared links: full output equality across controls, Unicode/whitespace/punctuation seeds, old engine selection after adding a newer registry entry, rejected unknown or malformed inputs, complete historical melodies, and reproducible legacy Highlight links.

`node scripts/snapshot-edition.mjs --check`: snapshot and adapter match. `git diff --check`: clean after removing trailing whitespace.

## Browser checks

T3's Chromium browser served the actual files over local HTTP.

- Homepage loads in standards mode with UTF-8 and `en-GB`. The approved introduction follows the playable word. It contains one entry for the four-chain set.
- Another word updates the specimen and its URL. Back restores the earlier word. A fresh visit to a saved link reproduces its spelling and IPA. Generator settings retain the incoming word; form submission updates the result and address. Multiline seeds retain their exact value in a textarea.
- Unsupported engine links show an explanation and a working Start a new word link. In-page Editions navigation retains its fragment and scroll destination after the initial generated URL is installed.
- Native Listen dispatches speech; Tab reaches the control with a visible focus outline and Space activates it. Stop and Escape end playback. Instrumented synthesis verifies text, voice, rate and pitch; pitch can move back down after reaching its upper limit. A simulated voiceschanged event preserves the selected voice. A simulated synthesis error restores the Listen control and gives recovery guidance.
- Edition Sing loop supplies the archived melody's pitch/rate sequence at 500 ms intervals, with Stop cancelling the loop. Native floating-point utterance property rounding is expected. This is not an assessment of audible voice quality.
- Copy link succeeds in the tested browser. If clipboard permission is unavailable, the ordinary permalink remains the fallback.
- With scripts disabled in a sandboxed same-origin iframe, editorial copy, edition links and repository links remain available; generation controls stay disabled and a noscript explanation is present.
- A simulated missing speech API leaves generation available and supplies explicit speech-unavailable feedback.
- The actual resource graph contains only same-origin site and Unglish engine files. The current engine imports 34 modules, 322,532 raw bytes; this excludes the small site wrappers and is not a measured compressed transfer size. Browser-provided voices may have their own platform behavior. No optional speech package is loaded.

## Layout and visual checks

Full-page captures in `.impeccable/review/` (local review artifacts, excluded from Git): homepage at 1440, 1280 and 390 CSS pixels; generator at 320 with voice settings open and a seven-syllable word; edition at 1280/light and 390/dark. The generator was also checked at 320 with the root font enlarged to 200% (36px body text), with a first-viewport capture. No document-width overflow occurred in these cases; long words wrap, and IPA remains readable.

The palette is explicitly light/dark; native buttons and selects follow browser appearance. No animated marquee, hidden shortcut requirement, custom font, or remote UI package remains in the live pages. The archived original presentation remains unchanged for provenance.

Calculated contrast for authored text against its page ground: light body 18.88:1, links 9.40:1, visited links 11.01:1; dark body 15.60:1, links 9.47:1, visited links 10.15:1. These values use sRGB relative luminance for the CSS colours and do not claim a measurement of every browser's native control rendering.

The Impeccable detector returned no findings across all live HTML and CSS targets. The independent finish reviewer subsequently returned **ship**, with no material fixes, across the supplied visual/source evidence. Its record is `.impeccable/finish-review.md`. The 1440 CSS-pixel desktop capture was proportionally downscaled by the capture tool when saved; layout metrics were checked before capture.

## Limits

This pass did not test Safari, Firefox, a physical touch device, a screen reader, or speech intelligibility. Browser-default controls were used deliberately, but that is not a claim of universal accessibility conformance. A native browser speech engine can differ by device.

The four Highlight pages were verified by rendered name, chain and sale state, backed by primary service records. No wallet connection or mint transaction was attempted. Dated observations and recovered archive leads are in `external-services.md`.

Optional speech remains research. No candidate has demonstrated all requirements with Unglish, so this prototype does not offer an unverified upgrade.
