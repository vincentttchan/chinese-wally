"""Trace visible red skirt only; source artwork stays untouched. Pillow required."""
from pathlib import Path
from collections import deque
from PIL import Image, ImageFilter
ROOT=Path(__file__).resolve().parents[2]
im=Image.open(ROOT/'public/art/zanhua/studies/P4-dress-study-v1.png').convert('RGBA')
w,h=im.size
# Restrict by garment geography to exclude red flowers on the floral scarf.
regions=[(325,490,438,610),(289,608,328,825),(245,950,343,1251),(140,1268,340,1601),(340,1390,937,1645)]
mask=Image.new('L',im.size)
pix=im.load();out=mask.load()
for x0,y0,x1,y1 in regions:
 for y in range(y0,y1):
  for x in range(x0,x1):
   r,g,b,a=pix[x,y]
   if a>100 and r>90 and r>g*1.55 and r>b*1.35 and b>g*.99:out[x,y]=255
# Close ink-line gaps at native resolution, then retain substantial connected pieces.
mask=mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
data=mask.tobytes();seen=bytearray(w*h);components=[]
for p,v in enumerate(data):
 if not v or seen[p]:continue
 q=[p];seen[p]=1;component=set()
 while q:
  i=q.pop();component.add(i);y,x=divmod(i,w)
  for n in (i-1,i+1,i-w,i+w):
   if 0<=n<w*h and not seen[n] and data[n] and abs(n%w-x)<=1:seen[n]=1;q.append(n)
 if len(component)>1000:components.append(component)
# Walk directed pixel edges. Interior holes (ink/folds) are omitted, preserving only outer silhouette.
def simplify(points,tolerance=1.25):
 if len(points)<3:return points
 ax,ay=points[0];bx,by=points[-1];dx=bx-ax;dy=by-ay;den=dx*dx+dy*dy
 ds=[((x-ax)**2+(y-ay)**2 if not den else ((x-ax)*dy-(y-ay)*dx)**2/den) for x,y in points]
 k=max(range(len(ds)),key=ds.__getitem__)
 return simplify(points[:k+1],tolerance)[:-1]+simplify(points[k:],tolerance) if ds[k]>tolerance*tolerance else [points[0],points[-1]]
paths=[];allpoints=[]
for comp in components:
 edges={}
 for i in comp:
  y,x=divmod(i,w)
  for absent,a,b in [(i-w,(x,y),(x+1,y)),(i+1,(x+1,y),(x+1,y+1)),(i+w,(x+1,y+1),(x,y+1)),(i-1,(x,y+1),(x,y))]:
   if absent not in comp:edges.setdefault(a,[]).append(b)
 loops=[]
 while edges:
  start=next(iter(edges));p=start;loop=[p]
  while True:
   nxt=edges[p].pop()
   if not edges[p]:del edges[p]
   p=nxt;loop.append(p)
   if p==start:break
  loops.append(loop)
 loop=max(loops,key=len);mid=len(loop)//2
 points=simplify(loop[:mid+1])[:-1]+simplify(loop[mid:])[:-1]
 allpoints+=points
 paths.append('M '+' L '.join(f'{x} {y}' for x,y in points)+' Z')
xs,ys=zip(*allpoints);bounds=[min(xs),min(ys),max(xs)-min(xs),max(ys)-min(ys)]
content='// Generated from the visible red skirt in P4-dress-study-v1.png.\n// Recreate: python3 scripts/art/trace-zanhua-p4-skirt.py\n'
content+='export const zanhuaP4SkirtPath = '+repr(' '.join(paths))+';\n'
content+='export const zanhuaP4SkirtBounds: [number,number,number,number] = '+str(bounds)+';\n'
(ROOT/'src/game/zanhuaP4SkirtContour.ts').write_text(content)
print('Garment regions:',len(paths),'bounds:',bounds,'vertices:',len(allpoints))
