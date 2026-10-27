"""Attach the approved entrance to the reviewed 2.1.14, preserving both versions.

This packages an independent chapter only. It never promotes a route or deploys.
"""
from pathlib import Path
import hashlib
import json
import re
import shutil

root = Path(__file__).resolve().parents[1]
base = root / 'public/chapters/kangqu-listening-v2'
archive = root / 'public/chapters/kangqu-listening-v2-2.1.14'
destination = root / 'public/chapters/kangqu-listening-v2-2.2.0'
source = root / 'src/entries/kangqu-three-act-v2.2.0'
ledger = root / 'docs/releases/kangqu-three-act-2.2.0-preservation.json'
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
base_manifest = json.loads((base / 'data/version-manifest.json').read_text())
if base_manifest['version'] != '2.1.14':
    raise SystemExit('Requires the reviewed 2.1.14; no version was written.')

if ledger.exists():
    recorded = json.loads(ledger.read_text())
    if digest(base / 'index.html') != recorded['baseIndexSha256']:
        raise SystemExit('The 2.1.14 document changed; preserve/reconcile it before repackaging.')

archive.mkdir(parents=True, exist_ok=True)
original = archive / 'original-index.html'
if original.exists() and digest(original) != digest(base / 'index.html'):
    raise SystemExit('The preserved 2.1.14 differs; it was not overwritten.')
if not original.exists():
    shutil.copyfile(base / 'index.html', original)
# Both saved documents read existing reviewed assets in place. Avoid hydrating
# unrelated iCloud assets merely to duplicate them; the source manifest pins them.
archived_html = original.read_text().replace('<head>', '<head><base href="../kangqu-listening-v2/">', 1)
(archive / 'index.html').write_text(archived_html)
(archive / 'data').mkdir(exist_ok=True)
shutil.copyfile(base / 'data/version-manifest.json', archive / 'data/version-manifest.json')
shutil.copyfile(base / 'data/source-note.json', archive / 'data/source-note.json')
(archive / 'fresh.html').write_text((base / 'fresh.html').read_text().replace('<head>', '<head><base href="../kangqu-listening-v2/">', 1))
destination.mkdir(parents=True, exist_ok=True)
(destination / 'data').mkdir(exist_ok=True)

html = original.read_text()
def replace_once(old, new):
    global html
    if html.count(old) != 1:
        raise SystemExit('Unexpected reviewed document shape: ' + old[:90])
    html = html.replace(old, new, 1)

css = (source / 'entry.css').read_text().replace("url('/fonts/", "url('../../fonts/")
css += '''
/* Same seven-column layout and transitions; this chapter has its own geometry. */
.lantern-entry-v1 .art-world,.lantern-entry-v1 .full-painting{width:4500px;height:2843px}
.lantern-entry-v1[hidden]{display:none!important}
.introduction.lantern-entry-cover-v1 .intro-sequence[hidden]{display:none!important}
'''
replace_once('<head>', '<head><base href="../kangqu-listening-v2/">')
replace_once('<a href="./index.html" aria-current="page">', '<a href="../kangqu-listening-v2-2.2.0/index.html" aria-current="page">')
if html.count('href="data/source-note.json"') != 2:
    raise SystemExit('Unexpected source-note links.')
html = html.replace('href="data/source-note.json"', 'href="../kangqu-listening-v2-2.2.0/data/source-note.json"')
replace_once('</style>', '\n' + css + '\n</style>')
replace_once('  <footer id="controls"', (source / 'entry.html').read_text() + '\n  <footer id="controls"')
replace_once('function ready(){', (source / 'entry.js').read_text() + '\nfunction ready(){')
replace_once("$('introduction').hidden=!intro;", "$('introduction').hidden=!intro||kangquThreeAct.coverHidden;")
replace_once('state.intro=0;state.journalReturn=null;', 'kangquThreeAct.reset();state.intro=0;state.journalReturn=null;')
pattern = r" if\(state.mode==='intro'\)\{\n  const steps=.*?\n \}else if\(state.mode==='seek'\)\{"
html, count = re.subn(pattern, lambda _: " if(state.mode==='intro'){\n  panel.replaceChildren();kangquThreeAct.drawCover();\n }else if(state.mode==='seek'){", html, flags=re.S)
if count != 1:
    raise SystemExit('Could not isolate the old intro; no new document written.')
if html.count("chapter.version='2.1.14';") != 2:
    raise SystemExit('Unexpected runtime version markers.')
html = html.replace("chapter.version='2.1.14';", "chapter.version='2.2.0';")
(destination / 'index.html').write_text(html)
fresh = html.replace('const expansionMemoryless=false;', 'const expansionMemoryless=true;')
fresh = fresh.replace('<title>在人群中聽樂 · 畫中尋人</title>', '<title>無記憶試玩 · 康衢駢慶 2.2.0</title>')
(destination / 'fresh.html').write_text(fresh)

manifest = dict(base_manifest)
manifest.update(version='2.2.0', date='2026-10-27',
    entry='chapters/kangqu-listening-v2-2.2.0/index.html',
    preservedVersion='chapters/kangqu-listening-v2-2.1.14/index.html',
    baseVersion='2.1.14', baseIndexSha256=digest(original),
    entrance={'acts': ['為誰祝壽', '畫中一街', '外鄉來客'],
              'role': '初到京城的外鄉客', 'reference': 'lantern-three-act-v1/1.1.0',
              'columns': 7, 'coverOverlapMs': 1050, 'coverFadeMs': 760,
              'driftDirection': 'right', 'driftDurationMs': 52000},
    scope='Independent local version; entrance integration only. No route promotion or deployment.')
manifest['memorylessTestEntry'] = {'path':'chapters/kangqu-listening-v2-2.2.0/fresh.html',
    'baseVersion':'2.2.0', 'storage':'No journal reads or writes; discoveries and seal live only in the current document.',
    'sha256':digest(destination / 'fresh.html')}
(destination / 'data/version-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
note = json.loads((base / 'data/source-note.json').read_text())
note['newVersion'].update(version='2.2.0', date='2026-10-27')
note['entrance'] = {'historicalCopy':'沿用已確認的三幕；一七五一年指慶典年份，不作畫作完成年份。',
    'fiction':'初到京城的外鄉客身份為遊戲虛構。',
    'art':'只移動既有官方原生畫作段落，不生成或修改原畫像素。'}
(destination / 'data/source-note.json').write_text(json.dumps(note, ensure_ascii=False, indent=2)+'\n')

preserved = {relative:digest(base / relative) for relative in ['index.html', 'fresh.html', 'data/version-manifest.json', 'data/source-note.json']}
record = {'version':'2.2.0', 'baseVersion':'2.1.14', 'baseIndexSha256':digest(base / 'index.html'),
    'basePath':str(base.relative_to(root)), 'archivePath':str(archive.relative_to(root)),
    'entry':str((destination / 'index.html').relative_to(root)),
    'newIndexSha256':digest(destination / 'index.html'), 'preservedFiles':preserved,
    'sharedAssets':{'base':'chapters/kangqu-listening-v2/', 'handling':'Read-only references; no asset was rewritten.',
                    'assetHashes':base_manifest['assets']},
    'storageKey':manifest['storageKey'], 'deployment':'Not deployed; official routes unchanged.'}
ledger.parent.mkdir(parents=True, exist_ok=True)
ledger.write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n')
print('Saved 2.2.0; preserved 2.1.14 document and manifest; existing assets unchanged.')
print(destination / 'index.html')
