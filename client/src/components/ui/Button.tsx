import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ghostLight' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-[0_12px_30px_-14px_rgba(255,77,28,0.95)] hover:bg-accent-deep',
  secondary: 'bg-ink text-cream hover:bg-black',
  ghost: 'border border-line bg-transparent text-ink hover:border-ink',
  ghostLight: 'border border-white/25 bg-transparent text-cream hover:border-white',
  danger: 'border border-red-200 bg-white text-danger hover:bg-red-50',
};

export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

export function Button({ variant = 'primary', loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button className={buttonClass(variant, className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
