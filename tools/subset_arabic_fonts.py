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
    # The original OFL reserves "Plex". Give the modified font a distinct primary name.
    weight=name.rsplit('-',1)[1]
    output=f'ORVENArabic-{weight}'
    names={1:'ORVEN Arabic',2:weight,3:f'ORVEN Arabic Subset {weight}',4:f'ORVEN Arabic {weight}',6:output,16:'ORVEN Arabic',17:weight}
    for record in font['name'].names:
        if record.nameID in names:
            record.string=names[record.nameID].encode(record.getEncoding())
    subset.save_font(font,str(F/f'{output}.woff2'),options)
    print(output,(F/f'{output}.woff2').stat().st_size)
