import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPortfolioServer } from './index.mjs';

// Two independent HTTP instances sharing a durable store contract.
// No actual credentials or production content are used.
test('shared storage preserves sessions, résumé and publications across instances',async()=>{
  const values=new Map(),sessionValues=new Map(),counts=new Map();
  const copy=value=>value===undefined?undefined:structuredClone(value);
  const store={
    read:async key=>{if(!values.has(key))throw Object.assign(new Error(),{code:'ENOENT'});return copy(values.get(key));},
    exists:async key=>values.has(key),write:async(key,value)=>{values.set(key,copy(value));},
    init:async(key,value)=>{if(!values.has(key))values.set(key,copy(value));},
    compare:async(key,old,next,backup)=>{if(JSON.stringify(values.get(key))!==JSON.stringify(old))return false;if(backup)values.set('content.backup.json',copy(old));values.set(key,copy(next));return true;},
    append:async message=>{const list=values.get('messages.json');if(list.length>=5000)return false;list.unshift(copy(message));return true;},
    limit:async key=>{const count=(counts.get(key)||0)+1;counts.set(key,count);return count;},
    sessions:{get:async key=>copy(sessionValues.get(key)),set:async(key,value)=>{sessionValues.set(key,copy(value));},delete:async key=>sessionValues.delete(key),clear:()=>{}},
  };
  const servers=await Promise.all([0,1].map(()=>createPortfolioServer({store,port:0,origin:'https://portfolio.example',production:true,initialPassword:'test-password-only-987654321'})));
  for(const server of servers)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const addresses=servers.map(server=>`http://127.0.0.1:${server.address().port}`);
  let cookie='',csrf='';
  const request=async(instance,route,method='GET',data,authenticated=true)=>{
    const res=await fetch(addresses[instance]+route,{method,headers:{Origin:'https://portfolio.example','Content-Type':'application/json',...(authenticated?{Cookie:cookie,'X-CSRF-Token':csrf}:{})},body:data===undefined?undefined:JSON.stringify(data)});
    return {res,data:await res.json()};
  };
  try{
    const login=await request(0,'/api/auth/login','POST',{username:'admin',password:'test-password-only-987654321'});
    assert.equal(login.res.status,200);cookie=login.res.headers.get('set-cookie').split(';')[0];csrf=login.data.csrf;
    assert.equal((await request(1,'/api/auth/session')).res.status,200);
    assert.equal((await request(1,'/api/messages','GET',undefined,false)).res.status,401);
    const pdf=Buffer.from('%PDF-1.4\nQA resume replacement\n%%EOF');
    const upload=await request(1,'/api/uploads','POST',{kind:'resume',data:pdf.toString('base64')});assert.equal(upload.res.status,201);
    const downloaded=await fetch(addresses[0]+upload.data.url);assert.equal(downloaded.headers.get('content-type'),'application/pdf');assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()),pdf);
    const original=(await request(0,'/api/content')).data;
    const next=structuredClone(original);next.content.profile.resume=upload.data.url;
    next.content.heroArtwork={...next.content.heroArtwork,mode:'text',phrases:['First idea','Second idea'],showCaption:true,caption:'Explore ideas'};
    const results=await Promise.all([request(0,'/api/content','PUT',next),request(1,'/api/content','PUT',next)]);
    assert.deepEqual(results.map(r=>r.res.status).sort(),[200,409]);
    assert.equal((await request(1,'/api/content','GET',undefined,false)).data.content.profile.resume,upload.data.url);
    assert.deepEqual((await request(1,'/api/content','GET',undefined,false)).data.content.heroArtwork,next.content.heroArtwork);
    const changed=await request(1,'/api/auth/password','POST',{currentPassword:'test-password-only-987654321',newPassword:'new-test-password-only-654321'});
    assert.equal(changed.res.status,200);
    assert.equal((await request(0,'/api/auth/session')).res.status,401);
    assert.equal((await request(0,'/api/auth/login','POST',{username:'admin',password:'test-password-only-987654321'})).res.status,401);
    assert.equal((await request(0,'/api/auth/login','POST',{username:'admin',password:'new-test-password-only-654321'})).res.status,200);
    assert.ok(!JSON.stringify([...values]).includes('new-test-password-only-654321'));
  }finally{for(const server of servers)await new Promise(resolve=>server.close(resolve));}
});
