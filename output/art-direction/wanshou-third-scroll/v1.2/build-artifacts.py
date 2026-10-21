"""Assemble saved chapter sources with the game's canonical Lantern UI.

This packages text and assets; it does not run the game, an app build or tests.
"""
from pathlib import Path
import hashlib
import json
import re
from html import escape

folder=Path(__file__).resolve().parent
root=folder.parents[3]
data=folder.parent/'v0.3.2'
styles=['src/styles.css','src/lantern.css','src/lantern-journal.css',
        'src/lantern-search-hud.css','src/lantern-observation.css',
        'src/lantern-field-journal.css','src/lantern-feedback.css','src/lantern-spark.css','src/page-motion.css']
css='\n'.join((root/name).read_text() for name in styles)
css=css.replace("url('/art/", "url('../../../../public/art/")
css+='\n'+(folder/'play.css').read_text()
icons={name:int(cell) for name,cell in re.findall(r'export const (\w+) = icon\((\d+)\);',(root/'src/components/ArtIcons.tsx').read_text())}
icon_js='const canonicalIcons='+json.dumps(icons)+';\n'
icon_js+="function icon(name,size=18){const cell=canonicalIcons[name];return `<span class=\"art-icon\" aria-hidden=\"true\" style=\"width:${size}px;height:${size}px;background-position:${cell%4*100/3}% ${Math.floor(cell/4)*100/3}%\"></span>`;}\n"
js='\n'.join((data/name).read_text() for name in ['chapter-data.js','inventory.js','collection-revisions.js','diagnostic-revisions.js','geometry.js'])
js+='\n'+(folder/'content-revisions.js').read_text()
js+='\n'+(folder/'dialogue-revisions.js').read_text()
config=json.loads((folder/'viewport-config.json').read_text())
js+='\nconst chapterViewport='+json.dumps(config,ensure_ascii=False)+';\n'+(folder/'viewport.js').read_text()
music_sources=['src/audio/chapterMusic.js','src/audio/chapterMusicTracks.js']
shared_music='\n'.join((root/name).read_text().replace('export function ','function ').replace('export const ','const ') for name in music_sources)
js+='\nconst ensemblePlayback='+json.dumps(json.loads((root/'src/game/kangquEnsemblePlayback.json').read_text()))+';\n'
js+='\nconst audiencePlayback='+json.dumps(json.loads((root/'src/game/kangquAudiencePlayback.json').read_text()))+';\n'
js+='\nconst hitContourPaths='+json.dumps(json.loads((folder/'hit-contours.json').read_text()))+';\n'
js+='\n'+icon_js+shared_music+'\n'+(folder/'music.js').read_text()+'\n'+(folder/'epilogue.js').read_text()+'\n'+(folder/'audience-animation.js').read_text()+'\n'+(folder/'hit-feedback.js').read_text()+'\n'+(folder/'play.js').read_text()+'\n'+(folder/'interface.js').read_text()+'\n'+(folder/'map.js').read_text()
js+='\n'+(root/'src/chapterNavigation.js').read_text().replace('export function ','function ')
js+='\ndocument.querySelectorAll(\".chapter-links\").forEach(keepCurrentChapterVisible);\n'
js+='\n'+(root/'src/page-motion.js').read_text()
shell=(folder/'shell.html').read_text()

# Generate this isolated document's chapter navigation from the same registry
# used by ChapterLinks, rather than retaining the old three-link cover.
registry=(root/'src/game/historicalChapters.ts').read_text()
chapter_links=re.findall(r"\{id:'([^']+)',title:'([^']+)',painting:'([^']+)',href:'([^']+)'",registry)
if not chapter_links:raise RuntimeError('Historical chapter navigation registry was not found.')
nav_match=re.search(r'<nav class="chapter-links"[^>]*>.*?</nav>',shell,re.S)
if not nav_match:raise RuntimeError('Kangqu chapter navigation container was not found.')
practice_links=re.findall(r'<a\b[^>]*href="[^"]*#examination"[^>]*>.*?</a>',nav_match.group(),re.S)
links=[]
for chapter_id,title,painting,href in chapter_links:
    current=chapter_id=='kangqu-listening'
    target=href if current else '../../../../public/index.html'+href
    attrs=' aria-current="page"' if current else ' class="chapter-back" target="_top"'
    preload=' data-preload-src="../../../../public/art/lantern-festival/full-scroll.jpg"' if chapter_id=='lantern-festival' else ''
    links.append(f'<a href="{escape(target,quote=True)}"{attrs}{preload}><span>{escape(painting.split(" · ")[0])}</span>{escape(title)}</a>')
nav='<nav class="chapter-links" aria-label="選擇畫卷">'+''.join(links+practice_links)+'</nav>'
shell=shell[:nav_match.start()]+nav+shell[nav_match.end():]

def painted(match):
    name=match.group(1);cell=icons[name];size=int(match.group(2) or 18)
    return f'<span class="art-icon" aria-hidden="true" style="width:{size}px;height:{size}px;background-position:{cell%4*100/3}% {cell//4*100/3}%"></span>'
shell=re.sub(r'\{\{icon:(\w+)(?::(\d+))?\}\}',painted,shell)
page='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>在人群中聽樂 · 畫中有案</title><style>\n'+css+'\n</style></head><body class="lantern-game kangqu-game">'+shell+'<script>\n'+js+'\n</script></body></html>\n'
(folder/'play.html').write_text(page)
records=[{'path':name,'sha256':hashlib.sha256((root/name).read_bytes()).hexdigest()} for name in styles+['src/components/ArtIcons.tsx','src/game/historicalChapters.ts','src/chapterNavigation.js']+music_sources]
(folder/'ui-source-manifest.json').write_text(json.dumps({'standard':'宮中鬧元宵現行介面','sources':records,'chapterAdaptations':['source-coordinate display bounds and cover camera','initial view at 1.5 times cover minimum','undistorted native-content map with viewport rectangle','four target portraits','202 people with individually authored three-line fictional dialogue and native evidence records','eight collection illustrations in two columns, plus visible motif progress','four characters, spatial observation, evidence judgement, two historical interpretations and approved v7 ensemble and seven-person audience group animations with stationary backgrounds'],'retiredStyles':['v0.2/common.css','v0.2/effects.css','v0.2/art-ui.css','v0.2/journal-ui.css','v0.3.2/play.css','v0.5/play.css']},ensure_ascii=False,indent=2)+'\n')
print('Saved v1.2 chapter with research-backed observations and collection names.')
