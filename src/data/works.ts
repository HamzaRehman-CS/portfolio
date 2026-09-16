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
    id: 7,
    title: 'Idea – 3D Interactive World',
    category: '3D Frontend Design',
    year: '2026',
    image: '/idea_3d.png',
    color: 'from-cyan-500/20 to-blue-600/20',
    link: 'https://my-idea-1.netlify.app/',
    description: 'An immersive 3D interactive hero section where a glowing light trail guides the user through futuristic building architectures, illuminating structures along the scroll path before ending with a dramatic rocket launch sequence.',
    status: 'Live',
  },
  {
    id: 8,
    title: 'Geythere.mv',
    category: '3D Interactive Showcase',
    year: '2026',
    image: '/geythere_3d.png',
    color: 'from-teal-500/20 to-emerald-600/20',
    link: 'https://demo-geythere.netlify.app/',
    description: 'A custom 3D interactive scroll-driven client showcase designed for a Maldivian home & utility brand, seamlessly guiding visitors through a virtual room as furniture and products interactively pack and present themselves upon scrolling.',
    status: 'Live',
  },
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
    id: 9,
    title: 'AI Beyond Sigma',
    category: '3D Interactive Experience',
    year: '2026',
    image: '/ai_beyond.png',
    color: 'from-purple-500/20 to-blue-600/20',
    link: 'https://ai-beyond-sigma.vercel.app/',
    description: 'An interactive 3D web experience engineered with Three.js and WebGL, featuring procedural metallic star meshes, a rotating card carousel, and fluid scroll-driven animations.',
    status: 'Live',
  },
  {
    id: 10,
    title: 'Voss Medical',
    category: 'Interactive Healthcare Web',
    year: '2026',
    image: '/voss_medical.png',
    color: 'from-sky-500/20 to-indigo-600/20',
    link: 'https://clinic-demo-lovat-kappa.vercel.app/',
    description: 'A modern clinic web experience featuring an interactive 3D particle DNA helix, Lenis smooth scrolling, GSAP parallax reveals, and responsive care cards.',
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


