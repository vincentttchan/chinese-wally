from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,html
p=Path('docs/art/luoshen/selection-2026-10-15');data=json.loads((p/'candidates.json').read_text());items=data['candidates']
names={'C1':'岸上初見','C2':'坐榻凝望','C3':'岸邊送別','C4':'樓船之中','C5':'岸邊坐候','C6':'車中回望','L1':'初見的洛神','L2':'俯身回轉','L3':'下方雙人場面','L4':'上方雙人場面','L5':'柳旁回身','L6':'左側雙人場面','L7':'坐榻前的身影','L8':'長頸鳥形旁的身影','L9':'雲車中的身影'}
roles={'main':'主線候選','observe':'觀察搭配','ending':'收尾回看','compare':'比較備選'}
font=ImageFont.truetype('/System/Library/Fonts/STHeiti Light.ttc',22)
for prefix in ['C','L']:
 selected=[a for a in items if a['id'].startswith(prefix)];rows=(len(selected)+2)//3
 out=Image.new('RGB',(1200,rows*470),'#f4f0e7');draw=ImageDraw.Draw(out)
 for i,a in enumerate(selected):
  x=(i%3)*400;y=(i//3)*470
  draw.text((x+12,y+9),a['id']+' '+names[a['id']],font=font,fill='#29251e')
  draw.text((x+12,y+36),roles[a['role']],font=font,fill='#5f5649')
  crop=Image.open(p/a['file']);crop.thumbnail((370,385));out.paste(crop,(x+(400-crop.width)//2,y+74+(385-crop.height)//2))
 out.save(p/f'{prefix}-comparison.jpg',quality=95)
context={'C1':(17450,230,18800,1030),'C2':(11600,300,12950,1000),'C3':(8100,300,9450,1010),'C4':(3850,180,5350,1040),'C5':(2600,380,3900,1040),'C6':(250,200,2000,1040),'L1':(16100,100,17950,1010),'L2':(15000,300,16550,1020),'L3':(14000,100,15300,1030),'L4':(13800,100,15300,1030),'L5':(12800,200,14350,1030),'L6':(12200,250,13700,1020),'L7':(11200,200,12950,1020),'L8':(8100,300,9450,1010),'L9':(5400,100,7600,1030)}
im=Image.open(p/'painting-level16.jpg')
parts=['<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>洛神賦圖｜人物原畫比較</title><style>body{max-width:1200px;margin:32px auto;padding:0 20px;background:#f6f2e9;color:#302c26;font:18px/1.7 serif}h1{font-size:28px}h2{font-size:23px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}article{border-top:1px solid #b9b0a1;padding:12px 0}img{display:block;max-width:100%;height:360px;object-fit:contain;margin:auto}details img{height:auto}a{color:#68432e}small{font-size:15px}summary{cursor:pointer}</style><h1>《洛神賦圖》：主角身影原畫比較</h1><p>2026-10-15研究稿。北京故宮藏新00147329宋摹本。人物名稱為本次圖像比對指認；C1、L1相遇及L9雲車有館方場景文字支持，其餘依反覆衣飾、冠髮、鬚貌及場景推定，並非館方逐人標註。</p><p>所有人物圖均為原圖直接裁切，未補畫、銳化或生成。比較表中的全身與位置供選角；遊戲首層提示仍只用頭部。L3／L4／L6各取雙人場面左側、肩側有圓形物的身影；L9取雲車右側有圓形物的身影。</p><p>建議六次尋找：C1 → L1 → C2 → L8 → L9 → C4；C3配合離別觀察，C5／C6用於畫中收尾。main等標籤已改為中文。<a href="../../../chapters/luoshen-character-selection-and-flow-v0.2.md">完整選角與故事流程</a></p>']
for prefix,title in [('C','曹植：六處重複身影'),('L','洛神：九處比對候選')]:
 parts.append('<h2>'+title+'</h2><div class="grid">')
 for a in [x for x in items if x['id'].startswith(prefix)]:
  ident=a['id'];file=f'{ident}-context.jpg';im.crop(context[ident]).save(p/file,quality=95)
  a['name']=names[ident];a['context_file']=file;a['context_crop_level16_local']=context[ident]
  parts.append(f'<article id="{ident}"><h3>{ident} {names[ident]}</h3><p>{roles[a["role"]]}</p><a href="{a["file"]}"><img src="{a["file"]}" alt="{ident} 原畫局部"></a><details><summary>展開周邊原畫場面</summary><a href="{file}"><img src="{file}" alt="{ident} 周邊場面"></a></details><small>點圖可看原裁圖。</small></article>')
 parts.append('</div>')
parts.append('<p>來源：<a href="https://www.dpm.org.cn/collection/paint/234597.html">故宮藏品介紹</a>、<a href="https://www.dpm.org.cn/bigimg/737/0">館方縮放看圖器</a>。公開圖像僅作本次研究，正式發行使用條件待確認。未做遊戲或學生試玩。</p></html>')
(p/'comparison.html').write_text(''.join(parts));(p/'candidates.json').write_text(json.dumps(data,ensure_ascii=False,indent=2));print('15人物裁圖、15情境裁圖、2比較表及比較頁已保存')
