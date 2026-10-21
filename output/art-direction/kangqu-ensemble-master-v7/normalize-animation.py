"""Normalize nine intact RGBA groups against the same drum anchor; never split people."""
from pathlib import Path
import json
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
root=Path(__file__).resolve().parents[3];here=Path(__file__).parent
out=root/'public/art/animations/kangqu-ensemble-master-v7'
raw=Image.open(here/'animation-raw.png').convert('RGBA')
frames=[]
for i in range(9):
 c=i%3;r=i//3
 frames.append(raw.crop((round(c*raw.width/3),round(r*raw.height/3),round((c+1)*raw.width/3),round((r+1)*raw.height/3))).resize((377,464),Image.Resampling.LANCZOS))
def grey(a):return a[...,0]*.299+a[...,1]*.587+a[...,2]*.114
base=np.asarray(frames[0],dtype=float);box=(180,328,281,416);x,y,r,b=box
t=grey(base[y:b,x:r]);t=(t-t.mean())/(t.std()+1)
records=[]
for i,frame in enumerate(frames):
 a=np.asarray(frame,dtype=float);best=(-1,0,0)
 for dy in range(-8,9):
  for dx in range(-8,9):
   q=grey(a[y+dy:b+dy,x+dx:r+dx]);q=(q-q.mean())/(q.std()+1)
   score=float((t*q).mean())
   if score>best[0]:best=(score,-dx,-dy)
 result=Image.new('RGBA',(377,464),(0,0,0,0));result.alpha_composite(frame,(best[1],best[2]))
 if i==8:result=frames[0].copy() # exact rest lock at finish
 result.save(out/f'frames/group-{i+1:02}.png')
 records.append({'frame':i+1,'translation':[best[1],best[2]],'drumSimilarity':round(best[0],3),'restLocked':i==8})
(out/'frame-registration.json').write_text(json.dumps({'frameSize':[377,464],'sharedGroupScale':.534,'placement':[12,28],'frames':records},indent=2)+'\n')
print(json.dumps(records))
# One empty plate is composited ONCE; all animation frames contain only the alpha group.
if (here/'empty-background-raw.png').exists():
 source=Image.open(out/'original-reference.png').convert('RGB');src=np.asarray(source,dtype=float)
 plate=Image.open(here/'empty-background-raw.png').convert('RGB').resize((240,295),Image.Resampling.LANCZOS);a=np.asarray(plate,dtype=float)
 v=np.median(src[15:55,118:142],axis=(0,1));w=np.median(a[15:55,118:142],axis=(0,1))
 plate=Image.fromarray(np.clip(a*.9+v-w*.9,0,255).astype('uint8'))
 mask=Image.new('L',(240,295));d=ImageDraw.Draw(mask)
 polygons=[
 [(70,43),(98,39),(111,54),(113,80),(123,100),(125,174),(120,244),(95,244),(84,169),(66,139),(45,132),(28,116),(25,98),(31,80),(51,72),(67,76)],
 [(122,77),(133,67),(148,67),(162,81),(166,101),(159,116),(175,121),(199,123),(219,136),(222,155),(206,168),(180,164),(178,199),(128,199),(114,177),(110,139),(116,121)],
 [(64,105),(90,97),(104,110),(104,137),(97,150),(126,149),(148,159),(150,181),(124,189),(115,209),(128,255),(109,263),(85,263),(70,248),(60,226),(51,218),(50,179),(48,155),(57,137),(69,132),(66,123)],
 [(109,186),(122,179),(155,180),(175,187),(179,215),(178,249),(162,265),(118,265),(107,247)],
 [(34,215),(73,213),(94,234),(93,260),(33,261)],
 ]
 for p in polygons:d.polygon(p,fill=255)
 mask=mask.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.5))
 Image.composite(plate,source,mask).save(out/'fixed-background.png')
 mask.save(here/'fixed-background-mask.png')
