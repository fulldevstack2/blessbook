# Blesspoke — handoff

Rewritten 14 Aug 2026, then updated twice the same day: once when the user
settled the publishing question, and again after the **Dennis-first rebuild**
described in §1a — the largest change the project has had. Read §1a before
anything else; it overrides earlier framing wherever the two disagree. **This project is simply Blesspoke.** It is not a v2 and there is
nothing for it to be a second version of — the earlier attempt has been
scrapped (see §2). Everything an incoming agent needs to continue without
re-deriving context. Read this top to bottom once before touching anything.

---

## 1. What this is

**Blesspoke** is a premium single-artist commission site for **Dennis Lau
(刘凯彦)**, Malaysia's foremost electric violinist, composer and producer.

### 1a. The Dennis-first rebuild — read this first

The user's verdict on the previous build: *"we got it wrong we are promoting our
service first then dennis lau. the whole site is supposed to revolve first and
foremost about dennis lau and how he's awesome and amazing with all everything
that he is and his pictures and accolades and everything, and it just happens to
be this site you can also purchase song."*

Also, verbatim: the Phoenix and Dragon heroes were *"cool but it doesn't relate
to what the site is about, dennis lau and music, and ellegance, and
exclusivity"*, *"not world-class enough"*, *"chosen carbon is totally not
ellegant, replace it with something else"*, and the whole thing was *"lacking
soul."*

What that means for anyone working here:

1. **He leads, the commission closes.** Every concept runs: hero (him) →
   instrument and its provenance → who he is → the record → hear him → in the
   room → who books him → why he keeps going → *then* the commission as a coda.
   Do not move the commission back up the page.
2. **A hero must be about him, not a graphic.** Each hero now carries a
   photograph or a cut-out of Dennis, his name at the largest size on the page,
   and his own playing. The WebGL is layered *with* him, never instead of him.
3. **The motion comes from his violin.** `lib/listening.ts` is a shared analyser
   bus; every scene's `render(progress, elapsed, level)` receives his live
   signal, so the gold seam, the ink and the pearl all move because he is
   playing. This is verified, not asserted — see §8.
4. **Concept 03 is no longer carbon.** It is **Silk and pearl**: cream silk,
   pearl lustre, gold-thread hairlines, Bodoni Moda, a couture lookbook. It
   keeps the name *The Chosen* because that is his own line — "The Chosen One —
   born, raised and tuned to acquire excellence" — and couture *is* selection,
   which is also what a commission is. The carbon-fibre violin of the same name
   is still a fact and still appears; only the design language changed.
5. **Naming rule, decided by the user: provenance only.** Name the people who
   made something — Alistair Hay of Emerald Guitars, music director Aubrey
   Suwito, his teachers, the Wang Leehom guitar that started the Phoenix
   commission, orchestras, brand clients. Never a wall of singers he has backed;
   that reads as the roster this site refuses to have.

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

- "I think we got it wrong we are promoting our service first then dennis lau…
  Dennis lau has to be the main focus." (See §1a. This is now the governing
  instruction for the whole site.)
- "to get inspiration really understand dennis lau, his work, what he does,
  music and everything. it's lacking soul still."

**All of the above have been acted on — see §8 for what landed and §9 for what is
still open.**

---

## 2. Where things are, and how to run it

```
/home/malkuth/projects/blesspoke         <- THIS project. All work happens here.
/home/malkuth/projects/creators-platform <- "canto", the previous project. Local source of Dennis content.
```

```bash
cd /home/malkuth/projects/blesspoke
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
- **It is now a git repository.** There is an undo. `git log --oneline` is the
  fastest orientation to what landed when.
- **It is live at <https://fulldevstack2.github.io/blesspoke/>.** Pushing to
  `main` triggers `.github/workflows/deploy-pages.yml`, which builds and
  publishes to Pages. Pages `build_type` is `workflow`, not branch-serving.
- Deploy config lives in `.env` and is repeated explicitly in the workflow:
  `VITE_BASE` drives the base path and the icon href, `VITE_SITE_URL` drives the
  og:/twitter: origin. Both are set to the account above. Moving to a custom
  domain later means changing those two values and adding a CNAME, nothing else.
- The build copies `index.html` to `404.html` for SPA routing. **A deep route
  returns HTTP 404 with the app as its body** — that is the standard Pages SPA
  trick working as intended, not a fault.

### What was scrapped

An **earlier Blesspoke, built by a different Cursor agent**, occupied both this
directory and this repo. The user scrapped it — "it's really bad... I don't even
mind if you delete everything about it" — so its local directory was deleted and
`main` was force-pushed over with this project.

**It was not destroyed.** Its one commit is preserved on the
**`archive/cursor-build`** branch, because that commit's message is "Blesspoke:
atas scroll-cinema song commissioning platform **+ Lumo admin portal**" and it
became the only surviving copy of that Lumo work once the local directory went.
Delete the branch if the user confirms they want it gone.

> **Do not casually `git checkout archive/cursor-build`.** That commit *tracks
> `node_modules`*, so switching to it writes thousands of stale dependency files
> into the working tree and switching back does not fully clean them. If you
> ever need to read it, use `git show`/`git worktree` instead. This already bit
> once and cost a full `npm ci` to recover from.

Canto is still live at `https://fulldevstack2.github.io/canto/`
(`fulldevstack2/canto`). The user said they would unpublish it themselves;
**this agent did not touch that repo.** Canto stays on disk as the local source
of Dennis's content, which is fine — everything needed has already been copied
across and Blesspoke has no runtime dependency on it.

Note for anyone running git commands here: `git init` created **`master`**, which
was later renamed to `main` to match the remote. If a stale local `main` ever
reappears tracking an old remote, check `git branch -vv` before pushing.

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

### 03 Chosen — "Silk and pearl" (light)

**Replaced the carbon concept entirely on 14 Aug 2026.** The user's words:
*"chosen carbon is totally not ellegant, replace it with something else."* The
name survives because it is his own — "The Chosen One" — and because couture is
selection, which is exactly what a commission is. The carbon-fibre violin called
The Chosen is still listed as a fact in the instruments table.

- **Object:** a bolt of cream silk, a single pearl, one gold thread.
- **Palette:** silk `oklch(96% 0.008 85)`, pearl `oklch(89% 0.018 320)`, gold
  thread `oklch(76% 0.095 85)`, ink `oklch(23% 0.012 310)`.
- **Type:** Bodoni Moda (Didone display, optical sizing on) + Jost (body and
  every label, 300 weight, tracked wide). No mono anywhere — couture labels are
  letterspaced sans, not machine type.
- **Layout:** a lookbook. Numbered plates (`Plate I`–`Plate IV` in the hero,
  `I`–`VIII` down the page), garment-label tags with a gold-thread rule, care-label
  spec rows, and one centred creed page carrying his own line with nothing else
  on it.
- **Scene:** silk in a fragment shader — anisotropic weave stretched along the
  warp, a broad sheen crossing it, and from 40% scroll a **pearl** gathering out
  of the light: sphere normal recovered from the disc, off-centre specular, nacre
  fresnel rim, contact shadow so it sits on the cloth. Small on purpose. Its
  lustre rises with `uLevel` — when he plays, the silk catches more light.
- **Choreography:** slower and longer than the other two. Couture does not hurry.
- The figure in the hero is `dennis-cutout.webp` standing on the cloth. It has
  real alpha, so **no blend mode or filter is needed** — an earlier attempt used
  `invert(1)` and turned him into a photographic negative. Don't.

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
| `live-gold-violin.webp` | 1920×1080 | frame from his own concert film | The Phoenix Rising, 2016 |
| `stage-phoenix.webp` | 1920×1080 | frame from his own concert film | The Phoenix Rising, 2016 |
| `crowd.webp` | 1600×900 | frame from his own concert film | three thousand seats, 2016 |
| `live-blue.webp` | 1600×900 | frame from his own concert film | The Phoenix Rising, 2016 |
| `silhouette-sky.webp` | 1920×810 | frame from his own documentary | *The Phoenix Rising*, a film by Eugene Low |
| `portrait-mono.webp` | 1400×591 | frame from his own documentary | same |
| `portrait-mono-2.webp` | 1400×591 | frame from his own documentary | same |
| `poster-the-chosen.webp` | 921×682 | his official site | concert poster, 2019 |

**How the frames were chosen**, in case more are ever needed: `yt-dlp` at
`height<=1080` from his own channel, `ffmpeg` sampling every 4–6 s, contact
sheets assembled with Pillow to pick moments by eye, then each pick re-extracted
at five timestamps 0.2 s apart and scored by the variance of a Laplacian —
keeping the sharpest, because concert video is soft and motion-blurred more often
than not. The script is `process_media.py` in the session scratchpad; the method
matters more than the file.

`public/clients/` — **fourteen brand logos reduced to alpha-only silhouettes**
(`patek-philippe`, `porsche`, `mercedes`, `audi`, `honda`, `dunhill`, `chivas`,
`grand-hyatt`, `huawei`, `intel`, `nestle`, `maybank`, `maxis`, `sime-darby`),
harvested from the client wall on his own site. They carry no colour: each is a
coverage mask painted with `currentColor` through a CSS `mask-image`, so one asset
reads correctly on lacquer, on rice paper and on silk. Keying is by distance from
each logo's own corner-sampled background, which is the only rule that survives
transparent PNGs, dark-on-white JPEGs and white-on-coloured-field marks at once.
BMW and Samsung are **deliberately absent** — light marks inside a coloured field,
and they reduce to blobs.

`public/film/` — `showreel.mp4` (his own 2021 showreel, 10 MB, 1280×720, 67 s,
self-hosted and click-to-play), `showreel-loop.mp4` (532 KB, silent 14 s cut for
a hero background if one is ever wanted) and `showreel-poster.webp`. Self-hosted
rather than embedded: the films section can afford YouTube's player and cookie
banner, the showreel cannot.

`public/audio/the-journey-live.mp3` — **40 seconds of him playing live**, the
sound every hero is drawn by. Cut from the full 5:33 of *The Journey* at The
Phoenix Rising by scoring every 40-second window on RMS, spectral flatness and a
violin-band-to-bass ratio, then loudness-normalised to −16 LUFS with 2 s/3 s
fades. The window that won (249–289 s) is the climax. Worth knowing: that mix is
bass-heavy throughout, so the violin/bass ratio does *not* cleanly isolate violin
passages — don't trust it alone if you re-cut this.

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

**Landed in the Dennis-first rebuild (§1a):**

- **Research.** His record was read out of his own site, his Wikipedia entry and
  Emerald Guitars' account of the build, then written into `content/dennis.ts`:
  his mother the pianist, his violin teachers by name, 18 years / 10,000
  performances / 168,000 in his audiences / 57 songs / 10 awards / five
  continents, the awards themselves, the orchestras he played in before any of
  this, the twelve territories, the Donegal story, and both quotes — his
  soul-mate line and Alistair Hay's.
- **`content/clients.ts`** — the fourteen brands, and `clientWall` copy.
- **The four testimonials in `work.ts` are now real and attributed** (UCSI's
  chairman, Carlsberg Malaysia's MD, A Cut Above, The Factory Music Studio),
  taken from his own site. The two anonymous commission quotes inherited from
  canto were never verifiable and are gone.
- **`lib/listening.ts`** — one analyser bus for the site. `SceneHandle.render`
  gained a third argument, `level`. The reel's private analyser was deleted and
  it now feeds the same bus, so one element is never routed twice.
- **`components/Listen.tsx`** (40 s of him playing, in every hero),
  **`Showreel.tsx`** (his own reel, self-hosted, click-to-play) and
  **`ClientWall.tsx`** (masked logos, painted in each concept's ink).
- **All three heroes re-founded on him**, plus the chooser, which now opens with
  his name rather than the product's.
- **Concept 03 rebuilt** as Silk and pearl: new stylesheet, new scene, new page.
- **The fixed-chrome overlap is fixed** on all three concepts with a scrim in
  each one's own material. Note the mechanism: an absolutely positioned
  pseudo-element paints *above* in-flow content, so a scrim belongs on the stage
  layer under the hero, not on the hero itself. Getting that wrong dims the very
  words it is meant to protect.

**Verified, not assumed:**

- `tsc -b` clean, `npm run build` green.
- Zero page-level horizontal overflow and zero stuck reveals at **1440 px and
  390 px** on all four routes, checked programmatically by walking every
  element's bounding box. The hero plates report as overflowing their own box on
  purpose — they are scaled 1.04–1.06 and clipped by `.stage-pin`.
- No console or page errors on any route. One intermittent 404 from
  `fonts.gstatic.com` for a Martian Mono weight is Google's own stale CSS, not
  ours; the stack falls back and the chooser is the only page still asking for
  that family.
- Reduced motion leaves nothing invisible on any of the four routes.
- **The audio-reactive claim is measured, not asserted.** Clicking "Hear him
  play" on each concept starts `the-journey-live.mp3` and the WebGL canvas
  redraws: 99% of canvas bytes differ on Phoenix and Chosen, 62% on Dragon.
- **The Chinese has now actually been seen rendered.** Noto Sans SC was
  installed into `~/.local/share/fonts` on this machine, so 刘凯彦 and the brush
  phrases render in screenshots instead of tofu.

---

## 9. What is NOT done — your work queue

### 9a. Content decisions that need the user, not an agent

- **Unpublish canto** (`fulldevstack2/canto`), which the user is handling.
- **Decide whether `archive/cursor-build` can be deleted**, which depends on
  whether the Lumo admin portal work in it is still wanted.
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

- ~~The fixed `ConceptChrome` bar overlaps large display type.~~ **Fixed** — each
  concept now scrims behind it in its own ground colour.
- The Dragon `一` numeral renders as a lone horizontal stroke, which is correct
  Chinese but can look like a stray mark in the margin.
- The Stave phrase is decorative-but-real; it could encode an actual motif from
  one of Dennis's songs.
- Test on a real phone. Only headless Chromium at 390/1440 px has been checked.
  CJK now renders locally (Noto Sans SC is installed in
  `~/.local/share/fonts`), so the Chinese has been seen — but a real device is
  still a different thing.
- Lighthouse/performance pass. Three.js is a 464 KB chunk (116 KB gzipped) —
  already manually chunked, but consider lazy-loading scenes per route.
- The chooser now opens with him and carries his record, but it still has no
  photography beyond the press portrait and says nothing about the showreel.
- The Dragon `一` numeral note below still applies, and Dragon is the only concept
  whose hero photograph is a *treatment* (multiplied ink) rather than a
  photograph — if the user wants him recognisable there, it needs a second image.

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
cd /home/malkuth/projects/blesspoke
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
- Live at <https://fulldevstack2.github.io/blesspoke/>; push to `main` to
  deploy. `gh run list` and `gh run watch <id>` to follow it.
- Deploy config is `.env` plus the same two values in the workflow.
- Playwright and Chromium are installed under `creators-platform/node_modules`
  and `~/.cache/ms-playwright`, which is how the overflow, reveal and reduced-
  motion checks in §8 were run. Import it as
  `/home/malkuth/projects/creators-platform/node_modules/playwright/index.mjs`.
