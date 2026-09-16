import seed from '../../server/seed.json';
export type Content = typeof seed;
export type Project = Content['projects'][number];
export type SectionKey = keyof Content['sections'];
export type ContentResponse = {content:Content; revision:number};
export const initialContent:Content = seed;
export async function api<T>(url:string, options:RequestInit = {}):Promise<T> {
  const response=await fetch(url,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...options.headers}});
  const data=await response.json().catch(()=>({error:'The content server is unavailable. Start it with npm run dev.'}));
  if(!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as T;
}
