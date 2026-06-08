import { SelectHTMLAttributes } from 'react';

export function Select({ label, children, className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span>{label}</span>
      <select
        className={`min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-operacional-accent ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
