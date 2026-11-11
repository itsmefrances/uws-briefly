"""Build docs/index.html (the Instagram link-in-bio page) from links.json.

links.json is a list of {"date": "YYYY-MM-DD", "headline": str, "links": [[source, url], ...]},
newest first. The page shows the most recent 30 days.
"""
import html, json
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
stories = json.loads((ROOT / "links.json").read_text())
newest = max(s["date"] for s in stories)
cutoff = (date.fromisoformat(newest) - timedelta(days=30)).isoformat()
e = html.escape

parts, day = [], None
for s in sorted((s for s in stories if s["date"] >= cutoff), key=lambda s: s["date"], reverse=True):
    if s["date"] != day:
        day = s["date"]
        d = date.fromisoformat(day)
        parts.append(f'<h2>{d.strftime("%A, %b")} {d.day}</h2>')
    links = "".join(f'<li><a href="{e(u)}">{e(src)}</a></li>' for src, u in s["links"])
    parts.append(f'<article><h3>{e(s["headline"])}</h3><ul>{links}</ul></article>')

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UWS Briefly: links</title>
<style>
:root {{ --bg:#f3f1ec; --fg:#15201d; --muted:#55625e; --rule:#d9d6cd; --accent:#1f6b5c; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg:#121715; --fg:#e6ecea; --muted:#9aa8a4; --rule:#2b3431; --accent:#6cc4ae; }} }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--bg); color:var(--fg); font:17px/1.45 -apple-system,"Inter","Segoe UI",system-ui,sans-serif; }}
main {{ max-width:38rem; margin:0 auto; padding:32px 18px 64px; }}
h1 {{ font-size:2.2rem; line-height:1; letter-spacing:-.02em; margin:0 0 8px; }}
.dek {{ color:var(--muted); margin:0 0 8px; }}
h2 {{ font-size:.8rem; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); margin:36px 0 4px; padding-bottom:8px; border-bottom:2px solid var(--fg); }}
article {{ padding:14px 0; border-bottom:1px solid var(--rule); }}
h3 {{ font-size:1.05rem; font-weight:650; margin:0 0 6px; text-wrap:balance; }}
ul {{ margin:0; padding-left:1.2em; }}
li {{ padding:3px 0; }}
a {{ color:var(--accent); text-underline-offset:3px; }}
footer {{ margin-top:36px; color:var(--muted); font-size:.85rem; }}
</style></head><body><main>
<h1>UWS Briefly</h1>
<p class="dek">Upper West Side news in one line each. Tap a source to read the full story.</p>
{chr(10).join(parts)}
<footer>Summaries by <a href="https://www.instagram.com/uws_briefly/">@uws_briefly</a>. All reporting belongs to the linked publications.</footer>
</main></body></html>
"""
(ROOT / "docs").mkdir(exist_ok=True)
(ROOT / "docs" / "index.html").write_text(page)
print("built docs/index.html with", len(parts), "blocks")
