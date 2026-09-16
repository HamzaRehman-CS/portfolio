import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createRedisStore } from '../server/redis-store.mjs';
import { contentSchema } from '../server/schema.mjs';
const store=createRedisStore(), directory=process.env.DATA_DIR||path.resolve('.portfolio-data');
for(const file of ['content.json','auth.json','messages.json']){
  if(await store.exists(file))throw new Error('The target namespace is not empty. Choose a new PORTFOLIO_STORAGE_PREFIX; no records were replaced.');
}
const records=await Promise.all(['content.json','auth.json','messages.json'].map(async file=>[file,JSON.parse(await readFile(path.join(directory,file),'utf8'))]));
const content=records.find(([file])=>file==='content.json')[1];content.content=contentSchema.parse(content.content);
// Upload first, publish the document that references the files last.
for(const filename of await readdir(path.join(directory,'uploads'))){
  if(!/^[a-f0-9]{64}\.(png|jpg|webp|pdf)$/.test(filename))continue;
  const bytes=await readFile(path.join(directory,'uploads',filename));
  if(bytes.length>3*1024*1024)throw new Error('An existing upload exceeds 3 MB. Compress it before migrating.');
  await store.init(`uploads/${filename}`,{data:bytes.toString('base64')});
}
for(const [name,value] of records.reverse())await store.init(name,value);
console.log('Migration complete. Existing credentials, published content, inbox and uploads preserved.');
