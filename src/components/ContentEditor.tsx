import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Plus, Minus, Trash2, Upload, Search } from 'lucide-react';
import { api, initialContent } from '../lib/content';
const human = (key:string) => ({href:'Destination',url:'Link',accent:'Accent color',motion:'Enable animation',metaTitle:'Search title',metaDescription:'Search description',headlineAccent:'Second headline line',headline:'First headline line',heroCta:'Work button',contactCta:'Contact button',available:'Accepting projects',iconName:'Icon'}[key] || key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,s=>s.toUpperCase()));
const templates:Record<string,unknown> = {...Object.fromEntries(Object.entries(initialContent).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,(v as unknown[])[0]])),gallery:''};
function emptyItem(name:string):unknown {
  const t = structuredClone(templates[name] ?? '');
  if(typeof t !== 'object' || t === null) return '';
  return Object.fromEntries(Object.entries(t).map(([k,v])=>[k,k==='id'?crypto.randomUUID():k==='rating'?3:k==='color'?'#ff5b23':k==='status'?'Under Work':k==='type'?'work':k==='iconName'?'Code2':k==='year'?String(new Date().getFullYear()):Array.isArray(v)?[]:typeof v==='boolean'?false:typeof v==='number'?0:'']));
}
const profileGroups = [
  {title:'Identity',keys:['name','initials','role','portrait','location']},
  {title:'Résumé',keys:['resume','resumeLabel']},
  {title:'Home',keys:['headline','headlineAccent','bio','eyebrow','heroCta']},
  {title:'About',keys:['about']},
  {title:'Contact & availability',keys:['email','phone','whatsapp','available','availability','contactTitle','contactDescription','contactCta']},
  {title:'Search & footer',keys:['metaTitle','metaDescription','footer']},
];
export default function ContentEditor({value,onChange,name,csrf}:{value:unknown;onChange:(value:unknown)=>void;name:string;csrf:string}) {
  const [uploading,setUploading] = useState(false), [error,setError] = useState(''), [open,setOpen] = useState<string|null>(null), [query,setQuery] = useState('');
  const latestChange = useRef(onChange), mounted = useRef(true);
  useEffect(()=>{latestChange.current=onChange;},[onChange]);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  if(Array.isArray(value)) {
    const matches = value.map((item,index)=>({item,index})).filter(({item,index})=>open===String((item as {id?:string})?.id??index)||JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
    return <div className="editor-collection"><div className="collection-toolbar"><span>{value.length} {name==='gallery'?'images':'items'}</span>{value.length>4 && <label className="collection-search"><Search size={16}/><input aria-label={`Search ${name}`} placeholder="Find an item…" value={query} onChange={e=>{setOpen(null);setQuery(e.target.value);}}/></label>}<button type="button" className="button primary" onClick={()=>{const item=emptyItem(name);onChange([...value,item]);setOpen(String((item as {id?:string})?.id??value.length));setQuery('');}}><Plus size={16}/>Add {name==='gallery'?'image':'new'}</button></div>{matches.map(({item,index:i})=>{
      const id=String((item as {id?:string})?.id??i), expanded=open===id;
      const title=typeof item==='object'&&item!==null?String(item.title||item.name||item.role||item.label||`Untitled ${i+1}`):`Image ${i+1}`;
      const thumbnail=typeof item==='object'&&item!==null?item.image:typeof item==='string'?item:null;
      return <article className={`editor-item ${expanded?'expanded':''}`} key={id}><div className="editor-item-bar"><button type="button" className="item-summary" aria-expanded={expanded} onClick={()=>setOpen(expanded?null:id)}>{thumbnail?<img src={String(thumbnail)} alt="" loading="lazy"/>:<span className="item-number">{String(i+1).padStart(2,'0')}</span>}<strong>{title}</strong>{expanded?<Minus size={16}/>:<Plus size={16}/>}</button><div className="item-actions"><button className="icon-button" type="button" aria-label={`Move item ${i+1} up`} disabled={i===0} onClick={()=>{const a=[...value];[a[i-1],a[i]]=[a[i],a[i-1]];onChange(a);}}><ArrowUp size={15}/></button><button className="icon-button" type="button" aria-label={`Move item ${i+1} down`} disabled={i===value.length-1} onClick={()=>{const a=[...value];[a[i],a[i+1]]=[a[i+1],a[i]];onChange(a);}}><ArrowDown size={15}/></button><button className="icon-button danger" type="button" aria-label={`Delete item ${i+1}`} onClick={()=>{if(confirm('Remove this item from the draft?')) onChange(value.filter((_,j)=>i!==j));}}><Trash2 size={15}/></button></div></div>{expanded && <ContentEditor name={name==='gallery'?'image':name} value={item} csrf={csrf} onChange={next=>onChange(value.map((v,j)=>i===j?next:v))}/>}</article>;
    })}{!matches.length&&<div className="empty-state"><p>{query?'No matching items.':'Nothing here yet. Add your first item.'}</p></div>}</div>;
  }
  if(value!==null && typeof value==='object') {
    const record=value as Record<string,unknown>;
    if(name==='profile') return <div className="editor-groups">{profileGroups.map((group,i)=><details className="editor-group" key={group.title} open={i===0?true:undefined}><summary><span>{group.title}</span><Plus size={18}/></summary><ContentEditor value={Object.fromEntries(group.keys.map(k=>[k,record[k]]))} name="profile-group" csrf={csrf} onChange={next=>onChange({...record,...next as object})}/></details>)}</div>;
    if(name==='sections') return <div className="editor-groups">{Object.entries(record).map(([key,section])=><details className="editor-group" key={key}><summary><span>{human(key)}</span><small>{(section as {visible:boolean}).visible?'Visible':'Hidden'}</small><Plus size={18}/></summary><ContentEditor value={section} name={key} csrf={csrf} onChange={next=>onChange({...record,[key]:next})}/></details>)}</div>;
    return <div className="fields-grid">{Object.entries(record).filter(([k])=>k!=='id' && !(name==='contact' && k!=='visible') && !(name==='testimonials' && k==='title')).map(([key,v])=><div key={key} className={typeof v==='object'||['description','text','bio','about','contactDescription','metaDescription'].includes(key)?'field wide-field':'field'}>{typeof v==='object'&&<h3 className="field-group-title">{human(key)}</h3>}<ContentEditor value={v} name={key} csrf={csrf} onChange={next=>onChange({...record,[key]:next})}/></div>)}</div>;
  }
  if(typeof value==='boolean') return <label className="toggle-field"><input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)}/><span>{human(name)}</span></label>;
  if(typeof value==='number') return <label>{human(name)}<input type="number" value={value} min={name==='rating'?1:0} max={name==='rating'?5:undefined} onChange={e=>onChange(Number(e.target.value))}/></label>;
  const choices:Record<string,string[]>={status:['Live','Under Work'],type:['work','education','certificate'],iconName:['Code2','Sparkles','Server','Database','Palette','Smartphone','Image','Boxes','Target','Shield','Handshake','Flame','Box','Layout','Globe','Cpu','Binary']};
  if(choices[name]) return <label>{human(name)}<select value={String(value)} onChange={e=>onChange(e.target.value)}>{choices[name].map(c=><option key={c}>{c}</option>)}</select></label>;
  const media=['image','portrait','resume'].includes(name);
  const upload=async(file:File)=>{setError('');if(file.size>3*1024*1024){setError('Choose a file smaller than 3 MB.');return;}setUploading(true);try{const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file);});const result=await api<{url:string}>('/api/uploads',{method:'POST',headers:{'X-CSRF-Token':csrf},body:JSON.stringify({data,kind:name})});if(mounted.current)latestChange.current(result.url);}catch(e){setError((e as Error).message);}finally{setUploading(false);}};
  return <div><label>{human(name)}{['description','text','bio','about','contactDescription','metaDescription'].includes(name)?<textarea rows={name==='about'||name==='text'?5:3} value={String(value??'')} onChange={e=>onChange(e.target.value)}/>:<input type={['color','accent'].includes(name)?'color':name==='email'?'email':'text'} value={String(value??'')} onChange={e=>onChange(e.target.value)}/>}</label>{name==='href'&&<small className="field-hint">#home · #works · #about · #expertise · #contact</small>}{media&&<div className="upload-field">{name==='resume'&&Boolean(value)&&<a className="text-link" href={String(value)} target="_blank" rel="noreferrer">Download current résumé ↗</a>}{Boolean(value)&&name!=='resume'&&<img src={String(value)} alt="Current image" loading="lazy"/>}<label className="upload-button"><Upload size={16}/>{uploading?'Uploading…':name==='resume'?'Replace résumé (PDF)':'Upload image'}<input type="file" disabled={uploading} accept={name==='resume'?'application/pdf':'image/png,image/jpeg,image/webp'} onChange={e=>{if(e.target.files?.[0])void upload(e.target.files[0]);e.target.value='';}}/></label></div>}{error&&<p className="error" role="alert">{error}</p>}</div>;
}
