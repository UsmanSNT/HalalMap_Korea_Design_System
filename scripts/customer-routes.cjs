const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');const fs=require('fs');fs.mkdirSync('artifacts',{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];
 page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));
 await page.goto('http://127.0.0.1:8443');await page.locator('input').first().waitFor();await page.locator('button[type=submit]').click();await page.waitForURL('**/#/home');
 const localeIssues=await page.evaluate(async()=>{const {dictionaries}=await import('/src/i18n/index.ts');return Object.entries(dictionaries).flatMap(([ns,langs])=>Object.keys(langs.ko).flatMap(key=>['en','uz'].filter(l=>!langs[l]?.[key]).map(l=>`${ns}.${key}:${l}`)));});if(localeIssues.length)throw Error(JSON.stringify(localeIssues));console.log('PASS dictionary key parity');
 const app=fs.readFileSync('src/App.tsx','utf8');
 const routes=[...app.matchAll(/case "([\w-]+)":/g)].map(m=>m[1]);const results=[];
 for(const lang of ['ko','en','uz']){
  await page.evaluate(l=>localStorage.setItem('halalmap-language',l),lang);
  await page.reload();
  for(const width of [360,390,430]){
   await page.setViewportSize({width,height:844});
   for(const route of routes){
    await page.goto(`http://127.0.0.1:8443/#/${route}`);await page.waitForFunction(()=>document.querySelector('main')?.innerText.trim(),{},{timeout:3000}).catch(()=>{});await page.waitForTimeout(120);
    const data=await page.evaluate(()=>({text:document.body.innerText,width:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,empty:!document.querySelector('main')?.innerText.trim(),overflow:[...document.querySelectorAll('main button,main input')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)&&!el.closest('.overflow-x-auto')}).map(el=>el.textContent.trim().slice(0,50))}));
    const missing=data.text.match(/\b(?:home|flow|common|profile|search|mosque|scanner|order|community|smart|travel|engagement|rewards|accessibility|onboarding)\.[a-z_]+/g)||[];
    const korean=lang!=='ko'?data.text.split('\n').filter(t=>/[가-힣]/.test(t)&&!t.includes('한국어')):[];
    results.push({route,lang,width,missing,korean,overflow:data.overflow,empty:data.empty,horizontal:data.width>width||data.bodyWidth>width});
    if(width===390&&lang==='en'&&['home','profile','menu','checkout','search','ai-meal','language'].includes(route))await page.screenshot({path:`artifacts/${route}-en.png`});
   }console.log('completed',lang,width);
  }
 }
 fs.writeFileSync('artifacts/route-audit.json',JSON.stringify({errors,results},null,2));
 const issues=results.filter(r=>r.missing.length||r.korean.length||r.horizontal||r.empty||r.overflow.length);console.log(JSON.stringify({errors,issues},null,2));await browser.close();if(errors.length||issues.length)process.exitCode=1;
})();
