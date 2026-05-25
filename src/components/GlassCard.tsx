import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
  enableGlare?: boolean;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function GlassCard({
  children,
  className,
  enableTilt = true,
  enableGlare = true,
  style,
  onMouseEnter,
  onMouseLeave,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableGlare || !glareRef.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    glareRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
    glareRef.current.style.opacity = '1';
  }, [enableGlare]);

  const handleMouseLeave = useCallback(() => {
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
    onMouseLeave?.();
  }, [onMouseLeave]);

  return (
    <div className={cn('perspective-container', enableTilt && 'group')} style={style}>
      <div
        ref={cardRef}
        className={cn(
          'glass-card',
          enableTilt && 'preserve-3d transition-transform duration-500 ease-out group-hover:translate-y-[-4px]',
          enableTilt && '[transform:rotateX(8deg)_rotateY(-8deg)] group-hover:[transform:rotateX(4deg)_rotateY(-4deg)]',
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {enableGlare && (
          <div
            ref={glareRef}
            className="absolute inset-0 rounded-inherit pointer-events-none opacity-0 transition-opacity duration-300"
            style={{ borderRadius: 'inherit' }}
          />
        )}
      </div>
    </div>
  );
}
