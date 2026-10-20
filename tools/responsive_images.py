"""Generate display-size WebP copies; retain reviewed originals for lightbox zoom.

Optional maintenance dependency: Pillow. Run after changing source screenshots.
No crops, retouching, privacy changes, or upscaling are performed.
"""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
assets = ROOT / 'assets'
target = assets / 'responsive'
target.mkdir(exist_ok=True)
manifest = {}
for name in json.loads((ROOT / 'source/asset-dimensions.json').read_text(encoding='utf-8')):
    if not name.startswith(('spiky-', 'future-')):
        continue
    with Image.open(assets / name) as image:
        entries = []
        for width in sorted({min(w, image.width) for w in (480, 960, 1440)}):
            resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
            file = target / f'{Path(name).stem}-{width}.webp'
            resized.save(file, 'WEBP', quality=85, method=6)
            entries.append({'src': file.relative_to(assets).as_posix(), 'width': width})
        manifest[name] = entries
(ROOT / 'source/responsive-images.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(f'Generated responsive variants for {len(manifest)} reviewed screenshots.')
