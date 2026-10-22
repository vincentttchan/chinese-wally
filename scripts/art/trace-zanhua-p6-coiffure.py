"""Build focus masks from the existing P6 study, without changing its pixels."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

root = Path(__file__).resolve().parents[2]
source = Image.open(root / 'public/art/zanhua/studies/P6-full-study-v1.png').convert('RGBA')
size = source.size
hair = [(315,375),(301,369),(299,350),(307,334),(297,318),(298,291),(307,248),(323,214),(341,184),(361,154),(383,135),(404,125),(429,117),(455,111),(480,109),(507,117),(531,132),(558,144),(581,160),(597,180),(606,202),(617,221),(615,245),(601,272),(578,295),(559,313),(541,338),(515,365),(522,336),(510,311),(485,288),(461,279),(442,276),(420,282),(398,290),(379,300),(365,321),(354,345),(338,366)]
flower = [(448,38),(469,37),(484,8),(508,7),(524,0),(542,10),(560,4),(588,18),(600,7),(624,26),(645,42),(656,59),(663,62),(658,87),(672,97),(668,119),(650,145),(620,151),(626,167),(610,184),(594,188),(580,170),(555,159),(533,142),(514,141),(490,126),(469,124),(445,112),(450,89),(462,72)]
ornaments = [
    [(381,28),(423,24),(446,47),(450,91),(443,123),(429,137),(413,137),(408,124),(381,128),(377,92)],
    [(469,129),(514,128),(555,138),(579,155),(590,180),(600,211),(587,228),(568,244),(548,255),(506,248),(484,244),(455,240),(452,226),(480,227),(512,235),(537,233),(548,214),(531,209),(508,202),(481,198),(460,180),(453,168)],
    [(343,158),(374,156),(369,204),(334,207)],
    [(299,301),(333,296),(342,329),(309,343)],
]

def polygon(points):
    mask = Image.new('L', size)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return mask

gold_area = Image.new('L', size)
for points in ornaments:
    gold_area = ImageChops.lighter(gold_area, polygon(points))
gold_pixels = Image.new('L', size)
src = source.load(); area = gold_area.load(); target = gold_pixels.load()
for y in range(20,350):
    for x in range(290,625):
        r,g,b,a = src[x,y]
        if area[x,y] and a>80 and g>73 and r>g*1.12 and g>b*1.26:
            target[x,y] = 255
# Native one-pixel expansion retains antialiased gold edges, not the surrounding black hair.
gold_pixels = gold_pixels.filter(ImageFilter.MaxFilter(3))
alpha = source.getchannel('A')
gold_pixels = ImageChops.multiply(gold_pixels, alpha)
flower_pixels = ImageChops.multiply(polygon(flower), alpha)
flower_pixels = ImageChops.subtract(flower_pixels, gold_pixels)
hair_pixels = ImageChops.multiply(polygon(hair), alpha)
hair_pixels = ImageChops.subtract(ImageChops.subtract(hair_pixels, gold_pixels), flower_pixels)
# The slanted hairline crosses the outline: exclude skin pixels rather than lighting the forehead.
dark = Image.new('L', size); dark_data = dark.load()
petals = Image.new('L', size); petal_data = petals.load()
for y in range(400):
    for x in range(270,700):
        r,g,b,a = src[x,y]
        if r<135 and g<112 and b<100: dark_data[x,y] = 255
        if r>83 and g>55: petal_data[x,y] = 255
hair_pixels = ImageChops.multiply(hair_pixels, dark.filter(ImageFilter.MaxFilter(3)))
flower_pixels = ImageChops.multiply(flower_pixels, petals.filter(ImageFilter.MaxFilter(3)))

def path(points):
    return 'M ' + ' L '.join(f'{x} {y}' for x,y in points) + ' Z'

entries = []
for name,mask,hit in [('high-hair',hair_pixels,path(hair)),('hair-flower',flower_pixels,path(flower)),('hair-ornament',gold_pixels,' '.join(path(p) for p in ornaments))]:
    filename = f'P6-{name}-focus-v2.png'
    image = Image.new('RGBA', size, (255,255,255,0)); image.putalpha(mask)
    image.save(root / 'public/art/zanhua/studies' / filename)
    x0,y0,x1,y1 = mask.getbbox()
    entries.append(f" {name!r}:{{path:{hit!r},bounds:[{x0},{y0},{x1-x0},{y1-y0}],focusMask:'art/zanhua/studies/{filename}'}},")
    # A larger reference sheet makes each mask inspectable against the same untouched pixels.
    selected = source.copy(); selected.putalpha(ImageChops.multiply(alpha, mask))
    dim = Image.new('RGBA', size, '#28221c'); dim.alpha_composite(source)
    dim = ImageChops.blend(dim, Image.new('RGBA',size,'#28221c'), .7)
    dim.alpha_composite(selected)
    out = root / 'output/gameplay-preview/zanhua/detail-calibration'
    out.mkdir(parents=True,exist_ok=True)
    dim.crop((270,0,700,400)).resize((860,800)).save(out / f'{name}-focus.png')

(root / 'src/game/zanhuaP6CoiffureContours.ts').write_text(
    '// Generated from the unchanged 956×1646 P6 full study.\n'
    '// Recreate: python3 scripts/art/trace-zanhua-p6-coiffure.py\n'
    "export const zanhuaP6CoiffureContours:Record<string,{path:string;bounds:[number,number,number,number];focusMask:string}>={\n"
    + '\n'.join(entries) + '\n};\n')
