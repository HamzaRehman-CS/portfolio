export interface Skill {
  id: string;
  name: string;
  rating: number;
  description: string;
  iconName: string; // Lucide icon component identifier (e.g. Sparkles, Code2, Database)
  color: string; // Accent color hex code
}

export const skills: Skill[] = [
  {
    id: 'ai-web',
    name: 'AI-Driven Development',
    rating: 5,
    description: 'Leveraging cutting-edge AI engines to accelerate web engineering and build intelligent software applications.',
    iconName: 'Sparkles',
    color: '#00D4FF',
  },
  {
    id: 'frontend',
    name: 'Frontend Dev (React & JS)',
    rating: 4,
    description: 'Engineering responsive, state-driven user interfaces using React, JavaScript, and modern design principles.',
    iconName: 'Code2',
    color: '#61DAFB',
  },
  {
    id: 'backend',
    name: 'Backend Dev (Node.js & WP)',
    rating: 4,
    description: 'Building secure backend APIs, cloud configurations, and flexible integrations with Node.js and WordPress.',
    iconName: 'Server',
    color: '#339933',
  },
  {
    id: 'database',
    name: 'Database (MySQL & Firebase)',
    rating: 4,
    description: 'Designing robust data schemas, running optimizations, and managing Firebase and MySQL datasets.',
    iconName: 'Database',
    color: '#FFCA28',
  },
  {
    id: 'ai-design',
    name: 'AI-Powered UI/UX Design',
    rating: 4,
    description: 'Designing intuitive wireframes, responsive prototypes, and customer layouts enhanced with AI design models.',
    iconName: 'Palette',
    color: '#F24E1E',
  },
  {
    id: 'responsive',
    name: 'Responsive Web Layouts',
    rating: 5,
    description: 'Crafting pixel-perfect responsive layouts that adapt and scale fluidly across all screen dimensions.',
    iconName: 'Smartphone',
    color: '#1572B6',
  },
  {
    id: 'branding',
    name: 'Visual Branding',
    rating: 3,
    description: 'Creating cohesive visual assets, high-conversion posters, and custom visual identity vectors on Canva.',
    iconName: 'Image',
    color: '#FF007F',
  },
  {
    id: 'systems',
    name: 'Custom Design Systems',
    rating: 4,
    description: 'Defining consistent typography, UI patterns, and design tokens tailored specifically to the customer\'s needs.',
    iconName: 'Boxes',
    color: '#A020F0',
  },
  {
    id: 'scraping',
    name: 'Client Hunting & Scraping',
    rating: 3,
    description: 'Automating high-fidelity data extraction, lead list generation, and targeted client acquisition systems.',
    iconName: 'Target',
    color: '#00FA9A',
  },
  {
    id: 'leadership',
    name: 'Team Leadership',
    rating: 4,
    description: 'Guiding student developer organizations, directing technical bootcamps, and managing complex project timelines.',
    iconName: 'Shield',
    color: '#FF4500',
  },
  {
    id: 'teamwork',
    name: 'Collaborative Teamwork',
    rating: 5,
    description: 'Working smoothly within multi-disciplinary groups, aligning through agile workflows and active communication.',
    iconName: 'Handshake',
    color: '#3178C6',
  },
  {
    id: 'resilience',
    name: 'Never Give Up Resilience',
    rating: 5,
    description: 'Approaching complex bugs and challenging requirements with extreme tenacity, persistence, and continuous learning.',
    iconName: 'Flame',
    color: '#FF8C00',
  },
];
