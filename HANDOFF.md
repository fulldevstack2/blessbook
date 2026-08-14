# Blesspoke — handoff

Written 14 Aug 2026. Everything an incoming agent needs to continue without
re-deriving context. Read this top to bottom once before touching anything.

---

## 1. What this is

**Blesspoke** is a premium single-artist commission site for **Dennis Lau
(刘凯彦)**, Malaysia's foremost electric violinist, composer and producer.

The whole product is three lines:

| Line | Copy |
|---|---|
| Headline | Create your own song |
| The ask | 1 prompt · 1 request |
| The deed | Song ownership is yours |

A client writes one paragraph. Dennis writes and produces one song. Full
copyright and master transfer to the client. No roster, no other artists —
**Dennis is the only artist on the site.** That constraint is explicit and
repeated by the user; do not add a roster, testimonials from other performers,
or a "featured artists" section.

### Deliverable

**Three complete, standalone design concepts** — not three sections of one page.
The user picks a winner, and that one becomes Blesspoke. They are named after
the three custom violins Alistair Hay of Emerald Guitars built to Dennis's own
drawings: **Phoenix**, **Dragon**, **Chosen**.

### Non-negotiables from the user, verbatim

- "Make it very atas" (Malay/KL slang: high-class, upmarket, classy).
- "Can ask ai put more musical elements in it?"
- "Also no other artist. Main chef is dennis."
- "I think they want scroll video effect thing" — resolved with the user to
  **hand-built WebGL/Three.js**, not a video scrub, not Spline. Real code we
  control.
- "Remember to be musical, and find images of Dennis Lau and add it to the
  site. It's his site, we're selling his premium skills on a premium website
  designs... his talents, his instruments, everything about him."
- **Newest, and the main open work:** "The hero section is nice and lively but
  the rest of the sections are not really lively. we have to make people go
  WOW. even in the hero section. Like they hired the most expensive design firm
  that is the best in the world, world class."
- **Also newest:** "see the canto there are a lot of info on dennis Lau as well
  look at his profile, his uploads samples, youtube etc. social medias, etc.
  more content for this new site."

---

## 2. Where things are, and how to run it

```
/home/malkuth/projects/blesspoke-v2      <- THIS project. All work happens here.
/home/malkuth/projects/creators-platform <- "canto", the previous project. Source of Dennis content.
```

```bash
cd /home/malkuth/projects/blesspoke-v2
npm install          # already done; node_modules is 117M
npm run dev          # Vite on http://localhost:4300/blesspoke/
npm run build        # tsc -b && vite build && cp dist/index.html dist/404.html
npx tsc -b           # typecheck only
```

**A dev server is already running on port 4300** (pid 283350). Check before
starting another. Routes:

| Route | Page |
|---|---|
| `/blesspoke/` | Chooser — proof sheet of all three concepts |
| `/blesspoke/phoenix` | Concept 01 |
| `/blesspoke/dragon` | Concept 02 |
| `/blesspoke/chosen` | Concept 03 |

### State of the tree

- `tsc -b` clean, `npm run build` green as of this writing.
- **NOT a git repository.** `git init` before doing anything large — there is
  currently no undo.
- Nothing has been pushed anywhere. No GitHub repo named `blesspoke` has been
  created by this agent. `vite.config.ts` sets `base: "/blesspoke/"` in
  anticipation of GitHub Pages at `<user>.github.io/blesspoke/`, and the build
  copies `index.html` to `404.html` for SPA routing. Confirm with the user
  before creating a repo or deploying.

### Why `blesspoke-v2` and not `blesspoke`

A **different Cursor agent was working concurrently** in a directory called
`blesspoke` — it had a dev server up and was modifying and deleting files. The
user was asked and chose "Scrap it and let me rebuild Blesspoke from scratch my
own way," so this clean directory was created. If you find a
`/home/malkuth/projects/blesspoke`, it is not ours; do not merge from it without
asking.

---

## 3. Stack

Vite 6 · React 19 · React Router 7 · TypeScript 5 (strict) · Three.js 0.170.
No CSS framework, no component library, no animation library. Everything is
hand-written CSS and hand-written GLSL. Keep it that way — the user is paying
for bespoke, and "avoid unnecessary dependencies" is a standing rule.

TypeScript config notes:

- `strict: true`, `exactOptionalPropertyTypes: true`, `noUnusedLocals`.
- `noUncheckedIndexedAccess` was **deliberately removed** — it forced dozens of
  non-null assertions in Three.js buffer loops for no safety gain.
- `"types": ["vite/client"]` is required for `import.meta.env.BASE_URL`.
- **Never use `as any`** (standing user rule). Model the type properly.

---

## 4. Architecture

Shared machinery, per-concept skins. Content lives in one place so the three
designs cannot drift apart factually.

```
src/
  main.tsx                    BrowserRouter with basename from BASE_URL
  App.tsx                     Routes + ScrollToTop
  styles/base.css             Reset, spacing scale, easings, .stage-* mechanics,
                              .skip-link, .visually-hidden, reduced-motion policy
  content/
    dennis.ts                 Facts: artist, violins, credentials, tallies,
                              training, milestones
    commission.ts             promise, steps, rights, commission terms
    media.ts                  Photo records with src/dimensions/alt/credit
  lib/
    ScrollStage.tsx           Pinned scroll track -> progress
    SceneCanvas.tsx           WebGL host: frame loop, resize, dispose
    plucker.ts                Karplus-Strong plucked-string synth
    useFonts.ts               Per-concept Google Fonts injection
    prefersReducedMotion.ts
  components/
    ConceptChrome.tsx         Fixed top bar + bottom concept switcher
    Stave.tsx                 Real 5-line stave, drawn in SVG
    StringRow.tsx             Four clickable violin strings
  concepts/
    registry.ts               Concept metadata: names, fonts, swatches, instrument
    phoenix/  PhoenixPage.tsx  phoenix.css  phoenixScene.ts
    dragon/   DragonPage.tsx   dragon.css   dragonScene.ts
    chosen/   ChosenPage.tsx   chosen.css   chosenScene.ts
  pages/
    ChooserPage.tsx  chooser.css
```

### `ScrollStage` — the scroll engine

```tsx
<ScrollStage vh={420} cuts={4} className="phoenix-stage">
  {({ stage, progress }) => ( ... )}
</ScrollStage>
```

- Renders a `vh`-tall `.stage-track` containing a sticky viewport-height
  `.stage-pin`.
- Publishes scroll two ways: a `--p` CSS custom property on the pin (0→1, 4dp),
  and `progress`, a `RefObject<number>`.
- **`progress` is a ref, not state.** Read it inside animation frames only. If
  you need scroll progress as rendered text, use `stage` (the discrete cut
  index) — that is the only thing that goes through React state, deliberately,
  so scrolling does not re-render the tree every frame.
- All three concepts currently use `vh={420}` and `cuts={4}`.

### `SceneCanvas` — the WebGL host

```tsx
<SceneCanvas factory={createPhoenixScene} progress={progress} label="..." />
```

A scene factory receives `{ canvas, reducedMotion }` and returns a
`SceneHandle`:

```ts
interface SceneHandle {
  render(progress: number, elapsed: number): void;  // once per frame
  resize(width: number, height: number, dpr: number): void;
  dispose(): void;
}
```

`SceneCanvas` handles the rAF loop, `ResizeObserver`, an `IntersectionObserver`
that pauses rendering off-screen, and teardown. If WebGL construction throws it
hides the canvas and the HTML underneath still reads. `label` is the screen
reader description — every scene must have a real one.

### Reduced motion policy

The pinned stage is **kept** under `prefers-reduced-motion` because it advances
only as fast as the user scrolls — it is direct manipulation, not autoplay. What
gets switched off is idle drift inside the scenes (`reducedMotion` freezes the
`uTime` uniform). Preserve this reasoning if you touch it; it is written in a
comment in `base.css`.

---

## 5. The musical layer

The user asked twice for more musical elements. Three shared pieces exist. They
are styled per-concept by scoping CSS under `.phoenix` / `.dragon` / `.chosen`.

### `lib/plucker.ts` + `components/StringRow.tsx`

A **Karplus-Strong** plucked-string synthesiser. Excite a buffer of length
`sampleRate / frequency` with noise, then feed it back through a two-tap average
so it loses high partials the way a real string does. Through a lowpass and an
exponential gain decay.

- **No audio files.** Nothing plays until the user clicks a string.
- `violinStrings` exports real open-string tuning: G3 196.00, D4 293.66,
  A4 440.00, E5 659.25 Hz.
- `<StringRow caption="..." readout="note" | "frequency" />` — Phoenix and
  Dragon show note names, Chosen shows Hz because it is the technical concept.
- `AudioContext` is created lazily on first gesture (autoplay policy), and
  `window.webkitAudioContext` is declared in a `declare global` block.

### `components/Stave.tsx`

A real five-line stave in plain SVG carrying a real nine-note phrase
(`commissionPhrase`), with a time signature and an optional tempo marking. Used
where a section needed a horizontal rule anyway, so the notation **replaces**
the rule rather than sitting on top of it as an ornament. Noteheads, stems,
flags and ledger lines are drawn from `{ step, beats }` data. No music font
needed.

### Other musical texture already in place

- Italian performance markings on the four commission steps: `rubato`,
  `con sordino`, `una corda`, `sempre` (in `content/commission.ts`).
- Phoenix section eyebrows are movements: "Movement I — The only artist" …
  "Coda — Commission".
- Dragon numbers its sections with Chinese numerals 一二三四五.
- Tempo marking "Adagio · quarter note = 58" on all three.

---

## 6. The three concepts

All three share content and structure-of-argument, and differ in palette,
typography, **layout structure**, and WebGL technique. The three scenes
deliberately use three *different* rendering techniques.

### 01 Phoenix — "Gilded" (dark)

- **Object:** a gold-leaf lacquer screen, a velvet-lined flight case.
- **Palette:** lacquer `oklch(16% 0.018 40)`, 24K gold `oklch(78% 0.13 85)`,
  ivory `oklch(93% 0.014 85)`.
- **Type:** Italiana (display) + Commissioner (body).
- **Layout:** stacked editorial. Eyebrow, then content, full-width sections.
- **Scene technique:** line geometry morph in a **vertex shader**. A gilded
  plume scatters into gold dust and draws back together into a single vibrating
  string.
- **Happy accident worth keeping:** the real Phoenix violin is literally a
  carved gold feathered wing, so the drawn plume and the photograph rhyme. Lean
  into this.
- Body weight is `360` and line-height `1.74` — bumped from 300/1.68 because
  light type on a dark ground reads thinner than it measures and was showing
  subpixel colour fringing.

### 02 Dragon — "Ink and jade" (light) — the only daylight concept

- **Object:** an ink-wash hand scroll, a jade seal pressed in cinnabar.
- **Palette:** rice paper `oklch(95% 0.012 85)`, ink `oklch(25% 0.014 250)`,
  jade `oklch(54% 0.078 165)`, cinnabar `oklch(50% 0.19 32)`.
- **Type:** Faustina (display) + Hanken Grotesk (body) + Ma Shan Zheng (brush
  script, for 刘凯彦 and the seal).
- **Layout:** hand-scroll marginalia. Section labels and Chinese numerals sit
  out in a sticky left margin; text runs in one measured column.
- **Scene technique:** full-screen **fragment shader**. Domain-warped fbm ink
  blooms in water, then gathers and settles into **two violin f-holes** — an
  S-curved SDF slit with waist nicks and bulbs flared to opposite sides, edge-
  perturbed by the noise field so it stays brushed rather than vector-sharp.
- Paper grain is an inline `feTurbulence` SVG data URI at 5% opacity.
- Photography uses `mix-blend-mode: multiply` so studio backgrounds drop out and
  the photo behaves like something brushed onto the sheet.
- Bilingual brush marks in the hero: 为你写一首歌 / 一句话，一首歌 / 版权归你 /
  刘凯彦. Simplified Chinese, correct for Malaysia.

### 03 Chosen — "Carbon" (dark)

- **Object:** a carbon-fibre instrument in a machined case.
- **Palette:** graphite `oklch(19% 0.006 250)`, silver `oklch(86% 0.004 250)`,
  ember `oklch(66% 0.17 44)`.
- **Type:** Anybody (variable **width** axis — headings use `wdth 118`) +
  Public Sans (body) + Martian Mono (all labels and measurements).
- **Layout:** a specification sheet. `§01`–`§05` reference codes, numbered spec
  rows with `decimal-leading-zero` counters, hairline-gridded figure blocks.
- **Scene technique:** **instanced point cloud + line segments**, 9,000 points.
  They start as a flat measured drawing and lift off the sheet — staggered per
  point by a seed so it reads as an assembly, not a cross-fade — into a teardrop
  solid of revolution, while an ember scan line runs the body. Points are drawn
  as squares, not discs: it is a machined object, not a spark.
- The body offsets to the right on wide screens (`group.position.x = 0.95` when
  aspect > 1.15) so copy sits left, drawing right, like a real spec sheet.
- Background is a 2×2 CSS twill at the threshold of visibility — the material,
  not a texture.

---

## 7. Assets and provenance

`public/dennis/` — 432 KB total, all WebP, all optimised with Pillow.

| File | Size | Source | Licence |
|---|---|---|---|
| `dennis-phoenix-live.webp` | 800×800 | Wikimedia Commons `Dennis_Lau.png` | **CC0** — free anywhere |
| `dennis-portrait-crop.webp` | 400×400 | tight crop of the same CC0 frame | **CC0** |
| `violin-phoenix.webp` | 1600×1067 | his official site | press photo, instrument by Alistair Hay |
| `dennis-seated.webp` | 1000×1123 | his official site | press photo |
| `dennis-cutout.webp` | 1000×1500 | his official site | press photo, **has real alpha** |
| `album-the-journey.webp` | 800×800 | his official site | album art, 2015 |

Credits are rendered on the page, not buried in code. `content/media.ts` carries
`alt` and `credit` per photo; keep that discipline.

Notes:

- The CC0 photo came from the Commons API with `extmetadata`: artist "Mosaic
  Music Entertainment", CC0, dated 2023-11-01, described as "Dennis Lau performs
  with his iconic golden phoenix violin."
- `violin-phoenix.webp` is on **pure #000**. The Phoenix plate band therefore
  uses `#000` deliberately so the letterbox has no seam, then feathers into the
  lacquer at the left and right edges via a `::before` gradient. That is the one
  sanctioned use of pure black.
- `dennis-cutout.webp` alpha verified as a real 0–255 range, not opaque white.
- A group finale shot (`stage.jpg`) was downloaded and then **deleted** because
  it featured other performers, which violates "no other artist".
- Everything is deliberately sourced from Dennis's own press library or CC0.
  Do not substitute AI-generated imagery — the user rejected AI-looking
  portraits explicitly and at length on the previous project.

---

## 8. What is done

- Scaffold, routing, build pipeline, GitHub Pages base path and 404 fallback.
- Shared content model (`dennis.ts`, `commission.ts`, `media.ts`).
- `ScrollStage`, `SceneCanvas`, `useFonts`, `prefersReducedMotion`.
- Musical layer: `plucker.ts`, `StringRow`, `Stave`.
- **All three concepts are complete and working end to end** — hero scene plus
  full page of sections, each with its own photography treatment.
- Chooser page with a Dennis portrait bar, tallies, and three level-aligned
  specimen panels showing each palette and display face.
- Verified in-browser: all three heroes animate correctly across the full scroll
  range; f-hole resolution and point-cloud assembly both confirmed visually.
- **Zero horizontal overflow at 390 px on all four routes**, checked
  programmatically by walking every element's bounding box.
- `tsc -b` clean, `npm run build` green.

---

## 9. What is NOT done — this is your work queue

### 9a. PRIORITY ONE — "make people go WOW" beyond the hero

The user's exact words: *"The hero section is nice and lively but the rest of
the sections are not really lively. we have to make people go WOW. even in the
hero section. Like they hired the most expensive design firm that is the best in
the world, world class."*

Honest assessment of the current state: the heroes are strong, but **below the
fold all three concepts degrade into static typographic documents.** Sections
are well-set but inert — they fade in at best. There is no scroll choreography,
no motion, no second or third moment of spectacle. That is the gap.

Ideas that fit each concept without breaking its logic (pick and go deeper
rather than sprinkling all of them):

- **Scroll-linked section reveals with real choreography** — staggered line-by-
  line type reveals, clip-path wipes, mask reveals on photography. Use
  `IntersectionObserver` + CSS custom properties, or a shared
  `useScrollReveal` hook so it stays DRY across concepts.
- **A second WebGL moment mid-page**, not just the hero. Phoenix: gold dust
  reforming behind the deed. Dragon: ink bleeding into the margin as you pass.
  Chosen: an exploded axonometric of the instrument next to the spec rows.
- **Make the photography move** — parallax within the frame, duotone that shifts
  with scroll, the Dragon multiply-wash "painting itself" as it enters.
- **Audio-reactive elements.** The plucker already exists; the strings could
  drive a live waveform, and the section rules could be a real waveform of the
  plucked note.
- **Number and figure animation** — the tallies (57 songs, 10,000+ performances)
  should count up. Cheap, and it is the kind of thing that reads as expensive.
- **Cursor-aware detail** on desktop: the Phoenix gold seam catching a highlight,
  Chosen's grid illuminating locally.
- **A real page transition** between chooser and concept, and between concepts.
- Consider a `prefers-reduced-motion` path for every one of these. The existing
  policy (scroll-driven stays, idle drift goes) is a good rule to extend.

Keep the "atas" register. World-class does not mean busy — it means every
transition is considered, nothing is default, and the restraint reads as
confidence. Do not turn it into a parallax demo.

### 9b. PRIORITY TWO — pull the real Dennis content out of canto

The user: *"see the canto there are a lot of info on dennis Lau as well look at
his profile, his uploads samples, youtube etc. social medias, etc. more content
for this new site."*

Everything below is **real, already-cleared content** sitting in
`/home/malkuth/projects/creators-platform`. The Blesspoke content model
currently has none of it.

**Source of truth:** `creators-platform/src/lib/data.ts`, the `c-dennis` object
(around lines 64–239). Also `public/audio/CREDITS.md`.

**Ten real audio demos** in `creators-platform/public/audio/dennis/` (~40 MB
of MP3, 192 kbps — they will need trimming/compression before shipping):

| File | Title | Dur | Note |
|---|---|---|---|
| `shark-v3.mp3` | Shark V3 - Best of the Best | 1:39 | Cinematic trailer for a Shark game by Ammo Box Studios |
| `unmute-chloe.mp3` | Unmute (Chloe) Demo V4 | 3:31 | Taiwan pop R&B demo; melody/structure by Dennis |
| `suen-demo.mp3` | Suen Demo V4 | 4:15 | For SUEN, The Voice Asia Champion |
| `one-corsa.mp3` | One Corsa V1 | 1:24 | Brand music for luxury car importer ONE CORSA |
| `born-for-a-reason.mp3` | Born for a Reason | 4:32 | Personal milestone song for a 3rd birthday |
| `malay-indon-ballad.mp3` | Malay / Indon Pop Ballad Chorus | 1:12 | Music and lyrics by Dennis |
| `great-wall-v3.mp3` | The Great Wall V3 | 2:53 | Epic entrance theme |
| `great-wall-zh.mp3` | The Great Wall (Chinese) | 3:03 | Chinese version |
| `free-shipping-fun-shopping.mp3` | Free Shipping, Fun Shopping | 2:28 | TikTok Shop campaign demo |
| `vanessa-you-wo-ding.mp3` | Vanessa (由我定) | 3:23 | For Sing China Malaysia 1st runner-up |

This is the single biggest content win available: **a site selling commissioned
songs should let you hear commissioned songs.** A beautifully built player is
also a natural second "wow" moment, and it makes the site genuinely musical
rather than musically themed. Note the range these demos prove — game trailer,
luxury car brand, TikTok campaign, a child's birthday, Mandarin pop. That range
*is* the sales argument for "one prompt, any song".

**Three YouTube videos:**

- ONE SEAFOOD — 6 Michelin Star Chefs Event — `https://youtu.be/QGlYj8CrJ6E`
- DENZA Z9 GT launch at KLCC — `https://youtu.be/FtXeR3TTtbE`
- Heaven's Gift (天赐) — A Song for Theo Lau — `https://youtu.be/Dq52GzlIaAQ`

**Socials:**

- Website `https://dennislau.thechosen.io`
- Instagram `@dennisviolin`
- YouTube `DennisLauTV` (`https://www.youtube.com/@DennisLauTV`)
- Facebook `MosaicMusicEntertainment`
- X `dennislauviolin`

**Real commercial terms — these CONTRADICT what is currently in the code:**

| | Canto (real) | `blesspoke-v2/src/content/commission.ts` (invented) |
|---|---|---|
| Price | **USD 2,500** full original song (3–4 min); from USD 1,500 | RM 8,800 |
| Turnaround | **7 days or less, guaranteed** | "Six to ten weeks" |
| Revisions | 2 included | 1 |
| Rights | 100% copyright + masters + all commercial usage | matches |

**Fix `commission.ts` early.** The invented figures were placeholders and
"six to ten weeks" is not merely wrong, it throws away the strongest proof
point Dennis has — *guaranteed in seven days*. Also worth folding in: 99%
completion rate, 420 jobs, 4.98 rating, avg 5-day delivery.

**His real service description**, which is better positioning copy than anything
currently on the site, is the `bio` field in `data.ts` — "Bespoke Music
Composition and Production Service for brands, businesses, marketing campaigns,
tourism, luxury experiences, events, personal milestones, celebrations, and
corporate storytelling... Unlike stock music or generic licensed tracks, every
composition is exclusive."

Also available: `creators-platform/public/artists/dennis-lau.jpg` (240 KB
official Mosaic press portrait) and two client reviews.

Other facts already harvested from his official site and sitting in
`content/dennis.ts`: piano at 3, Grade 8 by 11, violin at 8, ATCL at 15, UCSI
Bachelor of Music (Newcastle program), ATCL/A.Mus.A/Dip ABRSM/LGSM(hons), LTCL
and FTCL Outstanding Performance from Trinity College London, 57 original songs,
10,000+ performances, five continents, three albums (DiversiFy 2009, DiversiFy
LE 2010, The Journey 2015), two sold-out 3,000-seat concerts (#DLThePhoenixRising
2016, #DLTheChosen 2019), TEDx speaker, acted in Nasi Lemak 2.0 and Hantu
Gangster, Teach For Malaysia work.

Deliberately **not** used, and you should keep it that way unless the user says
otherwise: his list of collaborator names (David Tao, Lee Hom, Siti Nurhaliza,
Namewee and others). It reads as a roster and the user was emphatic — "no other
artist."

### 9c. Smaller open items

- Init git. Seriously, do this first.
- The fixed `ConceptChrome` bar overlaps large display type when it scrolls
  past. Phoenix uses `mix-blend-mode: difference` so it stays legible, but it
  is untidy. Consider auto-hiding on scroll down.
- Chosen's photo treatment (`brightness(0.86)`) still reads a touch bright
  against the graphite. Minor.
- The Dragon `一` numeral renders as a lone horizontal stroke, which is correct
  Chinese but can look like a stray mark in the margin.
- No favicon asset exists yet; `index.html` references `/blesspoke/icon.svg`.
- No OG image, no meta beyond title and description.
- The Stave phrase is currently decorative-but-real; it could encode an actual
  motif from one of Dennis's songs.
- Verify at 320 px, and on a real phone. Only 390 px has been checked.
- Lighthouse/performance pass. Three.js is a 464 KB chunk (116 KB gzipped) —
  already manually chunked, but consider lazy-loading scenes per route.

### 9d. Parked — not part of Blesspoke

The user's long message also recapped an **Admin Portal for Lumo** (Dashboard
with top metrics, Users List, Transactions with withdrawals/bundle volume,
Network/Affiliates/Franchise tree and table views). That is a **different
project** and was a recap, not a Blesspoke requirement. Do not build it here.
Lumo has its own repo and its own standing rules.

---

## 10. Working agreements

From the user's global rules, all of which apply:

- DRY. Reuse what exists. Three concepts share one content model and one set of
  primitives on purpose — do not fork them.
- Follow the established patterns in this codebase rather than importing new
  ones.
- Never `as any`. Type things properly.
- Prefer small, verified increments; write the test or the check first where it
  makes sense.
- Comments explain intent, constraint or trade-off — never narrate the code.
  Existing comments follow this; match them.
- Meaningful commit messages.

Style conventions in this repo specifically:

- Colours in `oklch()`, always.
- Spacing from the `--space-*` scale in `base.css`; no magic pixel values.
- Easings from the `--ease-*` tokens.
- Concept CSS is scoped under `.phoenix` / `.dragon` / `.chosen`, including the
  shared components, which is how one `Stave` renders three different ways.
- Every image carries explicit `width`/`height` (CLS) and real `alt`.
- Every canvas carries a real `aria-label` describing what it shows.

---

## 11. How to continue in Claude CLI

```bash
cd /home/malkuth/projects/blesspoke-v2
claude
```

If you want it to move without permission prompts, the pattern already in use on
this machine is `claude --dangerously-skip-permissions`.

Paste this as the first message:

> Read HANDOFF.md in this repo end to end before doing anything, then confirm
> back to me what you understand the two priorities to be.
>
> Context: this is Blesspoke, a premium single-artist commission site for Dennis
> Lau. Three standalone design concepts (Phoenix, Dragon, Chosen) are already
> built and working — run `npm run dev` and look at all four routes on
> http://localhost:4300/blesspoke/ before you form an opinion. A dev server may
> already be running on 4300.
>
> Priority one: the heroes are strong but everything below the fold is inert. I
> want world-class — the kind of work the most expensive design firm on earth
> would deliver. Scroll choreography, a second moment of spectacle per concept,
> photography that moves, figures that count up. Not a parallax demo — restraint
> that reads as confidence. Keep it atas.
>
> Priority two: pull the real Dennis Lau content out of the canto project at
> /home/malkuth/projects/creators-platform — see section 9b of HANDOFF.md. Ten
> real audio demos, three YouTube videos, his socials, his real service copy,
> and his real commercial terms. Fix src/content/commission.ts first: the
> current RM 8,800 / six-to-ten-weeks figures are invented placeholders and the
> truth (USD 2,500, guaranteed in 7 days or less, 2 revisions) is both correct
> and a much stronger sell. A player for those ten demos is probably the single
> biggest win available.
>
> Constraints that are non-negotiable: Dennis is the only artist — no roster, no
> collaborator name-drops. No AI-generated imagery. Hand-built WebGL only, no
> Spline, no animation libraries. No `as any`. Stay DRY across the three
> concepts.
>
> Run `git init` and make a first commit before you start changing things —
> there is currently no version control and no undo.

### Useful facts to hand it

- Dev server: `npm run dev` → http://localhost:4300/blesspoke/
- Typecheck: `npx tsc -b` · Build: `npm run build`
- Canto repo on GitHub is `fulldevstack2/canto`, deployed via GitHub Pages.
- No `blesspoke` GitHub repo exists yet — ask the user before creating one.
