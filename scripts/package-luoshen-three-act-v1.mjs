import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const release=path.join(root,'output/releases/luoshen-three-act-v1-2026-10-27');
const legacy=process.argv.includes('--legacy');
const name=legacy?'luoshen-before-three-act':'luoshen-three-act-v1';
const destination=path.join(root,'public/chapters',legacy?'luoshen-before-three-act-20261027':'luoshen-three-act-v1');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
let html=fs.readFileSync(path.join(release,legacy?'legacy-build':'build',`${name}.html`),'utf8');
const scripts=Array.from(html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g));
const styles=Array.from(html.matchAll(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/g));
if(scripts.length!==1)throw new Error('Expected one independent chapter bundle.');
const build=path.join(release,legacy?'legacy-build':'build');
const localize=text=>text.replaceAll('/chinese-wally/','../../').replace(/(["'`])\/(art|audio|fonts|chapters)\//g,'$1../../$2/').replace(/url\((["']?)\/(art|audio|fonts|chapters)\//g,'url($1../../$2/');
const js=localize(fs.readFileSync(path.join(build,'assets',path.basename(scripts[0][1])),'utf8'));
if(/\bimport\s*\(|\bimport\.meta|\bexport\s*\{/.test(js))throw new Error('Independent bundle still needs external modules.');
const css=localize(styles.map(style=>fs.readFileSync(path.join(build,'assets',path.basename(style[1])),'utf8')).join('\n'));
html=html.replace(scripts[0][0],'');for(const style of styles)html=html.replace(style[0],'');
html=html.replace('</head>',()=>`<style>${css}</style></head>`).replace('</body>',()=>`<script>${js.replaceAll('</script','<\\/script')}</script></body>`);
const sources=legacy?['src/components/LuoshenGame.tsx','src/luoshen-before-three-act.tsx','src/entries/VersionedLuoshenChapter.tsx']:['src/components/LuoshenThreeActGameV1.tsx','src/components/LuoshenThreeActEntryV1.tsx','src/components/luoshen-three-act-entry-v1.css','src/luoshen-three-act-v1.tsx','src/entries/VersionedLuoshenChapter.tsx'];
const manifest={id:legacy?'luoshen-before-three-act-20261027':'luoshen-three-act-v1',version:legacy?'before-three-act-20261027':'1.0.0',date:'2026-10-27',status:legacy?'preserved-local-copy':'local-review-not-deployed',chapter:'洛水之間',baseCommit:'65b144abc4080f9fa7931716c01867be504bc8ef',acceptedSample:'output/design-preview/luoshen-entry-2026-10-27/',storageKey:'painting-luoshen-v1',entry:path.relative(root,path.join(destination,'index.html')),previous:legacy?null:'public/chapters/luoshen-before-three-act-20261027/index.html',productionRoute:'#luoshen (unchanged)',sources:Object.fromEntries(sources.map(file=>[file,hash(fs.readFileSync(path.join(root,file)))])),entrySHA256:hash(html),flow:legacy?['原有兩幕引言','原有完整章節']:['封面','交疊展卷','洛水相逢','一卷藏時','循賦入畫','現有樣貌提示','原畫尋人','原有觀察、洛神賦對讀、見聞冊與收尾'],role:legacy?null:'循賦入畫的年輕書生',sharedAssets:'Existing public artwork, portraits, fonts, audio and animation files are referenced read-only.',scope:'Independent full chapter versions only. No promotion, site home build, push or deployment.'};
if(legacy&&fs.existsSync(path.join(destination,'index.html'))){
 if(hash(fs.readFileSync(path.join(destination,'index.html')))!==hash(html))throw new Error('Preserved legacy build differs; use a new archive directory instead of overwriting.');
}else{fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'index.html'),html);fs.writeFileSync(path.join(destination,'version.json'),JSON.stringify(manifest,null,2)+'\n');}
console.log(`Saved ${path.relative(root,destination)}/index.html (${Buffer.byteLength(html)} bytes).`);
