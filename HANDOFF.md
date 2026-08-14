# Blesspoke — handoff

Rewritten 14 Aug 2026, after the session that acted on the previous handoff's
two priorities. Everything an incoming agent needs to continue without
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
- "The hero section is nice and lively but the rest of the sections are not
  really lively. we have to make people go WOW. even in the hero section. Like
  they hired the most expensive design firm that is the best in the world,
  world class."
- "see the canto there are a lot of info on dennis Lau as well look at his
  profile, his uploads samples, youtube etc. social medias, etc. more content
  for this new site."

**The last two were the previous handoff's priority one and two. Both have now
been acted on — see §8 for what landed and §9 for what is still open.**

---

## 2. Where things are, and how to run it

```
/home/malkuth/projects/blesspoke-v2      <- THIS project. All work happens here.
/home/malkuth/projects/creators-platform <- "canto", the previous project. Source of Dennis content.
```

```bash
cd /home/malkuth/projects/blesspoke-v2
npm install          # already done
npm run dev          # Vite on http://localhost:4300/blesspoke/
npm run build        # tsc -b && vite build && cp dist/index.html dist/404.html
npx tsc -b           # typecheck only
```

**A dev server may already be running on port 4300.** Check before starting
another. Routes:

| Route | Page |
|---|---|
| `/blesspoke/` | Chooser — proof sheet of all three concepts |
| `/blesspoke/phoenix` | Concept 01 |
| `/blesspoke/dragon` | Concept 02 |
| `/blesspoke/chosen` | Concept 03 |

### State of the tree

- `tsc -b` clean, `npm run build` green.
- **It is now a git repository** with four commits. There is an undo.
- Nothing has been pushed anywhere. No GitHub repo named `blesspoke` exists.
  `vite.config.ts` sets `base: "/blesspoke/"` in anticipation of GitHub Pages at
  `<user>.github.io/blesspoke/`, and the build copies `index.html` to `404.html`
  for SPA routing. **`index.html` currently hardcodes
  `https://fulldevstack2.github.io/blesspoke/` in the og:url and og:image tags**,
  inferred from the canto repo being `fulldevstack2/canto`. Scrapers will not
  resolve a relative og:image, so it had to be absolute — but confirm the origin
  with the user and correct it before anyone shares a link.
- Confirm with the user before creating a repo or deploying.

### Why `blesspoke-v2` and not `blesspoke`

A **different Cursor agent was working concurrently** in a directory called
`blesspoke`. The user chose "Scrap it and let me rebuild Blesspoke from scratch
my own way," so this clean directory was created. If you find a
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
                              [data-reveal] choreography, .reel-* and .film-*
                              mechanics, .skip-link, reduced-motion policy
  content/
    dennis.ts                 Facts: artist, violins, credentials, tallies,
                              training, milestones
    commission.ts             promise, steps, rights, tiers, proof, commission,
                              service
    media.ts                  Photo records with src/dimensions/alt/credit
    work.ts                   Ten demos, three films, socials, client words
  lib/
    ScrollStage.tsx           Pinned scroll track -> progress
    SceneCanvas.tsx           WebGL host: frame loop, resize, dispose
    audioContext.ts           One shared AudioContext for the whole site
    plucker.ts                Karplus-Strong plucked-string synth
    useFonts.ts               Per-concept Google Fonts injection
    useScrollReveal.ts        [data-reveal] entrances, one observer per page
    useParallax.ts            [data-parallax] drift inside a clipped frame
    prefersReducedMotion.ts
  components/
    ConceptChrome.tsx         Fixed top bar + bottom concept switcher
    Stave.tsx                 Real 5-line stave, drawn in SVG
    StringRow.tsx             Four clickable violin strings
    Reel.tsx                  The ten commissions, playable, with a live scope
    Films.tsx                 Click-to-load YouTube posters
    Tally.tsx                 A figure that counts up when scrolled to
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
- All three concepts use `vh={420}` and `cuts={4}`.

### `SceneCanvas` — the WebGL host

A scene factory receives `{ canvas, reducedMotion }` and returns a `SceneHandle`
with `render(progress, elapsed)`, `resize(w, h, dpr)` and `dispose()`.
`SceneCanvas` owns the rAF loop, a `ResizeObserver`, an `IntersectionObserver`
that pauses rendering off-screen, and teardown. If WebGL construction throws it
hides the canvas and the HTML underneath still reads. `label` is the screen
reader description — every scene must have a real one.

### The choreography layer — read this before adding motion

`useScrollReveal(ref)` is called once per page on `<main>`. It walks the subtree
for `[data-reveal]`, sets `--reveal-i` so siblings stagger, and flips
`data-revealed="true"` when each enters. Elements reveal **once** and stay
revealed — re-hiding on the way back up is the tell of a demo.

Flavours live in `base.css`: bare `data-reveal` rises and fades, `data-reveal="wipe"`
clips up from the bottom (for photography), `data-reveal="line"` draws from the
left (for rules). Concepts refine these under their own scope, and all three do
— see §6.

**Two observer subtleties that cost real debugging time. Do not undo them:**

1. **`threshold` must stay 0.** A `wipe` sets `clip-path: inset(0 0 100% 0)` on
   itself, which zeroes its own intersection *ratio* while `isIntersecting`
   stays true. Any threshold above zero can never be met, and the element sits
   invisible forever. All the timing comes from `rootMargin` instead.
2. **`rootMargin` opens the top by 100000px.** Otherwise anything scrolled
   *past* — via a deep link, restored scroll position, or the End key — never
   intersects, never reveals, and is blank if the reader scrolls back up.

`useParallax(ref)` drifts `[data-parallax]` pictures inside their own clipped
frames, writing `--shift` (-1 → 1) straight to the element from a frame loop,
never through React state. Phoenix and Chosen use it. **Dragon deliberately does
not** — its photographs are multiplied into the paper with real alpha and have
no frame to move within, so that concept does its work with ink instead.

`Tally` counts a figure up the first time it is scrolled to. It parses display
strings (`"10,000+"`, `"4.98"`, `"USD 2,500"`), preserves prefix, suffix,
decimals and grouping, and simply prints anything with no digits in it (`"Five"`).
Content files never have to know it exists.

### Reduced motion policy

The pinned stage is **kept** under `prefers-reduced-motion` because it advances
only as fast as the user scrolls — it is direct manipulation, not autoplay. What
gets switched off is idle drift inside the scenes (`reducedMotion` freezes the
`uTime` uniform), the reveal transitions (everything is revealed immediately),
the count-up (final values print at once), the parallax, and the reel's scope
canvas. Verified: nothing is left invisible on any of the three concepts.
Preserve this reasoning if you touch it; it is written in a comment in
`base.css`.

---

## 5. The musical layer

Four shared pieces. They are styled per-concept by scoping CSS under
`.phoenix` / `.dragon` / `.chosen`.

### `lib/plucker.ts` + `components/StringRow.tsx`

A **Karplus-Strong** plucked-string synthesiser. Excite a buffer of length
`sampleRate / frequency` with noise, then feed it back through a two-tap average
so it loses high partials the way a real string does.

- **No audio files.** Nothing plays until the user clicks a string.
- `violinStrings` exports real open-string tuning: G3 196.00, D4 293.66,
  A4 440.00, E5 659.25 Hz.
- `<StringRow caption="..." readout="note" | "frequency" />` — Phoenix and
  Dragon show note names, Chosen shows Hz because it is the technical concept.

### `components/Reel.tsx` — the ten commissions

The biggest content win on the site and its second moment of spectacle. Ten real
commissioned demos, playable, with a scope that draws the signal as it arrives —
the song is written across the panel while you listen, which is the same gesture
the site is selling.

- One `<audio>` element with `preload="none"`. Nothing is fetched until asked.
- Routed through Web Audio to an `AnalyserNode`. **A media element gets exactly
  one `MediaElementAudioSourceNode` for its lifetime** — asking twice throws,
  which is why `connect()` guards on a ref.
- The scope is a plain 2D canvas keeping a 220-column ring buffer of peak
  amplitude — about 3.7 seconds, roughly one phrase. The trace never thins past
  a hairline, so at rest it reads as an instrument idling rather than a blank
  box.
- **Canvas cannot resolve `var()`.** `--reel-trace` and `--reel-edge` are written
  out as full `oklch()` literals in each concept's stylesheet. This is the one
  sanctioned place a colour is repeated rather than referenced.
- The played fraction goes onto the reel as `--played` from the frame loop, and
  again from `timeupdate` so it stays honest when the loop is not running.
- `index` prop lets a concept renumber the rows; Chosen passes `04.NN` part
  codes.

### `components/Films.tsx`

Three YouTube films. Poster frames are served from this site and **nothing is
requested from YouTube until someone presses play**, at which point it loads a
`youtube-nocookie` embed. Same rule as the strings and the reel.

### `components/Stave.tsx`

A real five-line stave in plain SVG carrying a real nine-note phrase
(`commissionPhrase`), with a time signature and an optional tempo marking. Used
where a section needed a horizontal rule anyway, so the notation **replaces**
the rule rather than sitting on top of it as an ornament.

### Other musical texture

- Italian performance markings on the four commission steps: `rubato`,
  `con sordino`, `una corda`, `sempre` (in `content/commission.ts`).
- Phoenix section eyebrows are movements: "Movement I" … "Coda".
- Dragon numbers its eight sections with Chinese numerals 一二三四五六七八.
- Tempo marking "Adagio · quarter note = 58" on all three.

---

## 6. The three concepts

All three share content and structure-of-argument, and differ in palette,
typography, **layout structure**, WebGL technique, **and reveal choreography**.
That last one matters: the mechanism is shared, the feel is not.

### 01 Phoenix — "Gilded" (dark)

- **Object:** a gold-leaf lacquer screen, a velvet-lined flight case.
- **Palette:** lacquer `oklch(14% 0.014 48)`, 24K gold `oklch(78% 0.13 85)`,
  ivory `oklch(93% 0.012 85)`.
- **Type:** Italiana (display) + Commissioner (body).
- **Layout:** stacked editorial, six movements and a coda.
- **Scene:** line geometry morph in a **vertex shader**. A gilded plume scatters
  into gold dust and draws back together into a single vibrating string.
- **Choreography:** the long default drift. Photographs wipe up and then parallax
  inside their frames.
- **Happy accident worth keeping:** the real Phoenix violin is literally a carved
  gold feathered wing, so the drawn plume and the photograph rhyme.
- Body weight is `360` and line-height `1.74` — light type on a dark ground reads
  thinner than it measures.

### 02 Dragon — "Ink and jade" (light) — the only daylight concept

- **Object:** an ink-wash hand scroll, a jade seal pressed in cinnabar.
- **Palette:** rice paper `oklch(95% 0.012 85)`, ink `oklch(25% 0.014 250)`,
  jade `oklch(54% 0.078 165)`, cinnabar `oklch(50% 0.19 32)`.
- **Type:** Faustina (display) + Hanken Grotesk (body) + Ma Shan Zheng (brush
  script, for 刘凯彦 and the seal).
- **Layout:** hand-scroll marginalia. Chinese numerals and section labels sit out
  in the left margin; text runs in one measured column.
- **Scene:** full-screen **fragment shader**. Domain-warped fbm ink blooms in
  water, then gathers into **two violin f-holes**, edge-perturbed by the noise
  field so it stays brushed rather than vector-sharp.
- **Choreography:** ink settles. Headings, the artist's name, photographs and
  film stills come out of a 7px blur. Kept to those four because a blur filter on
  every revealed element at once is more than the paint budget will carry.
- The reel draws its trace in ink and its playhead in cinnabar — the two inks the
  design already owns.
- Paper grain is an inline `feTurbulence` SVG data URI at 5% opacity.
- Photography uses `mix-blend-mode: multiply` so studio backgrounds drop out.

### 03 Chosen — "Carbon" (dark)

- **Object:** a carbon-fibre instrument in a machined case.
- **Palette:** graphite `oklch(19% 0.006 250)`, silver `oklch(86% 0.004 250)`,
  ember `oklch(66% 0.17 44)`.
- **Type:** Anybody (variable **width** axis) + Public Sans (body) + Martian Mono
  (all labels and measurements).
- **Layout:** a specification sheet. `§01`–`§08` reference codes, hairline-gridded
  blocks, `decimal-leading-zero` counters.
- **Scene:** **instanced point cloud + line segments**, 9,000 points, lifting off
  a flat measured drawing into a teardrop solid of revolution while an ember scan
  line runs the body. Points are squares, not discs: a machined object, not a
  spark.
- **Choreography:** mechanical. Shorter travel, quicker settle — a measuring
  instrument snapping to a value rather than something drifting into place.
- The reel's playhead is the same ember scan line the hero assembly uses, and the
  catalogue rows are numbered `04.01`–`04.10` like a parts list.

---

## 7. Assets and provenance

`public/dennis/` — all WebP, all optimised with Pillow.

| File | Size | Source | Licence |
|---|---|---|---|
| `dennis-phoenix-live.webp` | 800×800 | Wikimedia Commons `Dennis_Lau.png` | **CC0** |
| `dennis-portrait-crop.webp` | 400×400 | tight crop of the same CC0 frame | **CC0** |
| `dennis-press.webp` | 1000×1000 | canto's `artists/dennis-lau.jpg` | official Mosaic press portrait |
| `violin-phoenix.webp` | 1600×1067 | his official site | press photo, instrument by Alistair Hay |
| `dennis-seated.webp` | 1000×1123 | his official site | press photo |
| `dennis-cutout.webp` | 1000×1500 | his official site | press photo, **has real alpha** |
| `album-the-journey.webp` | 800×800 | his official site | album art, 2015 |

`public/films/` — `denza.webp`, `seafood.webp`, `theo.webp`, all 1280×720 poster
frames pulled from YouTube and re-encoded. `theo.webp` is pillarboxed because the
source video is 1:1; cropping it to the content would cut the title card, so it
is left alone and the black frame absorbs it.

`public/audio/` — the ten demos, **39 MB, shipped as the original 192 kbps MP3s,
untranscoded**. That was a deliberate call: this site's whole pitch is production
quality, and generational loss on a music producer's own demo reel undermines it.
Nothing downloads until someone presses play (`preload="none"`), and MP3 streams
progressively, so page weight is unaffected. If bandwidth ever becomes a problem,
transcoding to ~128 kbps VBR roughly halves it — but treat that as the user's
call, not a default.

`public/icon.svg` — four bars, the open strings at the heights of a signal.
`public/og.jpg` — 1200×630, typeset in the real Italiana by rendering an HTML
page in Playwright and screenshotting it, rather than mocked up in an image
editor. The generator is not checked in; regenerate the same way if the copy
changes.

Notes:

- Credits are rendered on the page, not buried in code. `content/media.ts`
  carries `alt` and `credit` per photo; keep that discipline.
- `violin-phoenix.webp` is on **pure #000**, so the Phoenix plate band uses `#000`
  deliberately and feathers into the lacquer at the edges. That is the one
  sanctioned use of pure black.
- A group finale shot was downloaded and then **deleted** because it featured
  other performers, which violates "no other artist".
- Everything is sourced from Dennis's own press library or CC0. **Do not
  substitute AI-generated imagery** — the user rejected AI-looking portraits
  explicitly and at length on the previous project.

---

## 8. What is done

Everything from the previous handoff, plus both of its priorities.

**Was already done:** scaffold, routing, build pipeline, GitHub Pages base path
and 404 fallback; the shared content model; `ScrollStage`, `SceneCanvas`,
`useFonts`, `prefersReducedMotion`; `plucker.ts`, `StringRow`, `Stave`; all three
concepts complete end to end; the chooser page.

**Landed this session:**

- **Git.** Four commits. There is an undo.
- **The real commercial terms.** `commission.ts` no longer invents anything. USD
  2,500 for a full song, from USD 1,500 for a track, **guaranteed in seven days
  or less**, two revisions, 100% copyright and masters. The old RM 8,800 /
  six-to-ten-weeks figures were placeholders and threw away the strongest proof
  point Dennis has. Also added: `tiers`, `proof` (420 commissions, 99% completion,
  4.98 rating, 5-day average) and `service`, his own positioning copy.
- **`content/work.ts`** — ten demos, three films, five socials, two client
  reviews, with real measured durations.
- **The reel**, on all three concepts, with a live scope. Verified playing,
  seeking, switching tracks and advancing on end.
- **The films**, click-to-load, on all three concepts.
- **Scroll choreography** — `useScrollReveal` + `Tally` + `useParallax`, applied
  across every section of all three concepts and flavoured per concept.
- **Favicon, OG image, Twitter card, theme-color.**
- Chosen's photo treatment dropped to `brightness(0.8)` as the previous handoff
  asked.
- CJK fallback stacks on all three concepts.

**Verified, not assumed:**

- `tsc -b` clean, `npm run build` green.
- Zero horizontal overflow and zero stuck reveals at **320 px and 390 px** on all
  four routes, checked programmatically by walking every element's bounding box.
- No console or page errors on any route.
- Reduced motion leaves nothing invisible on any concept and prints final figures.
- Audio actually plays, the scope actually draws, and track switching works.

---

## 9. What is NOT done — your work queue

### 9a. Content decisions that need the user, not an agent

- **Confirm the deploy origin.** `index.html` guesses
  `fulldevstack2.github.io/blesspoke`. Wrong origin means broken link previews.
- **The two client reviews in `work.ts`** came from canto and are attributed to
  "Brand film lead" and "Mei & Arun". Confirm they are real and cleared for
  publication before this goes anywhere public.
- **Deliberately not used, and keep it that way unless the user says otherwise:**
  his collaborator names (David Tao, Lee Hom, Siti Nurhaliza, Namewee and
  others). It reads as a roster and the user was emphatic. For the same reason,
  demos commissioned *by performers* describe the client rather than naming them
  ("the champion of The Voice Asia"), while brand clients are named outright,
  because that is credit rather than a roster. The reasoning is in a comment at
  the top of `work.ts`.

### 9b. Remaining "wow" ideas, in the order I would do them

The heroes and the reel are now the two spectacle moments, and every section
below the fold moves. What is still on the table from the original list:

- **A real page transition** between chooser and concept, and between concepts.
  This is the most conspicuous remaining gap — the routes currently hard-cut.
- **Cursor-aware detail on desktop**: the Phoenix gold seam catching a highlight,
  Chosen's grid illuminating locally. Nothing exists for this yet.
- **A third WebGL moment mid-page** — Phoenix gold dust reforming behind the
  deed, Dragon ink bleeding into the margin, Chosen an exploded axonometric
  beside the spec rows. Note the reel already supplies a second moment, so weigh
  whether a third earns its place or just adds noise.
- **Audio-reactive elements beyond the reel** — the plucked strings could drive
  a waveform of their own.

Keep the "atas" register. World-class does not mean busy — it means every
transition is considered, nothing is default, and the restraint reads as
confidence. Do not turn it into a parallax demo.

### 9c. Smaller open items

- The fixed `ConceptChrome` bar overlaps large display type when it scrolls past.
  Phoenix uses `mix-blend-mode: difference` so it stays legible, but it is
  untidy. Consider auto-hiding on scroll down.
- The Dragon `一` numeral renders as a lone horizontal stroke, which is correct
  Chinese but can look like a stray mark in the margin.
- The Stave phrase is decorative-but-real; it could encode an actual motif from
  one of Dennis's songs.
- Test on a real phone. Only headless Chromium at 320/390 px has been checked,
  and **this machine has no CJK fonts installed at all** (`fc-list :lang=zh`
  returns nothing), so every Chinese glyph renders as tofu here. The fallback
  stacks are in place, but the Chinese has never actually been *seen* rendered.
  Check it somewhere with CJK fonts before showing the user.
- Lighthouse/performance pass. Three.js is a 464 KB chunk (116 KB gzipped) —
  already manually chunked, but consider lazy-loading scenes per route.
- The chooser page has not been given any of the new content. It still works and
  its figures are correct, but it could carry a line about the reel.

### 9d. Parked — not part of Blesspoke

The user's earlier message also recapped an **Admin Portal for Lumo** (Dashboard,
Users List, Transactions, Network/Affiliates/Franchise trees). That is a
**different project** and was a recap, not a Blesspoke requirement. Do not build
it here. Lumo has its own repo and its own standing rules.

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
- Meaningful commit messages.

Style conventions in this repo specifically:

- Colours in `oklch()`, always. The one exception is `--reel-trace` /
  `--reel-edge`, which must be literals because canvas cannot resolve `var()`.
- Spacing from the `--space-*` scale in `base.css`; no magic pixel values.
- Easings from the `--ease-*` tokens.
- **Shared component mechanics go in `base.css`; skins go in the concept
  stylesheet, scoped under `.phoenix` / `.dragon` / `.chosen`.** That is how one
  `Reel` renders three different ways. Follow it for anything new.
- Every image carries explicit `width`/`height` (CLS) and real `alt`.
- Every canvas carries a real `aria-label` describing what it shows.
- Anything that makes sound or fetches from a third party waits for a click.

---

## 11. How to continue in Claude CLI

```bash
cd /home/malkuth/projects/blesspoke-v2
claude
```

Paste this as the first message:

> Read HANDOFF.md in this repo end to end before doing anything, then tell me
> what you think the highest-value next move is.
>
> Context: this is Blesspoke, a premium single-artist commission site for Dennis
> Lau. Three standalone design concepts (Phoenix, Dragon, Chosen) are built and
> working, all three now carry the real content and a playable reel of ten real
> commissions, and every section below the fold has scroll choreography. Run
> `npm run dev` and look at all four routes on http://localhost:4300/blesspoke/
> before you form an opinion.
>
> The remaining work is in section 9 of HANDOFF.md. The biggest conspicuous gap
> is that the routes hard-cut between each other with no page transition.
>
> Constraints that are non-negotiable: Dennis is the only artist — no roster, no
> collaborator name-drops. No AI-generated imagery. Hand-built WebGL only, no
> Spline, no animation libraries. No `as any`. Stay DRY across the three
> concepts, and keep shared mechanics in base.css with skins in the concept
> stylesheets.

### Useful facts to hand it

- Dev server: `npm run dev` → http://localhost:4300/blesspoke/
- Typecheck: `npx tsc -b` · Build: `npm run build`
- Canto repo on GitHub is `fulldevstack2/canto`, deployed via GitHub Pages.
- No `blesspoke` GitHub repo exists yet — ask the user before creating one.
- Playwright and Chromium are installed under `creators-platform/node_modules`
  and `~/.cache/ms-playwright`, which is how the overflow, reveal and reduced-
  motion checks in §8 were run. Import it as
  `/home/malkuth/projects/creators-platform/node_modules/playwright/index.mjs`.
