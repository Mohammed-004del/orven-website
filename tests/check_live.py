"""Read-only page checks and rejected intake requests against the owned deployment."""
from pathlib import Path
import urllib.request,urllib.error,json,time,uuid,concurrent.futures
R=Path(__file__).resolve().parent.parent
BASE=json.loads((R/'source/site-config.json').read_text(encoding='utf-8'))['site_url']
def request(path,method='GET',data=None,headers=None):
 start=time.monotonic()
 req=urllib.request.Request(BASE+path,data=data,method=method,headers={'User-Agent':'ORVEN-Launch-Verification/1.0',**(headers or {})})
 try:
  with urllib.request.urlopen(req,timeout=30) as response: result=(response.status,dict(response.headers),response.read())
 except urllib.error.HTTPError as e: result=(e.code,dict(e.headers),e.read())
 return (*result,round((time.monotonic()-start)*1000))
paths=['','services/','work/','about/','contact/','work/spiky/','work/future-interiors/','privacy/']
def page(path):
 status,headers,body,ms=request(path);text=body.decode(); lower={k.lower():v for k,v in headers.items()}
 return dict(path=path,status=status,elapsed_ms=ms,bytes=len(body),passed=status==200 and 'index,follow' in text and BASE+path in text and 'content-security-policy' in lower and lower.get('x-content-type-options')=='nosniff',headers=lower)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 pages=list(pool.map(page,['/'+lang+'/'+p for lang in ['en','ar'] for p in paths]))
checks=[]
for path,expected in [('/not-an-orven-page/',404),('/api/missing',404),('/api/inquiry',405)]:
 s,h,b,ms=request(path);checks.append(dict(test=path,status=s,expected=expected,passed=s==expected))
for path,needle in [('/robots.txt','Allow: /'),('/sitemap.xml','hreflang="ar"')]:
 s,h,b,ms=request(path);checks.append(dict(test=path,status=s,passed=s==200 and needle in b.decode()))
s,h,b,ms=request('/api/inquiry','POST',b'{}',{'Content-Type':'application/json','Origin':'https://untrusted.invalid'})
checks.append(dict(test='Reject foreign origin',status=s,passed=s==403))
s,h,b,ms=request('/api/inquiry','POST',b'{}',{'Content-Type':'text/plain','Origin':BASE})
checks.append(dict(test='Reject simple form content type',status=s,passed=s==415))
payload=dict(name='Synthetic protection check',contact='test@example.invalid',details='No client information.',service='',locale='en',requestId=str(uuid.uuid4()),startedAt=int(time.time()*1000)-3000,policyVersion='2026-10-19',turnstileToken='',company_url='')
s,h,b,ms=request('/api/inquiry','POST',json.dumps(payload).encode(),{'Content-Type':'application/json','Origin':BASE})
try: parsed=json.loads(b)
except ValueError: parsed={'non_json_response':b[:160].decode(errors='replace')}
checks.append(dict(test='Reject missing Turnstile without saving',status=s,response=parsed,passed=s==400 and parsed.get('code')=='verification'))
result=dict(base=BASE,pages=pages,checks=checks,passed=all(x['passed'] for x in pages+checks),scope='Real HTTPS requests; successful UI intake is recorded separately. Timings are single observations, not a performance score.')
if '1010' in parsed.get('non_json_response',''):
 for item in pages+checks:
  item['passed']=False
  item['verification']='Blocked upstream by Cloudflare 1010; no application assertion'
 result['passed']=False
 result['scope']='External HTTP probe blocked before application. Do not interpret these 403 responses as successful application security tests. Browser and live intake evidence is separate.'
(R/'test-results/live-http.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(dict(pages=len(pages),checks=len(checks),passed=result['passed'])))
raise SystemExit(0 if result['passed'] else 1)
