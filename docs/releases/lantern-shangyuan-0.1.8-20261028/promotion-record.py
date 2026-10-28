from pathlib import Path
import re,hashlib,json,shutil
local=Path('/Users/vincentttchan99/Documents/ChatGPT/Chinese Wally')
root=Path('/tmp/chinese-wally-publish-lantern-20261028')
name='lantern-shangyuan-v2-0.1.8-live'
preview=local/'public/chapters/lantern-shangyuan-v2-0.1.8'
dest=root/'public/chapters'/name
assert not dest.exists();dest.mkdir(parents=True)
manifest=json.loads((preview/'version.json').read_text());assert hashlib.sha256((preview/'index.html').read_bytes()).hexdigest()==manifest['sha256']
s=(preview/'index.html').read_text().replace('lantern-shangyuan-v2-0.1.8/',name+'/')
s=s.replace('宮中鬧元宵 · 上元隨記 v2 試玩版','宮中鬧元宵 · 上元隨記')
s=s.replace('chinese-wally:lantern-shangyuan-v2-0.1.8:journey:v2','chinese-wally:lantern-shangyuan-v2:journey:v2')
s=s.replace('chinese-wally:lantern-shangyuan-v2-0.1.8:findings:v1','chinese-wally:lantern-findings:v1').replace('chinese-wally:lantern-shangyuan-v2-0.1.8:origins:v2','chinese-wally:lantern-finding-origins:v1')
s=s.replace('window.location.assign(`https://vincentttchan.github.io/chinese-wally/${e}`)','(window.top??window).location.assign(new URL(`../../index.html${e}`,window.location.href).href)')
# Keep all existing shared assets untouched; freeze any changed/missing asset directories under this release.
refs=set(re.findall(r'(?:art|audio|fonts)/[^"\x27`\s<>)}]+',s));refs={p for p in refs if not p.startswith('art/overview')}
changes=[]
def differs(p):
 q=root/'public'/p.relative_to(local/'public')
 return not q.exists() or hashlib.sha256(p.read_bytes()).digest()!=hashlib.sha256(q.read_bytes()).digest()
dynamic={path.split('${')[0].rsplit('/',1)[0] for path in refs if '${' in path}
for directory in sorted(dynamic,key=len,reverse=True):
 src=local/'public'/directory
 if src.is_dir() and any(differs(p) for p in src.rglob('*') if p.is_file()):
  shutil.copytree(src,dest/'assets'/directory,dirs_exist_ok=True)
  s=s.replace(directory+'/',f'chapters/{name}/assets/{directory}/');changes.append(directory+'/')
for path in sorted(refs):
 if '${' in path or any(path.startswith(d+'/') for d in dynamic):continue
 src=local/'public'/path
 if src.is_file() and differs(src):
  target=dest/'assets'/path;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,target)
  s=s.replace(path,f'chapters/{name}/assets/{path}');changes.append(path)
shutil.copytree(preview/'fonts',dest/'fonts')
(dest/'index.html').write_text(s)
manifest.update(status='production',entry=f'public/chapters/{name}/index.html',sha256=hashlib.sha256(s.encode()).hexdigest(),approvedPreviewSHA256=manifest['sha256'],storage='Production journey namespace; existing lantern-findings:v1 and lantern-finding-origins:v1 retained; preview isolated.',frozenAssetDirectories=changes)
(dest/'version.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(root/'src/components/LanternShangyuanRelease.tsx').write_text('''import {assetPath} from '../game/assets.ts';
export function LanternShangyuanRelease(){
 return <iframe title="宮中鬧元宵 · 上元隨記" src={assetPath('chapters/lantern-shangyuan-v2-0.1.8-live/index.html?v=0.1.8-20261028')} style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0,display:'block'}} allow="fullscreen"/>;
}
''')
p=root/'src/main.tsx';t=p.read_text();t="import {LanternShangyuanRelease} from './components/LanternShangyuanRelease.tsx';\n"+t;t=t.replace(': <LanternThreeActGameV1/>}',': <LanternShangyuanRelease/>}');assert ': <LanternShangyuanRelease/>}' in t;p.write_text(t)
# Retain both old documents byte-for-byte; their URLs remain available as archives.
archive=root/'docs/releases/lantern-shangyuan-0.1.8-20261028';archive.mkdir(parents=True)
shutil.copy2(local/'output/releases/lantern-shangyuan-v2-2026-10-27/source-v0.1.8.zip',archive/'approved-source-0.1.8.zip')
shutil.copy2(local/'output/releases/lantern-shangyuan-v2-2026-10-27/version-0.1.8.json',archive/'approved-preview-manifest.json')
print(json.dumps({'frozenDirectories':changes,'entrySHA256':manifest['sha256']},ensure_ascii=False))
