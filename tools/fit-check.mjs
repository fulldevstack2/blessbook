/**
 * Does anything fall out of a pinned frame?
 *
 *     node tools/fit-check.mjs [origin]
 *
 * A `.stage-pin` is exactly one viewport tall and it clips. That is the whole
 * point of it — and it is also a trap, because content that does not fit is not
 * scrolled to, it is silently deleted. A hero can lose its last line on a short
 * window and look perfectly fine on the machine it was built on.
 *
 * That is not hypothetical: it shipped. Three heroes were cutting their footer
 * off on a 620px-tall laptop and one was cutting it off on a 640px phone, and
 * the reason none of it was noticed is that a clipped line leaves no trace —
 * no scrollbar, no overflow, no warning.
 *
 * So this walks every pinned frame on every concept at a spread of viewport
 * sizes and reports any text-bearing leaf whose box falls outside its frame.
 * Run it against a local preview (`npm run build && npm run preview`) or against
 * the deployed origin. Exits non-zero if anything is clipped, so it can gate a
 * change.
 *
 * Needs playwright-core and a Chromium; see the note in HANDOFF.md.
 */

import { chromium } from "playwright-core";

const ORIGIN = process.argv[2] ?? "http://localhost:4319/blesspoke";
const PAGES = ["", "phoenix", "nocturne", "dragon"];

/* Real shapes, plus the short ones that break things: a laptop with the window
   not maximised, and a small phone with the browser chrome showing. */
const SIZES = [
  [320, 568], [360, 640], [375, 667], [390, 700], [390, 760], [390, 844],
  [412, 732], [430, 932], [768, 1024], [820, 1180], [1024, 1366],
  [1280, 620], [1280, 800], [1440, 800], [1440, 900], [1536, 700], [1920, 1080],
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

let clipped = 0;

for (const path of PAGES) {
  for (const [width, height] of SIZES) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`${ORIGIN}/${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const found = await page.evaluate(() => {
      const out = [];
      for (const pin of document.querySelectorAll(".stage-pin")) {
        const frame = pin.getBoundingClientRect();
        for (const el of pin.querySelectorAll("*")) {
          // Leaves that carry words: those are the ones a reader loses.
          if (el.children.length || !el.textContent.trim()) continue;
          const box = el.getBoundingClientRect();
          if (box.height === 0 || box.width === 0) continue;
          if (getComputedStyle(el).visibility === "hidden") continue;
          const below = Math.round(box.bottom - frame.bottom);
          const above = Math.round(frame.top - box.top);
          if (below > 0 || above > 0) {
            out.push({
              pin: pin.className.replace("stage-pin", "").trim(),
              text: el.textContent.trim().slice(0, 30),
              below,
              above,
            });
          }
        }
      }
      return out;
    });

    for (const hit of found) {
      clipped += 1;
      const edge = hit.below > 0 ? `${hit.below}px below` : `${hit.above}px above`;
      console.log(`CLIPPED  /${path || ""} ${width}x${height}  [${hit.pin}]  "${hit.text}"  ${edge} the frame`);
    }
    await page.close();
  }
}

await browser.close();

console.log(
  clipped === 0
    ? `fit-check: clean — ${PAGES.length} pages x ${SIZES.length} viewports`
    : `fit-check: ${clipped} clipped element(s)`,
);
process.exit(clipped === 0 ? 0 : 1);
