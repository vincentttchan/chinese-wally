"""Whole seven-person frames: shared scale, transparent padding and whole-group registration only."""
from pathlib import Path
from PIL import Image
import numpy as np,json
here=Path(__file__).resolve().parent;root=here.parents[2];out=root/'public/art/animations/kangqu-audience-v2-seven'
(out/'frames').mkdir(exist_ok=True);logical=(545,275);size=(2180,1100)
master=Image.open(out/'group-master.png').convert('RGBA')
def gray(im):
 bg=Image.new('RGBA',logical,'#dfd0b1');bg.alpha_composite(im.resize(logical,Image.Resampling.LANCZOS));return np.asarray(bg,dtype=float)[...,:3].mean(axis=2)
target=gray(master)[210:260,35:500];target=(target-target.mean())/(target.std()+1)
poses=[];records=[]
for name in ['gesture','response']:
 raw=Image.open(here/f'{name}-strip-raw.png').convert('RGBA')
 for i in range(2):
  cell=raw.crop((0,round(i*raw.height/2),raw.width,round((i+1)*raw.height/2))).resize((2340,1260),Image.Resampling.LANCZOS)
  frame=cell.crop((80,80,2260,1180));a=gray(frame);best=(-1,0,0)
  for dy in range(-10,11):
   for dx in range(-12,13):
    q=a[210+dy:260+dy,35+dx:500+dx];q=(q-q.mean())/(q.std()+1);score=float((target*q).mean())
    if score>best[0]:best=(score,-dx,-dy)
  aligned=Image.new('RGBA',size);aligned.alpha_composite(frame,(best[1]*4,best[2]*4));poses.append(aligned)
  records.append({'phase':name,'pose':i+1,'wholeGroupTranslation':[best[1]*4,best[2]*4],'lowerRobeSimilarity':round(best[0],3)})
frames=[master,poses[0],poses[1],poses[1],poses[2],poses[3],poses[3],master,master]
for i,im in enumerate(frames):im.save(out/f'frames/group-{i+1:02}.png')
(out/'frame-registration.json').write_text(json.dumps({'size':size,'logicalCrop':[240,2420,785,2695],'partExtraction':False,'registration':records},indent=2)+'\n');print(json.dumps(records))
# Representative composite, original foreground is preserved exactly by renderer too.
from PIL import ImageDraw
src=Image.open(out/'original-reference.png').convert('RGBA').resize(size,Image.Resampling.LANCZOS);bg=Image.open(out/'fixed-background.png').convert('RGBA').resize(size,Image.Resampling.LANCZOS)
mask=Image.new('L',logical);d=ImageDraw.Draw(mask)
for poly in [[(56,275),(213,162),(225,140),(245,135),(251,139),(247,145),(238,147),(231,162),(227,172),(385,275)],[(390,275),(425,239),(457,217),(485,200),(515,193),(545,192),(545,275)],[(0,153),(66,151),(69,212),(0,254)]]:d.polygon(poly,fill=255)
mask=mask.resize(size,Image.Resampling.LANCZOS)
for n,i in [('gesture',2),('response',5)]:
 pic=bg.copy();pic.alpha_composite(frames[i]);Image.composite(src,pic,mask).save(here/f'composite-{n}.png')
