"""Version the formal Kangqu navigation without editing the approved 2.2.0."""
from pathlib import Path
import hashlib
import json
import re
root=Path(__file__).resolve().parents[1]
chapters=root/'public/chapters'
source=chapters/'kangqu-listening-v2-2.2.0/index.html'
destination=chapters/'kangqu-listening-v2-2.2.0-navigation-20261027'
html=source.read_text()
html,n=re.subn(r'<a\b[^>]*href="[^"]*#qingming-shanghe"[^>]*><span>北宋</span>清明上河圖</a>', '<span class="chapter-pending" aria-disabled="true"><span>北宋</span>清明上河圖 · 已上鎖</span>',html)
if n!=1:raise RuntimeError('Expected one Qingming navigation entry')
html,n=re.subn(r'<a\b[^>]*href="[^"]*#examination"[^>]*><span>卷一</span>榜下尋人</a>','',html)
if n!=1:raise RuntimeError('Expected one Examination navigation entry')
html=html.replace('href="../kangqu-listening-v2-2.2.0/index.html" aria-current="page"','href="./index.html" aria-current="page"')
destination.mkdir(parents=True,exist_ok=True)
(destination/'index.html').write_text(html)
(destination/'version.json').write_text(json.dumps({'version':'2.2.0-navigation-20261027','source':'public/chapters/kangqu-listening-v2-2.2.0/index.html','sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'entrySHA256':hashlib.sha256(html.encode()).hexdigest(),'scope':'Only cover navigation changed: remove Examination and lock Qingming. Approved 2.2.0 document, gameplay, shared assets and storage keys preserved.'},ensure_ascii=False,indent=2)+'\n')
print('Saved versioned Kangqu navigation; approved source unchanged.')
