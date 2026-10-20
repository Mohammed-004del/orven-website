"""Keep Arabic shaping and the full basic Arabic block; omit unused extra scripts.

Optional dependencies: fonttools, brotli. Originals and OFL licence remain in assets/fonts.
Includes all characters in the authored JSON/JS plus Latin, Arabic and punctuation,
so the standard Arabic alphabet/marks and bilingual form input remain supported.
"""
from pathlib import Path
from fontTools import subset

ROOT=Path(__file__).resolve().parent.parent
F=ROOT/'assets/fonts'
characters=set()
for p in [*(ROOT/'source').glob('*.json'), ROOT/'site.js']:
    characters.update(map(ord, p.read_text(encoding='utf-8')))
characters.update(subset.parse_unicodes('U+0020-007E,U+00A0-00FF,U+0600-06FF,U+2000-206F,U+2190-2199'))
for name in ['IBMPlexSansArabic-Regular', 'IBMPlexSansArabic-Medium']:
    options=subset.Options()
    options.flavor='woff2'
    options.layout_features=['*']
    options.notdef_outline=True
    font=subset.load_font(str(F/f'{name}.ttf'),options)
    sub=subset.Subsetter(options)
    sub.populate(unicodes=characters)
    sub.subset(font)
    subset.save_font(font,str(F/f'{name}.woff2'),options)
    print(name,(F/f'{name}.woff2').stat().st_size)
