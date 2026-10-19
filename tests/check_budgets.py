"""Asset budgets and design-token contrast; not a browser speed or WCAG certification."""
from pathlib import Path
from html.parser import HTMLParser
import json,gzip
R=Path(__file__).resolve().parent.parent;D=R/'dist'
class Page(HTMLParser):
 def __init__(self,text):super().__init__();self.images=set();self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='img' and a.get('src'):self.images.add(a['src'])
def luminance(h):
 c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 c=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c]
 return sum(x*y for x,y in zip(c,[.2126,.7152,.0722]))
def contrast(a,b):
 x,y=sorted([luminance(a),luminance(b)])
 return round((y+.05)/(x+.05),2)
pairs=[('Dark body','#F1EFEA','#0B0B0C'),('Dark secondary','#B4B1B0','#0B0B0C'),('Bronze on dark','#B9A189','#0B0B0C'),('Light body','#181819','#F1EFEA'),('Light secondary','#5E5B59','#F1EFEA'),('Primary button','#0B0B0C','#B9A189')]
colors=[dict(name=n,ratio=contrast(a,b),passed=contrast(a,b)>=4.5) for n,a,b in pairs]
pages=[]
for file in [*D.glob('en/**/index.html'),*D.glob('ar/**/index.html')]:
 p=Page(file.read_text(encoding='utf-8'));lang=file.relative_to(D).parts[0]
 fonts=['IBMPlexSansArabic-Regular.woff2','IBMPlexSansArabic-Medium.woff2'] if lang=='ar' else ['Inter.woff2','SpaceGrotesk.woff2']
 if lang=='en' and 'lang="ar" dir="rtl"' in file.read_text(encoding='utf-8'): fonts.append('IBMPlexSansArabic-Regular.woff2')  # verbatim Arabic client feedback
 # Upper bound for all page images at full scroll, plus one uncached load of CSS/JS/fonts.
 total=file.stat().st_size+sum((D/s.lstrip('/')).stat().st_size for s in p.images)+sum((D/f).stat().st_size for f in ['tokens.css','site.css','site.js','assets/vendor/lenis.min.js'])+sum((D/'assets/fonts'/f).stat().st_size for f in fonts)
 pages.append(dict(path=str(file.relative_to(D)).replace('\\','/'),full_scroll_uncached_bytes=total,passed=total<4_000_000))
scripts=[dict(file=f,gzip_bytes=len(gzip.compress((D/f).read_bytes())),passed=len(gzip.compress((D/f).read_bytes()))<15_000) for f in ['tokens.css','site.css','site.js','assets/vendor/lenis.min.js']]
result=dict(colors=colors,pages=pages,scripts=scripts,passed=all(x['passed'] for x in colors+pages+scripts),scope='Static transfer budgets and six text-color token pairs. Does not measure real latency, Core Web Vitals, assistive technology, or full WCAG conformance.')
(R/'test-results/budgets-contrast.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(dict(passed=result['passed'],page_count=len(pages),max_uncached_page_bytes=max(p['full_scroll_uncached_bytes'] for p in pages),colors=colors)))
raise SystemExit(0 if result['passed'] else 1)
