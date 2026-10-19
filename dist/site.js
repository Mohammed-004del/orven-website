'use strict';
const settings=JSON.parse(document.getElementById('site-settings').textContent);
const header=document.querySelector('.site-header');
const menu=document.querySelector('.menu-toggle');
let previousScroll=window.scrollY;
function closeMenu(){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',settings.menu)}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?settings.close:settings.menu);header.classList.toggle('menu-open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('menu-open')){closeMenu();menu.focus()}});
document.querySelectorAll('#primary-nav a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('resize',()=>{if(window.innerWidth>760)closeMenu()});
window.addEventListener('scroll',()=>{const y=window.scrollY;if(Math.abs(y-previousScroll)>5){header.classList.toggle('is-hidden',y>140&&y>previousScroll&&!header.classList.contains('menu-open'));previousScroll=y}},{passive:true});
const toast=document.querySelector('.toast');let toastTimer;
document.querySelectorAll('[data-unavailable]').forEach(b=>b.addEventListener('click',()=>{toast.textContent=b.dataset.unavailable;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true},8500)}));
const dialog=document.querySelector('.lightbox');let lastImageButton;
document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{lastImageButton=b;dialog.querySelector('img').src=b.dataset.image;dialog.querySelector('img').alt=b.dataset.caption;dialog.querySelector('p').textContent=b.dataset.caption;dialog.showModal()}));
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>lastImageButton?.focus());
const form=document.getElementById('inquiry');
if(form){
 const copy=settings.formCopy,status=document.getElementById('form-status'),submit=form.querySelector('[type=submit]');
 let requestId=crypto.randomUUID(),startedAt=Date.now(),turnstileToken='',widgetId,loadingVerification;
 function loadVerification(){
  if(loadingVerification||!settings.turnstileSiteKey)return;
  loadingVerification=true;
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
  script.onload=()=>{widgetId=window.turnstile.render('#turnstile',{sitekey:settings.turnstileSiteKey,action:'inquiry',language:document.documentElement.lang,theme:'light',appearance:'interaction-only',callback:token=>{turnstileToken=token;},'expired-callback':()=>{turnstileToken='';},'error-callback':()=>{turnstileToken='';status.textContent=copy.verification;}})};
  script.onerror=()=>{status.textContent=copy.verification;loadingVerification=false;};document.head.append(script);
 }
 if(settings.formEndpoint)form.addEventListener('focusin',loadVerification,{once:true});
 const ids=['name','contact','details'];
 function error(id,msg){const input=document.getElementById(id);input.setAttribute('aria-invalid',String(Boolean(msg)));document.getElementById(id+'-error').textContent=msg}
 function normalizeDigits(s){return s.replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632)).replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-1776))}
 function validContact(s){s=normalizeDigits(s.trim());if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))return true;return /^[+\d\s()-]+$/.test(s)&&/^\+?\d{8,15}$/.test(s.replace(/[\s()-]/g,''))}
 ids.forEach(id=>document.getElementById(id).addEventListener('input',()=>error(id,'')));
 form.addEventListener('submit',async e=>{
  e.preventDefault();status.textContent='';let firstInvalid;
  ids.forEach(id=>{const v=document.getElementById(id).value.trim();const msg=!v?copy.required:id==='contact'&&!validContact(v)?copy.invalid:'';error(id,msg);if(msg&&!firstInvalid)firstInvalid=id});
  if(firstInvalid){document.getElementById(firstInvalid).focus();return}
  if(!settings.formEndpoint){status.textContent=copy.unconfigured;status.focus();return}
  if(!turnstileToken){loadVerification();status.textContent=copy.verification;status.focus();return}
  submit.disabled=true;submit.textContent=copy.sending;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30000);
  try{
   const values=Object.fromEntries(new FormData(form));const data={name:values.name,contact:normalizeDigits(values.contact),details:values.details,service:values.service,company_url:values.company_url,locale:document.documentElement.lang,requestId,startedAt,turnstileToken,policyVersion:settings.policyVersion};
   const response=await fetch(settings.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
   const result=await response.json();
   if(!response.ok||result.received!==true||result.requestId!==requestId)throw new Error('Unconfirmed delivery');
   status.textContent=copy.success;form.reset();requestId=crypto.randomUUID();startedAt=Date.now();
  }catch{status.textContent=copy.error}
  finally{clearTimeout(timeout);submit.disabled=false;submit.textContent=copy.submit;turnstileToken='';if(widgetId!==undefined)window.turnstile.reset(widgetId);status.focus()}
 });
}
