"""Create a local content candidate from the sealed navigation edition.

Never promotes routes, rebuilds the site, overwrites prior versions or deploys.
Shared art, animation, fonts, music and UI remain read-only references.
"""
from pathlib import Path
import hashlib
import json
import re

root = Path(__file__).resolve().parents[1]
base = root / 'public/chapters/kangqu-listening-v2-2.2.0-navigation-20261027/index.html'
source = root / 'src/entries/kangqu-content-v2.3.0'
destination = root / 'public/chapters/kangqu-listening-v2-2.3.0-preview-20261027'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
base_hash = (source / 'base.sha256').read_text().strip()
if sha(base) != base_hash:
    raise SystemExit('The pinned 2.2.0 source changed; no candidate was written.')
copy = json.loads((source / 'copy.json').read_text())
html = base.read_text()

def replace_once(old, new):
    global html
    if html.count(old) != 1:
        raise SystemExit('Unexpected pinned source: ' + old[:100])
    html = html.replace(old, new, 1)

replace_once('<title>在人群中聽樂 · 畫中尋人</title>', '<title>康衢駢慶 2.3.0 · 本機文案預覽</title>')
replace_once('<a href="./index.html" aria-current="page">', '<a href="../'+destination.name+'/index.html" aria-current="page">')
html = html.replace('../kangqu-listening-v2-2.2.0/data/source-note.json', '../'+destination.name+'/data/source-note.json')
# All revisions have finished before this marker. Install candidate copy last.
replace_once('const chapterViewport=', 'const kangquContentCopy='+json.dumps(copy, ensure_ascii=False)+';\nconst chapterViewport=')
work_start=html.index('const kangquWorkContext={')
work_end=html.index('\n// Original-painting recollections;',work_start)
html=html[:work_start]+(source / 'content.js').read_text()+'\nconst kangquWorkContext='+json.dumps(copy['work'],ensure_ascii=False)+';'+html[work_end:]
note_start=html.index('function drawRecollection(){')
note_end=html.index('\n// Read-only character coverage',note_start)
html=html[:note_start]+(source / 'recollection.js').read_text()+'\n'+html[note_end:]
flag_start=html.index('async function beginFlagObservation(person){')
flag_end=html.index('async function beginAudienceObservation(person){',flag_start)
html=html[:flag_start]+(source / 'flag-introduction.js').read_text()+'\n'+html[flag_end:]
html=html.replace("chapter.version='2.2.0';", "chapter.version='2.3.0';")
replace_once("const expansionJournalKey='chinese-wally:kangqu-listening-v2:journal:v2';", "const expansionJournalKey='chinese-wally:kangqu-listening-v2:preview:2.3.0:journal:v2';")
replace_once("const expansionLegacyJournalKey='chinese-wally:kangqu-listening-v2:journal:v1';", "const expansionLegacyJournalKey='chinese-wally:kangqu-listening-v2:preview:2.3.0:journal:v1';")
replace_once("state.round=0;state.completed=0;state.completedStations=[];", "resetKangquSummary();state.round=0;state.completed=0;state.completedStations=[];")
# Retain the third animation intact, then let its observation note be read.
replace_once('if(finishMain)await finishInquiryStation();', 'if(finishMain){drawPanel();render();panel.focus({preventScroll:true});}')
replace_once("if(station==='audience')await finishInquiryStation();", "if(station==='audience'){drawPanel();render();panel.focus({preventScroll:true});}")
# The same note close and character bubble carry each approved handoff.
replace_once("if(state.mode==='observe'&&state.step===2){await finishInquiryStation();return;}", "if(state.mode==='observe'&&state.step===2){await offerInquiryHandoff();return;}")
replace_once("speak(inquiryPerson(),station.handoff,false,'handoff');", "const next=document.createElement('button');next.id='kangqu-handoff-next';next.className='emperor-speech-action';next.textContent={ensemble:'去找一位持旗者',flags:'去找街邊的表演者',audience:'閱讀畫作小記'}[current().station];next.onclick=()=>clearCharacterSpeech({restoreView:false});$('speech-bubble').append(next);\n speak(inquiryPerson(),station.handoff,false,'handoff');")
replace_once("function speak(person,text,found=false,action=null){\n if(!person)return;", "function speak(person,text,found=false,action=null){\n if(!person)return;\n if(action!=='handoff')$('kangqu-handoff-next')?.remove();")
replace_once("state.speaker=null;hideSpeechRetry();$('speech').hidden=true;", "state.speaker=null;$('kangqu-handoff-next')?.remove();$('kangqu-flag-next')?.remove();hideSpeechRetry();$('speech').hidden=true;")
replace_once("if(restoreFocus){\n  const person=chapter.people.find(person=>person.id===speaker?.id);", "if(speaker?.action==='handoff'&&state.mode==='observe'&&state.step===2){void finishInquiryStation();return;}\n if(restoreFocus){\n  const person=chapter.people.find(person=>person.id===speaker?.id);")
# A preview-only direct note entry supports reviewing the new question without
# synthetic collections, stored progress, or changes to the playable entries.
replace_once('async function nativeLoaded(){try{await $(\'painting\').decode();}catch{}ready();}', 'async function nativeLoaded(){try{await $(\'painting\').decode();}catch{}ready();if(kangquNotePreview&&!kangquNoteOpened){kangquNoteOpened=true;void openRecollection();}}')
replace_once('const state={mode:', 'const kangquNotePreview=false;let kangquNoteOpened=false;\nconst state={mode:')
destination.mkdir(parents=True,exist_ok=True)
(destination / 'data').mkdir(exist_ok=True)
(destination / 'index.html').write_text(html)
fresh=html.replace('const expansionMemoryless=false;', 'const expansionMemoryless=true;')
(destination / 'fresh.html').write_text(fresh)
note=fresh.replace('const kangquNotePreview=false;', 'const kangquNotePreview=true;').replace('<title>康衢駢慶 2.3.0 · 本機文案預覽</title>', '<title>康衢駢慶 2.3.0 · 畫作小記預覽</title>')
(destination / 'note.html').write_text(note)
note_source=json.loads((base.parent / 'data/source-note.json').read_text()) if (base.parent / 'data/source-note.json').exists() else json.loads((root / 'public/chapters/kangqu-listening-v2-2.2.0/data/source-note.json').read_text())
note_source['contentPreview']={'version':'2.3.0','date':'2026-10-27','copy':str((source / 'copy.json').relative_to(root)),'sources':[copy['work']['source'],copy['work']['research']],'fiction':copy['work']['fiction'],'deployment':'Local preview only; no route promotion or deployment.'}
(destination / 'data/source-note.json').write_text(json.dumps(note_source,ensure_ascii=False,indent=2)+'\n')
manifest={'version':'2.3.0','status':'local-preview','date':'2026-10-27','base':str(base.relative_to(root)),'baseSha256':base_hash,'sources':{p.name:sha(p) for p in source.iterdir() if p.is_file()},'entries':{name:sha(destination/name) for name in ['index.html','fresh.html','note.html']},'storageKey':'chinese-wally:kangqu-listening-v2:preview:2.3.0:journal:v2','sharedAssets':'All artwork, animation, UI, music and font paths from the pinned 2.2.0 document; no shared files rewritten.','scope':'Approved copy, evidence-reading summary question and existing-note handoffs. No official route change or deployment.'}
(destination / 'data/version-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
if sha(base)!=base_hash:
    raise SystemExit('Pinned source changed while packaging.')
print('Saved independent local candidate: '+str(destination / 'index.html'))
