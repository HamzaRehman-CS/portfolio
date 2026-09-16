import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';
const read = async (name, key) => {
  const source = await readFile(new URL(`../src/data/${name}.ts`, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return (await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`))[key];
};
const content = {
  profile: {
    name: 'Hamza Rehman', initials: 'hr', role: 'Creative developer & designer',
    eyebrow: 'Independent developer · Haripur, Pakistan',
    headline: 'Thoughtful code.', headlineAccent: 'Unforgettable experiences.',
    bio: 'I’m Hamza, a creative developer bringing together thoughtful design, interactive worlds, and intelligent technology. Building things that feel as good as they work.',
    about: 'A curious mind. A builder at heart.\n\nI’m a Computer Science student at Pak-Austria Fachhochschule – IAST, exploring the space where design meets engineering. From full-stack products and immersive 3D websites to practical AI tools, I turn ambitious ideas into useful, human experiences.',
    portrait: '/hamza_rehman.jpg', resume: '/Hamza_Rehman_CV.pdf',
    availability: 'Available for new projects', available: true, location: 'Haripur, Pakistan',
    email: 'hamzarehmankhan001@gmail.com', phone: '+92 370 1929406', whatsapp: 'https://wa.me/923701929406',
    contactTitle: 'Have an idea? Let’s make it real.', contactDescription: 'A new product, an ambitious website, or something no one has tried yet. I’d love to hear what you have in mind.',
    footer: 'Built with intention. Always evolving.', metaTitle: 'Hamza Rehman — Creative Developer & Designer',
    metaDescription: 'Explore Hamza Rehman’s work in full-stack development, immersive 3D websites, design, and AI automation.',
    heroCta: 'Explore my work', resumeLabel: 'Download résumé', contactCta: 'Let’s talk',
    sculptureLabel: 'A little code. A little curiosity.', sculptureHint: 'Move your cursor. Make a little ripple.',
  },
  sections: {
    works: { label: 'Selected work', title: 'Ideas, brought to life.', description: 'A collection of digital experiences, useful tools, and a few creative experiments.', visible: true },
    about: { label: 'Behind the pixels', title: 'Equal parts logic & imagination.', description: '', visible: true },
    services: { label: 'What I do', title: 'From first sketch to final ship.', description: 'Design sensibility. Engineering precision. A considered approach to every detail.', visible: true },
    skills: { label: 'The toolkit', title: 'Always learning. Always building.', description: 'The technologies, creative tools, and human skills behind the work.', visible: true },
    experience: { label: 'The journey', title: 'Learning by doing.', description: 'Real projects, new perspectives, and a commitment to getting better.', visible: true },
    certificates: { label: 'Milestones', title: 'Curiosity, with credentials.', description: 'A few moments from an ongoing journey of learning and collaboration.', visible: true },
    testimonials: { label: 'Kind words', title: 'Good work starts with trust.', description: 'Notes from the people I’ve had the pleasure of building with.', visible: true },
    contact: { label: 'Your next chapter', title: 'Let’s build something meaningful.', description: '', visible: true },
  },
  navigation: [{ label: 'Work', href: '#works' }, { label: 'About', href: '#about' }, { label: 'Expertise', href: '#skills' }, { label: 'Contact', href: '#contact' }],
  socials: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/hamza-rehman-577116360' }, { label: 'Instagram', url: 'https://www.instagram.com/hamza.__.rehman' }],
  projects: (await read('works', 'works')).map(({color: _color, ...p}) => ({...p, gallery: p.id === 4 ? ['/design_basic.png','/design_personal.png','/design_diet.png'] : [], featured: [7,8,1].includes(p.id)})),
  skills: await read('skills', 'skills'), services: await read('services', 'services'),
  experiences: (await read('experience', 'experiences')).map(p => ({...p, image:p.image || ''})),
  certificates: await read('certificates', 'certificates'), testimonials: await read('testimonials', 'testimonials'),
};
await mkdir(new URL('../server/', import.meta.url), {recursive:true});
await writeFile(new URL('../server/seed.json', import.meta.url), JSON.stringify(content, null, 2));
console.log('Existing portfolio content migrated.');
