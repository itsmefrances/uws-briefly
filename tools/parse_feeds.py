import sys, re, html, xml.etree.ElementTree as ET
ns={'content':'http://purl.org/rss/1.0/modules/content/'}
for f in sys.argv[1:]:
    root=ET.parse(f).getroot()
    print("#####", f)
    for it in root.iter('item'):
        t=it.findtext('title'); l=it.findtext('link'); d=it.findtext('pubDate')
        c=it.findtext('content:encoded',namespaces=ns) or it.findtext('description') or ''
        txt=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',c))).strip()
        print(f"\n## {html.unescape(t)}\n{d}\n{l}\n{txt[:900]}")
