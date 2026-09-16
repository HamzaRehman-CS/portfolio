import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode, type PointerEvent } from 'react';
import { ArrowDown, ArrowUpRight, ArrowRight, ArrowLeft, Menu, X, Download, Plus, Check, Copy, ChevronLeft, ChevronRight, Grid2X2, List, Pause, Play } from 'lucide-react';
import { api, type Content, type Project } from '../lib/content';
import { SkillIcon } from '../components/SkillIcon';
import { Modal } from '../components/Modal';
const KineticSculpture = lazy(() => import('../components/KineticSculpture'));
type Page = 'home' | 'works' | 'about' | 'expertise' | 'contact';
const pageFor = (hash: string): Page => ({ works: 'works', work: 'works', about: 'about', experience: 'about', certificates: 'about', testimonials: 'about', skills: 'expertise', services: 'expertise', expertise: 'expertise', contact: 'contact' }[hash.replace('#', '')] as Page) || 'home';
const number = (n: number) => String(n).padStart(2, '0');

function Magnetic({ children, className = '', href }: { children: ReactNode; className?: string; href: string }) {
  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches || e.currentTarget.closest('[data-motion="false"]')) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.translate = `${(e.clientX - r.left - r.width / 2) * .12}px ${(e.clientY - r.top - r.height / 2) * .18}px`;
  };
  return <a href={href} className={`magnetic ${className}`} onPointerMove={move} onPointerLeave={e => { e.currentTarget.style.translate = '0px 0px'; }}>{children}</a>;
}
function Tilt({ children, className = '', onClick, label }: { children: ReactNode; className?: string; onClick: () => void; label: string }) {
  return <button aria-label={label} className={className} onClick={onClick} onPointerMove={e => {
    if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches || e.currentTarget.closest('[data-motion="false"]')) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - .5) * -5}deg`);
    e.currentTarget.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 5}deg`);
  }} onPointerLeave={e => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); }}>{children}</button>;
}
function ContactForm() {
  const [status, setStatus] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget; const data = Object.fromEntries(new FormData(form)); setBusy(true); setStatus('');
    try { await api('/api/contact', { method: 'POST', body: JSON.stringify(data) }); form.reset(); setSent(true); setStatus('Message received. Thank you for reaching out.'); }
    catch (e) { setStatus((e as Error).message); } finally { setBusy(false); }
  };
  return <form className={`contact-form ${sent ? 'sent' : ''}`} onSubmit={submit}>
    <label><span><small>01</small> Your name</span><input name="name" required minLength={2} maxLength={100} placeholder="What's your name?" autoComplete="name"/></label>
    <label><span><small>02</small> Your email</span><input name="email" type="email" required maxLength={254} placeholder="you@company.com" autoComplete="email"/></label>
    <label><span><small>03</small> The idea</span><textarea name="message" required minLength={10} maxLength={5000} rows={3} placeholder="What are we making?"/></label>
    <label className="honeypot" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off"/></label>
    <button className="send-button" disabled={busy}>{busy ? 'Sending…' : sent ? 'Send another message' : 'Send message'}{sent ? <Check/> : <ArrowUpRight/>}</button><p className="form-status" role="status">{status}</p>
  </form>;
}
function ProjectDetails({ project, onClose, onNext }: { project: Project; onClose: () => void; onNext: () => void }) {
  const images = project.gallery.length ? project.gallery : [project.image]; const [index, setIndex] = useState(0);
  return <Modal title={project.title} onClose={onClose} wide><div className="case-heading"><p className="eyebrow">{project.category} / {project.year}</p><h2>{project.title}</h2></div><div className="project-preview"><img src={images[index]} alt={`${project.title} — image ${index + 1}`}/>{images.length > 1 && <div className="gallery-controls"><button className="icon-button" aria-label="Previous image" onClick={() => setIndex((index + images.length - 1) % images.length)}><ChevronLeft/></button><span>{index + 1} / {images.length}</span><button className="icon-button" aria-label="Next image" onClick={() => setIndex((index + 1) % images.length)}><ChevronRight/></button></div>}</div><div className="case-description"><span className="eyebrow">{project.status}</span><p>{project.description}</p></div><div className="case-actions">{project.link && project.link !== '#' && <a href={project.link} target="_blank" rel="noreferrer" className="button primary">Visit project<ArrowUpRight size={18}/></a>}<button className="text-link" onClick={onNext}>Next project<ArrowRight size={18}/></button></div></Modal>;
}
function WorkCard({ work, index, onOpen }: { work: Project; index: number; onOpen: () => void }) {
  return <Tilt className="work-card reveal" label={`View ${work.title}`} onClick={onOpen}><div className={`work-image work-tone-${index % 4}`}><img src={work.image} alt={work.title} loading="lazy" decoding="async"/><span className="work-index">{number(index + 1)}</span><span className="work-open"><ArrowUpRight size={28}/></span><span className="work-view">View project ↗</span></div><div className="work-caption"><div><p>{work.category}</p><h3>{work.title}</h3></div><span>{work.year}</span></div></Tilt>;
}
function NextPage({ href, title, label = 'Up next' }: { href: string; title: string; label?: string }) {
  return <a className="next-page" href={href}><span className="eyebrow">{label}</span><span className="next-title">{title}<ArrowUpRight/></span></a>;
}
export default function Portfolio({ content, onAdmin }: { content: Content; onAdmin: () => void }) {
  const p = content.profile;
  const [page, setPage] = useState<Page>(() => pageFor(location.hash));
  const [menu, setMenu] = useState(false), [filter, setFilter] = useState('All'), [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [project, setProject] = useState<Project | null>(null), [certificate, setCertificate] = useState<Content['certificates'][number] | null>(null);
  const [service, setService] = useState(0), [quote, setQuote] = useState(0), [copied, setCopied] = useState(false), [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null), main = useRef<HTMLElement>(null), copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motion = (content.appearance?.motion ?? true) && !paused;
  const accent = content.appearance?.accent || '#ff5b23';
  const availablePages: Page[] = ['home', ...(content.sections.works.visible ? ['works' as const] : []), ...(['about','experience','certificates','testimonials'].some(k => content.sections[k as keyof Content['sections']].visible) ? ['about' as const] : []), ...((content.sections.services.visible || content.sections.skills.visible) ? ['expertise' as const] : []), ...(content.sections.contact.visible ? ['contact' as const] : [])];
  const visiblePage = availablePages.includes(page) ? page : 'home';
  const nextPage = availablePages[(availablePages.indexOf(visiblePage) + 1) % availablePages.length];
  const pageLabels: Record<Page,string> = { home: 'Back to the start.', works: 'The work.', about: 'Meet the maker.', expertise: 'What I bring.', contact: p.contactCta };
  const categories = ['All', ...new Set(content.projects.map(p => p.category))];
  const selectedFilter = categories.includes(filter) ? filter : 'All';
  const matching = content.projects.filter(p => selectedFilter === 'All' || p.category === selectedFilter);
  const featured = [...content.projects.filter(p => p.featured), ...content.projects.filter(p => !p.featured)].slice(0, 3);
  const currentQuote = content.testimonials[quote % Math.max(1,content.testimonials.length)];
  const selectedService = content.services[service] || content.services[0];
  useEffect(() => {
    const route = () => { setPage(pageFor(location.hash)); setMenu(false); setProject(null); setCertificate(null); window.scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(() => main.current?.focus({ preventScroll: true })); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('hashchange', route); window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('hashchange', route); window.removeEventListener('keydown', escape); if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }), { threshold: .06 });
    root.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [visiblePage, content, filter, layout]);
  useEffect(() => {
    let frame = 0;
    const draw = () => { frame = 0; root.current?.style.setProperty('--scroll', String(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))); };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(draw); };
    draw(); window.addEventListener('scroll', scroll, { passive: true });
    return () => { window.removeEventListener('scroll', scroll); cancelAnimationFrame(frame); };
  }, [visiblePage]);
  useEffect(() => { document.title = visiblePage === 'home' ? p.metaTitle : `${visiblePage === 'works' ? 'Work' : visiblePage.charAt(0).toUpperCase() + visiblePage.slice(1)} — ${p.name}`; }, [visiblePage, p.metaTitle, p.name]);
  const copy = async () => { try { await navigator.clipboard.writeText(p.email); setCopied(true); if (copyTimer.current) clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(false), 2000); } catch { window.location.href = `mailto:${p.email}`; } };
  const nav = content.navigation.filter(item => !item.href.startsWith('#') || availablePages.includes(pageFor(item.href)));
  return <div className={`portfolio page-${visiblePage}`} data-motion={motion} ref={root} style={{ '--accent': accent } as CSSProperties}>
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); main.current?.focus(); }}>Skip to content</a><div className="scroll-progress"/>
    <header className="header"><a className="brand" href="#home" aria-label={`${p.name} — home`}>{p.initials}<span>✳</span></a><a className="header-name" href="#home">{p.name}<span>{p.role}</span></a><nav aria-label="Main navigation" className={menu ? 'nav open' : 'nav'}>{nav.map((item,i) => <a key={i} href={item.href} aria-current={item.href.startsWith('#') && pageFor(item.href) === visiblePage ? 'page' : undefined} onClick={() => setMenu(false)}><small>{number(i+1)}</small><span>{item.label}</span></a>)}</nav><button className="icon-button menu-button" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button></header>
    <main id="main" ref={main} tabIndex={-1} className="page-content" key={visiblePage}>
      {visiblePage === 'home' && <>
        <section className="home-hero container"><div className="hero-kicker"><span className="eyebrow"><span className={`status-dot ${p.available ? '' : 'unavailable'}`}/>{p.availability}</span><span className="eyebrow">{p.eyebrow}</span></div>
          <div className="hero-stage"><div className="hero-copy"><h1><span className="title-line"><span>{p.headline}</span></span><span className="title-line accent-line"><span>{p.headlineAccent}</span></span></h1><div className="hero-intro"><span className="cross-mark" aria-hidden="true">✳</span><p>{p.bio}</p></div>{content.sections.works.visible && <Magnetic className="round-link" href="#works"><span>{p.heroCta}</span><ArrowUpRight size={24}/></Magnetic>}</div><div className="hero-object"><Suspense fallback={<div className="living-type" aria-hidden="true"/>}><KineticSculpture motion={motion} accent={accent} artwork={content.heroArtwork} initials={p.initials} owner={p.name}/></Suspense></div></div>
          <div className="hero-base"><span>{p.location}<br/><span className="muted">{p.role}</span></span><a href={p.resume} download className="text-link">{p.resumeLabel}<Download size={16}/></a><a href="#home-work" className="scroll-cue" onClick={e => { e.preventDefault(); document.getElementById('home-work')?.scrollIntoView({ behavior: motion && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' }); }}>A little further<ArrowDown size={18}/></a></div>
        </section>
        <div className="marquee" aria-hidden="true"><div>{[0,1,2,3].map(n => <span key={n}>{p.role}<i>✳</i>{p.name}<i>✳</i></span>)}</div></div>
        {content.sections.works.visible && <section className="home-work container section" id="home-work"><div className="section-top reveal"><p className="eyebrow">01 / {content.sections.works.label}</p><a className="text-link" href="#works">All projects ({number(content.projects.length)})<ArrowUpRight size={18}/></a></div><h2 className="editorial-title reveal">{content.sections.works.title}</h2>{content.sections.works.description&&<p className="optional-description">{content.sections.works.description}</p>}<div className="featured-grid">{featured.map((work,i) => <WorkCard key={work.id} work={work} index={i} onOpen={() => setProject(work)}/>)}</div></section>}
        {content.sections.about.visible && <section className="home-about container section reveal"><span className="eyebrow">02 / {content.sections.about.label}</span><h2>{content.sections.about.title}</h2><Magnetic href="#about" className="circle-arrow" ><ArrowUpRight size={38}/><span className="sr-only">About {p.name}</span></Magnetic></section>}
      </>}
      {visiblePage === 'works' && <section className="work-page container"><div className="page-intro"><p className="eyebrow">Selected projects / {number(content.projects.length)}</p><h1>{content.sections.works.label.split(' ').slice(0,-1).join(' ')}<span className="outlined-word">{content.sections.works.label.split(' ').at(-1)}<span className="title-dot">.</span></span></h1><div className="work-toolbar"><div className="filters" aria-label="Filter projects">{categories.map(c => <button key={c} className={selectedFilter === c ? 'selected' : ''} aria-pressed={selectedFilter === c} onClick={() => setFilter(c)}>{c}<sup>{c === 'All' ? number(content.projects.length) : number(content.projects.filter(p => p.category === c).length)}</sup></button>)}</div><div className="view-toggle"><button aria-label="Grid view" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')}><Grid2X2 size={18}/></button><button aria-label="List view" aria-pressed={layout === 'list'} onClick={() => setLayout('list')}><List size={21}/></button></div></div></div><div className={`work-collection ${layout}`} key={`${filter}-${layout}`}>{matching.map((work,i) => <WorkCard key={work.id} work={work} index={i} onOpen={() => setProject(work)}/>)}</div>{!matching.length && <p className="empty-work">No projects here yet.</p>}</section>}
      {visiblePage === 'about' && <>
        {content.sections.about.visible && <section className="about-hero container"><div className="about-title"><p className="eyebrow">{content.sections.about.label} / {p.location}</p><h1>{p.name.split(' ')[0]}<span>{p.name.split(' ').slice(1).join(' ')}<i aria-hidden="true">✳</i></span></h1></div><div className="about-editorial"><div className="portrait-frame"><img src={p.portrait} alt={p.name}/><span className="portrait-sticker" aria-hidden="true">HELLO<br/>WORLD<span>↗</span></span><div className="portrait-footer"><span>{p.name}</span><span>{p.role}</span></div></div><div className="about-story"><span className="cross-mark" aria-hidden="true">✳</span><h2>{content.sections.about.title}</h2><p>{p.about}</p>{content.sections.about.description && <p>{content.sections.about.description}</p>}<a href={p.resume} download className="text-link">{p.resumeLabel}<Download size={17}/></a></div></div></section>}
        {content.sections.experience.visible && <section className="journey-section"><div className="container journey-grid section"><div className="sticky-heading"><span className="eyebrow">01 / {content.sections.experience.label}</span><h2>{content.sections.experience.title}</h2>{content.sections.experience.description&&<p className="optional-description">{content.sections.experience.description}</p>}</div><div className="journey-list">{content.experiences.map((entry,i) => <details className="journey-row reveal" key={entry.id}><summary><span className="journey-number">{number(i+1)}</span><div><p className="eyebrow">{entry.date}</p><h3>{entry.role}</h3><p>{entry.organization}</p></div><Plus size={20}/></summary><div className="journey-body"><p>{entry.description}</p><small>{entry.location}</small>{entry.image && <a href={entry.image} target="_blank" rel="noreferrer" className="text-link">View credential<ArrowUpRight size={16}/></a>}</div></details>)}</div></div></section>}
        {content.sections.certificates.visible && <section className="certificate-section section container"><div className="section-top"><span className="eyebrow">02 / {content.sections.certificates.label}</span><span className="eyebrow">{number(content.certificates.length)} credentials</span></div><h2 className="editorial-title">{content.sections.certificates.title}</h2>{content.sections.certificates.description&&<p className="optional-description">{content.sections.certificates.description}</p>}<div className="certificate-reel">{content.certificates.map((cert,i) => <button className="certificate-tile" key={cert.id} onClick={() => setCertificate(cert)}><div><img src={cert.image} alt={cert.title} loading="lazy"/></div><span className="eyebrow">{number(i+1)} / {cert.date}</span><h3>{cert.title}</h3><p>{cert.issuer}</p><ArrowUpRight size={20}/></button>)}</div></section>}
        {content.sections.testimonials.visible && currentQuote && <section className="quote-section"><div className="container"><span className="eyebrow">{content.sections.testimonials.label}</span>{content.sections.testimonials.description&&<p className="optional-description">{content.sections.testimonials.description}</p>}<div className="quote-stage" key={quote}><span className="giant-quote" aria-hidden="true">“</span><blockquote>{currentQuote.text.includes('Translation:') ? currentQuote.text.split('Translation:')[1].trim() : currentQuote.text}</blockquote><p>{currentQuote.name}<span>{currentQuote.role}</span></p></div><div className="quote-controls"><span>{number(quote % content.testimonials.length + 1)} / {number(content.testimonials.length)}</span><button className="icon-button" aria-label="Previous testimonial" onClick={() => setQuote((quote + content.testimonials.length - 1) % content.testimonials.length)}><ArrowLeft/></button><button className="icon-button" aria-label="Next testimonial" onClick={() => setQuote((quote + 1) % content.testimonials.length)}><ArrowRight/></button></div></div></section>}
      </>}
      {visiblePage === 'expertise' && <>
        <section className="expertise-hero container"><p className="eyebrow">{content.sections.services.label} / Design + development</p><h1>{content.sections.services.visible?content.sections.services.title:content.sections.skills.title}</h1>{content.sections.services.visible&&content.sections.services.description&&<p className="optional-description">{content.sections.services.description}</p>}<div className="expertise-symbol" aria-hidden="true"><span>✳</span><i>+</i><span>⌘</span></div></section>
        {content.sections.services.visible && <section className="service-section container"><div className="service-selector">{content.services.map((s,i) => <button key={s.id} onClick={() => setService(i)} aria-pressed={service === i} aria-controls="service-detail" className={service === i ? 'active' : ''}><span>{number(i+1)}</span><h2>{s.title}</h2><ArrowUpRight/></button>)}</div>{selectedService && <div id="service-detail" className="service-detail" aria-live="polite" key={selectedService.id}><div className={`service-art art-${service % 3}`} aria-hidden="true">{Array.from({length:7},(_,i) => <i style={{'--i':i} as CSSProperties} key={i}/>)}</div><div><p className="eyebrow">{selectedService.category}</p><h3>{selectedService.title}</h3><p>{selectedService.description}</p>{content.sections.contact.visible && <a href="#contact" className="text-link">Start a project<ArrowUpRight size={18}/></a>}</div></div>}</section>}
        {content.sections.skills.visible && <section className="toolkit-section section"><div className="container"><div className="section-top"><p className="eyebrow">The toolkit / {number(content.skills.length)}</p></div><h2 className="editorial-title">{content.sections.skills.title}</h2>{content.sections.skills.description&&<p className="optional-description">{content.sections.skills.description}</p>}<div className="toolkit-grid">{content.skills.map(s => <details key={s.id} className="tool-item reveal"><summary><span className="tool-icon" style={{color:s.color}}><SkillIcon name={s.iconName}/></span><h3>{s.name}</h3><Plus size={18}/></summary><div><p>{s.description}</p><span className="skill-rating" aria-label={`Self-assessed proficiency ${s.rating} out of 5`}>{Array.from({length:5},(_,i) => <i key={i} className={i<s.rating?'filled':''}/>)}</span></div></details>)}</div></div></section>}
      </>}
      {visiblePage === 'contact' && <section className="contact-page container"><div className="contact-heading"><p className="eyebrow"><span className={`status-dot ${p.available ? '' : 'unavailable'}`}/>{p.availability}</p><h1>{p.contactTitle}<span className="contact-asterisk" aria-hidden="true">✳</span></h1></div><div className="contact-grid"><div className="contact-info"><p>{p.contactDescription}</p><a href={`mailto:${p.email}`} className="contact-email">{p.email}<ArrowUpRight size={22}/></a><button className="text-link" onClick={() => void copy()}>{copied?<Check size={16}/>:<Copy size={16}/>}<span role="status">{copied?'Copied':'Copy email'}</span></button><div className="contact-socials">{content.socials.map((s,i) => <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.label}<ArrowUpRight size={17}/></a>)}{p.whatsapp && <a href={p.whatsapp} target="_blank" rel="noreferrer">WhatsApp<ArrowUpRight size={17}/></a>}</div><span className="contact-location">{p.location}<br/>{p.phone}</span></div><ContactForm/></div></section>}
      {availablePages.length > 1 && <NextPage href={`#${nextPage}`} title={pageLabels[nextPage]} label={visiblePage==='contact'?'One more look?':'Keep exploring'}/>}
    </main>
    <footer className="footer container"><a className="brand" href="#home">{p.initials}<span>✳</span></a><span>© {new Date().getFullYear()} {p.name}{p.footer&&<small className="footer-note">{p.footer}</small>}</span><div className="footer-socials">{content.socials.map((s,i) => <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.label}<ArrowUpRight size={13}/></a>)}</div><div className="footer-tools"><button aria-label={paused?'Play motion':'Pause motion'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={13}/>:<Pause size={13}/>}Motion {motion?'on':'off'}</button><button onClick={onAdmin}>Admin<ArrowUpRight size={13}/></button></div></footer>
    {project && <ProjectDetails key={project.id} project={project} onClose={() => setProject(null)} onNext={() => setProject(content.projects[(content.projects.findIndex(p=>p.id===project.id)+1)%content.projects.length])}/>}
    {certificate && <Modal title={certificate.title} onClose={()=>setCertificate(null)} wide><img className="certificate-full" src={certificate.image} alt={certificate.title}/><p className="eyebrow">{certificate.issuer} / {certificate.date}</p><h2>{certificate.title}</h2><p className="modal-description">{certificate.description}</p><a className="text-link" href={certificate.image} target="_blank" rel="noreferrer">Open original<ArrowUpRight size={17}/></a></Modal>}
  </div>;
}
