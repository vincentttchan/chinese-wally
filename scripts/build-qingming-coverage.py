"""Compile the manually inspected painting inventory; do not infer new figures.

Inputs live in docs so coordinates, exclusions and dialogue remain reviewable.
Only approved interactive entries enter the runtime. Run after editing inventory.
"""
from pathlib import Path
import json
import re
from html import escape

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / 'docs/art/qingming/inventory'
PARTS = ('city', 'river', 'outskirts')
CLASSES = {'paper-shop', 'rainbow-bridge', 'wine-shop', 'lodging-shop', 'incense-shop', 'medicine-shop'}


def compile_inventory():
    all_entries, segments, ids, existing = [], [], set(), set()
    known_ids = set(re.findall(r"paintingActor\('([^']+)'", (ROOT / 'src/game/qingming.ts').read_text()))
    for part in PARTS:
        document = json.loads((DIRECTORY / f'{part}.json').read_text())
        segments.extend(document['segments'])
        for kind in ('people', 'objects'):
            for item in document[kind]:
                item = dict(item, category='person' if kind == 'people' else 'object', part=part)
                identity = item['id']
                if identity in ids:
                    raise ValueError(f'Duplicate inventory ID: {identity}')
                ids.add(identity)
                left, top, right, bottom = item['bounds']
                if not (0 <= left < right <= 38414 and 0 <= top < bottom <= 1800):
                    raise ValueError(f'Invalid original-pixel bounds: {identity}')
                if item['status'] not in ('interactive', 'excluded'):
                    raise ValueError(f'Unknown inventory status: {identity}')
                if item['status'] == 'excluded' and not item.get('reason'):
                    raise ValueError(f'Excluded entry needs a reason: {identity}')
                if item['status'] == 'interactive' and (len(item.get('replies', [])) != 3 or any(not line for line in item['replies'])):
                    raise ValueError(f'Interactive entry needs three responses: {identity}')
                if item['status'] == 'interactive':
                    point = item.get('hitPoint')
                    if not point or not (left <= point[0] <= right and top <= point[1] <= bottom):
                        raise ValueError(f'Interactive entry needs a visually reviewed hit point inside bounds: {identity}')
                if item.get('collectionId') and item['collectionId'] not in CLASSES:
                    raise ValueError(f'Unknown collection: {identity}')
                if item.get('existingId'):
                    if item['existingId'] not in known_ids:
                        raise ValueError(f'Unknown original actor ID: {item["existingId"]}')
                    if item['existingId'] in existing:
                        raise ValueError(f'Duplicate existing actor: {item["existingId"]}')
                    existing.add(item['existingId'])
                all_entries.append(item)

    if missing := known_ids - existing:
        raise ValueError('Original actors missing from coverage reconciliation: ' + ', '.join(sorted(missing)))

    summary = {
        'imageSize': [38414, 1800],
        'basis': '本次原畫影像逐段目視盤點。people 為人物與待核身影的登記位置數，不是歷史人口統計或其他版本的人物總數。',
        'people': sum(e['category'] == 'person' for e in all_entries),
        'interactivePeople': sum(e['category'] == 'person' and e['status'] == 'interactive' for e in all_entries),
        'excludedPeople': sum(e['category'] == 'person' and e['status'] == 'excluded' for e in all_entries),
        'objects': sum(e['category'] == 'object' for e in all_entries),
        'interactiveObjects': sum(e['category'] == 'object' and e['status'] == 'interactive' for e in all_entries),
        'excludedObjects': sum(e['category'] == 'object' and e['status'] == 'excluded' for e in all_entries),
        'existingActorIds': sorted(existing),
        'collectionInstances': {key: [e.get('existingId', e['id']) for e in all_entries if e['status'] == 'interactive' and e.get('collectionId') == key] for key in sorted(CLASSES)},
    }
    (DIRECTORY / 'coverage.json').write_text(json.dumps({'summary': summary, 'segments': segments, 'entries': all_entries}, ensure_ascii=False, indent=2) + '\n')
    # Evidence and exclusions stay in the ledger; only gameplay fields ship.
    runtime = [{key: e[key] for key in ('id', 'bounds', 'name', 'category', 'replies', 'existingId', 'collectionId', 'hitPoint') if key in e}
               for e in all_entries if e['status'] == 'interactive']
    output = '''// Generated from the manually inspected inventory by scripts/build-qingming-coverage.py.
// Do not invent entries here; edit the original-pixel inventory and regenerate.
export type QingmingCoverageEntry = {
 id:string; name:string; category:'person'|'object'; bounds:readonly [number,number,number,number];
 replies:readonly string[]; existingId?:string; collectionId?:string; hitPoint?:readonly [number,number];
};
export const qingmingCoverageEntries:readonly QingmingCoverageEntry[] = '''
    output += json.dumps(runtime, ensure_ascii=False, separators=(',', ':')) + ';\n'
    output += 'export const qingmingCoverageSummary = ' + json.dumps(summary, ensure_ascii=False, separators=(',', ':')) + ';\n'
    (ROOT / 'src/game/qingmingCoverageData.ts').write_text(output)
    lines = ['# 清明上河圖逐人／逐物覆蓋表', '', summary['basis'], '',
             f"人物 {summary['people']}：互動 {summary['interactivePeople']}，暫不互動 {summary['excludedPeople']}。",
             f"物件 {summary['objects']}：互動 {summary['interactiveObjects']}，暫不互動 {summary['excludedObjects']}。", '',
             '座標為原畫像素 [左, 上, 右, 下]；所有人物對白皆為遊戲虛構，物件文字為觀察提示。', '',
             '| ID／既有 ID | 類別／狀態 | 原畫像素 | 已目視核對點 | 可見依據／排除原因 | 首次／再次／後續回應 | 收藏 |',
             '|---|---|---|---|---|---|---|']
    for e in all_entries:
        responses = '／'.join(e.get('replies', [])).replace('|', '｜')
        evidence = e['evidence'].replace('|', '｜') + ('；' + e['reason'] if e.get('reason') else '')
        lines.append(f"| {e['id']}" + (f" → {e['existingId']}" if e.get('existingId') else '') +
                     f" | {e['category']}／{e['status']} | {e['bounds']} | {e.get('hitPoint', '—')} | {evidence} | {responses} | {e.get('collectionId', '—')} |")
    (DIRECTORY / 'coverage-table.md').write_text('\n'.join(lines) + '\n')
    # Canonical overlays are regenerated from reconciled bounds/statuses, so
    # early reviewers' SVGs cannot silently keep superseded seam rectangles.
    overlays = DIRECTORY / 'overlays'
    overlays.mkdir(exist_ok=True)
    for segment in segments:
        left, top, right, bottom = segment['bounds']
        elements = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{right-left}" height="{bottom-top}" viewBox="{left} {top} {right-left} {bottom-top}">']
        for number in range(int(left // 4000), min(9, int((right-1) // 4000)) + 1):
            elements.append(f'<image href="../../../../../public/art/qingming/tile-{number+1:02}.jpg" x="{number*4000}" y="0" width="{min(4000,38414-number*4000)}" height="1800"/>')
        for entry in all_entries:
            l, t, r, b = entry['bounds']
            if l >= right or r <= left or t >= bottom or b <= top:
                continue
            colour = '#777777' if entry['status'] == 'excluded' else '#b5003c' if entry['category'] == 'person' else '#146baf'
            label = f"{entry['part'][0].upper()}{entry['category'][0].upper()}{entry['id'].split('-')[-1]}"
            elements.append(f'<rect x="{l}" y="{t}" width="{r-l}" height="{b-t}" fill="none" stroke="{colour}" stroke-width="2"><title>{escape(entry["name"])}</title></rect>')
            if point := entry.get('hitPoint'):
                elements.append(f'<circle cx="{point[0]}" cy="{point[1]}" r="4" fill="{colour}" stroke="#ffffff" stroke-width="1"><title>已目視核對點</title></circle>')
            elements.append(f'<text x="{l}" y="{t-3}" font-size="12" fill="{colour}" stroke="#ffffff" stroke-width="0.3">{label}</text>')
        elements.append('</svg>')
        (overlays / f'{segment["id"]}.svg').write_text('\n'.join(elements) + '\n')

    groups = {}
    for entry in all_entries:
        if entry['category'] != 'object':
            continue
        name = entry['name']
        if entry.get('existingId') in {'bridge-boat', 'bridge-people', 'bridge-stalls'}:
            family = '主線集體觀察（不計個人人數）'
        elif re.search('招牌|掛牌|字牌|文字牌|店名|商品文字|宣傳文字|立牌|幡|幌|正店牌', name):
            family = '招牌與文字線索'
        elif re.search('船|舟', name):
            family = '舟船與船上細節'
        elif re.search('車|轎|牲口|駱駝|馱獸|驢|馬匹', name):
            family = '車轎與牲畜運輸'
        elif re.search('鋪|店|攤|棚|窗|桌|陳列', name):
            family = '店面、攤棚與陳列位置（店種未必可辨）'
        elif re.search('器物|貨物|貨堆|筐|籃|桶|捆|擔', name):
            family = '器物與搬運用品'
        elif re.search('橋|城門', name):
            family = '橋與城門'
        else:
            family = '其他可见細節／用途待核'
        groups.setdefault(family, []).append(entry)
    clue_lines = ['# 同類線索與收藏對應', '', '以下是已目視登記位置的分類索引；位置數不等於獨立店舖或船隻數。集體觀察與個別線索分列。未知店種不解鎖特定行業收藏。', '',
                  '| 收藏類別 | 全部可觸發位置（包括既有觀察位置） |', '|---|---|']
    for key, instances in summary['collectionInstances'].items():
        clue_lines.append(f'| {key} | ' + '、'.join(instances) + ' |')
    for family, items in groups.items():
        clue_lines.extend(['', '## ' + family, '', '| ID | 名稱 | 狀態 | 收藏 |', '|---|---|---|---|'])
        for entry in items:
            clue_lines.append(f"| {entry.get('existingId', entry['id'])} | {entry['name']} | {entry['status']} | {entry.get('collectionId', '只回應，不新增收藏')} |")
    (DIRECTORY / 'clue-types-and-collections.md').write_text('\n'.join(clue_lines) + '\n')
    # Inspection artifact only: original tiles and coordinate outlines, never
    # painted onto or substituted for the production scroll.
    payload = json.dumps(all_entries, ensure_ascii=False).replace('</', '<\\/')
    atlas = '''<!doctype html><html lang="zh-Hant"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>清明上河圖 · 覆蓋盤點原畫對照</title>
<style>body{margin:0;padding:24px;background:#f1ead7;color:#384333;font:16px/1.7 serif}h1{font-size:24px}main{display:grid;grid-template-columns:330px 1fr;gap:24px}aside{max-height:72vh;overflow:auto}button{display:block;width:100%;text-align:left;padding:10px;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer}button[aria-pressed=true]{background:#ddd1b5}input{padding:8px;width:90%;font:inherit}svg{width:100%;max-height:65vh;background:#dbd0b9}p{margin:8px 0}small{color:#696f58}@media(max-width:750px){main{display:block}aside{max-height:28vh;margin-bottom:20px}}</style>
<h1>人物與同類線索：原畫位置對照</h1>
<p>製作盤點用對照，並非遊戲介面。方框只是登記位置；底圖保持原像素。人物短句為遊戲虛構，物件文字為觀察提示。</p>
<main><aside><input id="filter" aria-label="搜尋名稱、ID、類別" placeholder="搜尋名稱、ID、類別"><div id="list"></div></aside>
<section><svg id="crop" role="img" aria-label="所選登記位置的原畫局部"></svg><h2 id="name"></h2><p id="details"></p><p id="evidence"></p><p id="reply"></p><small id="status"></small></section></main>
<script>
const entries=PAYLOAD;
const ns='http://www.w3.org/2000/svg',list=document.getElementById('list'),crop=document.getElementById('crop');let selected=entries[0]?.id;
function choose(e){selected=e.id;const [l,t,r,b]=e.bounds,w=Math.min(1800,Math.max(800,r-l+400)),h=Math.min(1800,Math.max(500,b-t+300));
const x=Math.max(0,Math.min(38414-w,(l+r-w)/2)),y=Math.max(0,Math.min(1800-h,(t+b-h)/2));crop.replaceChildren();crop.setAttribute('viewBox',[x,y,w,h].join(' '));
for(let n=Math.floor(x/4000);n<=Math.min(9,Math.floor((x+w)/4000));n++){const img=document.createElementNS(ns,'image');img.setAttribute('href','../../../../public/art/qingming/tile-'+String(n+1).padStart(2,'0')+'.jpg');img.setAttribute('x',n*4000);img.setAttribute('y',0);img.setAttribute('width',Math.min(4000,38414-n*4000));img.setAttribute('height',1800);crop.append(img)}
const rect=document.createElementNS(ns,'rect');for(const [a,v] of Object.entries({x:l,y:t,width:r-l,height:b-t,fill:'none',stroke:e.status==='excluded'?'#696f58':'#a53228','stroke-width':2,'vector-effect':'non-scaling-stroke'}))rect.setAttribute(a,v);crop.append(rect);
if(e.hitPoint){const dot=document.createElementNS(ns,'circle');for(const [a,v] of Object.entries({cx:e.hitPoint[0],cy:e.hitPoint[1],r:5,fill:'#a53228',stroke:'#ffffff','stroke-width':1,'vector-effect':'non-scaling-stroke'}))dot.setAttribute(a,v);crop.append(dot)}
document.getElementById('name').textContent=e.name;document.getElementById('details').textContent=e.id+(e.existingId?' → '+e.existingId:'')+' · 原畫像素 '+e.bounds.join(', ');document.getElementById('evidence').textContent=e.evidence;document.getElementById('reply').textContent=(e.replies||[]).join(' ／ ');document.getElementById('status').textContent=(e.status==='excluded'?'暫不互動：'+e.reason:'已接入個別熱區')+(e.collectionId?' · 收藏 '+e.collectionId:'');for(const btn of list.children)btn.setAttribute('aria-pressed',String(btn.dataset.id===selected));}
function render(){const query=document.getElementById('filter').value.trim().toLowerCase();list.replaceChildren();for(const e of entries){if(query&&!JSON.stringify([e.id,e.name,e.category,e.collectionId,e.status]).toLowerCase().includes(query))continue;const btn=document.createElement('button');btn.textContent=e.name+' · '+e.id;btn.dataset.id=e.id;btn.setAttribute('aria-pressed',String(e.id===selected));btn.onclick=()=>choose(e);list.append(btn)}}
document.getElementById('filter').oninput=render;render();if(entries[0])choose(entries[0]);
</script></html>'''.replace('PAYLOAD', payload)
    (DIRECTORY / 'coverage-atlas.html').write_text(atlas)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    compile_inventory()
