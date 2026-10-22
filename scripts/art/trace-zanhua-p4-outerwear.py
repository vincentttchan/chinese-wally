"""Derive vector focus/hit regions from the complete study; never modify source art."""
from pathlib import Path
import runpy
from statistics import median
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[2]
base=runpy.run_path(str(root/'scripts/art/trace-zanhua-p4-skirt.py'))
im=base['im'];w,h=im.size;pix=im.load();simplify=base['simplify']
skirt=set().union(*base['components'])
# One visible interval per row, inside measured left/right scarf envelopes.
envelopes=[[(525,230,280),(560,225,295),(620,225,302),(750,222,305),(875,223,307),(945,245,310),(982,280,307)],[(565,560,587),(600,420,588),(630,396,588),(670,412,588),(695,418,580),(710,422,518),(850,432,536),(1000,440,558),(1150,450,580),(1250,470,605),(1335,590,615)]]
scarf=set()
for envelope in envelopes:
 rows=[]
 for y in range(envelope[0][0],envelope[-1][0]+1):
  lo,hi=next((a,b) for a,b in zip(envelope,envelope[1:]) if a[0]<=y<=b[0]);t=(y-lo[0])/(hi[0]-lo[0])
  x0=round(lo[1]+(hi[1]-lo[1])*t);x1=round(lo[2]+(hi[2]-lo[2])*t)
  found=[]
  for x in range(x0,x1+1):
   r,g,b,a=pix[x,y]
   if a>100 and r>g*1.65 and g>b*1.15 and (y*w+x) not in skirt:found.append(x)
  rows.append((y,min(found) if found else None,max(found) if found else None))
 # Floral motifs and ink interrupt the brown ground: interpolate only across short missing rows.
 valid=[i for i,r in enumerate(rows) if r[1] is not None]
 for i,(y,a,b) in enumerate(rows):
  if a is None:
   before=max((j for j in valid if j<i),default=None);after=min((j for j in valid if j>i),default=None)
   if before is None or after is None:continue
   t=(i-before)/(after-before);a=round(rows[before][1]*(1-t)+rows[after][1]*t);b=round(rows[before][2]*(1-t)+rows[after][2]*t)
  near=[r for r in rows[max(0,i-2):i+3] if r[1] is not None]
  if near:a=round(median([r[1] for r in near]));b=round(median([r[2] for r in near]))
  scarf.update(y*w+x for x in range(a,b+1))
# The arm wrap and hanging end form a U: do not bridge the gauze visible between them.
gap=Image.new('L',im.size)
ImageDraw.Draw(gap).polygon([(390,540),(580,540),(576,556),(572,572),(563,589),(551,604),(535,616),(513,629),(485,640),(473,633),(456,626),(438,622),(418,615),(408,613),(390,611)],fill=255)
gapdata=gap.tobytes();scarf={i for i in scarf if not gapdata[i]}
# Entire visible gauze: alpha silhouette below the cuffs, plus the two collar sections.
cloth=Image.new('L',im.size);draw=ImageDraw.Draw(cloth)
draw.rectangle((0,500,w,h),fill=255)
draw.polygon([(383,398),(348,420),(312,445),(283,465),(273,489),(304,518),(327,551),(340,493)],fill=255)
draw.polygon([(504,391),(537,422),(559,461),(576,517),(579,574),(554,610),(500,630),(399,602),(429,522),(464,451)],fill=255)
# The hands stay dim even where they cross the wide sleeve and collar.
draw.polygon([(50,438),(130,436),(171,460),(195,480),(209,513),(191,521),(175,499),(146,490),(99,485),(50,475)],fill=0)
draw.polygon([(265,485),(269,484),(279,498),(287,501),(300,498),(314,502),(324,511),(328,527),(330,566),(334,579),(347,590),(347,611),(344,624),(337,630),(312,607),(296,592),(286,579),(282,566),(279,536),(277,525),(271,519),(259,513),(249,507),(249,502),(253,500),(263,504),(276,510),(267,498),(263,490)],fill=0)
clothdata=cloth.tobytes();alph=im.getchannel('A').tobytes()
gown={i for i,v in enumerate(clothdata) if v and alph[i]>100 and i not in skirt and i not in scarf}
def contours(pixels):
 seen=set();parts=[]
 for p in sorted(pixels):
  if p in seen:continue
  q=[p];seen.add(p);component=set()
  while q:
   i=q.pop();component.add(i)
   for n in (i-1,i+1,i-w,i+w):
    if n in pixels and n not in seen and abs(n%w-i%w)<=1:seen.add(n);q.append(n)
  if len(component)>120:parts.append(component)
 paths=[];pointsall=[]
 for component in parts:
  edges={}
  for i in component:
   y,x=divmod(i,w)
   for absent,a,b in [(i-w,(x,y),(x+1,y)),(i+1,(x+1,y),(x+1,y+1)),(i+w,(x+1,y+1),(x,y+1)),(i-1,(x,y+1),(x,y))]:
    if absent not in component:edges.setdefault(a,[]).append(b)
  while edges:
   start=next(iter(edges));p=start;loop=[p]
   while True:
    nxt=edges[p].pop()
    if not edges[p]:del edges[p]
    p=nxt;loop.append(p)
    if p==start:break
   if len(loop)<30:continue
   mid=len(loop)//2;points=simplify(loop[:mid+1])[:-1]+simplify(loop[mid:])[:-1]
   pointsall+=points;paths.append('M '+' L '.join(f'{x} {y}' for x,y in points)+' Z')
 xs,ys=zip(*pointsall)
 return ' '.join(paths),[min(xs),min(ys),max(xs)-min(xs),max(ys)-min(ys)]
content='// Generated focus and hit silhouettes; source art remains unchanged.\n// Recreate: python3 scripts/art/trace-zanhua-p4-outerwear.py\n'
for name,pixels in [('Gauze',gown),('Scarf',scarf)]:
 path,bounds=contours(pixels)
 content+=f'export const zanhuaP4{name}Path = {path!r};\nexport const zanhuaP4{name}Bounds: [number,number,number,number] = {bounds};\n'
 print(name,bounds,len(path))
(root/'src/game/zanhuaP4OuterwearContours.ts').write_text(content)
