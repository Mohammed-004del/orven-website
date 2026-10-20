// Optional dependency: playwright. CHROME_PATH can point to an installed Chrome.
// Read-only frontend checks: never submits an inquiry to Google.
const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:8773';
 const out=path.resolve(__dirname,'../test-results/performance');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({headless:true, ...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'}),args:['--no-proxy-server']});
 const results=[],errors=[];
 try{
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
   for(const lang of ['ar','en'])for(const route of ['','services/','work/','about/','contact/','work/spiky/','work/future-interiors/','privacy/']){
    const url=`${origin}/${lang}/${route}`;const response=await page.goto(url);assert.equal(response.status(),200);
    await page.evaluate(()=>document.fonts.ready);
    const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,dir:document.documentElement.dir}));
    assert.equal(state.h1,1);assert.ok(state.scrollWidth<=width,`${url}: overflow`);assert.equal(state.dir,lang==='ar'?'rtl':'ltr');
    // Reach each image so lazy loading is checked, including original screenshot fallback.
    for(const img of await page.locator('main img').all()){
     await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());
     assert.ok(await img.evaluate(i=>i.naturalWidth>0));
    }
    if(!route){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`home-${lang}-${width}.jpg`),type:'jpeg',quality:85});}
    results.push({url,width,...state,passed:true});
   }
   await context.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${origin}/en/`);
  await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  const faq=page.locator('.faq summary').first();await faq.click();assert.ok(await faq.evaluate(e=>e.parentElement.open));
  await page.goto(`${origin}/ar/work/spiky/`);
  await page.locator('[data-image]').first().click();assert.ok(await page.locator('.lightbox').evaluate(e=>e.open));
  const original=await page.locator('.lightbox img').getAttribute('src');assert.ok(!original.includes('/responsive/'));
  await page.locator('.lb-next').click();assert.notEqual(await page.locator('.lightbox img').getAttribute('src'),original);
  await page.keyboard.press('Escape');assert.ok(!await page.locator('.lightbox').evaluate(e=>e.open));
  await page.goto(`${origin}/en/contact/`);
  // Programmatic submit event avoids activating Turnstile via focus: only empty-field validation.
  await page.locator('#inquiry').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(await page.locator('[aria-invalid="true"]').count(),3);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'name');
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(out,'browser.json'),JSON.stringify({results,interactions:'Menu/Escape, FAQ, original-image zoom/next/Escape, empty form validation passed',errors,scope:'Frontend checks; no inquiry sent; images checked with reduced motion; interactions with normal motion'},null,2));
  console.log(JSON.stringify({pageChecks:results.length,errors,interactions:'passed'}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
