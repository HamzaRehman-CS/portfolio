const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'C:/Users/ztech.pk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('401 (Unauthorized)'))errors.push(m.text());});
 const base='http://localhost:5173';
 try{
  await page.goto(base,{waitUntil:'networkidle',timeout:120000});
  await page.getByRole('heading',{name:'Thoughtful code. Unforgettable experiences.'}).waitFor();
  await page.waitForTimeout(1200);await page.screenshot({path:'screenshots/qa-desktop.png'});
  for(const id of ['works','about','skills','certificates','contact']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(850);await page.screenshot({path:`screenshots/qa-${id}.png`});}
  await page.locator('#works').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Graphic Design',exact:true}).click();await page.locator('.project-card').first().click();
  assert.equal(await page.getByRole('dialog').count(),1);await page.getByRole('button',{name:'Next image',exact:true}).click();assert.ok((await page.locator('.gallery-controls').innerText()).includes('2 / 3'));
  await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
  await page.getByRole('button',{name:'All 08',exact:true}).click();
  await page.locator('#skills summary').first().click();assert.equal(await page.locator('#skills details[open]').count(),1);
  await page.getByRole('button',{name:'Settings — admin sign in'}).click();await page.getByRole('heading',{name:'Welcome back.'}).waitFor();await page.screenshot({path:'screenshots/qa-login.png'});
  if(!process.env.QA_PASSWORD)throw Error('Provide QA_PASSWORD to run the admin workflow.');
  await page.getByLabel('Password',{exact:true}).fill(process.env.QA_PASSWORD);await page.getByRole('button',{name:'Enter your studio'}).click();await page.getByRole('heading',{name:'Overview',exact:true}).waitFor({timeout:30000});await page.screenshot({path:'screenshots/qa-admin.png'});
  const original=await page.evaluate(async()=>await(await fetch('/api/content')).json());
  try{
   await page.getByRole('button',{name:'Profile & contact',exact:true}).click();await page.getByLabel('Headline',{exact:true}).fill('Thoughtful code. Tested live.');
   await page.getByRole('button',{name:'Preview',exact:true}).click();await page.getByRole('heading',{name:'Thoughtful code. Tested live. Unforgettable experiences.'}).waitFor();await page.getByRole('button',{name:'Back to editor'}).click();
   await page.getByRole('button',{name:'Publish changes'}).click();await page.getByRole('status').filter({hasText:'Published.'}).waitFor({timeout:30000});
   const anonymous=await browser.newContext();const visitor=await anonymous.newPage();await visitor.goto(base,{waitUntil:'networkidle'});await visitor.getByRole('heading',{name:'Thoughtful code. Tested live. Unforgettable experiences.'}).waitFor();await anonymous.close();
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:'screenshots/qa-admin-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile admin must not overflow');
  }finally{
   await page.evaluate(async original=>{const session=await(await fetch('/api/auth/session')).json();const current=await(await fetch('/api/content')).json();const r=await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrf},body:JSON.stringify({content:original.content,revision:current.revision})});if(!r.ok)throw Error('Could not restore QA changes');},original);
  }
  await page.getByRole('button',{name:'Sign out'}).click();await page.getByRole('heading',{name:'Welcome back.'}).waitFor();await page.getByRole('button',{name:'Back to portfolio'}).click();await page.waitForTimeout(1000);await page.screenshot({path:'screenshots/qa-mobile.png'});
  for(const width of [360,390,768,1280]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`No overflow at ${width}px`);}
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About',exact:true}).click();assert.equal(await page.locator('.nav.open').count(),0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.reveal').first().evaluate(e=>getComputedStyle(e).opacity),'1');
  assert.deepEqual(errors,[]);fs.writeFileSync('screenshots/qa-results.json',JSON.stringify({passed:true,checks:['desktop sections','project filter','gallery navigation','Escape closes dialog','skill details','admin login','draft preview','publishing visible in separate session','logout','mobile admin','responsive widths','mobile navigation','reduced motion'],errors},null,2));console.log('Browser checks passed. Screenshots saved in screenshots/qa-*.png.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
