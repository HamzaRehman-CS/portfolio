export interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Taimoor Khan',
    role: 'Gym Owner',
    rating: 5,
    text: 'Hamza ne hamare gym ke liye complete management web application develop ki, jisme QR scanning, member accounts aur admin controls sab kuch bohat smoothly kaam karta hai. Bohat professional aur reliable work.\n\nTranslation:\nHamza developed a complete gym management web application for us with QR scanning, member accounts, and powerful admin controls. Everything works smoothly and professionally.',
  },
  {
    id: 2,
    name: 'Taimoor Khan',
    role: 'Gym Owner',
    rating: 4,
    text: 'Hamza ne hamare gym ke liye unique logo aur premium gym membership cards design kiye jo hamare brand ko bohat professional look dete hain. Bohat hi creative aur visual design kaam hai.\n\nTranslation:\nHamza designed a unique logo and premium gym membership cards for our gym which gives our brand a highly professional look. Truly creative and visual design work.',
  },
  {
    id: 3,
    name: 'Waseem Khan',
    role: 'Photo Studio Owner',
    rating: 5,
    text: 'Hamza developed an incredible AI-powered automation tool for our photo studio that completely handles background edits, suit overlays, and print-ready PDF generation. Working with him was a fantastic experience—he delivered a highly professional and reliable solution that saves us hours of work every day.',
  },
];
