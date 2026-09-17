export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date: string;
  image: string;
  category: string;
  description: string;
}

export const certificates: Certificate[] = [
  {
    id: 7,
    title: 'Machine Learning Internship',
    issuer: 'FlyRank Corp.',
    date: '14 Sep 2026',
    image: '/certificates/flyrank_machine_learning.png',
    category: 'Internship',
    description: 'Completed the Machine Learning Internship Program at FlyRank.ai (ID: FR-D11-5D946-C56DE), demonstrating excellence in technical competency, ML pipelines, and collaborative engineering.',
  },
  {
    id: 8,
    title: 'AI Fluency Internship',
    issuer: 'FlyRank Corp.',
    date: '14 Sep 2026',
    image: '/certificates/flyrank_ai_fluency.png',
    category: 'Internship',
    description: 'Completed the AI Fluency Internship Program at FlyRank.ai (ID: FR-D11-91882-8DC0B), recognized for proficiency in advanced AI tools, workflow automation, and collaborative contribution.',
  },
  {
    id: 9,
    title: 'Forward Program',
    issuer: 'McKinsey.org',
    date: '30 Jun 2026',
    image: '/certificates/mckinsey_forward.png',
    category: 'Professional Program',
    description: 'Awarded for successfully completing the McKinsey.org Forward online learning program, mastering future-of-work leadership, structured problem solving, adaptability, and digital toolkits.',
  },
  {
    id: 3,
    title: 'Blockchain & AI Workshop',
    issuer: 'SecuredXWave (Avax Team1)',
    date: '3 Mar 2026',
    image: '/certificates/avax_blockchain_ai.jpg',
    category: 'Workshop',
    description: 'Certified participation in blockchain integrations, smart contract concepts, and AI agents workshop.',
  },
  {
    id: 1,
    title: 'Game Development Internship',
    issuer: 'Teknefy (Robotics-World)',
    date: '15 Sep 2025',
    image: '/certificates/teknefy_internship.jpg',
    category: 'Internship',
    description: 'Awarded for completing a 2-month professional training program in Game Development, engineering game systems, and scripting interactive mechanics.',
  },
  {
    id: 10,
    title: 'Front End Development Internship',
    issuer: 'DevelopersHub Corporation',
    date: '5 Sep 2025',
    image: '/certificates/developershub_internship.png',
    category: 'Internship',
    description: 'Awarded Best Award (DHC-78) for successfully completing a six-week Virtual Internship Program in Front End Development with exceptional performance.',
  },
  {
    id: 4,
    title: 'Basic Programming & Business',
    issuer: 'Giga Developers (Pvt) Ltd.',
    date: '27 Mar 2025',
    image: '/certificates/giga_developers.jpg',
    category: 'Seminar',
    description: 'Attended full-day training on corporate software practices, architectural patterns, and basic tech entrepreneurship workflows.',
  },
  {
    id: 6,
    title: 'Gamepreneurship Volunteer Recognition',
    issuer: 'Scale-Up PAF-IAST',
    date: '2025',
    image: '/certificates/gamepreneurship_recognition.png',
    category: 'Recognition',
    description: 'Recognized for outstanding volunteer support and best performance in Gamepreneurship 2025 at Pak-Austria Fachhochschule-IAST.',
  },
  {
    id: 5,
    title: 'EducationUSA Fair Organizer',
    issuer: 'PAIMAN Alumni Trust',
    date: '9 Jan 2025',
    image: '/certificates/educationusa_fair.jpg',
    category: 'Volunteering',
    description: 'Recognized for invaluable contribution and organizer/volunteer support during the Khyber Pakhtunkhwa EducationUSA student outreach event.',
  },
  {
    id: 2,
    title: 'Gamepreneurship Capacity Building',
    issuer: "USAID's ERDA & P@SHA",
    date: '26 Dec 2024',
    image: '/certificates/usaid_gamepreneurship.jpg',
    category: 'Workshop',
    description: 'One-day workshop on building scalable business models, game marketing, and funding strategies, hosted at Pak-Austria Fachhochschule-IAST.',
  },
];
