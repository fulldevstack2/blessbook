import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const REPO = "/home/malkuth/projects/blesspoke";
const violin = pathToFileURL(`${REPO}/public/dennis/violin-phoenix.webp`).href;
const W = 1200, H = 630, SCALE = 2;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500..900&family=Commissioner:wght@200..600&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box }
  body { width:${W}px; height:${H}px; overflow:hidden; background:#0c0805;
         font-family:"Commissioner",sans-serif; color:#f0e7d8 }
  .frame { position:relative; width:100%; height:100%; overflow:hidden }
  /* Warm light falling from the upper right, the way the Phoenix pages are lit. */
  .glow { position:absolute; inset:0;
    background: radial-gradient(78% 96% at 82% 18%, rgba(224,172,75,0.20) 0%, rgba(224,172,75,0.05) 42%, transparent 70%); }
  /* Blended, not pasted. The photograph is on pure black and the ground
     is warm lacquer, so dropping it in as a rectangle leaves a visible seam down
     its left edge. Blending keeps whichever is brighter, so the instrument shows
     and its background simply is the ground. */
  .shot { position:absolute; left:392px; top:64px; width:1160px; mix-blend-mode:lighten; }
  /* The photograph is on pure black, so it dissolves into the ground on its own;
     this only stops a visible seam under the type. */
  /* Two veils. The first keeps the type clear of the scroll; the second sinks
     the carbon display stand into the dark, so the instrument reads as an
     object emerging rather than a photograph of a thing on a plinth. */
  .veil { position:absolute; inset:0;
    background: linear-gradient(90deg, #0c0805 0%, #0c0805 24%, rgba(12,8,5,0.80) 34%, rgba(12,8,5,0) 47%); }
  .floor { position:absolute; left:0; right:0; bottom:0; height:232px;
    background: linear-gradient(0deg, #0c0805 0%, #0c0805 42%, rgba(12,8,5,0.90) 64%, rgba(12,8,5,0) 100%); }
  .type { position:absolute; left:76px; top:0; bottom:0; width:440px;
          display:flex; flex-direction:column; justify-content:center; gap:0 }
  .eyebrow { font-size:15px; letter-spacing:0.44em; text-transform:uppercase;
             color:#e0ac4b; font-weight:400 }
  .name { font-family:"Bodoni Moda",serif; font-size:88px; line-height:0.98;
          font-weight:600; font-optical-sizing:auto;
          color:#f7f1e6; margin-top:26px; letter-spacing:0.005em }
  .cn { margin-top:20px; font-size:17px; letter-spacing:0.62em; color:#e0ac4b }
  .rule { width:104px; height:1px; margin:30px 0 26px;
          background:linear-gradient(90deg,#e0ac4b,rgba(224,172,75,0.15)) }
  .line { font-size:22px; line-height:1.5; font-weight:300; color:#cdbfa9; max-width:16em }
  .foot { position:absolute; left:76px; right:76px; bottom:44px;
          display:flex; justify-content:space-between; align-items:baseline;
          font-size:12.5px; letter-spacing:0.28em; text-transform:uppercase; color:#8d8175 }
  .foot b { color:#e0ac4b; font-weight:400 }
  .edge { position:absolute; inset:26px; border:1px solid rgba(224,172,75,0.16); pointer-events:none }
</style></head><body>
  <div class="frame">
    <div class="glow"></div>
    <img class="shot" src="${violin}">
    <div class="veil"></div>
    <div class="floor"></div>
    <div class="type">
      <div class="eyebrow">Blessbook</div>
      <div class="name">Dennis Lau</div>
      <div class="cn">刘凯彦</div>
      <div class="rule"></div>
      <div class="line">Commission a song of your own.</div>
    </div>
    <div class="foot">
      <span>Electric violinist · Kuala Lumpur</span>
      <span><b>Seven days</b> or less, guaranteed</span>
    </div>
    <div class="edge"></div>
  </div>
</body></html>`;

// Written to disk and opened as a file:// page on purpose. `setContent` leaves
// the document on an about:blank origin, which is not allowed to fetch file://
// resources, so the photograph silently never loads and the render comes back
// as an empty background with the type on it.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "og-"));
const page = join(dir, "og.html");
writeFileSync(page, html);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
await p.goto(pathToFileURL(page).href, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
const loaded = await p.evaluate(() => {
  const img = document.querySelector(".shot");
  return { w: img.naturalWidth, h: img.naturalHeight };
});
if (!loaded.w) throw new Error("the photograph did not load");
console.log("photo", loaded.w + "x" + loaded.h);
await p.waitForTimeout(700);
writeFileSync("og-2x.png", await p.screenshot({ type: "png" }));
await b.close();
console.log("rendered at", W * SCALE, "x", H * SCALE);
