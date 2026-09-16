import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { initialContent, api, type ContentResponse } from './lib/content';
import Portfolio from './pages/Portfolio';
const Admin=lazy(()=>import('./pages/Admin'));
class AdminLoadBoundary extends Component<{children:ReactNode;onClose:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className="loading-screen"><div className="load-recovery"><h1>The studio couldn’t load.</h1><p>Reload to get the latest version.</p><button className="button primary" onClick={()=>location.reload()}>Reload studio</button><button className="text-link" onClick={this.props.onClose}>Back to portfolio</button></div></div>:this.props.children;}
}
export default function App() {
  const [data,setData]=useState<ContentResponse>({content:initialContent,revision:0}),[admin,setAdmin]=useState(location.pathname==='/admin'),[error,setError]=useState('');
  const reload=useCallback(async()=>{try{const response=await api<ContentResponse>('/api/content');setData(current=>response.revision>current.revision?response:current);setError('');}catch(e){setError((e as Error).message);}},[]);
  useEffect(()=>{let active=true;api<ContentResponse>('/api/content').then(response=>{if(active){setData(current=>response.revision>current.revision?response:current);setError('');}}).catch(e=>{if(active)setError((e as Error).message);});const refresh=()=>{if(!document.hidden)void reload();};window.addEventListener('focus',refresh);window.addEventListener('storage',refresh);document.addEventListener('visibilitychange',refresh);const interval=setInterval(refresh,5000);return()=>{active=false;window.removeEventListener('focus',refresh);window.removeEventListener('storage',refresh);document.removeEventListener('visibilitychange',refresh);clearInterval(interval);};},[reload]);
  useEffect(()=>{if(admin)document.title=`Admin — ${data.content.profile.name}`;document.querySelector('meta[name="description"]')?.setAttribute('content',data.content.profile.metaDescription);},[data.content.profile,admin]);
  useEffect(()=>{const handler=()=>setAdmin(location.pathname==='/admin');window.addEventListener('popstate',handler);return()=>window.removeEventListener('popstate',handler);},[]);
  const navigate=(next:boolean)=>{history.pushState(null,'',next?'/admin':'/');setAdmin(next);window.scrollTo(0,0);if(!next)void reload();};
  return admin?<AdminLoadBoundary onClose={()=>navigate(false)}><Suspense fallback={<div className="loading-screen">Opening your studio…</div>}><Admin initial={data} onClose={()=>navigate(false)} onPublished={published=>{setData(published);try{localStorage.setItem('portfolio-published',String(Date.now()));}catch{/* Live polling remains available. */}}}/></Suspense></AdminLoadBoundary>:<>{error&&<div className="connection-notice" role="status">Live content is temporarily unavailable. Showing the portfolio snapshot.</div>}<Portfolio content={data.content} onAdmin={()=>navigate(true)}/></>;
}
