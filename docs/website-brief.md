# Unglish website brief

This records the user's decisions from the clarification conversation following the October 2026 review. `PRODUCT.md` holds durable product facts. This brief records the agreed website experience, approved introduction, and work needed to implement it. The user approved a code-first working prototype, now implemented in this repository. Verification and known limits are recorded in `docs/verification.md`.

## Agreed experience

### Homepage

Open with a playable generated word, followed by the literary introduction below.

The opening is discovery first: Another word, Listen, and voice/playback controls. Deeper word-generation settings belong on a dedicated generator page rather than beside the opening specimen.

Visitors can share a reproducible link that brings back the exact discovered word. Definitions are out of scope. A personal saved-word library, accounts, and user submissions have not been requested.

### Generator

Provide a place for deeper experimentation and a clear route to the word-generator repository. Do not mistake the detailed developer interface for the homepage experience.

The current generator powers discovery. Historical editions retain their original rules. Select and record the exact revisions during implementation; the reviewed local package version is evidence, not an instruction to assume a particular published release.

### Editions

Give the four historical a editions one showcase entry for the set, leading to one set detail page. That page has distinctly flavoured, chain-specific CTAs.

The four names are arbiglish a, baglish a, optiglish a, and zorglish a. They share the same generator and differ by chain. Explain that relationship plainly, without inventing linguistic differences.

Preserve generation code as a snapshot. Presentation can evolve freely, including layout, controls, and accessibility. The user is not attached to the existing HTML.

Existing source files and Git history are evidence for preservation. Keeping the exact old HTML as the live preview is not required. Any extraction or adaptation of old generation code needs evidence that it preserves its generation behavior.

Resolve working collection destinations and verify the rendered pages before making present-tense availability claims. CTA wording and availability labels remain implementation work.

### Project information

Present the broader project and link to its associated repositories. Development updates stay in those repositories. Do not create an on-site development journal or an empty definitions section.

Final navigation labels and any supporting about-page structure can be resolved during implementation within this scope.

## Binding visual direction

A 1999 academic weblog, as if produced by a scholarly linguist who sometimes indulged a bit too much whimsy. This revises the earlier "native-web brutalism" direction: on 21 October 2026 the user judged the plain Craigslist-style cleanup to have lost the original site's charm, which came from uncommon border styles and antiquated but still supported elements such as `marquee`.

Use ordinary HTML, period elements and familiar browser conventions deliberately. The literary quality comes from the words, prose, the experimental-dictionary premise and scholarly apparatus (numbered sections, footnotes, captioned tables, colophon). Moving or blinking elements must stop on request, within five seconds, or under reduced-motion preferences. See `DESIGN.md` for the fittings.

The assistant's proposed polished reference-book treatment was rejected. Do not translate the brief into simulated paper, a refined print-publication design, or generic contemporary landing-page polish.

Specific colours, font declarations, and layout values have not been selected. Choose and verify them against the native-web references, not against an invented visual system.

## Approved introduction

Use B's opening paragraph followed by all of A, including the OED footnote:

> You can often pronounce an English word before you know what it means. You can sometimes get several years' use out of it before anybody notices.
>
> We all accept English as a gibberish language, collectively made up in real time across the globe. It's functional. It's cultural. It's an ungodly mishmash of borrowed words and sounds. It makes no sense, but it gets the job done.
>
> Some folks, like the OED¹, attempt to maintain control and impose order. It's a futile resistance.
>
> Unglish seeks to bring the insanity of English to its natural conclusion: infinite gibberish, self-replicating and in dynamic equilibrium. All while sounding kind of English when you squint your ears.
>
> ¹ Obstruent Etymology Dictators.

This wording was selected by the user. Further unsolicited rewriting is not part of the agreed copy decision. Present the footnote accessibly using native links or equivalent meaningful markup.

## Speech

Default to the browser's synthesis API. Treat an alternative as an optional enhancement, subject to every condition below:

- It runs entirely in the browser.
- It downloads only after visitor opt-in.
- Total required download is less than 100 MB.
- Code and model licensing is FOSS or otherwise liberal.
- There is a credible long-term archival path for the required assets.
- It demonstrably improves on native speech, for example through voice customisation or explicit phonetic input.

No candidate has yet been verified. Research must check the actual licence, model/runtime download sizes, input capabilities, and a working browser example. Do not substitute a server speech service or call an engine better solely because its demo voice sounds more natural.

The dependency exception is specific to qualifying optional speech. It is not permission to add a general frontend framework or unrelated libraries.

## Implementation work

These are engineering consequences of the decisions and review, not additional user-selected features:

1. Establish semantic, standards-mode documents with UTF-8, document language, coherent headings, and native navigation.
2. Pin the current generator and historical generation snapshots. Keep the generator's implementation and provenance identifiable.
3. Make word links record enough information to reproduce the word after the default generator evolves. Version, seed, and relevant configuration need a stable interpretation; choose the URL format during implementation.
4. Build the discovery experience and deeper generator page with native controls. Add visible playback state and speech-unavailable feedback. Avoid speech before an intentional user action.
5. Implement the approved introduction and single-set edition presentation. Verify collection destinations and use clear, distinct link names even where the wording is humorous.
6. Correct measured layout, contrast, and interaction failures while keeping the requested native-web character.
7. Evaluate optional speech separately against the acceptance criteria. Record findings honestly if no candidate qualifies.

The website can remain static and use Unglish JavaScript modules. Development-only tooling policy has not been explicitly settled; adding a site build dependency should not be treated as an approved decision.

## Verification

- A shared word link produces the same word in a fresh session, including after a new default engine version is introduced.
- Historical examples preserve original generation results for known inputs. Presentation changes must not alter random-input interpretation or generation behavior.
- Generation and speech controls work through keyboard, pointer, and touch, with visible state and focus.
- Long generated words remain readable at narrow widths and enlarged text sizes. Pronunciation remains legible.
- The editorial content remains useful when JavaScript is unavailable.
- Light and dark presentations use readable text/background combinations. Motion does not prevent reading or require involuntary animation.
- Collection links reach the intended rendered destinations. A successful outer HTTP response alone is not sufficient.
- Resource inspection supports the dependency claims. Optional speech assets are not fetched before opt-in.

Use focused checks appropriate to implementation. The earlier review is evidence of existing issues, not proof of a future version's behavior.

## Implementation record

- Code-first prototype: ordinary static HTML/CSS and native ES modules, with no site install or build step.
- Current engine: `u-fd5ded6d-v1`, from clean production sources at word-generator commit `fd5ded6dc245054a85ca353887b94b503d234e6c`. Original source, license, checksums and compiler recipe are archived with it.
- Historical engine: `unglish-a-6f0d391d5be7`, derived without changing generation bytes or RNG order from the archived original HTML. Tests compare it directly with that artifact.
- Link format and registry preservation are documented in the repository README. Exact seeds, options, engine IDs, and historical hash/token inputs remain in URLs.
- Navigation is Unglish, Generator, Editions, About, Source. The set detail page has a playable historical preview and four distinct chain links. Canonical destinations and dated availability were recovered; only baglish on Base currently lists an open public sale.
- Speech remains the browser API. `docs/external-services.md` records candidates and missing evidence; none has yet qualified for an opt-in implementation.

## Remaining evaluation

- Compare a fully archived optional speech build with native voices on Unglish words before adding it.
- Extend browser/device and assistive-technology testing beyond the Chromium checks recorded for this prototype.
- Recheck external sale information before publication; it is dated content, not a live chain query.
