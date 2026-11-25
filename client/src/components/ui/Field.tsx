import type { ReactNode } from 'react';
import { cx } from '@/lib/format';

const control =
  'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-soft outline-none transition duration-300 placeholder:text-stone focus:-translate-y-px focus:border-accent focus:shadow-[0_0_0_4px_rgba(255,77,28,0.12)]';

export function fieldClass(invalid?: boolean, className?: string) {
  return cx(control, invalid && 'border-danger focus:border-danger', className);
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-stone">{hint}</p>
      ) : null}
    </div>
  );
}
