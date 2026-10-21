# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Present Unglish as a whole: an experiment in generated, English-sounding words, the evolving word-generator project, and generative minted works. Visitors should be able to encounter the words, explore their source, and understand the editions.

## Operating Context

- This repository hosts the public website, currently using static HTML, CSS, and a self-contained historical artwork preview.
- The current generator is developed separately at https://github.com/unglish/word-generator. The local repository inspected during review is `/Users/ryanbetts/Code/unglish/word-generator`.
- Development updates belong in the associated repositories. An on-site development journal is out of scope.

## Capabilities and Constraints

- Visitors can generate and listen to words. Discovery takes priority over exposing generator settings.
- A discovered word can be shared through a reproducible link that reopens that exact word.
- Definitions are out of scope for this iteration.
- Historical editions retain their original generation rules as fixed code snapshots. Their presentation can evolve freely. Preserving the old HTML presentation is not a product requirement.
- Arbiglish a, baglish a, optiglish a, and zorglish a use the same generator on different chains. Do not invent phonological differences between them.
- Strive to use only the web platform and Unglish-owned code. The existing site needs no framework or third-party UI library.
- Native browser speech synthesis is the default.
- An optional speech upgrade is an explicitly permitted dependency exception. It must run entirely in the browser, download only after visitor opt-in, and total less than 100 MB. Its code and models must be FOSS or liberally licensed, with a credible path to long-term archiving.
- The optional speech upgrade must demonstrate an improvement over browser speech. Voice customisation and accepting phonetic input instead of guessing from spelling are examples of meaningful improvement. No engine has been chosen, and no qualifying candidate has yet been verified.
- Whether the dependency restriction also excludes development-only tools remains unspecified. Do not claim a runtime-only interpretation is a confirmed user decision.

## Brand Commitments

- Unglish should feel like an experimental dictionary with tongue-in-cheek, dry British humour.
- The user specifically cautions against flat or manufactured wit. The approved introduction combines the opening paragraph of draft B with all of draft A, including its OED footnote. The exact copy is recorded in `docs/website-brief.md`.
- The binding visual reference is a late-1990s academic weblog: a scholarly linguist's homepage that sometimes indulges too much whimsy. Uncommon border styles (groove, ridge, inset, outset, double) and antiquated but supported elements such as `marquee` are part of the intended character, as are native browser conventions. On 21 October 2026 the user rejected the plainer Craigslist-style cleanup for losing this charm. Effective CSS for layout and accessibility is welcome.
- A polished print-reference-book treatment was proposed by the assistant and rejected. Do not revive it as an approved direction.

## Evidence on Hand

- Existing website: `index.html`, `styles.css`, `iterations/a.html`, and `iterations/a-preview.html`.
- Review: `.impeccable/critique/2026-10-20T21-55-24Z__index-html.md`.
- The local generator identifies itself as version 0.6.0 / IDGAF u. The review exercised seeded public APIs and found no runtime package dependencies. This does not establish npm publication contents or deployed-demo parity.
- The historical preview embeds Highlight integration code. The modern site's dependency ambition does not make that historical code first-party; preserve provenance when retaining a snapshot.
- All four linked Highlight collection destinations and the linked Highlight profile displayed errors during the 20 October 2026 review. The Teia artwork page loaded. These observations do not establish contract state or the availability of alternative mint URLs.

## Product Principles

1. Let visitors encounter the words before explaining the machinery.
2. Preserve historical generation behavior while allowing presentation to change.
3. Make discoveries reproducible and shareable.
4. Use native web capabilities deliberately; require a concrete benefit and archival path for the optional speech exception.
5. Prefer the project's own humour and factual history to invented claims or generic marketing copy.

## Accessibility & Inclusion

CSS is explicitly welcome where it improves accessibility and layout. The site's native-web character must support readable text, responsive layouts, keyboard operation, and understandable controls. Concrete review findings and implementation checks are recorded in `docs/website-brief.md`.
