import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-operacional-accent text-slate-950 hover:bg-yellow-300',
  secondary: 'bg-slate-800 text-white ring-1 ring-slate-700 hover:bg-slate-700',
  ghost: 'bg-transparent text-slate-200 hover:bg-slate-800',
  danger: 'bg-operacional-fire text-white hover:bg-red-700'
};

export function Button({ className = '', variant = 'primary', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      className={`min-h-12 rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
