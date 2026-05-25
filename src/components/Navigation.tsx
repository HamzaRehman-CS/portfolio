import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useCursor } from '@/context/CursorContext';
import { useIsMobile } from '@/hooks/useMediaQuery';

const navLinks = [
  { label: 'about', href: '#hero' },
  { label: 'services', href: '#services' },
  { label: 'works', href: '#works' },
  { label: 'experience', href: '#experience' },
  { label: 'certificates', href: '#certificates' },
  { label: 'skills', href: '#skills' },
  { label: 'testimonials', href: '#testimonials' },
  { label: 'contact', href: '#contact' },
];

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { setCursorState } = useCursor();
  const isMobile = useIsMobile();

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-nav px-8 py-6 md:px-16 md:py-8">
        <div className="max-w-container mx-auto flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="text-label font-display text-text-primary tracking-wider lowercase font-bold"
            onMouseEnter={() => setCursorState('interactive')}
            onMouseLeave={() => setCursorState('default')}
          >
            hamza rehman
          </a>

          {/* Desktop Nav Links */}
          {!isMobile && (
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  onMouseEnter={() => {
                    setHoveredLink(link.label);
                    setCursorState('interactive');
                  }}
                  onMouseLeave={() => {
                    setHoveredLink(null);
                    setCursorState('default');
                  }}
                  className={cn(
                    'text-label text-text-secondary transition-all duration-300 relative lowercase',
                    hoveredLink === link.label && 'text-text-primary text-glow'
                  )}
                >
                  <span className={cn(
                    'inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 transition-transform duration-500 ease-out',
                    hoveredLink === link.label ? 'scale-100' : 'scale-0'
                  )} />
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* CTA Button / Hamburger */}
          {!isMobile ? (
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
              className="px-6 py-2.5 border border-accent/60 rounded-pill text-label text-accent hover:bg-accent hover:text-bg-primary transition-all duration-400"
            >
              Get in touch
            </a>
          ) : (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
              className="w-8 h-8 flex flex-col justify-center items-center gap-1.5 z-[110]"
              aria-label="Toggle menu"
            >
              <span className={cn(
                'w-6 h-[1.5px] bg-text-primary transition-all duration-300',
                mobileOpen && 'rotate-45 translate-y-[4.5px]'
              )} />
              <span className={cn(
                'w-6 h-[1.5px] bg-text-primary transition-all duration-300',
                mobileOpen && 'opacity-0'
              )} />
              <span className={cn(
                'w-6 h-[1.5px] bg-text-primary transition-all duration-300',
                mobileOpen && '-rotate-45 -translate-y-[4.5px]'
              )} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        'fixed inset-0 z-[105] bg-bg-primary/98 backdrop-blur-lg flex flex-col items-center justify-center transition-all duration-500',
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}>
        <div className="flex flex-col items-center gap-8">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
              className="text-h4 text-text-primary lowercase hover:text-accent transition-colors duration-300"
              style={{
                transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms',
                transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: mobileOpen ? 1 : 0,
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
