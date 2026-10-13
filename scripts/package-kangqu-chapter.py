"""Package the saved Kangqu document as an application asset; no browser or tests.

The self-contained document isolates chapter DOM state while reading the game's
canonical Lantern UI sources. This packager assembles its versioned source first;
do not hand-edit public/chapters/kangqu-listening/index.html.
"""
from pathlib import Path
import hashlib
import json
import shutil
import runpy
import argparse

parser=argparse.ArgumentParser()
parser.add_argument("--runtime-only",action="store_true",help="Refresh text/runtime while retaining the packaged art and provenance.")
args=parser.parse_args()

root=Path(__file__).resolve().parents[1]
source=root/'output/art-direction/wanshou-third-scroll'
version=source/'v1.2'
runpy.run_path(str(version/'build-artifacts.py'),run_name='__main__')
destination=root/'public/chapters/kangqu-listening'
for name in ['art','ui','collections','recognition','data']:(destination/name).mkdir(parents=True,exist_ok=True)

copies={
 source/'stage-and-crowd-native.png':'art/native-segment.png',
 version/'art/native-segment-lossless.webp':'art/native-segment-lossless.webp',
 version/'art/encoding-record.json':'data/native-encoding-record.json',
 source/'stage-and-crowd-overview.jpg':'art/overview.jpg',
 source/'v0.2/sources/third-scroll-public-33949x800.jpg':'art/complete-scroll.jpg',
}
shared_ui=['painted-icons.png','reading-paper.png','lantern-search-frame-v1.png','lantern-silk-note-v1.png','lantern-dialogue-ink-frame-v1.png']
for name in shared_ui:copies[root/'public/art/ui'/name]='ui/'+name
for name in ['drum','discs','flag','painted-wall']:copies[source/'v0.2/journal-art'/(name+'-illustration-v1.png')]='collections/'+name+'-illustration-v1.png'
for name in ['gong','horn']:copies[version/'collections'/(name+'-illustration-v1.png')]='collections/'+name+'-illustration-v1.png'
for name in ['seated-drum','hand-at-hat','brown-green-hem']:
 for suffix in ['-head-source.png','-head-tracing-v2.png']:copies[source/'v0.3.2/recognition'/(name+suffix)]='recognition/'+name+suffix
for name in ['red-front-east-05','watcher-pattern']:
 for suffix in ['-head-source.png','-head-tracing-v2.png']:copies[version/'recognition'/(name+suffix)]='recognition/'+name+suffix
for suffix in ['-head-source.png','-head-tracing-v2.png']:copies[version/'recognition'/('watcher-blue'+suffix)]='recognition/watcher-blue'+suffix
# v1.2 runtime animates native pixels; generated frames remain in archived source.
if args.runtime_only:
 records=json.loads((root/'docs/chapters/kangqu-listening-application-assets.json').read_text())['assets']
else:
 records=[]
 for origin,relative in copies.items():
  target=destination/relative;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(origin,target)
  records.append({'source':str(origin.relative_to(root)),'applicationAsset':relative,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})

 native=json.loads((source/'source-provenance.json').read_text())
 full=json.loads((source/'v0.2/sources/full-scroll-provenance.json').read_text())
 source_note={
  'painting':'崇慶皇太后六旬萬壽圖 · 第三卷 康衢駢慶',
  'catalog':native['catalog_page'],
  'nativeViewer':native['viewer_url'],
  'nativeSegment':{'sourceDimensions':native['source_dimensions'],'sourceCrop':native['source_bbox'],'dimensions':native['output_dimensions'],'sha256':native['output_sha256'],'method':'官方原生圖磚拼合及裁切，沒有放大、補畫或生成原畫。'},
  'completeComposition':{'page':'https://yihua.art/chong-qing-wan-shou-qing-dian.html','image':'https://yihua.art/wp-content/uploads/2023/04/wanshoutu-shang.jpg','dimensions':[33949,800],'scope':'完整公開構圖；不當作全卷原生高清。'},
  'interfaceArt':'頭像與收藏圖樣為原畫衍生插圖；角色短句為遊戲虛構對白。',
  'scope':'互動位置位於 4500×2843 的原生清晰段落，完整第三卷其他位置未有同等高清互動覆蓋。'
 }
 source_note['displayBounds']=json.loads((version/'viewport-config.json').read_text())
 source_note['runtimeNativeEncoding']=json.loads((version/'art/encoding-record.json').read_text())
 (destination/'data/source-note.json').write_text(json.dumps(source_note,ensure_ascii=False,indent=2)+'\n')

html=(version/'play.html').read_text()
paths={
 '../stage-and-crowd-native.png':'art/native-segment.png',
 '../stage-and-crowd-overview.jpg':'art/overview.jpg',
 '../v0.2/sources/third-scroll-public-33949x800.jpg':'art/complete-scroll.jpg',
 '../v0.2/ui/':'ui/',
 '../v0.2/journal-art/':'collections/',
 '../v0.3.2/recognition/':'recognition/',
 '../../../../public/fonts/':'../../fonts/',
 '../../../../public/#historical-paintings':'../../index.html#historical-paintings',
 '../../../../public/index.html':'../../index.html',
 '../source-provenance.json':'data/source-note.json',
}
for name in shared_ui:paths['../../../../public/art/ui/'+name]='ui/'+name
paths['../../../../public/art/']='../../art/'
paths['../../../../public/']='../../'
for old,new in paths.items():html=html.replace(old,new)
html=html.replace('<a href="data/source-note.json">原畫來源記錄</a>','<a href="data/source-note.json" target="_blank" rel="noopener noreferrer">原畫來源記錄</a>')

# Parent/child handshakes signal native-image readiness, not gameplay completion.
notify="if(window.parent!==window)window.parent.postMessage({type:'kangqu-chapter-ready'},window.location.origin==='null'?'*':window.location.origin);"
ready="function ready(){if(state.ready)return;state.ready=true;$('loading').hidden=true;$('painting').classList.add('is-decoded');drawPanel();drawPoints();render();}"
if ready not in html:raise RuntimeError('Native readiness function changed; update the host handshake.')
html=html.replace(ready,ready[:-1]+notify+'}')
html=html.replace("function failed(){state.ready=false;", "function failed(){if(window.parent!==window)window.parent.postMessage({type:'kangqu-chapter-error'},window.location.origin==='null'?'*':window.location.origin);state.ready=false;")
bridge="""
window.addEventListener('message',event=>{
 if(event.source!==window.parent||event.origin!==window.location.origin||event.data?.type!=='kangqu-host-ping')return;
 if(state.ready)window.parent.postMessage({type:'kangqu-chapter-ready'},event.origin==='null'?'*':event.origin);
});
"""
html=html.replace('</script></body>',bridge+'</script></body>')
(destination/'index.html').write_text(html)

manifest={'date':'2026-10-13','version':'1.2','sourceVersion':'1.2','route':'#kangqu-listening','homeRoute':'#lantern-festival','method':'research-backed content assembly; no test, app build or browser execution','assets':records,'notes':['All v0.2/v0.3/v0.5 preview style layers remain excluded. The site and current Lantern CSS are read directly by the source builder.','v1.2 integrates spatial observation, mandatory celebration background, evidence judgement, original-pixel motion, collection hit tolerance and journal navigation.','Observation conclusions now connect the visible instruments, procession and auspicious wall motifs to the historical meaning of 康衢駢慶.','The wall motif is identified as 暗八仙 from visible native pixels and the Palace Museum motif definition; source scope is recorded in content-sources.json.']}
doc=root/'docs/chapters/kangqu-listening-application-assets.json';doc.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
shutil.copy2(version/'ui-source-manifest.json',destination/'data/ui-source-manifest.json')
shutil.copy2(version/'viewport-config.json',destination/'data/viewport-config.json')
shutil.copy2(version/'content-sources.json',destination/'data/content-sources.json')
shutil.copy2(version/'animation/generation-records.json',destination/'animation/generation-records.json')
shutil.copy2(version/'collections/generation-records.json',destination/'data/collection-generation-records.json')
shutil.copy2(version/'dialogue/dialogue-evidence.json',destination/'data/dialogue-evidence.json')
print('Packaged Kangqu v1.2 chapter with research-backed observations.')
