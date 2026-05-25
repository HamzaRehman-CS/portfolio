import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useCursor } from '@/context/CursorContext';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function CustomCursor() {
  const { cursorState } = useCursor();
  const isMobile = useIsMobile();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    if (isMobile || !dotRef.current || !ringRef.current) return;

    quickX.current = gsap.quickTo(dotRef.current, 'x', { duration: 0.05, ease: 'power2.out' });
    quickY.current = gsap.quickTo(dotRef.current, 'y', { duration: 0.05, ease: 'power2.out' });

    const ringQuickX = gsap.quickTo(ringRef.current, 'x', { duration: 0.08, ease: 'power2.out' });
    const ringQuickY = gsap.quickTo(ringRef.current, 'y', { duration: 0.08, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      quickX.current?.(e.clientX - 4);
      quickY.current?.(e.clientY - 4);
      ringQuickX(e.clientX - 20);
      ringQuickY(e.clientY - 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile || !ringRef.current || !dotRef.current) return;

    switch (cursorState) {
      case 'interactive':
        gsap.to(ringRef.current, { scale: 1.5, opacity: 1, duration: 0.3 });
        gsap.to(dotRef.current, { scale: 0.5, duration: 0.3 });
        break;
      case 'drag':
        gsap.to(ringRef.current, { scale: 1.3, opacity: 0.8, duration: 0.3 });
        break;
      case 'text':
        gsap.to(ringRef.current, { scale: 0.8, opacity: 0.4, duration: 0.3 });
        break;
      default:
        gsap.to(ringRef.current, { scale: 1, opacity: 0.5, duration: 0.3 });
        gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
    }
  }, [cursorState, isMobile]);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-cursor">
      <div
        ref={dotRef}
        className="absolute w-2 h-2 rounded-full bg-accent"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="absolute w-10 h-10 opacity-50"
        style={{ willChange: 'transform' }}
      >
        <svg viewBox="0 0 40 40" className="w-full h-full animate-cursor-ring">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="rgba(0, 212, 255, 0.4)"
            strokeWidth="1"
            strokeDasharray="80 30"
          />
        </svg>
      </div>
    </div>
  );
}
