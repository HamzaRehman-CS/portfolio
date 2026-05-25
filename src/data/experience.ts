export interface ExperienceEntry {
  id: number;
  type: 'work' | 'education' | 'certificate';
  role: string;
  organization: string;
  date: string;
  description: string;
  location: string;
  image?: string; // Optional certificate link
}

export const experiences: ExperienceEntry[] = [
  {
    id: 6,
    type: 'work',
    role: 'Event Management Lead',
    organization: 'Computer Science Society, Pak-Austria Fachhochschule - IAST',
    date: '2026 - Present',
    description: 'Directing event coordination, managing logistics, planning tech symposiums, and organizing student workshops and code sprints.',
    location: 'Haripur, Pakistan',
  },
  {
    id: 7,
    type: 'work',
    role: 'Freelance Web Developer (My First Client)',
    organization: 'Royal Muscle Factory (Taimoor Khan)',
    date: 'February 2026',
    description: 'Developed a gym membership management web application automating member records, payment logs, and account controls. Built an admin dashboard for owner Taimoor Khan to manage subscriptions and card validity.',
    location: 'Haripur, Pakistan',
  },
  {
    id: 5,
    type: 'work',
    role: 'Front End Development Intern',
    organization: 'DevelopersHub Corporation',
    date: '22 July 2025 - 5 September 2025',
    description: 'Successfully completed a six-week Virtual Internship Program in Front End Development with exceptional performance, gaining hands-on industry experience.',
    location: 'Remote',
    image: '/certificates/developershub_internship.png',
  },
  {
    id: 1,
    type: 'work',
    role: 'Game Development Intern',
    organization: 'Teknefy (powered by Robotics-World)',
    date: '15 July 2025 - 15 September 2025',
    description: 'Completed a structured professional Internship Program in Game Development. Worked on active projects, game mechanics, and design pipelines. Certified under Student ID T-GDev-001.',
    location: 'Haripur, Pakistan',
    image: '/certificates/teknefy_internship.jpg',
  },
  {
    id: 4,
    type: 'education',
    role: 'BS in Computer Science',
    organization: 'Pak-Austria Fachhochschule - IAST',
    date: '2024 - Present',
    description: 'Studying core Computer Science with specialization in software systems, algorithms, game design, and full stack engineering. Active in organizing university technical fairs.',
    location: 'Haripur, Pakistan',
  },
];
