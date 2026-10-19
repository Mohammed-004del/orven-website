"""Subset the Latin web fonts to the characters the site needs (Basic Latin, Latin-1,
common punctuation and arrows). Optional maintenance helper; needs `fonttools` and `brotli`.
Variable axes and OpenType layout features are kept. Source: the full .ttf files in assets/fonts
(both fonts are OFL 1.1 without a Reserved Font Name, so subsetting is permitted)."""
from pathlib import Path
from fontTools import subset
F=Path(__file__).resolve().parent.parent/'assets/fonts'
UNICODES='U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2010-2027,U+2030-203A,U+20AC,U+2122,U+2190-2199,U+2212,U+2215'
for name in ['Inter','SpaceGrotesk']:
 o=subset.Options();o.flavor='woff2';o.layout_features=['*'];o.name_IDs=['*'];o.notdef_outline=True
 font=subset.load_font(str(F/f'{name}.ttf'),o);s=subset.Subsetter(o);s.populate(unicodes=subset.parse_unicodes(UNICODES));s.subset(font)
 subset.save_font(font,str(F/f'{name}.woff2'),o);print(name,(F/f'{name}.woff2').stat().st_size)
