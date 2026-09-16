import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '@/components/SectionHeader';
import { GlassCard } from '@/components/GlassCard';
import { skills } from '@/data/skills';
import { useCursor } from '@/context/CursorContext';
import * as LucideIcons from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { setCursorState } = useCursor();

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.skill-card');

    const ctx = gsap.context(() => {
      // Entrances for cards
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.05,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // Rating dots fill-in
      const dotGroups = sectionRef.current!.querySelectorAll('.rating-dots');
      dotGroups.forEach((group, gi) => {
        const dots = group.querySelectorAll('.rating-dot');
        gsap.fromTo(
          dots,
          { opacity: 0.3, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.25,
            ease: 'power2.out',
            stagger: 0.04,
            delay: 0.2 + (gi % 4) * 0.05, // stagger delays to keep animation fast and synchronized
            scrollTrigger: {
              trigger: group,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });
    }, sectionRef);

    // Force GSAP ScrollTrigger to recalculate offsets to avoid layout/scrolling glitches
    ScrollTrigger.refresh();
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full section-padding border-t border-text-secondary/[0.04]"
    >
      <div className="max-w-container mx-auto px-8 md:px-16">
        <SectionHeader label="skills" heading="My Expertise" className="mb-16" />

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
        >
          {[...skills]
            .sort((a, b) => b.rating - a.rating)
            .map((skill) => {
              // Dynamically resolve Lucide Icon component
              const IconComponent = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[skill.iconName] || LucideIcons.HelpCircle;

              return (
                <GlassCard
                  key={skill.id}
                  className="skill-card group flex flex-col justify-between p-5 border border-white/[0.05] hover:border-accent/30 transition-all duration-500 rounded-2xl h-full min-h-[150px]"
                  onMouseEnter={() => setCursorState('interactive')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  <div>
                    {/* Top Row: Icon Container */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm"
                        style={{
                          backgroundColor: `${skill.color}12`,
                          color: skill.color,
                          border: `1px solid ${skill.color}20`,
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Skill Name */}
                    <h3 className="text-body-lg font-body font-bold text-text-primary group-hover:text-accent transition-colors duration-300 leading-tight">
                      {skill.name}
                    </h3>
                  </div>

                  {/* Rating Dots Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] mt-auto">
                    <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
                      Skill Level
                    </span>
                    <div className="rating-dots flex items-center gap-1.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`rating-dot w-2 h-2 rounded-full transition-all duration-300 ${
                            i < skill.rating
                              ? 'bg-accent shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                              : 'bg-text-secondary/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
        </div>
      </div>
    </section>
  );
}
