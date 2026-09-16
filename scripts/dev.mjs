import { createServer } from 'vite';
import { createPortfolioServer } from '../server/index.mjs';
const api=await createPortfolioServer({port:3001});
await new Promise(resolve=>api.listen(3001,'127.0.0.1',resolve));
const vite=await createServer();await vite.listen();vite.printUrls();
const close=async()=>{await vite.close();api.close();process.exit();};
process.on('SIGINT',close);process.on('SIGTERM',close);
