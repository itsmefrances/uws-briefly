// Render one story as a single 1080x1350 Instagram card.
// Usage: node tools/card.js out.png "Nov 12" "Label" "Story text." "Source name(s)"
const { chromium } = require('playwright');
const [, , out, date, cat, text, src] = process.argv;
if (!src) { console.error('usage: node tools/card.js out.png date label text source'); process.exit(1); }
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const size = text.length > 170 ? 62 : text.length > 110 ? 70 : text.length > 80 ? 78 : 88;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
* { box-sizing: border-box; margin: 0; }
html, body { width: 1080px; height: 1350px; }
body { font-family: "Inter", sans-serif; background: #f3f1ec; color: #15201d;
  padding: 96px 88px; display: flex; flex-direction: column; justify-content: space-between; }
.top { display: flex; justify-content: space-between; align-items: center;
  font-size: 28px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
.brand { color: #1f6b5c; } .date { color: #7b8682; letter-spacing: .06em; }
.cat { display: inline-block; font-size: 34px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
  color: #f3f1ec; background: #1f6b5c; padding: 10px 20px; border-radius: 6px; margin-bottom: 40px; }
.text { font-family: "Inter Display", "Inter", sans-serif; font-weight: 700; line-height: 1.12;
  letter-spacing: -.015em; text-wrap: balance; font-size: ${size}px; }
.foot { display: flex; justify-content: space-between; align-items: baseline; gap: 24px;
  font-size: 30px; color: #55625e; border-top: 3px solid #15201d; padding-top: 28px; }
.foot b { color: #15201d; font-weight: 600; } .bio { color: #1f6b5c; font-weight: 600; white-space: nowrap; }
</style></head><body>
<div class="top"><span class="brand">UWS Briefly</span><span class="date">${esc(date)}</span></div>
<div><span class="cat">${esc(cat)}</span><div class="text">${esc(text)}</div></div>
<div class="foot"><span>Via <b>${esc(src)}</b></span><span class="bio">Full story: link in bio</span></div>
</body></html>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'load' });
  await p.screenshot({ path: out });
  await b.close();
  console.log(out);
})();
