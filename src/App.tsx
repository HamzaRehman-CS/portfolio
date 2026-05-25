import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CursorProvider } from '@/context/CursorContext';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/sections/HeroSection';
import { ServicesSection } from '@/sections/ServicesSection';
import { WorksSection } from '@/sections/WorksSection';
import { ExperienceSection } from '@/sections/ExperienceSection';
import { CertificatesSection } from '@/sections/CertificatesSection';
import { SkillsSection } from '@/sections/SkillsSection';
import { TestimonialsSection } from '@/sections/TestimonialsSection';
import { ContactSection } from '@/sections/ContactSection';
import { Footer } from '@/sections/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only enable Lenis on desktop
    const isMobile = window.innerWidth < 768;

    if (!isMobile) {
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });

      lenisRef.current = lenis;

      // Sync Lenis with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      return () => {
        lenis.destroy();
        gsap.ticker.remove(lenis.raf as unknown as gsap.TickerCallback);
      };
    }
  }, []);

  return (
    <CursorProvider>
      <div className="relative bg-bg-primary min-h-screen text-text-primary">
        {/* Background Grid Pattern spanning the entire web */}
        <div className="grid-pattern" />
        
        <Navigation />

        <main>
          <HeroSection />
          <ServicesSection />
          <WorksSection />
          <ExperienceSection />
          <CertificatesSection />
          <SkillsSection />
          <TestimonialsSection />
          <ContactSection />
          <Footer />
        </main>
      </div>
    </CursorProvider>
  );
}

export default App;
