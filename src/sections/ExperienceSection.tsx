import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '@/components/SectionHeader';
import { experiences } from '@/data/experience';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useCursor } from '@/context/CursorContext';

gsap.registerPlugin(ScrollTrigger);

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const { setCursorState } = useCursor();
  const [selectedCertImage, setSelectedCertImage] = useState<string | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Central line draw
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 80%',
              end: 'bottom 50%',
              scrub: true,
            },
          }
        );
      }

      // Timeline cards sliding in
      const cards = sectionRef.current!.querySelectorAll('.timeline-card');
      cards.forEach((card, i) => {
        const isLeft = i % 2 === 0;
        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isDesktop ? (isLeft ? -100 : 100) : -50,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });

      // Nodes bounce in
      const nodes = sectionRef.current!.querySelectorAll('.timeline-node');
      nodes.forEach((node) => {
        gsap.fromTo(
          node,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: node,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });
    }, sectionRef);

    ScrollTrigger.refresh();
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [isDesktop]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCertImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative w-full section-padding"
    >
      <div className="max-w-narrow mx-auto px-8 md:px-16">
        <SectionHeader label="experience" heading="My Journey" className="mb-24 md:mb-32" />

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Central line */}
          <div className="absolute left-5 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-text-secondary/15 origin-top">
            {/* Glow line */}
            <div className="absolute inset-0 w-[3px] -left-[1px] bg-accent/[0.08] blur-[2px] origin-top" />
            <div ref={lineRef} className="absolute inset-0 bg-accent/30 origin-top" style={{ transform: 'scaleY(0)' }} />
          </div>

          {/* Entries */}
          {experiences.map((exp, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={exp.id}
                className={`timeline-entry relative flex items-start mb-12 md:mb-16 last:mb-0 ${
                  isDesktop ? (isLeft ? 'flex-row' : 'flex-row-reverse') : ''
                }`}
              >
                {/* Node */}
                <div className="timeline-node absolute left-5 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-bg-primary border-2 border-accent z-[2]"
                  style={{ boxShadow: '0 0 12px rgba(0,212,255,0.4)' }}
                />

                {/* Card */}
                <div
                  className={`timeline-card ml-12 md:ml-0 md:w-[45%] ${
                    isDesktop ? (isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12') : ''
                  }`}
                >
                  <div className="glass-card p-6">
                    {/* Date badge */}
                    <span className="inline-block px-3 py-1 border border-accent/30 rounded-pill text-caption text-accent mb-3">
                      {exp.date}
                    </span>

                    {/* Role */}
                    <h3 className="text-body-lg font-body font-semibold text-text-primary">
                      {exp.role}
                    </h3>

                    {/* Organization */}
                    <p className="text-body font-body font-medium text-text-secondary mt-1">
                      {exp.organization}
                    </p>

                    {/* Description */}
                    <p className="text-body text-text-secondary leading-relaxed mt-3">
                      {exp.description}
                    </p>

                    {/* Location */}
                    <p className="text-caption text-text-tertiary mt-3 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {exp.location}
                    </p>

                    {/* Certificate Thumbnail Preview */}
                    {'image' in exp && exp.image && (
                      <div
                        className="mt-5 group/cert cursor-pointer relative overflow-hidden rounded-xl border border-white/[0.06] hover:border-accent/40 transition-all duration-500 aspect-[1.414/1] w-full"
                        onClick={() => setSelectedCertImage(exp.image as string)}
                        onMouseEnter={() => setCursorState('interactive')}
                        onMouseLeave={() => setCursorState('default')}
                      >
                        <img
                          src={exp.image}
                          alt={`${exp.role} Certificate`}
                          loading="lazy"
                          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/cert:scale-[1.03] group-hover/cert:brightness-105"
                        />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/cert:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                          <span className="px-4 py-2 border border-accent text-accent text-label rounded-pill bg-bg-primary/95 scale-90 group-hover/cert:scale-100 transition-all duration-300">
                            View Internship Certificate
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/[0.08] text-[9px] text-text-secondary uppercase tracking-wider rounded group-hover/cert:opacity-0 transition-opacity duration-300">
                          Internship Credentials
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-End Lightroom Modal Backdrop for Experience Certificates */}
      {selectedCertImage && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 p-4 sm:p-6 md:p-8"
          onClick={() => setSelectedCertImage(null)}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-4xl w-full bg-[#151515] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl p-2 scale-95 animate-fade-in-scale flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <img
              src={selectedCertImage}
              alt="Internship Certificate"
              className="max-h-[85vh] w-auto object-contain rounded-lg border border-white/[0.05]"
            />

            {/* Absolute close button */}
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/[0.1] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xl"
              onClick={() => setSelectedCertImage(null)}
              aria-label="Close certificate modal"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Inject custom animation keyframe styles */}
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}
