import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '@/components/SectionHeader';
import { StarRating } from '@/components/StarRating';
import { GlassCard } from '@/components/GlassCard';
import { testimonials } from '@/data/testimonials';
import { useCursor } from '@/context/CursorContext';
import { useIsMobile } from '@/hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const scrollPos = useRef(0);
  const { setCursorState } = useCursor();
  const isMobile = useIsMobile();

  // Auto-scroll marquee
  useEffect(() => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const totalWidth = track.scrollWidth / 2;
    const speed = isMobile ? 30 : 50;
    const duration = totalWidth / speed;

    // Wait for section to be visible before starting
    const ctx = gsap.context(() => {
      animationRef.current = gsap.to(track, {
        x: -totalWidth,
        duration,
        ease: 'none',
        repeat: -1,
        delay: 1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Pause on hover
  const handleMouseEnter = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (animationRef.current && !isDragging.current) {
      animationRef.current.play();
    }
  }, []);

  // Drag interaction
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = e.clientX;
    scrollPos.current = gsap.getProperty(trackRef.current!, 'x') as number;
    if (animationRef.current) animationRef.current.pause();
    setCursorState('drag');
  }, [setCursorState]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const diff = e.clientX - dragStart.current;
    gsap.set(trackRef.current, { x: scrollPos.current + diff });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setCursorState('default');

    // Resume with slight delay
    setTimeout(() => {
      if (animationRef.current) {
        const currentX = gsap.getProperty(trackRef.current!, 'x') as number;
        const totalWidth = trackRef.current!.scrollWidth / 2;
        const normalizedX = ((currentX % -totalWidth) + -totalWidth) % -totalWidth;
        gsap.set(trackRef.current!, { x: normalizedX });
        animationRef.current.play();
      }
    }, 500);
  }, [setCursorState]);

  // Entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const cards = sectionRef.current!.querySelectorAll('.testimonial-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Replicate the cards to ensure a seamless marquee loop even with a small number of items
  const allTestimonials = Array.from({ length: Math.ceil(8 / testimonials.length) }).flatMap(
    () => testimonials
  );

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative w-full section-padding overflow-hidden"
    >
      <div className="max-w-container mx-auto px-8 md:px-16 mb-16">
        <SectionHeader label="testimonials" heading="What Clients Say" />
      </div>

      {/* Carousel */}
      <div
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          handleMouseLeave();
          handleMouseUp();
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          ref={trackRef}
          className="flex gap-6 pl-8"
          style={{ width: 'max-content' }}
        >
          {allTestimonials.map((testimonial, index) => (
            <GlassCard
              key={`${testimonial.id}-${index}`}
              className="testimonial-card w-[350px] md:w-[400px] flex-shrink-0 p-6 md:p-8"
              enableTilt={false}
            >
              {/* Name */}
              <h3 className="text-body-lg font-body font-semibold text-text-primary">
                {testimonial.name}
              </h3>

              {/* Role */}
              <p className="text-caption text-text-secondary mt-1">
                {testimonial.role}
              </p>

              {/* Stars */}
              <StarRating rating={testimonial.rating} size={18} className="mt-3" />

              {/* Divider */}
              <div className="w-full h-px bg-text-secondary/15 my-4" />

              {/* Quote */}
              <p className="text-body text-text-secondary leading-relaxed italic whitespace-pre-line">
                "{testimonial.text}"
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
