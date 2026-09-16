// Shared durable state for Vercel instances. Credentials never enter the browser bundle.
export function createRedisStore({url=process.env.UPSTASH_REDIS_REST_URL,secret=process.env.UPSTASH_REDIS_REST_TOKEN,prefix=process.env.PORTFOLIO_STORAGE_PREFIX||'portfolio'}={}) {
  if(!url?.startsWith('https://')||!secret) throw new Error('Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
  const key=name=>`${prefix}:${name}`;
  const command=async(...args)=>{
    const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error('Persistent storage is unavailable.');
    const data=await response.json();if(data.error)throw new Error('Persistent storage command failed.');return data.result;
  };
  return {
    async read(name){const value=await command('GET',key(name));if(value===null)throw Object.assign(new Error('Not found'),{code:'ENOENT'});return JSON.parse(value);},
    async exists(name){return Boolean(await command('EXISTS',key(name)));},
    async write(name,value){await command('SET',key(name),JSON.stringify(value));},
    async init(name,value){await command('SET',key(name),JSON.stringify(value),'NX');},
    async compare(name,old,next,backup=false){return Boolean(await command('EVAL',"if redis.call('GET',KEYS[1]) ~= ARGV[1] then return 0 end if ARGV[3] == '1' then redis.call('SET',KEYS[2],ARGV[1]) end redis.call('SET',KEYS[1],ARGV[2]) return 1",2,key(name),key('content.backup.json'),JSON.stringify(old),JSON.stringify(next),backup?'1':'0'));},
    async append(message){return Boolean(await command('EVAL',"local v=cjson.decode(redis.call('GET',KEYS[1]) or '[]') if #v >= 5000 then return 0 end table.insert(v,1,cjson.decode(ARGV[1])) redis.call('SET',KEYS[1],cjson.encode(v)) return 1",1,key('messages.json'),JSON.stringify(message)));},
    async limit(name,windowMs){return command('EVAL',"local n=redis.call('INCR',KEYS[1]) if n == 1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end return n",1,key(`limit:${name}`),windowMs);},
    sessions:{
      async get(id){const value=await command('GET',key(`session:${id}`));return value?JSON.parse(value):undefined;},
      async set(id,value){await command('SET',key(`session:${id}`),JSON.stringify(value),'PX',Math.max(1,value.expires-Date.now()));},
      async touch(id,value){return Boolean(await command('SET',key(`session:${id}`),JSON.stringify(value),'PX',Math.max(1,value.expires-Date.now()),'XX'));},
      async delete(id){await command('DEL',key(`session:${id}`));},
      clear(){/* Each session is also bound to the current password hash. */},
    },
  };
}
