import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '@/components/SectionHeader';
import { GlassCard } from '@/components/GlassCard';
import { services } from '@/data/services';
import { useCursor } from '@/context/CursorContext';

gsap.registerPlugin(ScrollTrigger);

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { setCursorState } = useCursor();

  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.children;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative w-full section-padding"
    >
      <div className="max-w-container mx-auto px-8 md:px-16">
        <SectionHeader label="services" heading="What I Do" className="mb-16" />

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {services.map((service) => (
            <GlassCard
              key={service.id}
              className="p-8 min-h-[260px] flex flex-col"
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
            >
              <span className="inline-block self-start px-4 py-1 border border-text-secondary/30 rounded-pill text-label text-text-secondary mb-6">
                {service.category}
              </span>
              <h3 className="text-h5 text-text-primary mb-3">{service.title}</h3>
              <p className="text-body text-text-secondary leading-relaxed flex-1">
                {service.description}
              </p>
              <div className="mt-6 w-[30%] h-[1px] bg-accent/15 group-hover:w-full transition-all duration-600" />
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
