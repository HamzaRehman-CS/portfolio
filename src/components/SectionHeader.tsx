import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  label: string;
  heading: string;
  className?: string;
  centered?: boolean;
}

export function SectionHeader({ label, heading, className, centered = false }: SectionHeaderProps) {
  return (
    <div className={cn(centered && 'text-center', className)}>
      <span className="text-label text-text-tertiary block mb-4">{label}</span>
      <h2 className="text-h2 text-text-primary">{heading}</h2>
    </div>
  );
}
