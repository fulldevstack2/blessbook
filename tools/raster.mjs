import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
const b = await chromium.launch();
const jobs = [
  ["icon.svg", 32, "favicon-32.png"],
  ["icon.svg", 16, "favicon-16.png"],
  ["icon-touch.svg", 180, "apple-touch-icon.png"],
  ["icon-touch.svg", 512, "icon-512.png"],
];
for (const [src, size, out] of jobs) {
  const svg = readFileSync(src, "utf8");
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(`<body style="margin:0"><div style="width:${size}px;height:${size}px">${svg}</div></body>`);
  await p.waitForTimeout(200);
  writeFileSync(out, await p.screenshot({ omitBackground: true }));
  await p.close();
  console.log(out, size);
}
await b.close();
