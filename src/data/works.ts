export interface Work {
  id: number;
  title: string;
  category: string;
  year: string;
  image: string;
  color: string;
  link: string;
  description: string;
  status: 'Live' | 'Under Work';
}

export const works: Work[] = [
  {
    id: 3,
    title: 'Daan Sports',
    category: 'B2B Catalog Website',
    year: '2026',
    image: '/daan_sports.png',
    color: 'from-emerald-500/20 to-teal-600/20',
    link: 'https://daan-sports.vercel.app/',
    description: 'A clean B2B catalog platform for a sports apparel manufacturer, showcasing customized teamwear and simple inquiry forms.',
    status: 'Under Work',
  },
  {
    id: 2,
    title: 'The Pillar Marketing',
    category: 'Frontend Client Website',
    year: '2026',
    image: '/pillar_marketing.png',
    color: 'from-violet-500/20 to-indigo-600/20',
    link: 'https://the-pillar-marketing.vercel.app/',
    description: 'A modern corporate landing page and services showcase for a marketing agency showcasing branding solutions and marketing pillars.',
    status: 'Under Work',
  },
  {
    id: 1,
    title: 'Royale Muscle',
    category: 'Full Stack Web App',
    year: '2026',
    image: '/royale_muscle.png',
    color: 'from-orange-500/20 to-red-600/20',
    link: 'https://royale-muscle.netlify.app/',
    description: 'A comprehensive gym membership management web application featuring member records, account controls, payment tracking, and admin dashboard utility.',
    status: 'Live',
  },
  {
    id: 4,
    title: 'Brand & Card Designs',
    category: 'Graphic Design',
    year: '2026',
    image: '/design_basic.png',
    color: 'from-pink-500/20 to-rose-600/20',
    link: '#',
    description: 'Custom membership passes, VIP training keys, and nutritional planners designed for Royale Muscle Factory on Canva. Click to preview each design.',
    status: 'Live',
  },
  {
    id: 5,
    title: 'AI Passport & ID Photo Automator',
    category: 'AI Web Tool',
    year: '2026',
    image: '/ai_photo_studio.png',
    color: 'from-blue-500/20 to-cyan-600/20',
    link: '#',
    description: 'An automated web utility that leverages AI to fit casual portraits into formal suits matching facial expressions, swaps backgrounds to solid colors, refines details, and exports print-ready PDFs.',
    status: 'Live',
  },
  {
    id: 6,
    title: 'AI Virtual Brand Try-On',
    category: 'AI SaaS Product',
    year: '2026',
    image: '/ai_virtual_tryon.png',
    color: 'from-fuchsia-500/20 to-purple-600/20',
    link: '#',
    description: 'A visualization system for e-commerce and retail brands, allowing online customers to visualize how garments, accessories, or products look on their uploaded photos or models using AI try-on models.',
    status: 'Live',
  },
];


