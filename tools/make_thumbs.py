"""Regenerate the lightweight screenshot thumbnails in assets/thumbs/.
Optional maintenance helper (needs Pillow); the site build itself stays standard-library only.
Thumbnails are top crops of the reviewed public screenshots, 640x360 WebP.
"""
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parent.parent;A=R/'assets';T=A/'thumbs';T.mkdir(exist_ok=True)
SOURCES=['spiky-public-cover-ar.png','spiky-public-coach-ar.png','spiky-public-contact-ar.png','spiky-public-faq-ar.png',
 *[f'future-public-{l}-{i:02d}.jpg' for l in ['en','ar'] for i in range(1,5)]]
W,H=640,360
for name in SOURCES:
 im=Image.open(A/name).convert('RGB');scale=W/im.width
 im=im.resize((W,round(im.height*scale)),Image.LANCZOS)
 if im.height<H:  # wider than 16:9 — scale to height and crop the centre instead
  im=Image.open(A/name).convert('RGB');scale=H/im.height;im=im.resize((round(im.width*scale),H),Image.LANCZOS);x=(im.width-W)//2;im=im.crop((x,0,x+W,H))
 else:im=im.crop((0,0,W,H))
 out=T/(Path(name).stem+'.webp');im.save(out,'WEBP',quality=74,method=6);print(out.name,out.stat().st_size)
