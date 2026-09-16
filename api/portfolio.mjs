import { createPortfolioServer } from '../server/index.mjs';
let pending;
export default async function handler(req,res){
  try {
    if(!pending)pending=createPortfolioServer({production:true}).catch(error=>{pending=undefined;throw error;});
    const server=await pending;
    await new Promise(resolve=>{
      res.once('finish',resolve);res.once('close',resolve);
      server.emit('request',req,res);
    });
  } catch {
    res.setHeader('Cache-Control','no-store');
    res.statusCode=503;res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({error:'The content service needs configuration. Please contact the site owner.'}));
  }
}
