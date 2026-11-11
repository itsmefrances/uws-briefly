"""Print stories from both feeds that have not been posted yet, as JSON.

Usage: python3 tools/new_stories.py            (list new stories)
       python3 tools/new_stories.py --mark URL [URL ...]   (record URLs as handled)
"""
import html, json, re, subprocess, sys, xml.etree.ElementTree as ET
from pathlib import Path

FEEDS = {
    "West Side Rag": "https://www.westsiderag.com/feed",
    "I Love the Upper West Side": "https://www.ilovetheupperwestside.com/feed/",
}
# The West Sider is a weekly newsletter with no RSS feed; new issues are found in its sitemap.
WEST_SIDER_SITEMAP = "https://www.thewestsidernyc.com/sitemap.xml"
STATE = Path(__file__).resolve().parent.parent / "posted.json"
NS = {"content": "http://purl.org/rss/1.0/modules/content/"}


def load():
    return json.loads(STATE.read_text()) if STATE.exists() else []


def fetch(url):
    return subprocess.run(
        ["curl", "-sS", "-L", "--fail", "-A", "Mozilla/5.0 (newsreader)", url],
        check=True, capture_output=True).stdout


def items():
    for source, url in FEEDS.items():
        for it in ET.fromstring(fetch(url)).iter("item"):
            body = it.findtext("content:encoded", namespaces=NS) or it.findtext("description") or ""
            text = re.sub(r"<script.*?</script>", " ", body, flags=re.S)
            text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text))).strip()
            yield {
                "source": source,
                "title": html.unescape(it.findtext("title") or ""),
                "url": (it.findtext("link") or "").strip(),
                "published": it.findtext("pubDate"),
                "sponsored": text[:200].lower().find("sponsored") != -1,
                "text": text[:2500],
            }


def strip(page):
    page = re.sub(r"<(script|style).*?</\1>", " ", page, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", page))).strip()


def west_sider(seen):
    """Each issue bundles many short items, so the text is long and holds several stories."""
    sitemap = fetch(WEST_SIDER_SITEMAP).decode()
    for entry in re.findall(r"<url>(.*?)</url>", sitemap, flags=re.S):
        url = re.search(r"<loc>(.*?)</loc>", entry).group(1).strip()
        if "/p/" not in url or url in seen:
            continue
        page = fetch(url).decode("utf-8", "replace")
        title = re.search(r"<title>(.*?)</title>", page, flags=re.S)
        lastmod = re.search(r"<lastmod>(.*?)</lastmod>", entry)
        yield {
            "source": "The West Sider",
            "title": html.unescape(title.group(1)).replace(" | The West Sider", "") if title else url,
            "url": url,
            "published": lastmod.group(1) if lastmod else None,
            "sponsored": False,
            "multi_story_issue": True,
            "text": strip(page)[:20000],
        }


if __name__ == "__main__":
    seen = load()
    if sys.argv[1:2] == ["--mark"]:
        STATE.write_text(json.dumps(sorted(set(seen) | set(sys.argv[2:])), indent=1) + "\n")
    else:
        new = [i for i in items() if i["url"] not in seen] + list(west_sider(seen))
        print(json.dumps(new, indent=1, ensure_ascii=False))
