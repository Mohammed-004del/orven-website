const MAX_BODY_BYTES=12000;
const encoder=new TextEncoder();
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function normalizeDigits(s){return s.replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632)).replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-1776))}
export function validateInquiry(input,now=Date.now()){
 if(!input||Array.isArray(input)||typeof input!=='object')return {error:'invalid'};
 const limits={name:120,contact:254,details:5000,service:32,locale:2,requestId:36,turnstileToken:2048,company_url:200,policyVersion:24};
 for(const [key,max] of Object.entries(limits))if(input[key]!=null&&(typeof input[key]!=='string'||input[key].length>max))return {error:'invalid'};
 if(input.company_url)return {error:'spam'};
 const name=(input.name||'').trim(),contact=normalizeDigits((input.contact||'').trim()),details=(input.details||'').trim();
 if(!name||!contact||!details||/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(name+contact+details)||/[\r\n]/.test(name+contact))return {error:'invalid'};
 const phone=contact.replace(/[\s()-]/g,'');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)&&!/^\+?\d{8,15}$/.test(phone))return {error:'invalid_contact'};
 if(!['','website','application'].includes(input.service||'')||!['en','ar'].includes(input.locale)||!UUID.test(input.requestId||''))return {error:'invalid'};
 if(!Number.isSafeInteger(input.startedAt)||now-input.startedAt<1500||now-input.startedAt>86400000)return {error:'invalid_timing'};
 if(input.policyVersion!=='2026-10-19')return {error:'policy_version'};
 return {value:{requestId:input.requestId,name,contact,details,service:input.service||'',locale:input.locale,policyVersion:input.policyVersion}};
}
export async function hmacHex(secret,value){
 const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
}
async function readBounded(request){
 const len=Number(request.headers.get('Content-Length')||0);
 if(len>MAX_BODY_BYTES)throw new RangeError('size');
 const reader=request.body?.getReader();if(!reader)throw new Error('empty');
 const chunks=[];let total=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_BODY_BYTES){await reader.cancel();throw new RangeError('size')}chunks.push(value)}}finally{reader.releaseLock()}
 const result=new Uint8Array(total);let offset=0;for(const c of chunks){result.set(c,offset);offset+=c.byteLength}return new TextDecoder('utf-8',{fatal:true}).decode(result);
}
const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"};
function reply(status,code,extra={}){return new Response(JSON.stringify({received:false,code,...extra}),{status,headers:HEADERS})}
export async function handleInquiry(request,env,dependencies={}){
 const fetcher=dependencies.fetch||fetch,now=dependencies.now||Date.now;
 if(request.method!=='POST')return new Response(null,{status:405,headers:{...HEADERS,Allow:'POST'}});
 const origin=new URL(request.url).origin;
 if(request.headers.get('Origin')!==origin||env.SITE_URL!==origin)return reply(403,'origin');
 if(request.headers.get('Sec-Fetch-Site')&&request.headers.get('Sec-Fetch-Site')!=='same-origin')return reply(403,'origin');
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type')||''))return reply(415,'content_type');
 if(!env.GAS_WEB_APP_URL||!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(env.GAS_WEB_APP_URL)||!env.GAS_SHARED_SECRET||env.GAS_SHARED_SECRET.length<32||!env.TURNSTILE_SECRET_KEY||!env.INQUIRY_RATE_LIMITER||!env.GLOBAL_RATE_LIMITER)return reply(503,'unavailable');
 try{
  const ip=request.headers.get('CF-Connecting-IP');if(!ip)return reply(403,'untrusted_request');
  // The IP is used transiently at Cloudflare; never forwarded to Google or application logs.
  const key=await hmacHex(env.GAS_SHARED_SECRET,'rate:'+ip);
  const [local,global]=await Promise.all([env.INQUIRY_RATE_LIMITER.limit({key}),env.GLOBAL_RATE_LIMITER.limit({key:'orven-inquiry'})]);
  if(!local.success||!global.success)return new Response(JSON.stringify({received:false,code:'rate_limit'}),{status:429,headers:{...HEADERS,'Retry-After':'60'}});
  let data;try{data=JSON.parse(await readBounded(request))}catch(err){return reply(err instanceof RangeError?413:400,'invalid')}
  const checked=validateInquiry(data,now());if(checked.error)return reply(400,checked.error);
  if(!data.turnstileToken)return reply(400,'verification');
  const verify=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:data.turnstileToken,idempotency_key:data.requestId}),signal:AbortSignal.timeout(8000)});
  const verification=await verify.json();
  if(!verify.ok||verification.success!==true||verification.hostname!==new URL(env.SITE_URL).hostname||verification.action!=='inquiry')return reply(400,'verification');
  const payload=JSON.stringify(checked.value),timestamp=String(now()),nonce=crypto.randomUUID();
  const signature=await hmacHex(env.GAS_SHARED_SECRET,timestamp+'.'+nonce+'.'+payload);
  const upstream=await fetcher(env.GAS_WEB_APP_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({timestamp,nonce,payload,signature}),redirect:'follow',signal:AbortSignal.timeout(18000)});
  const saved=await upstream.json();
  if(!upstream.ok||saved.received!==true||saved.requestId!==checked.value.requestId||!saved.receipt)return reply(502,'unconfirmed');
  const expected=await hmacHex(env.GAS_SHARED_SECRET,'receipt.'+saved.requestId+'.saved');
  if(saved.receipt!==expected)return reply(502,'unconfirmed');
  return reply(200,'saved',{received:true,requestId:saved.requestId});
 }catch{return reply(503,'unavailable')}
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/api/inquiry')return handleInquiry(request,env);
 if(url.pathname.startsWith('/api/'))return reply(404,'not_found');
 if(!['GET','HEAD'].includes(request.method))return reply(405,'method');
 if(url.pathname==='/')return Response.redirect(url.origin+'/en/',302);
 return env.ASSETS.fetch(request);
}};
