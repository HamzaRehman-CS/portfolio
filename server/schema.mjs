import { z } from 'zod';
const text = z.string().max(12000);
const short = z.string().max(300);
const id = z.union([z.string().min(1).max(100), z.number().int().nonnegative()]);
const safeUrl = z.string().max(2048).refine(v => !v || v === '#' || /^#[a-z][a-z0-9-]*$/i.test(v) || (/^\/(?!\/)/.test(v) && !/[\\\s]/.test(v)) || (() => { try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } })(), 'Use an HTTPS URL, a local /path, or a #section.');
const collection = schema => z.array(schema).max(200).refine(rows => new Set(rows.map(r => r.id)).size === rows.length, 'Each item must have a unique ID.');
const section = z.object({label:short,title:short,description:text,visible:z.boolean()}).strict();
const heroArtwork = z.object({
  mode:z.enum(['logo','text']),
  logo:z.string().max(2048).refine(v=>!v||/^\/uploads\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(v),'Upload a PNG, JPEG or WebP logo.'),
  phrases:z.array(z.string().trim().min(1).max(60).refine(v=>v.split('\n').length<=3,'Use at most 3 lines per slide.')).min(1).max(12),
  showEyebrow:z.boolean(),eyebrow:z.string().max(80),
  showCaption:z.boolean(),caption:z.string().max(40),
  interval:z.number().min(1).max(60).default(4),
}).strict().default({mode:'logo',logo:'',phrases:['MAKE\nIT MOVE.','STAY\nCURIOUS.','WHAT\nIF?'],showEyebrow:false,eyebrow:'',showCaption:false,caption:'Play with possibility',interval:4});
export const contentSchema = z.object({
  heroArtwork,
  appearance: z.object({accent:z.string().regex(/^#[0-9a-f]{6}$/i),motion:z.boolean()}).strict().default({accent:'#ff5b23',motion:true}),
  profile: z.object({name:short.min(1),initials:short.min(1),role:short,eyebrow:short,headline:short,headlineAccent:short,bio:text,about:text,portrait:safeUrl,resume:safeUrl,availability:short,available:z.boolean(),location:short,email:z.email().max(254),phone:short,whatsapp:safeUrl,contactTitle:short,contactDescription:text,footer:short,metaTitle:short,metaDescription:short,heroCta:short,resumeLabel:short,contactCta:short,sculptureLabel:short,sculptureHint:short}).strict(),
  sections: z.object({works:section,about:section,services:section,skills:section,experience:section,certificates:section,testimonials:section,contact:section}).strict(),
  navigation:z.array(z.object({label:short,href:safeUrl}).strict()).max(8),
  socials:z.array(z.object({label:short,url:safeUrl}).strict()).max(20),
  projects:collection(z.object({id,title:short,category:short,year:short,image:safeUrl,link:safeUrl,description:text,status:z.enum(['Live','Under Work']),gallery:z.array(safeUrl).max(20),featured:z.boolean()}).strict()),
  services:collection(z.object({id,category:short,title:short,description:text}).strict()),
  skills:collection(z.object({id,name:short,rating:z.number().int().min(1).max(5),description:text,iconName:short,color:z.string().regex(/^#[0-9a-f]{6}$/i)}).strict()),
  experiences:collection(z.object({id,type:z.enum(['work','education','certificate']),role:short,organization:short,date:short,description:text,location:short,image:safeUrl}).strict()),
  certificates:collection(z.object({id,title:short,issuer:short,date:short,image:safeUrl,category:short,description:text}).strict()),
  testimonials:collection(z.object({id,name:short,role:short,rating:z.number().int().min(1).max(5),text}).strict()),
}).strict();
export const contactSchema = z.object({name:z.string().trim().min(2).max(100),email:z.email().max(254),message:z.string().trim().min(10).max(5000),company:z.string().max(100).optional()}).strict();
