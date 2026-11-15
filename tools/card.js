// Render one story as a single 1080x1350 Instagram card.
// Usage: node tools/card.js out.png "Nov 12" "Label" "Story text." "Source name(s)"
const { chromium } = require('playwright');
const [, , out, date, cat, text, src] = process.argv;
if (!src) { console.error('usage: node tools/card.js out.png date label text source'); process.exit(1); }
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Small line icon drawn above the label, picked from the label's words.
const ICONS = [
  [/cop|police/, '<path d="M12 2.5 19.5 5.5V11c0 5-3.2 8.8-7.5 10.5C7.7 19.8 4.5 16 4.5 11V5.5Z"/><path d="m12 7.5 1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4Z"/>'],
  [/crime|charged|arrest|accused|indicted/, '<rect x="4" y="17" width="16" height="4" rx="1"/><path d="M6.5 17v-5a5.5 5.5 0 0 1 11 0v5M10 12a2 2 0 0 1 2-2M12 2v2M4.6 4.6 6 6M19.4 4.6 18 6M1.8 11.5h2M20.2 11.5h2"/>'],
  [/clos|shut/, '<path d="M2.5 9 4.5 3.5h15L21.5 9Z"/><path d="M4 9v11.5h16V9"/><path d="M6.5 11.5h11M6.5 14h11M6.5 16.5h11M6.5 19h11"/>'],
  [/restaurant|food|bar|cafe|opening|open/, '<path d="M7 2.5v19M4.5 2.5v5.5a2.5 2.5 0 0 0 5 0V2.5"/><path d="M17.5 21.5V2.5c-2.5 1.5-3.5 4.5-3.5 8.5h3.5"/>'],
  [/roach|rat|mice|bug|health/, '<ellipse cx="12" cy="14" rx="4.5" ry="6.5"/><circle cx="12" cy="6" r="2.2"/><path d="M12 7.5v13M10.5 4.2 8 2M13.5 4.2 16 2M7.6 11 3.5 9M7.5 14.5H3M7.8 17.8 4 20M16.4 11l4.1-2M16.5 14.5H21M16.2 17.8 20 20"/>'],
  [/building|construction|develop|tower|condo/, '<path d="M5 21.5V3.5M5 3.5h15M5 7h11M16 3.5V9"/><rect x="14" y="9" width="4" height="3.5"/><path d="M2.5 21.5h19M9 21.5v-8h8v8M11.5 16h3"/>'],
  [/landlord|rent|tenant|lease/, '<circle cx="7.5" cy="12" r="4.5"/><circle cx="7.5" cy="12" r="1.3"/><path d="M12 12h9.5M18 12v3.5M21 12v2.5"/>'],
  [/subway|train|mta|bus/, '<rect x="5" y="2.5" width="14" height="15" rx="3"/><path d="M5 10.5h14M9.5 5.5h5"/><circle cx="8.5" cy="14" r="1"/><circle cx="15.5" cy="14" r="1"/><path d="m8 17.5-2.5 4M16 17.5l2.5 4"/>'],
  [/finally/, '<circle cx="12" cy="12" r="9.5"/><path d="m7.5 12.5 3 3 6-6.5"/>'],
  [/mad|angry|protest|neighbor/, '<path d="M3 10v4h3l9 5V5L6 10Z"/><path d="M6 14l1.5 6h3L9 15.5M18 9a4 4 0 0 1 0 6M20.5 6.5a7.5 7.5 0 0 1 0 11"/>'],
  [/died|death|dead/, '<path d="M9 21.5h6V11H9Z"/><path d="M12 11V8.5M12 8.5c-1.6-1.3-1.6-3.3 0-5.5 1.6 2.2 1.6 4.2 0 5.5Z"/>'],
  [/.*/, '<rect x="3" y="4" width="15" height="16" rx="1.5"/><path d="M18 8h3v10.5a1.5 1.5 0 0 1-3 0M6 8h9M6 11.5h9M6 15h5"/>'],
];
const icon = l => ICONS.find(([re]) => re.test(l.toLowerCase()))[1];
const size = text.length > 170 ? 62 : text.length > 110 ? 70 : text.length > 80 ? 78 : 88;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
* { box-sizing: border-box; margin: 0; }
html, body { width: 1080px; height: 1350px; }
body { font-family: "Inter", sans-serif; background: #f3f1ec; color: #15201d;
  padding: 96px 88px; display: flex; flex-direction: column; justify-content: space-between; }
.top { display: flex; justify-content: space-between; align-items: center;
  font-size: 28px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
.brand { color: #1f6b5c; } .date { color: #7b8682; letter-spacing: .06em; }
.icon { display: block; width: 120px; height: 120px; color: #1f6b5c; margin-bottom: 28px; }
.cat { display: inline-block; font-size: 34px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
  color: #f3f1ec; background: #1f6b5c; padding: 10px 20px; border-radius: 6px; margin-bottom: 40px; }
.text { font-family: "Inter Display", "Inter", sans-serif; font-weight: 700; line-height: 1.12;
  letter-spacing: -.015em; text-wrap: balance; font-size: ${size}px; }
.foot { display: flex; justify-content: space-between; align-items: baseline; gap: 24px;
  font-size: 30px; color: #55625e; border-top: 3px solid #15201d; padding-top: 28px; }
.foot b { color: #15201d; font-weight: 600; } .bio { color: #1f6b5c; font-weight: 600; white-space: nowrap; }
</style></head><body>
<div class="top"><span class="brand">UWS Briefly</span><span class="date">${esc(date)}</span></div>
<div><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon(cat)}</svg><span class="cat">${esc(cat)}</span><div class="text">${esc(text)}</div></div>
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
