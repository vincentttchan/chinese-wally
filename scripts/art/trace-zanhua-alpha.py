"""Trace existing independent art, never approximate object edges with hit polygons.
Run from repository root. Alpha threshold 112; P4/P6 use native pixels.
P1 keeps its reviewed 2px sampling. Tiny isolated flecks are omitted.
"""
from PIL import Image, ImageDraw
import json, math
from pathlib import Path
atlases=[('P1','P1-dress-layers-v1.png',{'skirt':(0,0,818,809),'gown':(818,0,698,809),'scarf':(1516,0,426,809)}),('P4','P4-dress-layers-v1.png',{'skirt':(0,0,705,887),'gown':(705,0,790,887),'scarf':(1435,0,339,887)}),('P6','P6-coiffure-layers-v1.png',{'high-hair':(0,0,845,724),'hair-flower':(845,0,745,724),'hair-ornament':(1590,0,582,724)})]
def simplify(p,tol=1.2):
 if len(p)<3:return p
 a,b=p[0],p[-1];dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy
 ds=[]
 for x,y in p[1:-1]:
  t=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/den)) if den else 0
  ds.append(math.hypot(x-a[0]-t*dx,y-a[1]-t*dy))
 if not ds or max(ds)<=tol:return [a,b]
 k=ds.index(max(ds))+1
 return simplify(p[:k+1],tol)[:-1]+simplify(p[k:],tol)
result={}
for person,name,parts in atlases:
 im=Image.open(Path('public/art/zanhua/studies')/name).convert('RGBA')
 for part,(x,y,w,h) in parts.items():
  alpha=im.getchannel('A')
  if person=='P4' and part in ('gown','scarf'):
   mask=Image.new('L',im.size);d=ImageDraw.Draw(mask)
   pts=[(705,0),(1435,0),(1435,710),(1495,765),(1495,887),(705,887)] if part=='gown' else [(1435,0),(1774,0),(1774,887),(1530,887),(1530,755),(1435,740)]
   d.polygon(pts,fill=255)
   from PIL import ImageChops
   alpha=ImageChops.multiply(alpha,mask)
  sample=2 if person=='P1' else 1
  a=alpha.crop((x,y,x+w,y+h)).resize((math.ceil(w/sample),math.ceil(h/sample)))
  pixels=a.load();W,H=a.size;edges={}
  def solid(i,j):return 0<=i<W and 0<=j<H and pixels[i,j]>=112
  def edge(a,b):edges.setdefault(a,[]).append(b)
  for j in range(H):
   for i in range(W):
    if not solid(i,j):continue
    if not solid(i,j-1):edge((i,j),(i+1,j))
    if not solid(i+1,j):edge((i+1,j),(i+1,j+1))
    if not solid(i,j+1):edge((i+1,j+1),(i,j+1))
    if not solid(i-1,j):edge((i,j+1),(i,j))
  paths=[]
  while edges:
   start=next(iter(edges));p=[start];cur=start
   while cur in edges:
    nxt=edges[cur].pop()
    if not edges[cur]:del edges[cur]
    p.append(nxt);cur=nxt
    if cur==start:break
   area=abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(p,p[1:]))) / 2
   if area<(12 if person=='P1' or part=='hair-ornament' else 48):continue
   tolerance=1.2 if person=='P1' else .65
   mid=len(p)//2;q=simplify(p[:mid+1],tolerance)+simplify(p[mid:],tolerance)[1:]
   coords=[(round(x+i*w/W,1),round(y+j*h/H,1)) for i,j in q]
   paths.append('M'+' L'.join(f'{i:g} {j:g}' for i,j in coords)+' Z')
  result[f'{person}-{part}']=paths
Path('src/game/zanhuaArtEdges.ts').write_text('// Generated from transparent art by scripts/art/trace-zanhua-alpha.py.\nexport const zanhuaArtEdges:Record<string,string[]>='+json.dumps(result,separators=(',',':'))+';\n')
print({k:len(v) for k,v in result.items()})
