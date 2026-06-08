import { InputHTMLAttributes } from 'react';

export function FormInput({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span>{label}</span>
      <input
        className={`min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-operacional-accent ${className}`}
        {...props}
      />
    </label>
  );
}
