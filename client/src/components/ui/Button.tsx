import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ghostLight' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-[0_14px_30px_-16px_rgba(255,77,28,0.85)] hover:-translate-y-0.5 hover:bg-accent-deep hover:shadow-[0_18px_36px_-12px_rgba(255,77,28,0.9)]',
  secondary: 'bg-ink text-cream shadow-soft hover:-translate-y-0.5 hover:bg-black hover:shadow-lift',
  ghost: 'border border-line bg-white text-ink shadow-soft hover:-translate-y-0.5 hover:border-ink',
  ghostLight: 'border border-white/25 bg-white/5 text-cream hover:-translate-y-0.5 hover:border-white hover:bg-white/10',
  danger: 'border border-red-200 bg-white text-danger shadow-soft hover:-translate-y-0.5 hover:bg-red-50',
};

export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition duration-300 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
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
