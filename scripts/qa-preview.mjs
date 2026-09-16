import {createPortfolioServer} from '../server/index.mjs';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const dataDir=await mkdtemp(path.join(tmpdir(),'portfolio-redesign-qa-'));
const server=await createPortfolioServer({dataDir,port:3002,initialPassword:'portfolio-qa-only-2026-pass'});
server.listen(3002,'127.0.0.1',()=>console.log('Isolated QA preview: http://127.0.0.1:3002'));
