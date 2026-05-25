export interface Service {
  id: number;
  category: string;
  title: string;
  description: string;
}

export const services: Service[] = [
  {
    id: 1,
    category: 'Development',
    title: 'Frontend Development',
    description: 'Transforming custom designs into pixel-perfect, responsive, and accessible interfaces using React, Next.js, and Tailwind CSS.',
  },
  {
    id: 2,
    category: 'Development',
    title: 'Backend & API Integration',
    description: 'Implementing secure backend development, backend API integration, and database management utilizing Firebase and other modern databases.',
  },
  {
    id: 3,
    category: 'Design',
    title: 'Designing',
    description: 'Designing premium UI UX prototype and creative graphic designing on Canva. Smooth UI UX.',
  },
  {
    id: 4,
    category: 'Development',
    title: 'Full Stack Web Apps',
    description: 'Creating end-to-end web applications, connecting frontend state with backend servers and cloud storage.',
  },
  {
    id: 5,
    category: 'AI & Automation',
    title: 'AI Automation',
    description: 'Developing custom AI automation tools like AI Presentation Makers and Online Cloth Visualizers (which allow users to upload photos and try on outfits virtually).',
  },
  {
    id: 6,
    category: 'Game Dev',
    title: 'Unity Game Development',
    description: 'Building immersive 2D and 3D games, optimizing gameplay systems, and generating polished, fully-releasable production APKs.',
  },
];
