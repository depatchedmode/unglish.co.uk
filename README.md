# Unglish

A static website for generated words, the word-generator project, and historical editions. HTML, CSS and native browser modules; no install or site build step.

Run locally:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173>. ES modules need HTTP; opening the HTML directly from disk will not run the generator.

- `index.html`: discovery and the project introduction.
- `generator.html`: seeded generation with syllable, affix and distribution controls.
- `iterations/a.html`: every minted Unglish a token, shown in the archived minted artwork, with dialect and token controls and four collection links.
- `iterations/a-preview.html`: a standalone preview; reproducible legacy Highlight inputs remain supported.

The browser provides speech. Voice choice, speed, pitch and stopping use its native synthesis API. No speech model is downloaded. Optional engines are evaluated in [docs/external-services.md](docs/external-services.md).

## Reproducible words

Current-word URLs contain `v=1`, immutable engine `e`, exact string `seed`, syllable count `n` (`auto` or 1–7), affix flag `m` (0/1), and `mode` (`lexicon` or `text`). The versioned adapter defines seed hashing and explicit defaults. Shared links resolve through `assets/engines/registry.mjs`; retain all old entries when introducing a new default.

Edition URLs contain `v=1`, the original artifact ID in `e`, exact hash `h`, exact token ID `tid`, and curated flag `ic`. Complete legacy `h`/`tid` links and curated `h`/`ic=1` links are upgraded without changing their results. A legacy hash alone cannot recover the original random token ID, so it produces an explanation rather than a different word.

Snapshots are immutable. Their source, license notices and provenance live alongside their browser modules:

- [Current engine archive](assets/engines/u-fd5ded6d-v1/README.md), from word-generator commit `fd5ded6dc245054a85ca353887b94b503d234e6c`.
- [Historical edition archive](assets/editions/a/PROVENANCE.md), with a byte-identical copy of the original HTML. The embedded Highlight helper is historical third-party code, not an Unglish dependency we silently relabel as first-party.

To snapshot a later current generator, update the recipe's version identity and registry deliberately; never overwrite an existing version. The source repository's existing TypeScript compiler is used only for snapshot preparation, not by the website.

```sh
node scripts/snapshot-generator.mjs /path/to/word-generator
node scripts/snapshot-edition.mjs --check
node scripts/snapshot-mints.mjs   # refreshes the minted artwork and mint records (network)
node --test tests/*.test.mjs
```

The [implementation checks](docs/verification.md), [website brief](docs/website-brief.md) and [external-service research](docs/external-services.md) record scope, evidence and limits. Development updates belong in the associated repositories.
