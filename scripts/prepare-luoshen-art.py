"""Prepare unchanged source pixels and coordinate manifest for the approved chapter."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1];src=root/'docs/art/luoshen/selection-2026-10-15';out=root/'public/art/luoshen';out.mkdir(parents=True,exist_ok=True)
canvas=Image.new('RGB',(43*510,1080))
for x in range(30,73):
 for y in range(3):
  tile=Image.open(src/f'tile-16-{x}-{y}.png');canvas.paste(tile,((x-30)*510-1,y*510-(1 if y else 0)))
# Keep the full painting support; exclude surrounding mounting/colophons.
painting=canvas.crop((300,92,20250,1035));painting.resize((11970,566),Image.Resampling.LANCZOS).save(out/'full-scroll.jpg',quality=91)
for i in range(10):painting.crop((i*1995,0,(i+1)*1995,943)).save(out/f'detail-{i}.jpg',quality=95)
heads={'C1':(18105,475,18190,635),'L1':(16975,420,17080,605),'C2':(12240,500,12350,660),'L8':(8350,630,8425,755),'L9':(6560,445,6645,585),'C4':(4250,425,4355,590)}
for ident,b in heads.items():canvas.crop(b).save(out/f'head-{ident}.jpg',quality=97)
painting.crop((16300,200,18500,943)).resize((1100,371)).save(out/'cover.jpg',quality=94)
(src/'playable-art-manifest.json').write_text(json.dumps({'source':'https://www.dpm.org.cn/bigimg/737/0','crop_global_level16':[15600,92,35550,1035],'size':[19950,943],'head_rects_old_origin':heads,'treatment':'crop, JPEG encoding, overview downsampling only; no generated or repainted pixels'},indent=2))
print('full painting',painting.size,'10 detail tiles and 6 head crops saved')
