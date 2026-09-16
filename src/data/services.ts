export interface Service {
  id: number;
  category: string;
  title: string;
  description: string;
}

export const services: Service[] = [
  {
    id: 1,
    category: 'Frontend',
    title: 'Interactive Frontend Development',
    description: 'Crafting modern, responsive React and JavaScript web applications with fluid animations, micro-interactions, and high performance.',
  },
  {
    id: 2,
    category: 'Full-Stack',
    title: 'Full-Stack & API Integration',
    description: 'Building robust end-to-end applications, connecting scalable backend services, RESTful APIs, and secure database architectures.',
  },
  {
    id: 3,
    category: 'Product Design',
    title: 'UI/UX & Product Design',
    description: 'Transforming complex concepts into intuitive user journeys, high-fidelity prototypes, and cohesive design systems.',
  },
  {
    id: 4,
    category: 'AI & Automation',
    title: 'AI & Automation',
    description: 'Deploying intelligent AI features, automated workflows, custom scripts, and smart solutions that turn concepts into working products.',
  },
  {
    id: 5,
    category: 'Interactive 3D',
    title: '3D Web Experiences',
    description: 'Creating immersive 3D web environments, scroll-driven interactive worlds, Three.js scenes, and creative WebGL visual experiences.',
  },
  {
    id: 6,
    category: 'CMS & Commerce',
    title: 'E-commerce & CMS',
    description: 'Developing custom WooCommerce stores, WordPress platforms, and flexible content management systems tailored for growth.',
  },
];
