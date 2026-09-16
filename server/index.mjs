import http from 'node:http';
import { createRedisStore } from './redis-store.mjs';
import { readFile, writeFile, mkdir, rename, stat, copyFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentSchema, contactSchema } from './schema.mjs';
import { hashPassword, verifyPassword, token, digest } from './auth.mjs';

export async function createPortfolioServer(options = {}) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const dataDir = options.dataDir || process.env.DATA_DIR || path.join(root, '.portfolio-data');
  const prod = options.production ?? process.env.NODE_ENV === 'production';
  const port = options.port ?? Number(process.env.PORT || 3001);
  const origin = options.origin || process.env.APP_ORIGIN || `http://localhost:${port}`;
  if (prod && !origin.startsWith('https://')) throw new Error('Production requires an HTTPS APP_ORIGIN.');
  const origins = new Set([origin, ...(!prod ? ['http://localhost:5173','http://127.0.0.1:5173',`http://127.0.0.1:${port}`] : [])]);
  const cloud = options.store || (process.env.VERCEL ? createRedisStore() : null);
  if (!cloud) await mkdir(path.join(dataDir, 'uploads'), {recursive:true});
  const readJson = cloud ? file => cloud.read(file) : async file => JSON.parse(await readFile(path.join(dataDir, file), 'utf8'));
  const atomic = cloud ? (file,value) => cloud.write(file,value) : async (file, value) => {
    const dest = path.join(dataDir, file), tmp = `${dest}.${token()}.tmp`;
    await writeFile(tmp, JSON.stringify(value, null, 2), {mode:0o600});
    await rename(tmp, dest);
  };
  const exists = cloud ? file => cloud.exists(file) : async file => { try { await stat(path.join(dataDir,file)); return true; } catch(e) { if(e.code==='ENOENT') return false; throw e; } };
  const initialize = cloud ? (file,value) => cloud.init(file,value) : atomic;
  if (!await exists('content.json')) await initialize('content.json', {revision:1,content:contentSchema.parse(JSON.parse(await readFile(path.join(root,'server/seed.json'),'utf8')))});
  if (!await exists('messages.json')) await initialize('messages.json', []);
  if (!await exists('auth.json')) {
    const password = options.initialPassword || process.env.ADMIN_PASSWORD;
    if (password) {
      if(password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
      await initialize('auth.json', {username:'admin',...await hashPassword(password)});
    }
  }
  let pending = Promise.resolve();
  const exclusive = fn => { const work = pending.then(fn); pending = work.catch(() => {}); return work; };
  const sessions = cloud ? cloud.sessions : new Map(), limits = new Map();
  const cookieName = prod ? '__Host-portfolio-session' : 'portfolio-session';
  const fail = (status,message) => Object.assign(new Error(message),{status});
  const limit = async (key,max,windowMs) => {
    if(cloud){if(await cloud.limit(key,windowMs)>max)throw fail(429,'Too many attempts. Please try again later.');return;}
    const now=Date.now(); let entry=limits.get(key);
    if(!entry || entry.until<now) { entry={count:0,until:now+windowMs}; limits.set(key,entry); }
    if(++entry.count>max) throw fail(429,'Too many attempts. Please try again later.');
  };
  const cleanup = setInterval(() => {
    const now=Date.now();
    for(const [key,v] of (cloud ? [] : sessions)) if(v.expires<now || v.idle<now) sessions.delete(key);
    for(const [key,v] of limits) if(v.until<now) limits.delete(key);
  },60000); cleanup.unref();
  const server = http.createServer(async (req,res) => {
    const send = (status,value) => { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(value)); };
    res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    if(prod) res.setHeader('Strict-Transport-Security','max-age=31536000');
    try {
      const url=new URL(req.url,'http://localhost'), route=url.pathname, method=req.method;
      const mutating=!['GET','HEAD'].includes(method);
      const ip=(process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] : req.socket.remoteAddress) || 'unknown';
      if(route.startsWith('/api/')) res.setHeader('Cache-Control','no-store');
      if(mutating && !origins.has(req.headers.origin)) throw fail(403,'Request origin is not allowed.');
      const body = async (max=1024*1024) => {
        if(!req.headers['content-type']?.startsWith('application/json')) throw fail(415,'Send JSON content.');
        if(req.body !== undefined) {
          const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);
          if(Buffer.byteLength(raw)>max)throw fail(413,'The request is too large.');
          try{return JSON.parse(raw);}catch{throw fail(400,'Invalid JSON.');}
        }
        let length=0; const chunks=[];
        for await(const chunk of req) { length+=chunk.length; if(length>max) throw fail(413,'The request is too large.'); chunks.push(chunk); }
        try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw fail(400,'Invalid JSON.'); }
      };
      const cookie=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith(`${cookieName}=`))?.slice(cookieName.length+1) || '';
      const sessionId=digest(cookie), session=cookie ? await sessions.get(sessionId) : undefined;
      const authenticated=async () => {
        if(!session || session.expires<Date.now() || session.idle<Date.now()) { await sessions.delete(sessionId); throw fail(401,'Please sign in to continue.'); }
        if(mutating && req.headers['x-csrf-token']!==session.csrf) throw fail(403,'Session verification failed. Sign in again.');
        const auth = await readJson('auth.json');
        if(session.authVersion!==auth.hash) { await sessions.delete(sessionId); throw fail(401,'Please sign in again.'); }
        session.idle=Date.now()+30*60*1000;
        if(sessions.touch){if(!await sessions.touch(sessionId,session))throw fail(401,'Please sign in again.');}
        else await sessions.set(sessionId,session);
        return session;
      };
      const setCookie = (value,age) => res.setHeader('Set-Cookie',`${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${prod?'; Secure':''}`);
      if(route==='/api/content' && method==='GET') {
        const data = await readJson('content.json');
        return send(200,{...data,content:contentSchema.parse(data.content)});
      }
      if(route==='/api/auth/login' && method==='POST') {
        await limit(`login:${ip}`,8,15*60*1000); await limit('login:global',80,15*60*1000);
        const data=await body(4096);
        if(typeof data.username!=='string' || typeof data.password!=='string' || data.password.length>256) throw fail(400,'Enter your user ID and password.');
        if(!await exists('auth.json')) throw fail(503,'Admin setup is required on the server.');
        const auth=await readJson('auth.json');
        const valid=await verifyPassword(data.password,auth);
        if(!valid || data.username!==auth.username) throw fail(401,'Incorrect user ID or password.');
        await sessions.delete(sessionId);
        const raw=token(), csrf=token();
        await sessions.set(digest(raw),{csrf,authVersion:auth.hash,expires:Date.now()+8*60*60*1000,idle:Date.now()+30*60*1000});
        setCookie(raw,8*60*60); return send(200,{username:auth.username,csrf});
      }
      if(route==='/api/auth/session' && method==='GET') return send(200,{username:'admin',csrf:(await authenticated()).csrf});
      if(route==='/api/auth/logout' && method==='POST') { await authenticated(); await sessions.delete(sessionId); setCookie('',0); return send(200,{ok:true}); }
      if(route==='/api/auth/password' && method==='POST') {
        await authenticated(); await limit(`password:${ip}`,5,15*60*1000);
        const data=await body(4096);
        if(typeof data.currentPassword!=='string' || data.currentPassword.length>256 || typeof data.newPassword!=='string' || data.newPassword.length<12 || data.newPassword.length>256) throw fail(400,'New password must be 12–256 characters.');
        await exclusive(async()=>{
          const auth=await readJson('auth.json');
          if(!await verifyPassword(data.currentPassword,auth)) throw fail(401,'Current password is incorrect.');
          const nextAuth={username:'admin',...await hashPassword(data.newPassword)};
          if(cloud){if(!await cloud.compare('auth.json',auth,nextAuth))throw fail(409,'Password changed. Sign in again.');}
          else await atomic('auth.json',nextAuth);
        });
        sessions.clear(); setCookie('',0); return send(200,{ok:true});
      }
      if(route==='/api/content' && method==='PUT') {
        await authenticated(); const data=await body(), parsed=contentSchema.safeParse(data.content);
        if(!parsed.success) throw fail(400,parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).slice(0,4).join('; '));
        const saved=await exclusive(async()=>{
          const old=await readJson('content.json');
          if(data.revision!==old.revision) throw fail(409,'Content changed in another session. Copy your edits, then reload before publishing.');
          const next={revision:old.revision+1,content:parsed.data};
          if(cloud){if(!await cloud.compare('content.json',old,next,true))throw fail(409,'Content changed in another session. Reload before publishing.');}
          else {await copyFile(path.join(dataDir,'content.json'),path.join(dataDir,'content.backup.json'));await atomic('content.json',next);}
          return next;
        }); return send(200,saved);
      }
      if(route==='/api/uploads' && method==='POST') {
        await authenticated(); await limit(`uploads:${ip}`,60,60*60*1000);
        const data=await body(4_400_000);
        if(typeof data.data!=='string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(data.data)) throw fail(400,'Invalid file encoding.');
        const bytes=Buffer.from(data.data,'base64');
        if(bytes.length>3*1024*1024 || bytes.length<12) throw fail(400,'Choose an image or PDF up to 3 MB.');
        let ext='';
        if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext='png';
        else if(bytes[0]===255 && bytes[1]===216 && bytes[2]===255) ext='jpg';
        else if(bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP') ext='webp';
        else if(bytes.toString('ascii',0,5)==='%PDF-') ext='pdf';
        if(data.kind==='resume' && ext!=='pdf') throw fail(400,'Choose a PDF for your résumé.');
        if(data.kind==='logo' && !['png','jpg','webp'].includes(ext)) throw fail(400,'Choose a PNG, JPEG or WebP logo.');
        if(!ext) throw fail(400,'Only PNG, JPEG, WebP, and PDF files are supported.');
        const filename=`${token()}.${ext}`;
        if(cloud)await cloud.write(`uploads/${filename}`,{data:bytes.toString('base64')});
        else await writeFile(path.join(dataDir,'uploads',filename),bytes,{flag:'wx',mode:0o600});
        return send(201,{url:`/uploads/${filename}`});
      }
      if(route==='/api/contact' && method==='POST') {
        await limit(`contact:${ip}`,5,15*60*1000); const data=contactSchema.safeParse(await body(16000));
        if(!data.success) throw fail(400,'Enter your name, a valid email, and a message of 10–5000 characters.');
        if(data.data.company) return send(200,{ok:true});
        const message={id:token(),name:data.data.name,email:data.data.email,message:data.data.message,createdAt:new Date().toISOString()};
        if(cloud){if(!await cloud.append(message))throw fail(503,'Inbox is full. Please contact me by email.');}
        else await exclusive(async()=>{const messages=await readJson('messages.json');if(messages.length>=5000)throw fail(503,'Inbox is full. Please contact me by email.');messages.unshift(message);await atomic('messages.json',messages);});
        return send(201,{ok:true});
      }
      if(route==='/api/messages' && method==='GET') { await authenticated(); return send(200,await readJson('messages.json')); }
      if(route.startsWith('/api/')) throw fail(404,'Endpoint not found.');
      if(!['GET','HEAD'].includes(method)) throw fail(405,'Method not allowed.');
      const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.woff2':'font/woff2'};
      let file;
      if(route.startsWith('/uploads/')) {
        if(!/^\/uploads\/[a-f0-9]{64}\.(png|jpg|webp|pdf)$/.test(route)) throw fail(404,'File not found.');
        if(cloud){
          const upload=await cloud.read(route.slice(1)), bytes=Buffer.from(upload.data,'base64'), ext=path.extname(route);
          res.setHeader('Content-Type',types[ext]);res.setHeader('Content-Length',bytes.length);
          res.setHeader('Cache-Control','public, max-age=31536000, immutable');
          if(ext==='.pdf')res.setHeader('Content-Disposition','attachment; filename=resume.pdf');
          return res.end(method==='HEAD'?undefined:bytes);
        }
        file=path.join(dataDir,'uploads',path.basename(route));
      } else {
        const dist=path.join(root,'dist');
        const decoded=decodeURIComponent(route);
        file=path.resolve(dist,`.${decoded}`);
        if((file!==dist && !file.startsWith(dist+path.sep)) || /(?:^|[\\/])\./.test(decoded)) throw fail(404,'File not found.');
        try { if(!(await stat(file)).isFile()) file=path.join(dist,'index.html'); } catch { if(path.extname(route)) throw fail(404,'File not found.'); file=path.join(dist,'index.html'); }
      }
      const info=await stat(file); const ext=path.extname(file);
      res.setHeader('Content-Type',types[ext] || 'application/octet-stream');
      res.setHeader('Content-Length',info.size);
      res.setHeader('Cache-Control',route.startsWith('/assets/') || route.startsWith('/uploads/') ? 'public, max-age=31536000, immutable' : 'no-cache');
      if(ext==='.pdf') res.setHeader('Content-Disposition','attachment; filename="document.pdf"');
      if(method==='HEAD') return res.end();
      createReadStream(file).on('error',()=>res.destroy()).pipe(res);
    } catch(e) {
      if(!res.headersSent) send(e.status || (e.code==='ENOENT'?404:500),{error:e.status?e.message:'The server could not complete the request.'});
      else res.destroy();
    }
  });
  server.requestTimeout=30000; server.headersTimeout=15000;
  server.on('close',()=>clearInterval(cleanup));
  return server;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const port=Number(process.env.PORT || 3001);
  const server=await createPortfolioServer({port});
  server.listen(port,process.env.HOST || '127.0.0.1',()=>console.log(`Portfolio server: http://localhost:${port}`));
}
