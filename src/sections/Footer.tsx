import { useCursor } from '@/context/CursorContext';

export function Footer() {
  const { setCursorState } = useCursor();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full py-8 md:py-12 border-t border-text-secondary/[0.08]">
      <div className="max-w-container mx-auto px-8 md:px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand + Copyright */}
          <div className="flex items-center gap-3">
            <span className="text-label font-display font-medium text-text-primary lowercase">
              hamza rehman
            </span>
            <span className="text-caption text-text-tertiary">© 2026</span>
          </div>

          {/* Back to Top */}
          <button
            onClick={handleBackToTop}
            onMouseEnter={() => setCursorState('interactive')}
            onMouseLeave={() => setCursorState('default')}
            className="text-caption text-text-secondary hover:text-accent transition-colors duration-300 relative group"
          >
            Back to Top
            <span className="inline-block ml-1 transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
            <span className="absolute bottom-0 left-0 w-full h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
          </button>
        </div>
      </div>
    </footer>
  );
}
