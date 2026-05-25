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
    id: 1,
    title: 'Game Development Internship',
    issuer: 'Teknefy (Robotics-World)',
    date: '15 Sep 2025',
    image: '/certificates/teknefy_internship.jpg',
    category: 'Internship',
    description: 'Awarded for completing a 2-month professional training program in Game Development, engineering game systems, and scripting interactive mechanics.',
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
    id: 4,
    title: 'Basic Programming & Business',
    issuer: 'Giga Developers (Pvt) Ltd.',
    date: '27 Mar 2025',
    image: '/certificates/giga_developers.jpg',
    category: 'Seminar',
    description: 'Attended full-day training on corporate software practices, architectural patterns, and basic tech entrepreneurship workflows.',
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
    id: 6,
    title: 'Gamepreneurship Volunteer Recognition',
    issuer: 'Scale-Up PAF-IAST',
    date: '2025',
    image: '/certificates/gamepreneurship_recognition.png',
    category: 'Recognition',
    description: 'Recognized for outstanding volunteer support and best performance in Gamepreneurship 2025 at Pak-Austria Fachhochschule-IAST.',
  },
];
