---
name: Unglish
description: The homepage of a scholarly linguist, c. 1999, who sometimes indulges too much whimsy.
colors:
  page: "whitesmoke"
  plate: "#fff"
  ink: "#111"
  heading: "maroon"
  link: "#0000ee"
  visited: "#551a8b"
  rule: "darkgray"
  muted: "#555"
  tape: "gold"
  flash: "green"
  dark-page: "#000"
  dark-plate: "#111"
  dark-ink: "whitesmoke"
  dark-heading: "#e8b86d"
  dark-link: "lightseagreen"
  dark-visited: "plum"
  dark-rule: "gray"
  dark-tape: "darkorange"
  dark-flash: "lime"
typography:
  masthead:
    fontFamily: '"Times New Roman", Times, serif'
    fontSize: "clamp(2.6rem, 9vw, 4.5rem)"
    fontVariant: small-caps
  specimen:
    fontFamily: '"Times New Roman", Times, serif'
    fontSize: "clamp(2.4rem, 7vw, 4.25rem)"
    fontWeight: 700
  section:
    fontFamily: '"Times New Roman", Times, serif'
    fontSize: "1.6rem"
    fontVariant: small-caps
  body:
    fontFamily: '"Times New Roman", Times, serif'
    fontSize: "1.125rem"
    lineHeight: 1.55
  typewriter:
    fontFamily: '"Courier New", Courier, monospace'
  badge:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "9px"
---

# Design System: Unglish

## Overview

**Creative North Star: "A linguist's homepage, 1999"**

Unglish looks like a page hand-written by a scholarly linguist in the late 1990s who discovered CSS border styles and could not leave them alone. The scholarship is real: numbered sections, footnotes, tables with captions, an `<address>` colophon. The whimsy is indulged: a groove-bordered page frame, a `<marquee>` on construction tape, a blinking status, fleurons and 88×31 badges.

Everything is the web platform as shipped: system fonts, native controls, period elements that browsers still support, and CSS for the rest. No images, web fonts or frameworks.

## Period fittings

- **Page frame:** the body sits inside a thick `groove` border.
- **Masthead:** centred small-caps title, italic tagline, and a bracketed, pipe-separated link bar: `[ Unglish | Generator | … ]`. Separators are CSS-generated with empty alt text.
- **Section headings:** maroon small caps over a `double` rule, numbered `§ 1.` with a CSS counter (alt text empty).
- **Specimen:** a white plate in a `double` border, like a dictionary entry: kicker, headword, IPA, an italic sense line, then native buttons.
- **Construction tape:** a gold panel with a striped `border-image` holding a `<marquee>`. `assets/period.mjs` pauses it on hover, adds a "Hold still" toggle (`aria-pressed`), and replaces it with static text under `prefers-reduced-motion`.
- **Blink:** `.blink` emulates `<blink>` in oblique Courier, flashing four times (under five seconds) and not at all under reduced motion.
- **Ledgers:** tables with an `outset` frame, `inset` cells and a caption. They scroll horizontally inside `.ledger-wrap` on narrow screens.
- **Rules and fleurons:** `hr` is a groove; `hr.fleuron` prints ❦ ❦ ❦ before the footer.
- **Legend:** on Unglish a, the artwork's key is drawn like a map legend: a double-ruled frame with "Legend" boxed into its top edge, and each entry paired with a sample (the nonce word *wug*, shown plain, vulgar red and common-word solid, a row of note boxes, and `<kbd>` keycaps) styled as the minted artwork draws it.
- **Mint-open sunburst:** on Unglish a, a rotated (13°) link to the open baglish sale, overhanging the specimen's top-right corner, dressed as a Las Vegas sign: a hand-jittered 18-point `clip-path` star of conic rays behind a red disc ringed with thirty bulbs, every third lit and chasing round (`steps(3)`, quicker on hover). Yellow Impact capitals flash white at 2 Hz and the sign twitches between 13° and 10°, all under the WCAG 3-flashes-a-second limit. It runs continuously, so the page's "Hold still" button pauses it (WCAG 2.2.2), and it stands still under reduced motion. Its overhang is tied to the page padding so it never causes horizontal scrolling.
- **Hit counter:** a six-cell odometer (lime Courier letters in black inset cells) counting this browser's visits in `localStorage`, written in base IDGAF (`assets/idgaf.mjs`) with the base-ten figure alongside. The FAQ defines only a … u, ab; the counter extends it by alternating vowel and consonant places, least significant on the left, with no zero (uz → aba). Blank cells are the unused higher places. The wording says plainly that nobody else is counting; a site-wide count would need a server and is deliberately absent. Screen readers get the plain number.
- **Colophon:** italic `<address>`, last-revised date and two CSS 88×31 badges.

## Colour

Light mode is whitesmoke paper-white with near-black ink, maroon headings and browser-blue links with visited purple. Dark mode is black with whitesmoke ink, amber headings and the original site's lightseagreen links. Gold (dark: orange) is reserved for the construction tape and text selection; green (dark: lime) for blinking notices.

## Rules

- **Do** keep links underlined; hover switches to a wavy underline.
- **Do** keep native controls, `details` disclosures and visible keyboard focus.
- **Do** give every moving or blinking thing a stop: hover, button, time limit and reduced-motion handling.
- **Do** keep the humour in the copy and the period fittings, and keep claims (sale status, dates) factual and dated.
- **Don't** add web fonts, images for decoration, frameworks or contemporary card/landing-page polish.
- **Don't** turn it into a refined print-reference-book layout; this is a homepage, not a monograph.
