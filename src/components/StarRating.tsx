import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, size = 20, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? 'rgba(0, 212, 255, 0.15)' : 'none'}
          stroke={i < rating ? '#00D4FF' : 'rgba(183, 183, 183, 0.4)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}
