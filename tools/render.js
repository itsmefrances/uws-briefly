// Render an edition JSON into 1080x1350 Instagram carousel PNGs.
// Usage: node render.js edition.json outdir
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [, , editionPath, outDir] = process.argv;
const ed = JSON.parse(fs.readFileSync(editionPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const css = `
* { box-sizing: border-box; margin: 0; }
html, body { width: 1080px; height: 1350px; }
body { font-family: "Inter", sans-serif; background: #f3f1ec; color: #15201d;
  padding: 96px 88px; display: flex; flex-direction: column; justify-content: space-between; }
.top { display: flex; justify-content: space-between; align-items: center;
  font-size: 28px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
.brand { color: #1f6b5c; }
.count { color: #7b8682; font-variant-numeric: tabular-nums; letter-spacing: .06em; }
.cat { display: inline-block; font-size: 30px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
  color: #f3f1ec; background: #1f6b5c; padding: 10px 20px; border-radius: 6px; margin-bottom: 40px; }
.text { font-family: "Inter Display", "Inter", sans-serif; font-weight: 700; line-height: 1.12;
  letter-spacing: -.015em; text-wrap: balance; }
.src { font-size: 30px; color: #55625e; border-top: 3px solid #15201d; padding-top: 28px; }
.src b { color: #15201d; font-weight: 600; }
body.cover { background: #1f6b5c; color: #f3f1ec; }
body.cover .brand, body.cover .count { color: #cfe3dc; }
.title { font-family: "Inter Display", sans-serif; font-weight: 800; font-size: 190px; line-height: .92; letter-spacing: -.035em; }
.dates { font-size: 54px; font-weight: 500; margin-top: 36px; color: #cfe3dc; }
.sub { font-size: 34px; line-height: 1.4; color: #e4efe9; border-top: 3px solid #f3f1ec; padding-top: 28px; }
.list { font-size: 44px; font-weight: 600; line-height: 1.45; }
`;

function page(bodyClass, inner) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="${bodyClass}">${inner}</body></html>`;
}

const total = ed.stories.length + 2;
const slides = [];

slides.push(page('cover', `
  <div class="top"><span class="brand">Upper West Side</span><span class="count">1/${total}</span></div>
  <div><div class="title">UWS<br>Briefly</div><div class="dates">${esc(ed.dates)}</div></div>
  <div class="sub">This week's neighborhood news in one line each.&nbsp;Swipe&nbsp;→</div>`));

ed.stories.forEach((s, i) => {
  const size = s.text.length > 110 ? 70 : s.text.length > 80 ? 78 : 88;
  slides.push(page('', `
    <div class="top"><span class="brand">UWS Briefly</span><span class="count">${i + 2}/${total}</span></div>
    <div><span class="cat">${esc(s.cat)}</span><div class="text" style="font-size:${size}px">${esc(s.text)}</div></div>
    <div class="src">Via <b>${esc(s.src)}</b></div>`));
});

// Closing slide: credits every source used in this edition (ed.sources, or all three by default).
const sources = ed.sources || ['West Side Rag', 'I Love the Upper West Side', 'The West Sider'];
slides.push(page('cover', `
  <div class="top"><span class="brand">UWS Briefly</span><span class="count">${total}/${total}</span></div>
  <div><div class="text" style="font-size:84px">Read the full stories</div>
    <div class="list" style="margin-top:44px">Links to every story<br>are in our bio.</div></div>
  <div class="sub">Reporting by ${sources.map(esc).join(', ')}.</div>`));

(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (let i = 0; i < slides.length; i++) {
    await p.setContent(slides[i], { waitUntil: 'load' });
    const f = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await p.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
})();
