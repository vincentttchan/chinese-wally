"""Package standalone authoring artifacts. No game execution, tests or browser rendering."""
from pathlib import Path
import json

folder=Path(__file__).resolve().parent
previous=folder.parent/'v0.3'
ui=folder.parent/'v0.2'
css='\n'.join((ui/n).read_text() for n in ['common.css','effects.css','art-ui.css','journal-ui.css']).replace("url('ui/","url('../v0.2/ui/")+'\n'+(folder/'play.css').read_text()
js='\n'.join((folder/n).read_text() for n in ['chapter-data.js','inventory.js','collection-revisions.js','diagnostic-revisions.js','geometry.js','play.js'])
old=(previous/'play.html').read_text()
body=old.split('<body class="art-ui">',1)[1].split('<script>',1)[0]
body=body.replace('0.3 連續遊玩稿','0.3.2 坐標修訂版').replace('delivery-record.md','inspection-record.md')
body=body.replace('人物回應先涵蓋已登記的三處近看群組。全卷人物、同類物件的完整覆蓋與正式樣貌仍待完成。','人物回應涵蓋本輪登記的 202 位清晰段落人物，12 處難辨片段另有排除紀錄。全卷其他區域、熱區校準與正式樣貌確認仍待完成。')
page='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>在人群中聽樂 · 0.3.2 坐標修訂版</title><style>\n'+css+'\n</style></head><body class="art-ui">'+body+'<script>\n'+js+'\n</script></body></html>\n'
(folder/'play.html').write_text(page)

assets=json.loads((folder/'recognition/generation-records.json').read_text())['assets']
head_boxes={'seated-drum':[935,2375,978,2418],'hand-at-hat':[1427,1555,1467,1620],'brown-green-hem':[3718,2335,3772,2401]}
notes={'seated-drum':'移除舊版完整濃鬚輪廓，只保留較淡的下頰色塊。','hand-at-hat':'降低帽頂、縮短鬚形，排除原畫背景長桿。','brown-green-hem':'降低帽形與鬚髮細節，保留左向及淡灰口部色塊。'}
rows=[]
for i,a in enumerate(assets):
 ident=a['id'];b=head_boxes[ident]
 rows.append(f'''<section><h2>第 {i+1} 位：{notes[ident]}</h2><div class="compare"><div><h3>原畫原生頭部</h3><img class="native" src="recognition/{ident}-head-source.png" width="{b[2]-b[0]}" height="{b[3]-b[1]}" alt="未放大的原生頭部"><p class="small">局部坐標 {b}</p></div><div><h3>舊版 v1 草稿</h3><img class="head-drawing" src="../v0.2/recognition/{ident}-head-tracing-v1.png" alt="舊版樣貌摹繪"></div><div><h3>保守修訂 v2</h3><img class="head-drawing" src="recognition/{ident}-head-tracing-v2.png" alt="新版保守樣貌摹繪"></div></div></section>''')
recognition='''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>三張樣貌保守修訂 · 0.3.1</title><link rel="stylesheet" href="../v0.2/common.css"><style>.compare{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;align-items:start}.head-drawing{width:160px;height:160px;object-fit:contain}.native{display:block;max-width:none;object-fit:none}.compare h3{font-size:18px}.compare>div{min-height:210px}@media(max-width:650px){.compare{grid-template-columns:1fr 1fr}.compare>div:first-child{grid-column:1/-1;min-height:100px}.head-drawing{width:128px;height:128px}}</style></head><body><main class="document"><header><span class="eyebrow">2026.10.12 · 內建 Imagegen · 修訂候選</span><h1>樣貌摹繪，原畫為準</h1><p>三张摹繪減少難以確認的細節；對照原生頭部、旧版及新版。原生裁切按原尺寸顯示，沒有用低像素放大作提示。</p><nav class="links"><a href="play.html">開始新版遊玩 →</a><a href="index.html">本輪交付</a></nav></header>'''+''.join(rows)+'''<section class="plain-note"><h2>本次可以確認的界線</h2><p>已查看原生頭部及生成結果。新版減少了細節推測，仍是簡化插圖；帽形與臉部比例並非精確描摹，細線、眉眼與灰色鬚影不能作新增尋人特徵。這三張尚未獲使用者作正式樣貌確認。</p><p>只用於尋人介面；不替換原畫、不當作修復、也不推定人物身分。</p></section><footer class="links"><a href="recognition/generation-records.json">完整提示詞與素材路徑</a><a href="recognition/README.md">逐張檢視紀錄</a></footer></main></body></html>'''
(folder/'recognition.html').write_text(recognition.replace('三张','三張').replace('旧版','舊版'))

people=json.loads((folder/'people-inventory.json').read_text())
objects=json.loads((folder/'collection-inventory.json').read_text())
data=json.dumps({'people':people['people'],'excluded':people['excluded'],'groups':people['groups'],'objects':objects['instances']},ensure_ascii=False)
map_page='''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>原生段落人物與物件盤點</title><link rel="stylesheet" href="../v0.2/common.css"><style>.document{max-width:none}.map-tools{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:16px}.map-tools select{font:inherit;min-height:44px;max-width:100%}.map-viewport{height:65vh;overflow:auto;background:#d5cebe;border:1px solid var(--line)}.map-world{width:4500px;height:2843px;position:relative}.map-world>img{width:4500px;height:2843px;display:block;max-width:none}.marker{position:absolute;width:24px;height:24px;min-height:0;padding:0;border:1px solid #f1ead7;background:#384333cc;color:#fff;font:11px sans-serif;border-radius:50%;transform:translate(-50%,-50%)}.excluded{background:#93513dbb;border-style:dashed}.object-marker{background:#486b7bbf;border-radius:2px}#selection{max-width:900px;padding:16px 0;min-height:100px}#selection p{margin:8px 0}.map-legend{font-size:13px}</style></head><body><main class="document"><header><span class="eyebrow">製作盤點圖 · 不在遊戲中顯示編號</span><h1>原畫中的 202 位登記人物</h1><p>逐一編號，另列 12 處難辨片段與 44 處收藏實例。熱區仍是源圖初定，未作瀏覽器命中校準。</p><nav class="links"><a href="play.html">新版遊玩</a><a href="index.html">交付資料</a></nav></header><div class="map-tools"><label for="group">原畫分段</label><select id="group"></select><label><input id="show-people" type="checkbox" checked> 人物編號</label><label><input id="show-excluded" type="checkbox" checked> 難辨片段</label><label><input id="show-objects" type="checkbox"> 收藏實例</label></div><p class="map-legend">墨色：人物；朱色虛線：暫不互動片段；青色：物件。點編號可讀 ID、原畫位置與對白。</p><div id="map-viewport" class="map-viewport"><div id="map-world" class="map-world"><img src="../stage-and-crowd-native.png" alt="未修改的官方原生段落"><div id="markers"></div></div></div><div id="selection" role="status">選一個人物或物件編號。</div></main><script>const mapData = '''+data+''';
const el=id=>document.getElementById(id),viewport=el('map-viewport');
function center(b){return [(b[0]+b[2])/2,(b[1]+b[3])/2]}
function bbox(o){if(o.box)return o.box;return [Math.min(...o.polygon.map(p=>p[0])),Math.min(...o.polygon.map(p=>p[1])),Math.max(...o.polygon.map(p=>p[0])),Math.max(...o.polygon.map(p=>p[1]))]}
function show(item,type,index){const target=el('selection');target.replaceChildren();for(const text of [type+' '+index+' · '+item.id,'原畫局部坐標：'+(item.head||bbox(item)).join(', '),...(item.lines||[item.reason||'收藏類別：'+item.category])]){const p=document.createElement('p');p.textContent=text;target.append(p)}}
function marker(item,type,index){const b=document.createElement('button'),point=center(item.head||bbox(item));b.className='marker '+(type==='片段'?'excluded':type==='物件'?'object-marker':'');b.style.left=point[0]+'px';b.style.top=point[1]+'px';b.textContent=type==='人物'?index:type==='片段'?'×'+index:'物'+index;b.setAttribute('aria-label',type+' '+index+' '+item.id);b.onclick=()=>show(item,type,index);el('markers').append(b)}
function render(){el('markers').replaceChildren();if(el('show-people').checked)mapData.people.forEach((p,i)=>marker(p,'人物',i+1));if(el('show-excluded').checked)mapData.excluded.forEach((p,i)=>marker(p,'片段',i+1));if(el('show-objects').checked)mapData.objects.forEach((p,i)=>marker(p,'物件',i+1));}
mapData.groups.forEach((g,i)=>{const o=document.createElement('option');o.value=i;o.textContent=g.id+' · '+g.count+' 人';el('group').append(o)});el('group').onchange=()=>{const p=center(mapData.groups[Number(el('group').value)].context);viewport.scrollLeft=Math.max(0,p[0]-viewport.clientWidth/2);viewport.scrollTop=Math.max(0,p[1]-viewport.clientHeight/2)};['show-people','show-excluded','show-objects'].forEach(id=>el(id).onchange=render);render();el('group').dispatchEvent(new Event('change'));
</script></body></html>'''
(folder/'inventory.html').write_text(map_page)
print('Saved gameplay, recognition comparison and source inventory HTML snapshots.')
