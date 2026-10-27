"""Promote the reviewed 2.2.0 entry, preserving reviewed 2.1.14 and older art."""
from pathlib import Path
import hashlib
import json

root=Path(__file__).resolve().parents[1]
chapters=root/'public/chapters'
new=chapters/'kangqu-listening-v2-2.2.0'
base=chapters/'kangqu-listening-v2'
archive=chapters/'kangqu-listening-v2-2.1.14'
version=json.loads((new/'data/version-manifest.json').read_text())
if version['version']!='2.2.0':raise SystemExit('The reviewed 2.2.0 is missing.')
if (archive/'original-index.html').read_bytes()!=(base/'index.html').read_bytes():
    raise SystemExit('The reviewed 2.1.14 archive is not exact.')
for asset in version['assets']:
    path=base/asset['path']
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest()!=asset['sha256']:
        raise SystemExit('A reviewed asset is missing or differs: '+asset['path'])
legacy=chapters/'kangqu-listening'
previous=chapters/'kangqu-listening-legacy-20261027'
if not (previous/'original-index.html').is_file():
    raise SystemExit('The previously published chapter archive is missing.')
target='../kangqu-listening-v2-2.2.0/index.html?v=2.2.0-20261027'
redirect='''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>在人群中聽樂 · 畫中尋人</title>
<meta http-equiv="refresh" content="0;url=TARGET">
<script>location.replace(new URL('TARGET',location.href).href);</script>
</head><body><p>正在展開《在人群中聽樂》。</p><a href="TARGET">進入畫卷</a></body></html>
'''.replace('TARGET',target)
(legacy/'index.html').write_text(redirect)
release={'chapter':'kangqu-listening','version':'2.2.0','promoted':'2026-10-27',
    'route':'#kangqu-listening','entry':'chapters/kangqu-listening-v2-2.2.0/index.html',
    'revision':'2.2.0-20261027','archivedEntry':'chapters/kangqu-listening-v2-2.1.14/index.html',
    'exactArchivedDocument':'chapters/kangqu-listening-v2-2.1.14/original-index.html',
    'archiveOriginalSha256':hashlib.sha256((archive/'original-index.html').read_bytes()).hexdigest(),
    'olderPublishedArchive':'chapters/kangqu-listening-legacy-20261027/index.html',
    'storageKey':version['storageKey'],
    'assets':'Reviewed 2.1.14 assets retained read-only under kangqu-listening-v2 and original shared directories.'}
for folder in [legacy,new]:
    (folder/'data/active-release.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
print('Official Kangqu entry now targets 2.2.0; 2.1.14 and the older published chapter are preserved.')
