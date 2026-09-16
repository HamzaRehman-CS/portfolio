import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createPortfolioServer } from './index.mjs';
import { contentSchema } from './schema.mjs';

test('older portfolio content gets appearance defaults and invalid colors are rejected', async () => {
  const content=JSON.parse(await readFile(new URL('./seed.json',import.meta.url),'utf8'));
  delete content.appearance;
  delete content.heroArtwork;
  const artwork=contentSchema.parse(content).heroArtwork;
  assert.equal(artwork.mode,'logo');
  assert.equal(artwork.showCaption,false);
  assert.equal(artwork.showEyebrow,false);
  assert.deepEqual(contentSchema.parse(content).appearance,{accent:'#ff5b23',motion:true});
  content.appearance={accent:'url(https://example.com)',motion:true};
  assert.equal(contentSchema.safeParse(content).success,false);
});

test('hero settings validate slide limits and restrict logo URLs to uploaded images',async()=>{
  const content=JSON.parse(await readFile(new URL('./seed.json',import.meta.url),'utf8'));
  for(const patch of [{phrases:[]},{phrases:['a'.repeat(61)]},{phrases:['a\nb\nc\nd']},{phrases:Array(13).fill('Hello')},{logo:'https://example.com/logo.png'},{logo:'/uploads/'+ 'a'.repeat(64)+'.pdf'}]){
    assert.equal(contentSchema.safeParse({...content,heroArtwork:{...content.heroArtwork,...patch}}).success,false);
  }
  assert.equal(contentSchema.safeParse({...content,heroArtwork:{...content.heroArtwork,mode:'text',phrases:['My first idea','My next idea'],showCaption:true,caption:'Explore ideas'}}).success,true);
});

test('admin security, publishing, uploads, contact, and restart persistence', async t => {
  const dataDir=await mkdtemp(path.join(tmpdir(),'portfolio-test-'));
  const password='test-password-with-strong-entropy-9375';
  let server,base,cookie='',csrf='';
  const boot=async()=>{server=await createPortfolioServer({dataDir,port:0,origin:'http://localhost',initialPassword:password});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;};
  const close=()=>new Promise(r=>server.close(r));
  const request=async(route,{method='GET',body,auth=false,origin='http://localhost',token=csrf}={})=>{
    const headers={'Content-Type':'application/json',Origin:origin};if(auth){headers.Cookie=cookie;headers['X-CSRF-Token']=token;}
    const res=await fetch(base+route,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
    const text=await res.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {res,data};
  };
  const login=async()=>{const {res,data}=await request('/api/auth/login',{method:'POST',body:{username:'admin',password}});assert.equal(res.status,200);cookie=res.headers.get('set-cookie').split(';')[0];csrf=data.csrf;assert.match(res.headers.get('set-cookie'),/HttpOnly/);assert.match(res.headers.get('set-cookie'),/SameSite=Strict/);};
  try {
    await boot();let original;
    await t.test('public content is seeded; credentials are hashed and private',async()=>{
      const {res,data}=await request('/api/content');assert.equal(res.status,200);original=data;assert.ok(data.content.projects.length>0);assert.equal(res.headers.get('cache-control'),'no-store');
      assert.ok(!(await readFile(path.join(dataDir,'auth.json'),'utf8')).includes(password));
      for(const route of ['/api/messages','/api/auth/session'])assert.equal((await request(route)).res.status,401);
      for(const route of ['/.portfolio-data/auth.json','/server/seed.json','/.env','/uploads/../../.env'])assert.equal((await request(route)).res.status,404);
      assert.equal((await request('/api/content',{method:'PUT',body:original})).res.status,401);
      assert.equal((await request('/api/uploads',{method:'POST',body:{data:'test'}})).res.status,401);
    });
    await t.test('login rejects wrong credentials and cross-origin requests',async()=>{
      assert.equal((await request('/api/auth/login',{method:'POST',body:{username:'admin',password:'wrong'}})).res.status,401);
      assert.equal((await request('/api/auth/login',{method:'POST',origin:'https://evil.example',body:{username:'admin',password}})).res.status,403);await login();
      assert.equal((await request('/api/auth/session',{auth:true})).data.username,'admin');
    });
    await t.test('CSRF and invalid links cannot change published content',async()=>{
      assert.equal((await request('/api/content',{method:'PUT',auth:true,token:'bad',body:original})).res.status,403);
      const invalid=structuredClone(original);invalid.content.projects[0].link='javascript:alert(1)';
      assert.equal((await request('/api/content',{method:'PUT',auth:true,body:invalid})).res.status,400);
      assert.equal((await request('/api/content')).data.revision,original.revision);
    });
    await t.test('publish visible to anonymous visitor; stale writes rejected',async()=>{
      const draft=structuredClone(original);draft.content.profile.headline='Published through the admin';
      draft.content.skills.push({...draft.content.skills[0],id:'new-skill',name:'A newly added skill'});
      const {res,data}=await request('/api/content',{method:'PUT',auth:true,body:draft});assert.equal(res.status,200);assert.equal(data.revision,original.revision+1);
      const publicData=(await request('/api/content')).data;assert.equal(publicData.content.profile.headline,draft.content.profile.headline);assert.equal(publicData.content.skills.at(-1).name,'A newly added skill');
      assert.equal((await request('/api/content',{method:'PUT',auth:true,body:draft})).res.status,409);
      assert.equal(JSON.parse(await readFile(path.join(dataDir,'content.backup.json'),'utf8')).revision,original.revision);
    });
    await t.test('uploads reject active files, serve allowed image bytes',async()=>{
      assert.equal((await request('/api/uploads',{method:'POST',auth:true,body:{data:Buffer.from('<svg><script>alert(1)</script></svg>').toString('base64')}})).res.status,400);
      const bytes=await readFile(new URL('../public/hamza_rehman.jpg',import.meta.url));
      const {res,data}=await request('/api/uploads',{method:'POST',auth:true,body:{data:bytes.toString('base64')}});assert.equal(res.status,201);
      const image=await fetch(base+data.url);assert.equal(image.headers.get('content-type'),'image/jpeg');assert.equal((await image.arrayBuffer()).byteLength,bytes.length);
    });
    await t.test('contact message is stored only in the protected inbox',async()=>{
      assert.equal((await request('/api/contact',{method:'POST',body:{name:'Test Visitor',email:'visitor@example.com',message:'I would like a new website.'}})).res.status,201);
      const inbox=await request('/api/messages',{auth:true});assert.equal(inbox.data.length,1);assert.equal(inbox.data[0].email,'visitor@example.com');
      assert.ok(!JSON.stringify((await request('/api/content')).data).includes('visitor@example.com'));
    });
    await t.test('server restart preserves content and invalidates sessions',async()=>{
      await close();await boot();assert.equal((await request('/api/auth/session',{auth:true})).res.status,401);
      assert.equal((await request('/api/content')).data.content.profile.headline,'Published through the admin');await login();assert.equal((await request('/api/messages',{auth:true})).data.length,1);
    });
    await t.test('logout revokes the server session',async()=>{
      assert.equal((await request('/api/auth/logout',{method:'POST',auth:true,body:{}})).res.status,200);
      assert.equal((await request('/api/content',{method:'PUT',auth:true,body:original})).res.status,401);
    });
    await t.test('repeated failed logins are rate limited',async()=>{
      let status;for(let i=0;i<9;i++)status=(await request('/api/auth/login',{method:'POST',body:{username:'admin',password:'wrong'}})).res.status;assert.equal(status,429);
    });
  } finally {await close();await rm(dataDir,{recursive:true,force:true});}
});

test('production requires HTTPS and adds Secure cookie and security headers',async()=>{
  const dataDir=await mkdtemp(path.join(tmpdir(),'portfolio-prod-'));
  let server;
  try{
    await assert.rejects(createPortfolioServer({dataDir,production:true,origin:'http://example.com'}),/HTTPS/);
    server=await createPortfolioServer({dataDir,production:true,origin:'https://portfolio.example',initialPassword:'another-strong-password-2026'});
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const res=await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`,{method:'POST',headers:{Origin:'https://portfolio.example','Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:'another-strong-password-2026'})});
    assert.equal(res.status,200);assert.match(res.headers.get('set-cookie'),/__Host-portfolio-session/);assert.match(res.headers.get('set-cookie'),/; Secure/);assert.ok(res.headers.get('strict-transport-security'));assert.match(res.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  }finally{if(server)await new Promise(r=>server.close(r));await rm(dataDir,{recursive:true,force:true});}
});
