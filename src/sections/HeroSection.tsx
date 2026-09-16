import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { HeroBackground } from '@/components/three/HeroBackground';
import { useCursor } from '@/context/CursorContext';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const { setCursorState } = useCursor();
  const isMobile = useIsMobile();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Card fade in + float
      tl.fromTo(
        cardWrapperRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out' }
      );

      // Floating animation for card
      gsap.to(cardRef.current, {
        y: -10,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Heading chars stagger
      if (headingRef.current) {
        const chars = headingRef.current.querySelectorAll('.char');
        tl.fromTo(
          chars,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.02,
          },
          '-=0.5'
        );
      }

      // Description fade
      tl.fromTo(
        descRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.3'
      );

      // CTA buttons fade
      if (ctaRef.current) {
        const buttons = ctaRef.current.children;
        tl.fromTo(
          buttons,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 },
          '-=0.4'
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Card glare effect
  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (!glareRef.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    glareRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
    glareRef.current.style.opacity = '1';
  };

  const handleCardMouseLeave = () => {
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  const splitChars = (text: string) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className="char inline-block"
        style={{ opacity: 0 }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };



  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen w-full flex items-center overflow-hidden"
    >
      <HeroBackground />

      {/* Content Container */}
      <div className="relative z-10 max-w-container mx-auto w-full px-8 md:px-16 py-12 md:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-8">
        {/* Text Content */}
        <div className="flex-1 max-w-2xl text-center lg:text-left">
          <div ref={headingRef}>
            <span className="text-[clamp(1.5rem,4.5vw,48px)] font-display text-text-primary block leading-none">
              {splitChars("Hi, I'm")}
            </span>
            <span className="text-[clamp(2.2rem,6.2vw,74px)] font-display text-text-primary block leading-none mt-2 text-glow">
              {splitChars('Hamza Rehman')}
            </span>
          </div>

          <p
            ref={descRef}
            className="text-body-lg text-text-secondary mt-4 max-w-md mx-auto lg:mx-0 font-light"
            style={{ opacity: 0 }}
          >
            I’m Hamza. I design and build modern websites, interactive 3D experiences, and AI-powered digital products.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-5"
          >
            <a
              href="/Hamza_Rehman_CV.pdf"
              download="Hamza_Rehman_CV.pdf"
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
              className="px-8 py-3 bg-accent text-bg-primary font-body font-medium text-sm rounded-pill hover:bg-[#33DDFF] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300"
              style={{ opacity: 0 }}
            >
              Download CV
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
              className="px-8 py-3 border border-text-secondary/40 text-text-primary font-body font-medium text-sm rounded-pill hover:border-accent hover:text-accent transition-all duration-400"
              style={{ opacity: 0 }}
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* 3D Perspective Card */}
        <div
          ref={cardWrapperRef}
          className="perspective-container flex-shrink-0"
          style={{ opacity: 0 }}
        >
          <div
            ref={cardRef}
            className="preserve-3d relative w-[240px] h-[310px] sm:w-[300px] sm:h-[385px] lg:w-[340px] lg:h-[430px]"
            style={{
              transform: isMobile ? 'rotateX(5deg) rotateY(-5deg)' : 'rotateX(12deg) rotateY(-12deg)',
              transition: 'transform 0.5s ease-out',
            }}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            onMouseEnter={() => setCursorState('interactive')}
          >
            {/* Layer 4 - Top accent */}
            <div
              className="absolute inset-0 rounded-card border border-white/[0.03]"
              style={{ transform: 'translateZ(60px)' }}
            />
            {/* Layer 3 */}
            <div
              className="absolute inset-0 rounded-card border border-white/[0.05]"
              style={{ transform: 'translateZ(40px)' }}
            />
            {/* Layer 2 */}
            <div
              className="absolute inset-0 rounded-card border border-white/[0.08]"
              style={{ transform: 'translateZ(20px)' }}
            />
            {/* Layer 1 - Main content */}
            <div
              className="absolute inset-0 rounded-card bg-bg-secondary/40 backdrop-blur-xl border border-white/[0.1] overflow-hidden"
              style={{ transform: 'translateZ(0px)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-card pointer-events-none" />
              <img
                src="/hamza_rehman.jpg"
                alt="Hamza Rehman"
                className="w-full h-full object-cover rounded-card p-3"
              />
              {/* Glare overlay */}
              <div
                ref={glareRef}
                className="absolute inset-0 rounded-card pointer-events-none opacity-0 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
