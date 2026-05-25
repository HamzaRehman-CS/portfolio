import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCursor } from '@/context/CursorContext';
import { GlassCard } from '@/components/GlassCard';
import { Mail, MessageSquare, Share2, Linkedin, Instagram } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { setCursorState } = useCursor();

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const elements = sectionRef.current!.querySelectorAll('.animate-in');
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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

  return (
    <section ref={sectionRef} id="contact" className="relative w-full pt-32 md:pt-64 pb-16 md:pb-32">
      <div className="max-w-container mx-auto px-8 md:px-16 text-center">
        {/* Availability Badge */}
        <div className="animate-in inline-flex items-center gap-2.5 px-5 py-2.5 border border-success/30 rounded-pill bg-success/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-label text-success font-medium">Available for new projects</span>
        </div>

        {/* Main Heading */}
        <h2 className="animate-in text-h3 text-text-primary mb-6">
          Let's create something amazing together
        </h2>

        {/* Subheading */}
        <p className="animate-in text-body-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
          Have a project in mind? I'd love to hear about it. Let's discuss how we can work together to bring your vision to life.
        </p>

        {/* Contact Deck Grid */}
        <div className="animate-in grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 text-left">
          {/* Email Card */}
          <div className="flex">
            <GlassCard
              enableTilt={true}
              style={{ width: '100%' }}
              className="flex flex-col justify-between h-full p-6 border border-white/[0.05] hover:border-accent/30 transition-all duration-500 w-full rounded-2xl bg-black/10"
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
            >
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-accent/[0.05] border border-accent/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-body-lg font-body font-bold text-text-primary mb-2">
                  Email Inquiry
                </h3>
                <p className="text-caption text-text-secondary/70 leading-relaxed font-light mb-6">
                  For official projects, contracts, consultancy, or long-form business inquiries.
                </p>
              </div>
              <div className="pt-4 border-t border-white/[0.04]">
                <span className="block text-[11px] font-mono text-text-tertiary mb-2 break-all select-all">
                  hamzarehmankhan001@gmail.com
                </span>
                <a
                  href="mailto:hamzarehmankhan001@gmail.com"
                  className="text-caption font-semibold text-accent hover:text-[#33DDFF] transition-colors flex items-center gap-1.5 self-start group/btn"
                >
                  Shoot an Email <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </GlassCard>
          </div>

          {/* WhatsApp Card */}
          <div className="flex">
            <GlassCard
              enableTilt={true}
              style={{ width: '100%' }}
              className="flex flex-col justify-between h-full p-6 border border-white/[0.05] hover:border-emerald-500/30 transition-all duration-500 w-full rounded-2xl bg-black/10"
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
            >
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-emerald-500/[0.05] border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-body-lg font-body font-bold text-text-primary mb-2">
                  Direct Chat
                </h3>
                <p className="text-caption text-text-secondary/70 leading-relaxed font-light mb-6">
                  For rapid feedback, instant messaging, brainstorm ideas, or direct consultation.
                </p>
              </div>
              <div className="pt-4 border-t border-white/[0.04]">
                <span className="block text-[11px] font-mono text-text-tertiary mb-2">
                  +92 370 1929406
                </span>
                <a
                  href="https://wa.me/923701929406"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 self-start group/btn"
                >
                  Chat on WhatsApp <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </GlassCard>
          </div>

          {/* Socials Card */}
          <div className="flex">
            <GlassCard
              enableTilt={true}
              style={{ width: '100%' }}
              className="flex flex-col justify-between h-full p-6 border border-white/[0.05] hover:border-violet-500/30 transition-all duration-500 w-full rounded-2xl bg-black/10"
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
            >
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-violet-500/[0.05] border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                  <Share2 className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-body-lg font-body font-bold text-text-primary mb-2">
                  Social Channels
                </h3>
                <p className="text-caption text-text-secondary/70 leading-relaxed font-light mb-6">
                  Follow my developer updates, see recent design showcases, and connect on professional networks.
                </p>
              </div>
              <div className="pt-4 border-t border-white/[0.04] flex flex-col gap-2">
                <a
                  href="https://www.linkedin.com/in/hamza-rehman-577116360"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 border border-white/[0.08] hover:border-accent/40 rounded-xl flex items-center justify-center gap-2 text-caption text-text-secondary hover:text-text-primary bg-white/[0.01] hover:bg-accent/[0.02] transition-all duration-300"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn Profile</span>
                </a>
                <a
                  href="https://www.instagram.com/hamza.__.rehman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 border border-white/[0.08] hover:border-accent/40 rounded-xl flex items-center justify-center gap-2 text-caption text-text-secondary hover:text-text-primary bg-white/[0.01] hover:bg-accent/[0.02] transition-all duration-300"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram Profile</span>
                </a>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
