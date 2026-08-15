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
| `/blesspoke/nocturne` | Concept 03 |

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
  App.tsx                     Routes + ScrollToTop + useSmoothScroll
  styles/base.css             Reset, spacing scale, easings, .stage-* mechanics,
                              [data-reveal] choreography, .reel-* and .film-*
                              mechanics, .skip-link, reduced-motion policy
  content/
    dennis.ts                 Facts: artist, violins, credentials, tallies,
                              training, milestones, territories (with lat/lon),
                              awards, halls, calling
    commission.ts             promise, steps, rights, tiers, proof, commission,
                              enquiry copy
    media.ts                  Photo records with src/dimensions/alt/credit
    work.ts                   Ten demos, three films, socials, client words
    clients.ts                Fourteen brand clients + alpha logo masks
  lib/
    ScrollStage.tsx           Pinned scroll track -> --p + a progress ref
    SceneCanvas.tsx           WebGL host: frame loop, resize, dispose
    audioContext.ts           One shared AudioContext for the whole site
    listening.ts              Single-player policy: play() pauses everything else
    peaks.ts                  Decodes a media file to N amplitude buckets,
                              offline, cached per URL. The real waveform.
    plucker.ts                Karplus-Strong plucked-string synth
    loadModel.ts              The three instrument .glb files, fetched once
                              each, centred, normalised, shared by all three
                              concepts. Also TURNED (the order the turned
                              section shows them in) and cue() (which one the
                              scroll is on), because the scene and the plate
                              beside it both have to agree about that
    enquiry.ts                Commission request state. SENDS NOTHING YET.
    useFonts.ts               Per-concept Google Fonts injection
    useTypeset.ts             Waits for named faces before the loader paints
    useReady.ts               Loader gate: a hold floor and a scroll lock
    useScrollReveal.ts        [data-reveal] entrances, one observer per page
    useParallax.ts            [data-parallax] drift, and --s for a section
    useSectionProgress.ts     --s for concepts that do not run the parallax pass
    useSmoothScroll.ts        Weighted scrolling via rAF + real window.scrollTo
    prefersReducedMotion.ts
  components/
    ConceptChrome.tsx         Fixed top bar + bottom concept switcher
    FilmScrub.tsx             Scroll-scrubbed WebP frame sequences, two tiers,
                              bounded decode window
    Showreel.tsx              Click-to-load local showreel
    Reel.tsx                  The ten commissions, playable, with a live scope
    NowPlaying.tsx  Volume.tsx  Listen.tsx   The sticky player
    StringRow.tsx             Four clickable violin strings
    Words.tsx                 Per-word reveal for display headings
    Cursor.tsx  Grain.tsx
  concepts/
    registry.ts               Concept metadata: order, ordinals, fonts, swatches
    phoenix/  PhoenixPage.tsx  phoenix.css  phoenixScene.ts  bandScene.ts
              instrumentScene.ts  parts.tsx  Films.tsx  Groove.tsx
    dragon/   DragonPage.tsx   dragon.css   dragonScene.ts  instrumentScene.ts
              parts.tsx  Territories.tsx  land.ts (generated)
    nocturne/ NocturnePage.tsx nocturne.css nocturneScene.ts instrumentScene.ts
              parts.tsx  House.tsx  house.ts (generated)
  pages/
    ChooserPage.tsx  chooser.css

public/model/*.glb            phoenix, dragon, chosen — 150k faces, ~2.7 MB each
source-models/                The 35-85 MB Meshy exports. Gitignored, never built.
src/content/waveform.ts       Generated. 900 peaks off the live recording.
```

Two modules are generated and must not be hand-edited: `dragon/land.ts` (world
landmass dots, from Natural Earth) and `nocturne/house.ts` (three thousand
seats). Both are one SVG path per group, using the fact that a zero-length
subpath with a round linecap paints a dot. Their generators are in the working
notes on `/mnt/d/blesspoke-sr`.

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

### Notation: removed on purpose

There used to be three notation pieces — `components/Stave.tsx`, Phoenix's
`Score.tsx` and `ScoreRail.tsx`, all fed by `content/score.ts`, which held a
melodic contour genuinely derived from the recording. **All four files are
deleted.** The user's reaction was the right one: *"Im sure those are not real
notes you use as the audio player track. looks cheap and not thought off well."*
Notation that no reader can check reads as a prop no matter how honest its
derivation, so the site does not draw music any more.

What replaced them:

- `lib/peaks.ts` — machinery. Fetches a media file, decodes it in an
  `OfflineAudioContext` (no gesture needed, no autoplay warning) and reduces it
  to N amplitude buckets, cached per URL. What a player draws is now the sound
  it is playing.
- `concepts/phoenix/Groove.tsx` — the take cut as a lathe groove: one gold
  hairline per bucket, the played part lit, draggable to scrub. Concept-owned.
- `concepts/phoenix/parts.tsx` → `Marking` — a tempo marking set in words over a
  struck rule, which is what an engraver actually writes.
- `concepts/phoenix/parts.tsx` → `Plumb` — a hairline and a gilded bead down the
  right margin, replacing the five-line stave that used to live there.

### Other musical texture

- Italian performance markings on the four commission steps: `rubato`,
  `con sordino`, `una corda`, `sempre` (in `content/commission.ts`).
- Phoenix section eyebrows are movements: "Movement I" … "Coda".
- Dragon numbers its eight sections with Chinese numerals 一二三四五六七八.
- Nocturne numbers its sections as acts, with a printed programme's language.

### Two components that no longer exist

- **`components/LoaderScene.tsx`** — hosted a concept's own shader as its loader.
  All three arrivals are CSS and type now (Phoenix a black room and his name,
  Dragon 刘凯彦 brushed on paper, Nocturne the name under a drawn rule), so it had
  no callers. Deleted rather than left to rot.
- **`components/Tally.tsx`** — see below.

### The bow stroke

`dragon/parts.tsx` → `BrushStroke`. Worth knowing why it is a **filled outline**
and not a stroked path: a stroke has one width, and one width with round caps is
a marker pen. A brush touches down thin, takes the pressure through the middle
and lifts to a dry point, so the mark is an outline whose two edges diverge and
meet again, with bristle hairs over it, a blurred bleed under it, and two strands
carrying on past the tip. It is uncovered by clipping left to right, because a
dash offset has no stroke to work on.

It also draws at all now. It carried `data-scroll`, and **Dragon does not run the
parallax pass**, so its progress variable was never written and the mark sat at
zero: a black dot in an empty field. Anything in Dragon that needs `--s` has to
call `useSectionProgress` itself. The same bug had the 正 count invisible.

### Numbers: no counting

`components/Tally.tsx` is **deleted**. It counted figures up from zero on
reveal, and the user's read of it was exact: *"it looks cheap and overused
especially in those wordpress elementor sites."* A count-up says "look, a
statistic"; it says nothing about the object the page is made of, and running
the same one in all three concepts was a third thing they shared.

Each concept now owns a `Figure` in its own `parts.tsx`:

- **Phoenix — struck.** Arrives high, hits, squashes for a frame, flares gold at
  the moment of contact, settles. A die on a plate. (`@keyframes phoenix-strike`.)
- **Dragon — brushed.** Each glyph clipped in top to bottom in sequence, the same
  gesture as the name on the arrival sheet and the 正 marks in the count.
- **Nocturne — slotted.** A brass rule draws in above the figure and the number
  rises into place from behind it, the way a box-office board is set.

All three are driven by the existing `data-reveal` observer, so there is no new
machinery and no timers.

### Narrow screens: the three things that actually broke

Worth reading before touching any hero, because all three were invisible on
desktop and obvious on a phone.

1. **A positioned scrim paints over unpositioned children.** Dragon's hero has
   `.dragon-hero::before` for the paper wash. `position: absolute` puts it in the
   positioned-descendants paint step, above every child still in normal flow.
   `.dragon-cuts` had been given `position: relative` for exactly this reason
   years of debugging ago; the player and the foot had not, so below 899px the
   hero simply had no text in it. Everything in that hero is positioned now.
2. **Cover-fit on a wide still is a keyhole.** The documentary frames are 2.37:1
   and he stands at the far left. Cover-fitting into a portrait viewport keeps
   about a fifth of the width, and centred, that fifth is sky. Both the hero
   shader (`cover(uv, focus)`) and `FilmScrub` (the `focus` prop, 0.2 for Dragon)
   now anchor the crop on him.
3. **Type over a picture with no room.** Phoenix's plate moves to the top of the
   frame on a phone and the type takes the floor, and the gold seam moves to the
   far side rather than ruling a line through his name. Nocturne's proscenium
   springs at 0.82 instead of 0.52, or the round head becomes a dome.

### Copy rules the user set, which are absolute

- **No em dashes anywhere on the page.** Not in content, not in JSX, not in
  `index.html` meta. Use a comma, a full stop, a colon or `·`. Verified with a
  sweep that strips comments and then greps for `—` and `–`.
- **No "X, not Y" constructions.** "Engagements, not endorsements" and
  "a commission, not a purchase" were both named and both rewritten.
- **No section titles like "Why he keeps going."** That section is "The calling"
  on all three concepts now.
- The user's words: *"those are really ai sounding … you are a professional
  copywriter please fix all ai sounding bits."* Treat rhythmic triads, mirrored
  couplets and negative anaphora ("nothing is X, nothing is Y") as tells.

---

## 6. The three concepts

All three share content and structure-of-argument, and differ in palette,
typography, **layout structure**, WebGL technique, **and reveal choreography**.
That last one matters: the mechanism is shared, the feel is not.

**Order and ordinals changed on 15 Aug 2026.** Nocturne is 01 and shown first,
Phoenix 02, Dragon 03. Each loader reads its number from `registry.ts` rather
than carrying its own copy, Dragon converting to its own numerals; the numbers
had already drifted apart once. The sections below are in that order's
numbering but appear in this document in their original order.

**One fact, three ways, is the rule.** Every concept has to make the same
argument out of its own materials, and nothing with a visible shape is shared:

| | Phoenix | Dragon | Nocturne |
|---|---|---|---|
| Clients | engraved gold bar (WebGL) | cinnabar seals on a hand scroll | a programme's cast list |
| Territories | a gilded numbered index | a dotted world chart with an ink route | run in as a line |
| The big number | struck figures | 168 正 marks brushed in | 3,000 seats lighting in plan |
| The instrument | gold in a procedural room | stepped ink washes on paper | brass under one lamp |

### 02 Phoenix — "Gilded" (dark)

- **Object:** a gold-leaf lacquer screen, a velvet-lined flight case.
- **Palette:** lacquer `oklch(14% 0.014 48)`, 24K gold `oklch(78% 0.13 85)`,
  ivory `oklch(93% 0.012 85)`.
- **Type:** Italiana (display) + Commissioner (body).
- **Layout:** stacked editorial, six movements and a coda.
- **Hero scene** (`phoenixScene.ts`): a full-screen fragment shader. Procedural
  molten gold from a double domain-warped fbm, one seam of gold opening down the
  middle as you scroll, and the photograph set into it as an **inset plate** with
  its own gold hairline. The plate is held at `zoom = 1.09` so the slow rise on
  scroll always has picture to move into; sampling straight off the coordinate
  walked past the edge and smeared the clamped last row down the bottom of the
  plate, which the user caught.
- **The gold bar** (`bandScene.ts`): the "who books him" section. One quad, and
  the shader solves a cylinder for it — `theta = asin(y)` gives the surface, so
  foreshortening at the rim is real geometry rather than a squash. The client
  names are drawn to a `CanvasTexture` and read at that angle, with a two-sided
  bevel so the cut takes the light on one edge and loses it on the other. Pinned
  for 280vh; the roll runs one name at a time over the crown.
- **Choreography:** the long default drift. Photographs wipe up and then parallax
  inside their frames.
- **Happy accident worth keeping:** the real Phoenix violin is literally a carved
  gold feathered wing, so the drawn plume and the photograph rhyme.
- Two sections here were rejected before the bar landed: a grid of logo masks
  ("looks not so nice") and a wall of justified display type ("horrible"). Both
  were the same mistake — a list, laid out. The bar is an object.
- Body weight is `360` and line-height `1.74` — light type on a dark ground reads
  thinner than it measures.

### 03 Dragon — "Ink and jade" (light) — the only daylight concept

- **Object:** an ink-wash hand scroll, a jade seal pressed in cinnabar.
- **Palette:** rice paper `oklch(95% 0.012 85)`, ink `oklch(25% 0.014 250)`,
  jade `oklch(54% 0.078 165)`, cinnabar `oklch(50% 0.19 32)`.
- **Type:** Faustina (display) + Hanken Grotesk (body) + Ma Shan Zheng (brush
  script, for 刘凯彦 and the seal).
- **Layout:** hand-scroll marginalia. Chinese numerals and section labels sit out
  in the left margin; text runs in one measured column.
- **Scene:** full-screen **fragment shader**. Domain-warped fbm ink blooms in
  water with his silhouette sampled tonally into the ink field. It used to
  resolve into two violin f-holes and then a seal box; **both were removed** at
  the user's request ("what is that box it looks bad"). `float board = 0.0;` is
  the leftover of the second one.
- **The count** (`parts.tsx` → `Marks`): 168,000 people drawn as 168 正 marks,
  brushed on in sequence as the section passes, every twenty-fifth in cinnabar.
  It replaced a dark, soft photograph of the hall in which you could not see a
  single person. Dragon does not run the parallax pass, so this section measures
  its own passage with `useSectionProgress`.
- **Choreography:** ink settles. Headings, the artist's name, photographs and
  film stills come out of a 7px blur. Kept to those four because a blur filter on
  every revealed element at once is more than the paint budget will carry.
- The reel draws its trace in ink and its playhead in cinnabar — the two inks the
  design already owns.
- Paper grain is an inline `feTurbulence` SVG data URI at 5% opacity.
- Photography uses `mix-blend-mode: multiply` so studio backgrounds drop out.

### 01 Nocturne — "Velvet and lamplight" (dark)

**Replaced Silk and Pearl on 15 Aug 2026**, which the user found "too bland and
boring". Before rebuilding, ten current Awwwards winners were opened in Playwright
and scrolled — haoqi.design, Vero, ERA Residence, Revelatio, Trionn, 2xA, Obys,
Mosby's Files, Oliver Gareis, artem — and what they share was written down: a
WebGL canvas, GSAP with ScrollTrigger, **Lenis-weighted scrolling**, a custom
cursor, mix-blend-mode used in dozens of places, display type at 120–180px, and
pages 14,000–25,000px long. Two were close to this brief and taught the most:
**Vero**, a bespoke atelier whose call to action is literally "Start your
COMMISSION", for its mixed roman/italic display and its alternation of film
panels with ivory type pages; and **ERA Residence** for its arch-shaped image
windows, deep unusual ground colour and rotated micro-caps in the margins.

None of their looks were copied. The register stayed ours: violin, luxury,
exclusivity.

- **Premise:** a night at the house. The curtain is down, one lamp is lit, and
  the scroll walks you from the empty hall to the man to the last door.
- **Palette:** velvet `oklch(19% 0.06 22)`, deep velvet `oklch(12% 0.045 20)`,
  ivory `oklch(94% 0.012 80)`, brass `oklch(76% 0.1 78)`.
- **Type:** **Fraunces** and **Instrument Sans**. Instrument Serif was the first
  choice and the user rejected it — "its like squished horizontally" — so it was
  replaced with Fraunces at `font-variation-settings: "SOFT" 18, "WONK" 0`, which
  is wide and warm and does not go spindly at display size. The display face
  keeps its italic for the small connecting words, the way a concert programme
  sets them: *the* Dennis Lau, *one* SONG *written for* ONE PERSON. That device
  is the whole tone of the concept and is worth protecting.
- **Scene:** oxblood velvet under a brass lamp that follows the pointer, dust in
  the beam, and, as you scroll, the curtain parts to reveal him lit behind it.
  One shader: cloth, photograph, light and dust, so nothing is layered on
  anything.
  **The cloth is lit, not tinted.** Interpolating a colour along a sine gave
  smooth red bands, which the user called "so fake and drawn like kids one". It
  now builds a height field for the pleats, takes a normal from its slope, and
  lights that: creases go almost black by occlusion, flanks catch the lamp
  (velvet's sheen sits on the flank, not the crest), and the pile is a separate
  high-frequency term over the top. A scalloped valance with a bullion fringe
  hangs across the top and does not travel, which is what says proscenium rather
  than "two flat halves".
- **Arrival:** `parts.tsx` → `Loader`. Pure type on black: the name, a rule drawn
  under it, the concept mark. Two scenes were tried here and both were wrong. A
  curtain repeated the hero and, worse, could desync — the user scrolled during
  it and met a half-open curtain. A ghost light on an empty stage was a second
  piece of scenery arguing with the first ("looks cheap"). `nocturneGhostScene.ts`
  is deleted. **Do not put a scene back here.**
- **Structure:** acts, alternating velvet and ivory grounds so the scroll has a
  pulse. Every photograph is seen through the same proscenium arch. A line of
  type travels sideways as you pass it; the wordmark is set enormous on the way
  out; the coda is back in the dark with a brass door at the end of it.
- Each act sets `--edge`, so an act can be flipped between velvet and ivory
  without every rule inside it having to know which ground it is on.

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

### Restoration, and the ceiling

The user's standing note is *"that low quality stuff really ruins the high-end
look"*, and later, of the scroll sequences, *"it looks like old tv footage"*.
Two facts to save the next agent a day:

1. **1080p is the ceiling.** Every format `yt-dlp -F` offers for the concert film
   (`wue4V1mUk5A`) tops out at 1920×1080 / 3.7 Mbps. Same for the documentary
   (`e94jf8q8oas`, 1920×810) and the showreel (`cvbGj5yF_OM`). There is no 4K to
   find, so quality has to come from reconstruction.
2. **Reconstruct, do not sharpen.** The first pass sharpened with ffmpeg
   `unsharp`, which amplifies H.264 block noise and is most of what reads as
   "old TV". The current pipeline is Real-ESRGAN's `realesr-general-x4v3`, which
   is trained on exactly this degradation.

The toolchain lives on `/mnt/d/blesspoke-sr` (the system disk has under 6 GB
free):

- `venv/` — CPU-only PyTorch. **The GPU is unusable here:** WSL exposes no
  NVIDIA Vulkan ICD, so `realesrgan-ncnn-vulkan` falls through to lavapipe and
  dies with `LLVM ERROR: Broken function`. CUDA wheels do not fit on the system
  disk. CPU it is, at ~27 s per 2-megapixel frame on 10 cores.
- `sr.py` — SRVGGNetCompact written out by hand (40 lines) rather than pulling
  `basicsr`, which drags in a broken `functional_tensor` import. Tiled at 256 px
  with 16 px overlap.
- `locate.py` / `locate_many.py` — **the useful trick.** The timecodes that
  produced the original frames were lost, so these search for them: rescale a
  published frame back to master height, slide it across each candidate video
  frame with `matchTemplate`, keep the best correlation. It recovers the
  timestamp *and* the horizontal crop. Matches score 0.97–0.9999.
- `install.py` — publishes each sequence at two sizes and deletes the old JPEGs.

Recovered coordinates, so nobody has to search again:

| Sequence / still | Source | In | Detail |
|---|---|---|---|
| phoenix scrub | `wue4V1mUk5A` | 100.95 s | `crop=1518:1080:85:0`, `fps=22`, 77 frames |
| dragon scrub | `e94jf8q8oas` | 383.50 s | full frame, `fps=23.4`, 80 frames |
| nocturne scrub | `cvbGj5yF_OM` | 8.60 s | full frame, `fps=16.1`, 87 frames |
| `live-gold-violin` | `wue4V1mUk5A` | 87.96 s | |
| `stage-phoenix` | `wue4V1mUk5A` | 51.96 s | |
| `crowd` | `wue4V1mUk5A` | 75.96 s | |
| `live-blue` | `wue4V1mUk5A` | 215.96 s | |
| `silhouette-sky` | `e94jf8q8oas` | 384.0 s | |
| `portrait-mono` | `e94jf8q8oas` | 480.0 s | |
| `portrait-mono-2` | `e94jf8q8oas` | 396.0 s | |

**What it cost, in the end.** All 244 frames at 2560 wide come to **19 MB**,
against 25 MB for the old 1600px JPEGs. WebP on dark concert footage is that
efficient, so the sequences are higher resolution *and* lighter. The seven
stills rebuilt the same way land at 3.8 MB for the whole `public/dennis` folder.

**Two sizes per sequence, and why.** `public/scrub/<concept>/hi` is 2560 wide and
`/sm` is 1280. A canvas only needs its backing store: a 1440 viewport at 2x wants
about 2880 across, a phone wants about 800. One 2560 set for everything would
hand a phone eighty decoded frames it has no memory for, so `FilmScrub` picks by
`innerWidth × dpr`.

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

`public/film/` — `showreel.mp4` (his own showreel, 17 MB, **1920×1080**, 67 s,
self-hosted and click-to-play), `showreel-loop.mp4` (1.4 MB, silent 14 s cut from
6.0 s) and `showreel-poster.webp` (from 8.0 s). Self-hosted rather than embedded:
the films section can afford YouTube's player and cookie banner, the showreel
cannot. It was 1280×720 until the same reel was found on his channel at 1080p
(`cvbGj5yF_OM`); the audio track is carried over from the old file because
YouTube 403s the audio-only formats for it.

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

`public/dennis/silhouette-pose.webp` — the Dragon hero's plate. A studio
silhouette of him playing, cut out on white, 1024×1536, 63 KB at WebP q92
(lossless was 676 KB and differed by 256 pixels out of 1.5 million at the
threshold, which is not a trade worth 600 KB). It replaced a frame from the
concert film, and the reason is worth keeping: in that frame a cloud bank was
pressed against his shoulder and his boots and was as dark as he was, so nothing
— no threshold, no box, no ellipse — could separate them, because they touched
and they matched. Here the ground is 254 and he is under 60, so the plate's own
values *are* the ink and the shader does nothing to him but change his colour.
If this is ever re-cut, keep the white ground and keep him whole in frame.

`public/audio/` — the ten demos, **39 MB, shipped as the original 192 kbps MP3s,
untranscoded**. That was a deliberate call: this site's whole pitch is production
quality, and generational loss on a music producer's own demo reel undermines it.
Nothing downloads until someone presses play (`preload="none"`), and MP3 streams
progressively, so page weight is unaffected. If bandwidth ever becomes a problem,
transcoding to ~128 kbps VBR roughly halves it — but treat that as the user's
call, not a default.

`public/icon.svg` — four bars, the open strings at the heights of a signal.
### Photography of the other two instruments

There is none on this site, and the reason is licensing rather than absence.
**All three do appear in 3D** — the turned section in every concept now shows
the Phoenix, the Dragon and the Chosen in the order they were built, cut from
the user's own Meshy scans by `tools/model-cut.py`. What is missing is
photography, which is a different problem. Alistair Hay built all three, and
Emerald Guitars publish their own studio photography of the second one:

- **The Dragon is called Suilleach.** Nine studio frames at
  `emeraldguitars.com/wp-content/uploads/2024/03/dragon-violin-suilleach-by-emerald-guitars_mg_*.jpg`
  (`1949 1950 1957 1977 1993 1997 2003 2041 2042`). `2041` is the whole
  instrument in its case, `1957` the head. **All nine are 800px wide and that is
  the ceiling** — checked against their WordPress media API, there is no
  `-scaled` original and nothing larger anywhere in press. Too small for a hero
  on this site.
- **The Chosen** was photographed at its unveiling by Robb Report Malaysia:
  `robbreport.com.my/wp-content/uploads/2019/05/FEAT_Art-Dennis-Lau-Emerald-Violin-{LEAD-1,001-1,002-1,003-1}.jpg`.
  `LEAD-1` is 1795×1025 and is the usable one. Their ExactDN CDN returns 403 to
  a hotlink; the origin serves the file with a referer.

Neither set is his own press library or CC0, which is the standing rule, so
neither is checked in. **Emerald Guitars is the ask** — they made all three,
they hold the originals at full resolution, and the good photographs are theirs.

### The mark, the card, and the metadata

Everything below is generated, and **the generators are checked in under
`tools/`**. Regenerate rather than hand-editing the output.

- `tools/icon.py` → `public/icon.svg`, `public/icon-touch.svg`. Three feathers
  off one shoulder: the Phoenix, his six-string violin, is carved as a bird's
  wing, so the wing is the mark. Three and not five — five is the better drawing
  at 128px and unreadable at 16, where each feather gets two pixels and the gaps
  between them get one. Filled leaves rather than strokes, because an SVG stroke
  cannot taper and an untapered fan reads as a comb.
- `tools/raster.mjs` → `favicon-16.png`, `favicon-32.png`,
  `apple-touch-icon.png` (180), `icon-512.png`. The touch icon bleeds to its own
  edges because the OS rounds that one itself; the tab icon carries its own
  rounding.
- `tools/model-cut.py <id>` → `public/model/<id>.glb`. Decimates the Meshy scan
  in `source-models/<id>-original.glb` to 150k faces and drops the confetti that
  quadric decimation leaves behind — a few hundred stray components under 40
  faces, which read as dirt in the air around the instrument. `<id>` is the
  violin's id in `content/dennis.ts`, which is also its `ModelId`: one vocabulary
  for the object, the record and the mesh. Needs `trimesh` and
  `fast-simplification` on the same interpreter.
- `tools/waveform.mjs` → `src/content/waveform.ts`. ffmpeg-decodes
  `public/audio/the-journey-live.mp3` and writes one peak per bucket, 900 of
  them, normalised. Nocturne builds a room out of these and walks down it, so
  they have to be the real ones. Rerun if `livePhrase` is ever replaced.
- `tools/og.mjs` → `public/og.jpg`, 1200×630, rendered at 2× and downsampled.
  Typeset in the real Italiana by rendering a page in Playwright rather than
  mocked up in an image editor. Two things it has to do that are not obvious:
  the page is **written to disk and opened as a `file://` URL**, because
  `setContent` leaves the document on an `about:blank` origin which may not
  fetch `file://` resources and the photograph silently never loads; and the
  photograph is composited with `mix-blend-mode: lighten` rather than pasted,
  because it is on pure black and the ground is warm lacquer, so a plain drop-in
  leaves a visible seam down its left edge.

`index.html` carries a JSON-LD `@graph` of three nodes: `Person` (Dennis),
`WebSite` (Blesspoke) and `Service` (the commission, with both tiers as
`Offer`s). **The Person's own `url` points at `dennislau.thechosen.io`, not at
this site**, on purpose — this page is the service he provides, and saying
otherwise would claim to be his homepage. `sameAs` is what ties the entity
together for a search engine.

`public/sitemap.xml` lists **only the homepage**. The three concept routes are
client-side and GitHub Pages answers them from `404.html`, so they return HTTP
404 with the app as their body; listing them would report soft 404s.
`public/robots.txt` is served from `/blesspoke/`, where a crawler reading the
origin root will never see it. It is there so a move to a custom domain needs no
new work. `site.webmanifest` uses **relative** icon paths so it survives a
change of base path; the sitemap cannot, and carries the origin literally.

### The instrument, and how the stand came off it

The user supplied a Meshy scan of the Phoenix violin: `source-models/
phoenix-original.glb`, 35 MB, 1,977,950 faces, **one watertight component**. The
object is mounted on a carbon-fibre display stand, and the stand is fused to the
instrument in the scan.

Two approaches failed and are worth recording so nobody spends the afternoon
again:

- **A plane cut gutted the right wing.** The stand rises the full height of the
  object, so any horizontal slice that reaches the stand also reaches the lower
  wing. The fit reported a half-thickness of 0.349 in a model 1.34 deep, which
  should have been the tell that it was not fitting a sheet.
- **Crease-bounded region growing filled the whole mesh.** The scan is smooth
  everywhere; even a 12° threshold flooded 88.8% of the faces from a seed in the
  middle of the stand. There is no sharp edge at the junction to stop at.

What worked: **slice the scan in XZ and look.** The stand and the instrument
never share a footprint at any height, so the cut is a prism and not a plane.
Fitting the stand's four sides over the 132,000 faces below y = -0.40 gives four
planes with a maximum deviation of **0.0024** — it is a true truncated pyramid —
and the intersection of those four half-spaces handles the taper by itself,
because the planes converge to an apex and above the apex the region is empty.

Two corrections on top of that. The stand steps outward near the top by about
0.015 on one face, which left a flat blade hanging under the body; and the
pyramid's apex sits above the scroll, so the cone was clipping the tuning pegs
off into loose components. **Taking the convex hull of the seed faces plus that
blade solves both at once** and comes out as one connected piece with no strays.

1,977,950 faces in, 149,961 out, 2.7 MB, silhouette matching the photograph.
`loadModel.ts` centres and normalises on the longest axis — which, with the stand
gone, is the wingspan, so all three cameras were brought in.

The scripts are in the working notes on `/mnt/d/blesspoke-sr` (`planes.py`,
`hull.py`, `finish.py`, `views.py`, `zoom.py`, `slices.py`). `views.py` and
`zoom.py` are worth keeping: they rasterise a mesh's vertices to a z-buffered
orthographic sheet in numpy, with a labelled grid, which is how every one of
these diagnoses was actually made. There is no GPU renderer in this environment.

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

**Landed in the award-research pass (15 Aug 2026):**

- **`FilmScrub`** — his own footage scrubbed by the scroll, one sequence per
  concept, drawn to a canvas from a numbered WebP sequence in `public/scrub`.
  Finding uncut runs in dark concert footage defeated both frame-differencing and
  ffmpeg's own scene detection; the shots were verified by eye, and one of them
  turned out to be a *dissolve*, which is why the Phoenix sequence starts around
  100s and not at the "clean" 96.0s both detectors reported.

  **Two things in here are load-bearing; do not simplify them away.**

  1. *The tier.* It reads `<sequence>/hi` (2560) or `/sm` (1280), chosen once on
     mount from `innerWidth × dpr`. Fixed for the life of the section, because
     swapping mid-scroll would throw away every decoded frame for a difference
     nobody can see.
  2. *The decode window.* Every frame is fetched once and held as an **encoded
     blob** (about 70 KB each; the whole Phoenix sequence is 5 MB). Only the
     thirty frames nearest the playhead are decoded, and the furthest is
     `close()`d when the window is full. Eighty-seven frames at 2560 is 1.6 GB of
     bitmap if they are all kept alive. Measured in Chrome by summing renderer
     RSS while scrubbing the section twice end to end: 1538 MB on the old
     all-resident 1600px set, 1845 MB on the windowed 2560 set — same order, two
     and a half times the pixels. If you ever go back to holding every frame,
     measure it again first.

  `drawnExact` exists because a substitute neighbour is drawn while the real
  frame decodes; without it the substitute would never be replaced, since
  `drawn` records the index that was *asked for* either way.
- **`useSmoothScroll`** — weighted scrolling site-wide, done as real
  `window.scrollTo` on an animation frame rather than by transforming a wrapper,
  because a transformed wrapper breaks `position: sticky` and every pinned scene
  here depends on it. Off for touch and for reduced motion.
- **`Cursor`**, **`Grain`**, **`Kinetic`**, **`Band`**, **`Handscroll`**,
  **`Score`**, **`ScoreRail`**, **`Words`**, **`Marquee`**, **`Field`**,
  **`Territories`** — the shared vocabulary the three concepts now draw on.
- **Concept 03 rebuilt as Nocturne** (see §6).

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


**Landed 15 Aug 2026, after the user reviewed the live build.** Everything below
came from screenshots he sent back, in his order.

- **The frames were restored, not upscaled.** Real-ESRGAN
  (`realesr-general-x4v3`) on CPU torch, from the masters rather than from the
  published stills — the lost timecodes were recovered by template-matching the
  published frames back into the source at 0.97–0.9999 correlation. 244 frames
  at 2560px is **19 MB**, against 25 MB for the old 1600px JPEGs: higher
  resolution *and* lighter. `FilmScrub` holds a bounded decode window (30
  resident, 10 either side) so memory does not scale with sequence length.
- **All three instruments, in 3D.** `loadModel.ts` fetches three `.glb` files;
  each concept gives them its own material and turns them in the order they were
  built, and the plate beside the canvas names whichever one is on screen — the
  section passes `cuts={TURNED.length}` so `ScrollStage`'s cut index and the
  scene's own arithmetic cannot disagree. The stand had to come off the Phoenix
  scan first: see §7.
- **A commission form** (`lib/enquiry.ts`). It validates, it reports, and it
  **sends nothing**. `deliver()` waits 900 ms and resolves. Replace its body with
  a POST to whatever endpoint mails Dennis's team.
- **A font gate before every loader** (`useTypeset.ts`). His name never paints in
  Times New Roman and swaps.
- **Dragon's territories became a chart.** 1,773 land dots rasterised from
  Natural Earth's 110m coastlines, a jade graticule, and one ink line drawing
  London to Melbourne as you scroll, pressing a cinnabar chop on each territory.
  On a phone the map pans rather than shrinks.
- **Nocturne got the house.** Three thousand seats in plan, lighting from the
  front row outwards. See §6.
- **The chooser was rewritten for its actual audience.** It had been wearing
  Dennis's masthead and quoting his biography back at him. It now answers, in
  order: what this is, what the site sells, what is the same across the three
  and what differs, and what to do next.
- **A copy proofread across all three.** Phoenix had gone Movement IV then VI.
  Nocturne had the 3D violin inside ACT VI, between the client wall and the
  compliments those same clients paid. "Ten thousand nights" was ten thousand
  performances. "Twenty years of paper before the first commission" was neither.
- **Deployed.** `fulldevstack2.github.io/blesspoke`, on push to `main` via
  `.github/workflows/deploy-pages.yml`.

## 9. What is NOT done — your work queue

### 9a. Waiting on the user, not on an agent

- **The textured Meshy export.** The shipped `.glb` has geometry and no
  materials, so every concept infers its finish from normals alone. With a
  textured export the fingerboard, the strings and the carbon can read darker
  than the gold instead of the whole object being one metal.
- **An endpoint for the commission form.** Until one exists, `enquiry.ts`
  swallows every request. This is the single most important unfinished thing on
  the site: it looks like it works.
- **The two client reviews in `work.ts`** are attributed and should be confirmed
  as cleared for publication.
- **Photography of the Dragon and the Chosen**, at a resolution this site can
  use. See §7: what is published is 800px and 1795px respectively, and neither
  is ours to publish. Emerald Guitars is the ask.
- **Deliberately not used, and keep it that way unless the user says otherwise:**
  his collaborator names. It reads as a roster and the user was emphatic. Demos
  commissioned *by performers* describe the client rather than naming them;
  brand clients are named outright, because that is credit rather than a roster.

### 9b. Still on the table

- **A real page transition** between chooser and concept, and between concepts.
  The routes still hard-cut, and it is the most conspicuous remaining gap.
- **A second WebGL moment for Dragon.** The brush stroke is an SVG path drawn on
  scroll; a real bristle-and-bleed shader would read as craft rather than vector.
  Nocturne now has three canvases and does not need a fourth.
- **Nocturne's remaining flat pages.** The house broke the run of lists, but the
  reel, the compliments and the tallies are all still set as lists on a page. Any
  one of them could carry a treatment of its own.
- **A fourth concept.** The user's standing offer: *"feel free to create more
  designs please. the more the better but only when you have something real and
  new to bring to table in the form of a full new design."* The bar is high and
  the condition is explicit; do not add one for the sake of a fourth tile.

Keep the "atas" register. World-class does not mean busy — it means every
transition is considered, nothing is default, and the restraint reads as
confidence. Do not turn it into a parallax demo.

### 9c. Smaller open items

- The Dragon `一` numeral renders as a lone horizontal stroke, which is correct
  Chinese but can look like a stray mark in the margin.
- **Test on a real phone.** Only headless Chromium at 390 / 820 / 1440 px has
  been checked, at DPR 1–2. CJK renders locally (Noto Sans SC is in
  `~/.local/share/fonts`), so the Chinese has been *seen* — a real device is
  still a different thing.
- Lighthouse/performance pass. Three.js is a 464 KB chunk (116 KB gzipped),
  already manually chunked; consider lazy-loading scenes per route.
- Dragon is the only concept whose hero photograph is a *treatment* (multiplied
  ink) rather than a photograph. If the user wants him recognisable there, it
  needs a second image.

### 9d. Parked — not part of Blesspoke

An **Admin Portal for Lumo** was recapped in an early message. That is a
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
