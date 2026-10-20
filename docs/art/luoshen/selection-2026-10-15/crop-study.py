from PIL import Image,ImageDraw,ImageFont,ImageOps
from pathlib import Path
import json
p=Path('docs/art/luoshen/selection-2026-10-15');im=Image.open(p/'painting-level16.jpg')
items=[
('C1','opening',(17970,460,18350,950),'main'),('C2','seated',(12180,470,12560,850),'main'),('C3','farewell',(8740,500,9120,970),'observe'),('C4','boat',(4170,410,4470,730),'main'),('C5','shore',(2950,590,3270,1000),'ending'),('C6','carriage',(880,530,1190,900),'ending'),
('L1','first-sight',(16780,420,17420,940),'main'),('L2','turning',(15570,530,16180,1010),'compare'),('L3','pair-lower',(14320,530,14950,1000),'compare'),('L4','pair-upper',(13870,100,14470,550),'compare'),('L5','willow',(13220,450,13830,980),'compare'),('L6','pair-left',(12750,380,13270,880),'compare'),('L7','before-seated',(11700,330,12350,900),'observe'),('L8','farewell',(8150,560,8720,940),'main'),('L9','cloud-car',(6350,360,6740,780),'main')]
manifest=[]
for ident,name,box,role in items:
 file=f'{ident}-{name}.jpg';im.crop(box).save(p/file,quality=96)
 manifest.append({'id':ident,'file':file,'role':role,'crop_level16_local':list(box),'crop_level16_global':[box[0]+15300,box[1],box[2]+15300,box[3]],'raw_crop':True})
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',23)
for prefix in ['C','L']:
 selected=[a for a in manifest if a['id'].startswith(prefix)];rows=(len(selected)+2)//3
 out=Image.new('RGB',(1200,rows*470),'#f4f0e7');draw=ImageDraw.Draw(out)
 for i,a in enumerate(selected):
  x=(i%3)*400;y=(i//3)*470
  draw.text((x+16,y+12),a['id']+' / '+a['role'],font=font,fill='#29251e')
  crop=Image.open(p/a['file']);crop.thumbnail((370,410));out.paste(crop,(x+(400-crop.width)//2,y+48+(410-crop.height)//2))
 out.save(p/f'{prefix}-comparison.jpg',quality=95)
(p/'candidates.json').write_text(json.dumps({'coordinate_base':'painting-level16.jpg; global origin x15300 y0; level16 from official viewer','candidates':manifest},ensure_ascii=False,indent=2))
