from pathlib import Path
from PIL import Image
import urllib.request,ssl,concurrent.futures,io,json
p=Path('docs/art/luoshen/selection-2026-10-15');p.mkdir(parents=True,exist_ok=True)
ctx=ssl._create_unverified_context()
base='https://shuziwenwu-1259446244.cos.ap-beijing.myqcloud.com/relic/2016364543087083520/image-bundle/16/'
def get(t):
 x,y=t; f=p/f'tile-16-{x}-{y}.png'
 try:
  if not f.exists():f.write_bytes(urllib.request.urlopen(base+f'{x}_{y}.png',context=ctx,timeout=25).read())
  return x,y,Image.open(f).copy(),None
 except Exception as e:return x,y,None,str(e)
items=list(concurrent.futures.ThreadPoolExecutor(8).map(get,[(x,y) for x in range(30,69) for y in range(3)]))
out=Image.new('RGB',(39*510,1080),'white')
errors=[]
for x,y,im,e in items:
 if im:out.paste(im,((x-30)*510-(1 if x else 0),y*510-(1 if y else 0)))
 else:errors.append([x,y,e])
out.save(p/'painting-level16.jpg',quality=95)
(p/'fetch-record.json').write_text(json.dumps({'source':base,'level':16,'global_origin':[15300,0],'size':list(out.size),'tiles':len(items),'errors':errors},indent=2))
print('saved',out.size,'errors',errors)
for n in range(10):
 a=n*2000;b=min(a+2200,out.width)
 if a<out.width:out.crop((a,0,b,1080)).save(p/f'section-{n:02}.jpg',quality=94)
