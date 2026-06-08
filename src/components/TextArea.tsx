import { TextareaHTMLAttributes } from 'react';

export function TextArea({ label, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span>{label}</span>
      <textarea
        className={`min-h-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-operacional-accent ${className}`}
        {...props}
      />
    </label>
  );
}
