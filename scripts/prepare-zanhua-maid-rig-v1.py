"""Register generated transparent layers with one shared scale, without redrawing them."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'art-source/zanhua/maid-rig-v1'
output = root / 'public/art/zanhua/animation/maid-rig-v1'
output.mkdir(parents=True, exist_ok=True)
size = (710, 1018)
for name in ('maid-body', 'fan'):
    image = Image.open(source / f'{name}.png').convert('RGBA')
    scale = min(size[0] / image.width, size[1] / image.height)
    alpha = image.getchannel('A').point(lambda a: 0 if a < 16 else a)
    image.putalpha(alpha)
    image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', size)
    canvas.alpha_composite(image, ((size[0] - image.width) // 2, size[1] - image.height))
    canvas.save(output / f'{name}-registered.png', optimize=True)
plate = Image.open(source / 'clean-plate-source.png').convert('RGB')
plate.resize(size, Image.Resampling.LANCZOS).save(output / 'clean-plate.jpg', quality=95)
