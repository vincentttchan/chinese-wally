"""Promote the approved 2.3.1 without overwriting preview or archived chapters.

Only prepares files. Building, publishing and live verification are separate steps.
"""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[1]
chapters = root / 'public/chapters'
preview = chapters / 'kangqu-listening-v2-2.3.1-preview-20261027'
destination = chapters / 'kangqu-listening-v2-2.3.1'
archive = root / 'docs/releases/kangqu-2.3.1-promotion-20261027'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest = json.loads((preview / 'data/version-manifest.json').read_text())
if manifest['version'] != '2.3.1':
    raise SystemExit('The reviewed 2.3.1 preview is missing.')
for name, fingerprint in manifest['entries'].items():
    if sha(preview / name) != fingerprint:
        raise SystemExit('The reviewed preview changed: ' + name)

documents = {}
for name in ['index.html', 'fresh.html', 'note.html']:
    html = (preview / name).read_text()
    html = html.replace(preview.name, destination.name)
    html = html.replace('chinese-wally:kangqu-listening-v2:preview:2.3.1:journal:',
                        'chinese-wally:kangqu-listening-v2:journal:')
    html = html.replace('<title>康衢駢慶 2.3.1 · 本機文案預覽</title>',
                        '<title>在人群中聽樂 · 畫中尋人</title>' if name == 'index.html' else '<title>無記憶試玩 · 康衢駢慶 2.3.1</title>')
    html = html.replace('<title>康衢駢慶 2.3.1 · 畫作小記預覽</title>',
                        '<title>畫作小記 · 康衢駢慶 2.3.1</title>')
    if (destination / name).exists() and (destination / name).read_text() != html:
        raise SystemExit('A different production document already exists: ' + name)
    documents[name] = html

archive.mkdir(parents=True, exist_ok=True)
legacy = chapters / 'kangqu-listening'
for name, source in [('previous-redirect.html', legacy / 'index.html'),
                     ('previous-active-release.json', legacy / 'data/active-release.json')]:
    saved = archive / name
    if not saved.exists():
        saved.write_bytes(source.read_bytes())

destination.mkdir(parents=True, exist_ok=True)
(destination / 'data').mkdir(exist_ok=True)
for name, html in documents.items():
    (destination / name).write_text(html)
source_note = json.loads((preview / 'data/source-note.json').read_text())
source_note['production'] = {'version': '2.3.1', 'approved': '2026-10-27',
    'sourcePreview': str(preview.relative_to(root)), 'previewEntries': manifest['entries'],
    'storage': 'Retains the existing production journal:v2 and legacy journal:v1 keys; preview keys remain isolated.'}
(destination / 'data/source-note.json').write_text(json.dumps(source_note, ensure_ascii=False, indent=2) + '\n')
production = dict(manifest)
production.update(status='production', entry='chapters/' + destination.name + '/index.html',
    storageKey='chinese-wally:kangqu-listening-v2:journal:v2',
    approvedPreview=str(preview.relative_to(root)), approvedPreviewEntries=manifest['entries'],
    entries={name: sha(destination / name) for name in documents},
    sharedAssetManifest='chapters/kangqu-listening-v2/data/version-manifest.json',
    previousProductionEntry='chapters/kangqu-listening-v2-2.2.0-navigation-20261027/index.html',
    scope='Approved 2.3.1 content promoted to the official route. Interface, animation, shared assets and production storage retained.')
(destination / 'data/version-manifest.json').write_text(json.dumps(production, ensure_ascii=False, indent=2) + '\n')

target = '../' + destination.name + '/index.html?v=2.3.1-20261027'
redirect = '''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>在人群中聽樂 · 畫中尋人</title>
<meta http-equiv="refresh" content="0;url=TARGET">
<script>location.replace(new URL('TARGET',location.href).href);</script>
</head><body><p>正在展開《在人群中聽樂》。</p><a href="TARGET">進入畫卷</a></body></html>
'''.replace('TARGET', target)
(legacy / 'index.html').write_text(redirect)
active = json.loads((archive / 'previous-active-release.json').read_text())
active.update(version='2.3.1', promoted='2026-10-27',
    entry='chapters/' + destination.name + '/index.html', revision='2.3.1-20261027',
    previousProductionEntry=production['previousProductionEntry'],
    approvedGameplayEntry='chapters/' + destination.name + '/index.html',
    previewEntry='chapters/' + preview.name + '/index.html',
    storageKey=production['storageKey'],
    assets='Existing native painting, Lantern UI, music, portraits and animation remain read-only; previous production and previews retained.')
for folder in [legacy, destination]:
    (folder / 'data/active-release.json').write_text(json.dumps(active, ensure_ascii=False, indent=2) + '\n')

path = root / 'src/game/historicalChapters.ts'
text = path.read_text()
text = text.replace("export const kangquChapterRevision = '2.2.0-navigation-20261027';",
                    "export const kangquChapterRevision = '2.3.1-20261027';")
text = text.replace("assetPath('chapters/kangqu-listening-v2-2.2.0-navigation-20261027/index.html')",
                    "assetPath('chapters/kangqu-listening-v2-2.3.1/index.html')")
if "export const kangquChapterRevision = '2.3.1-20261027';" not in text:
    raise SystemExit('Unexpected official route; review it before promotion.')
path.write_text(text)
print('Prepared official 2.3.1; previous production, previews, assets and journal keys retained.')
