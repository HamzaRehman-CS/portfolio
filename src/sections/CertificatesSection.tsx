import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '@/components/SectionHeader';
import { certificates } from '@/data/certificates';
import { useCursor } from '@/context/CursorContext';
import { GlassCard } from '@/components/GlassCard';

gsap.registerPlugin(ScrollTrigger);

export function CertificatesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { setCursorState } = useCursor();
  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current!.children;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, sectionRef);

    // Force GSAP ScrollTrigger to recalculate offsets to avoid invisible element glitches
    ScrollTrigger.refresh();
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCert(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section ref={sectionRef} id="certificates" className="relative w-full section-padding border-t border-text-secondary/[0.04]">
      <div className="max-w-container mx-auto px-8 md:px-16">
        <SectionHeader label="credentials" heading="Certifications" className="mb-16" />

        <div
          ref={gridRef}
          className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto"
        >
          {certificates.filter((cert) => cert.id !== 1).map((cert) => (
            <div
              key={cert.id}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex"
              onClick={() => setSelectedCert(cert)}
            >
              <GlassCard
                enableTilt={true}
                style={{ width: '100%', display: 'flex' }}
                className="group cursor-pointer flex flex-col justify-between h-full p-0 overflow-hidden relative border border-white/[0.05] hover:border-accent/30 transition-all duration-500 w-full"
                onMouseEnter={() => setCursorState('interactive')}
                onMouseLeave={() => setCursorState('default')}
              >
              {/* Image Preview Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/[0.05]">
                <img
                  src={cert.image}
                  alt={cert.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-40" />
                
                {/* Click to Zoom indicator */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                  <span className="px-4 py-2 border border-accent text-accent text-label rounded-pill bg-bg-primary/80 scale-90 group-hover:scale-100 transition-transform duration-300">
                    View Credentials
                  </span>
                </div>
              </div>

              {/* Text Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 border border-accent/25 rounded-pill text-caption text-accent bg-accent/[0.02]">
                      {cert.category}
                    </span>
                    <span className="text-caption text-text-tertiary">{cert.date}</span>
                  </div>
                  <h3 className="text-body-lg font-body font-bold text-text-primary group-hover:text-accent transition-colors duration-300">
                    {cert.title}
                  </h3>
                  <p className="text-body font-body font-medium text-text-secondary mt-1">
                    {cert.issuer}
                  </p>
                  <p className="text-caption text-text-secondary/70 leading-relaxed mt-3">
                    {cert.description}
                  </p>
                </div>
                
                {/* Bottom line arrow hint */}
                <div className="flex items-center gap-1.5 text-caption font-semibold text-accent/80 mt-4 group-hover:translate-x-1 transition-transform duration-300">
                  Inspect Certificate <span>→</span>
                </div>
              </div>
            </GlassCard>
          </div>
          ))}
        </div>
      </div>

      {/* Modern High-End Lightroom Modal Backdrop */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 p-4 sm:p-6 md:p-8"
          onClick={() => setSelectedCert(null)}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-5xl w-full bg-bg-secondary/40 border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row scale-95 animate-fade-in-scale"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Image Section */}
            <div className="flex-1 bg-black/40 flex items-center justify-center p-4">
              <img
                src={selectedCert.image}
                alt={selectedCert.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg border border-white/[0.05]"
              />
            </div>

            {/* Info Section */}
            <div className="w-full md:w-[320px] bg-[#1a1a1a]/95 border-t md:border-t-0 md:border-l border-white/[0.08] p-6 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 border border-accent/30 rounded-pill text-caption text-accent mb-4">
                  {selectedCert.category}
                </span>
                <h3 className="text-h4 font-display text-text-primary leading-tight">
                  {selectedCert.title}
                </h3>
                <p className="text-body-lg font-body font-semibold text-accent mt-2">
                  {selectedCert.issuer}
                </p>
                <div className="w-full h-px bg-white/[0.06] my-4" />
                <p className="text-body text-text-secondary/90 leading-relaxed">
                  {selectedCert.description}
                </p>
              </div>

              <div className="mt-8">
                <div className="text-caption text-text-tertiary">
                  <span className="font-semibold block text-text-secondary mb-1">Issue Date:</span>
                  {selectedCert.date}
                </div>
                <button
                  className="mt-6 w-full py-3 bg-accent text-bg-primary font-body font-bold text-sm rounded-xl hover:bg-[#33DDFF] transition-all active:scale-[0.98]"
                  onClick={() => setSelectedCert(null)}
                >
                  Close Viewer
                </button>
              </div>
            </div>

            {/* Absolute close button */}
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/[0.1] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xl"
              onClick={() => setSelectedCert(null)}
              aria-label="Close credentials modal"
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
