import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '@/components/SectionHeader';
import { works } from '@/data/works';
import type { Work } from '@/data/works';
import { useCursor } from '@/context/CursorContext';
import { useIsDesktop } from '@/hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

const designImages = ['/design_basic.png', '/design_personal.png', '/design_diet.png'];
export function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { setCursorState } = useCursor();
  const isDesktop = useIsDesktop();

  // Selected work state for interactive inspection modals
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // Active zoomed card pass view inside the design showcase
  const [activeDesignPass, setActiveDesignPass] = useState<string | null>(null);

  // Carousel slide state for graphic design passes
  const [designIndex, setDesignIndex] = useState(0);


  // Handle escape key closure
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeDesignPass) {
          setActiveDesignPass(null);
        } else {
          setSelectedWork(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDesignPass]);

  // 5-second automatic slide interval for the graphic design passes card
  useEffect(() => {
    const interval = setInterval(() => {
      setDesignIndex((prev) => (prev + 1) % designImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current!.children;

      if (isDesktop) {
        // Scroll-driven 3D perspective on desktop
        gsap.fromTo(
          gridRef.current,
          {
            rotateX: 15,
            rotateY: -3,
            rotateZ: 4,
          },
          {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              end: 'bottom center',
              scrub: 0.5,
            },
          }
        );

        // Card reveals
        gsap.fromTo(
          cards,
          { opacity: 0.3, scale: 0.9, y: 50 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              end: 'center center',
              scrub: 1,
            },
          }
        );
      } else {
        // Standard fade-up for mobile/tablet
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cards,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // Progress indicator
      if (progressRef.current && isDesktop) {
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top center',
              end: 'bottom center',
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isDesktop]);

  return (
    <section
      ref={sectionRef}
      id="works"
      className="relative w-full py-24 md:py-36 border-t border-text-secondary/[0.04]"
    >
      <div className="max-w-container mx-auto px-8 md:px-16">
        <SectionHeader label="works" heading="Selected Works" className="mb-16" />

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 perspective-container max-w-5xl mx-auto"
          style={isDesktop ? { transformStyle: 'preserve-3d' } : undefined}
        >
          {works.map((work) => {
            const isDesignCard = work.id === 4;
            return (
              <div
                key={work.id}
                onClick={() => setSelectedWork(work)}
                onMouseEnter={() => setCursorState('interactive')}
                onMouseLeave={() => setCursorState('default')}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden block border border-white/5 bg-black/20 transition-all duration-300 cursor-pointer"
              >
                {/* Image / Carousel */}
                {isDesignCard ? (
                  <div className="absolute inset-0 w-full h-full p-4 bg-[#141414]/60 flex items-center justify-center relative overflow-hidden">
                    {designImages.map((img, idx) => (
                      <img
                        key={img}
                        src={img}
                        alt={`${work.title} - ${idx}`}
                        className={`absolute w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-contain rounded-lg transition-all duration-1000 ease-in-out group-hover:brightness-95 ${
                          idx === designIndex
                            ? 'opacity-100 scale-100 z-[2]'
                            : 'opacity-0 scale-95 z-[1]'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full p-4 bg-[#141414]/60 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={work.image}
                      alt={work.title}
                      loading="lazy"
                      className="w-full h-full object-contain rounded-lg transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-95"
                    />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-[5]" />

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="text-body-lg font-body font-semibold text-text-primary mb-1">
                    {work.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-text-tertiary">{work.year}</span>
                    <span className="text-label text-accent font-medium">Read Details →</span>
                  </div>
                </div>

                {/* Status Badge (Default State) */}
                <div className="absolute top-4 left-4 z-10 transition-opacity duration-300 group-hover:opacity-0">
                  <span className={`px-2.5 py-0.5 border rounded-pill text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-sm ${
                    work.status === 'Live'
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40'
                      : 'border-amber-500/30 text-amber-400 bg-amber-950/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      work.status === 'Live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`} />
                    {work.status}
                  </span>
                </div>

                {/* Category badge */}
                <div className="absolute top-4 right-4 z-10 transition-opacity duration-300 group-hover:opacity-0">
                  <span className="px-3 py-1 border border-text-secondary/30 rounded-pill text-label text-text-secondary bg-bg-primary/60 backdrop-blur-sm">
                    {work.category}
                  </span>
                </div>

                {/* Premium Hover Details Overlay */}
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6 z-20">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs uppercase tracking-wider text-accent font-semibold">
                        {work.category}
                      </span>
                      {/* Hover Status */}
                      <span className={`px-2 py-0.5 border rounded-pill text-[10px] font-semibold flex items-center gap-1 ${
                        work.status === 'Live'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40'
                          : 'border-amber-500/30 text-amber-400 bg-amber-950/40'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          work.status === 'Live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`} />
                        {work.status}
                      </span>
                    </div>
                    <h4 className="text-body font-body font-bold text-text-primary">
                      {work.title}
                    </h4>
                    <p className="text-caption text-text-secondary leading-relaxed font-light">
                      {work.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-label text-accent font-semibold transition-all duration-300 group-hover:translate-x-1">
                    <span>{isDesignCard ? 'Inspect Designs' : 'Read Project Details'}</span>
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-End Backdrop-Blurred Details Modal */}
      {selectedWork && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 p-4 sm:p-6 md:p-8 cursor-default"
          onClick={() => setSelectedWork(null)}
          style={{
            animation: 'fadeIn 0.3s ease-out forwards',
          }}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-5xl w-full bg-bg-secondary/40 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row scale-95"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {selectedWork.id === 4 ? (
              // GRAPHIC DESIGN LIGHTBOX SHOWCASE
              <div className="flex flex-col w-full p-6 md:p-8 relative">
                <div className="flex justify-between items-start mb-6 pr-12">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-0.5 border border-accent/30 rounded-pill text-caption text-accent bg-accent/[0.02]">
                        {selectedWork.category}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-text-tertiary bg-white/[0.03] px-2 py-0.5 rounded-sm">
                        {selectedWork.year}
                      </span>
                    </div>
                    <h3 className="text-h3 font-display text-text-primary leading-tight">
                      {selectedWork.title}
                    </h3>
                  </div>
                </div>

                {/* Grid of the three passes side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 overflow-y-auto max-h-[50vh] md:max-h-[60vh] pr-2">
                  {[
                    {
                      title: 'Basic Entry Pass',
                      image: '/design_basic.png',
                      color: 'border-blue-500/20 text-blue-400 bg-blue-950/20',
                      desc: 'Standard membership card designed with clean dark blue branding layouts.'
                    },
                    {
                      title: 'VIP Training Pass',
                      image: '/design_personal.png',
                      color: 'border-amber-500/20 text-amber-400 bg-amber-950/20',
                      desc: 'Premium gold-tinted exclusive pass designed for VIP coaching access.'
                    },
                    {
                      title: 'Nutritional Diet Pass',
                      image: '/design_diet.png',
                      color: 'border-rose-500/20 text-rose-400 bg-rose-950/20',
                      desc: 'Elegant red-hued nutrition identification and meal plan access pass.'
                    }
                  ].map((pass, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveDesignPass(pass.image)}
                      className="flex flex-col bg-black/30 border border-white/[0.05] rounded-xl overflow-hidden group cursor-zoom-in transition-all duration-300 hover:border-accent/40"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden border-b border-white/[0.05] bg-black/40 relative p-4 flex items-center justify-center">
                        <img
                          src={pass.image}
                          alt={pass.title}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay zoom indicator */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="px-3 py-1 border border-accent text-accent text-[10px] rounded-pill bg-bg-primary/90">
                            Click to View Full Card
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white/[0.01]">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 border rounded-pill text-[10px] font-semibold mb-2 ${pass.color}`}>
                            {pass.title}
                          </span>
                          <p className="text-caption text-text-secondary leading-relaxed font-light">
                            {pass.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full h-px bg-white/[0.06] my-4" />
                <p className="text-caption text-text-tertiary text-center">
                  Designed on Canva. Click on any design pass above to preview the full high-resolution image.
                </p>

                {/* Absolute close button positioned away from year badge */}
                <button
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xl cursor-pointer z-50 shadow-md"
                  onClick={() => setSelectedWork(null)}
                  aria-label="Close design modal"
                >
                  ×
                </button>
              </div>
            ) : (
              // WEB PROJECT DETAILS MODAL
              <>
                {/* Screenshot Column */}
                <div className="flex-1 bg-black/30 flex items-center justify-center p-6 md:p-8 relative min-h-[250px] md:min-h-[450px]">
                  <img
                    src={selectedWork.image}
                    alt={selectedWork.title}
                    className="max-h-[60vh] w-full object-contain rounded-lg border border-white/[0.05] shadow-lg"
                  />
                  {/* Subtle decorative glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Project Details Column */}
                <div className="w-full md:w-[380px] bg-[#141414]/98 border-t md:border-t-0 md:border-l border-white/[0.06] p-6 flex flex-col justify-between relative">
                  <div>
                    {/* Category row - date shifted inline aside close button */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 pr-12">
                      <span className="px-3 py-0.5 border border-accent/30 rounded-pill text-caption text-accent bg-accent/[0.02]">
                        {selectedWork.category}
                      </span>
                      <span className="text-caption text-text-secondary bg-white/[0.03] px-2.5 py-0.5 rounded-sm">
                        {selectedWork.year}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-h4 font-display text-text-primary leading-tight">
                        {selectedWork.title}
                      </h3>
                      {/* Active Status Badge */}
                      <span className={`px-2 py-0.5 border rounded-pill text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-sm ${
                        selectedWork.status === 'Live'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40'
                          : 'border-amber-500/30 text-amber-400 bg-amber-950/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          selectedWork.status === 'Live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`} />
                        {selectedWork.status}
                      </span>
                    </div>

                    <div className="w-full h-px bg-white/[0.06] my-4" />

                    <p className="text-body text-text-secondary leading-relaxed font-light">
                      {selectedWork.description}
                    </p>

                    {/* Tech details notes based on project */}
                    <div className="mt-6">
                      <span className="text-caption font-semibold text-text-secondary block mb-2">Key Highlights:</span>
                      <ul className="space-y-1.5">
                        {selectedWork.id === 1 && (
                          <>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                              QR Code scanning system integration
                            </li>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Database connection (Firebase)
                            </li>
                          </>
                        )}
                        {selectedWork.id === 2 && (
                          <>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                              Modern Clean Visual Design
                            </li>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Responsive Layout
                            </li>
                          </>
                        )}
                        {selectedWork.id === 3 && (
                          <>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                              B2B Product Showcase Catalog
                            </li>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Clean visual design and easy navigation
                            </li>
                          </>
                        )}
                        {selectedWork.id === 5 && (
                          <>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                              AI suit-fitting & facial expressions alignment
                            </li>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Print-ready passport size PDF compiler
                            </li>
                          </>
                        )}
                        {selectedWork.id === 6 && (
                          <>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                              E-commerce virtual try-on visualizer
                            </li>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Garment-to-photo visualization system
                            </li>
                          </>
                        )}
                        {selectedWork.id === 7 && (
                          <>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                              Light-trail guided architectural 3D scroll physics
                            </li>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Building illumination & rocket launch scroll sequence
                            </li>
                          </>
                        )}
                        {selectedWork.id === 8 && (
                          <>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                              Interactive 3D virtual room & scroll-driven furniture packing
                            </li>
                            <li className="text-caption text-text-secondary/70 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Custom client product showcase for Maldivian home goods brand
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    {selectedWork.link && selectedWork.link !== '#' ? (
                      <a
                        href={selectedWork.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-accent text-bg-primary font-body font-bold text-sm rounded-xl hover:bg-[#33DDFF] transition-all duration-300 text-center shadow-[0_0_20px_rgba(0,212,255,0.15)] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Visit Live Website</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    ) : (
                      <div
                        className="w-full py-3 bg-white/[0.04] text-text-secondary/50 font-body font-bold text-sm rounded-xl text-center border border-white/[0.08] flex items-center justify-center gap-2 select-none"
                      >
                        <span>Interactive Demo Coming Soon</span>
                      </div>
                    )}
                    
                    <button
                      className="w-full py-2.5 border border-white/[0.08] hover:border-white/[0.15] text-text-secondary text-caption font-semibold rounded-xl transition-all cursor-pointer"
                      onClick={() => setSelectedWork(null)}
                    >
                      Close Details
                    </button>
                  </div>

                  {/* Absolute close button positioned cleanly on details column */}
                  <button
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xl cursor-pointer z-50 shadow-md"
                    onClick={() => setSelectedWork(null)}
                    aria-label="Close design modal"
                  >
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. FULL RESOLUTION LIGHTBOX CARD OVERLAY */}
      {activeDesignPass && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 cursor-zoom-out animate-zoom-in"
          onClick={() => setActiveDesignPass(null)}
          style={{
            animation: 'fadeIn 0.25s ease-out forwards',
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center gap-4">
            <img
              src={activeDesignPass}
              alt="Zoomed Card Design"
              className="max-h-[80vh] w-auto object-contain rounded-xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-caption text-text-secondary bg-black/60 px-4 py-2 rounded-pill border border-white/5 pointer-events-none">
              Click anywhere or press Esc to close
            </span>
            {/* Direct Close Button for Zoom */}
            <button
              className="absolute -top-4 -right-4 md:top-2 md:right-2 w-10 h-10 rounded-full bg-black/80 hover:bg-black border border-white/10 text-white flex items-center justify-center text-xl cursor-pointer z-[1200] shadow-xl hover:scale-105 transition-all"
              onClick={() => setActiveDesignPass(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Progress indicator - desktop only */}
      {isDesktop && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 w-[2px] h-32 bg-text-secondary/10 z-10 origin-top hidden lg:block">
          <div
            ref={progressRef}
            className="w-full bg-accent origin-top"
            style={{ height: '100%', transform: 'scaleY(0)' }}
          />
        </div>
      )}

      {/* Inject custom animation keyframe styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
