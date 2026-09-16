import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
export const hashPassword = async password => {
  const salt = randomBytes(32).toString('hex');
  const key = await derive(password, salt, 64, {N:32768,r:8,p:1,maxmem:64*1024*1024});
  return {salt, hash:key.toString('hex')};
};
export const verifyPassword = async (password, credential) => {
  const key = await derive(password, credential.salt, 64, {N:32768,r:8,p:1,maxmem:64*1024*1024});
  return timingSafeEqual(key, Buffer.from(credential.hash, 'hex'));
};
export const token = () => randomBytes(32).toString('hex');
export const digest = value => createHash('sha256').update(value).digest('hex');
