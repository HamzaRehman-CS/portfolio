export interface Skill {
  id: string;
  name: string;
  rating: number;
  description: string;
  iconName: string;
  color: string;
}

export const skills: Skill[] = [
  {
    id: 'ai-assisted',
    name: 'AI-Assisted Development',
    rating: 5,
    description: 'Leveraging advanced AI tooling and LLM workflows to accelerate software development and build intelligent apps.',
    iconName: 'Sparkles',
    color: '#00D4FF',
  },
  {
    id: 'react-js',
    name: 'React & JavaScript',
    rating: 5,
    description: 'Building interactive, state-driven web applications and clean component architectures with modern ES6+.',
    iconName: 'Code2',
    color: '#61DAFB',
  },
  {
    id: 'nodejs-apis',
    name: 'Node.js & APIs',
    rating: 4,
    description: 'Designing robust RESTful endpoints, backend microservices, server logic, and API integrations.',
    iconName: 'Server',
    color: '#68A063',
  },
  {
    id: 'supabase-mysql',
    name: 'Supabase & MySQL',
    rating: 4,
    description: 'Relational schema modeling, queries, authentication, and realtime cloud databases.',
    iconName: 'Database',
    color: '#3ECF8E',
  },
  {
    id: 'threejs-3d',
    name: 'Three.js & 3D Web',
    rating: 5,
    description: 'Creating immersive 3D web environments, WebGL shaders, camera interactions, and creative canvas experiences.',
    iconName: 'Box',
    color: '#FF5B23',
  },
  {
    id: 'tailwind-css',
    name: 'Tailwind CSS',
    rating: 5,
    description: 'Rapid, responsive styling with utility-first CSS, custom design tokens, and smooth UI animations.',
    iconName: 'Palette',
    color: '#38BDF8',
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    rating: 5,
    description: 'Crafting intuitive user journeys, wireframes, high-fidelity prototypes, and user-centered interfaces.',
    iconName: 'Layout',
    color: '#F24E1E',
  },
  {
    id: 'responsive-design',
    name: 'Responsive Design',
    rating: 5,
    description: 'Fluid layouts and adaptive interfaces optimized for seamless performance on desktop, tablet, and mobile.',
    iconName: 'Smartphone',
    color: '#1572B6',
  },
  {
    id: 'wordpress-woocommerce',
    name: 'WordPress & WooCommerce',
    rating: 4,
    description: 'Custom theme creation, CMS architecture, e-commerce storefronts, and store customization.',
    iconName: 'Globe',
    color: '#9B51E0',
  },
  {
    id: 'automation',
    name: 'Automation',
    rating: 4,
    description: 'Automating repetitive tasks, web scraping, custom pipelines, and business workflow integrations.',
    iconName: 'Cpu',
    color: '#00FA9A',
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    rating: 4,
    description: 'Practical implementations of computer vision, NLP models, and machine learning pipelines.',
    iconName: 'Binary',
    color: '#FF6B6B',
  },
  {
    id: 'design-systems',
    name: 'Design Systems',
    rating: 4,
    description: 'Establishing reusable component libraries, typography hierarchies, and scalable visual consistency.',
    iconName: 'Boxes',
    color: '#A020F0',
  },
];
