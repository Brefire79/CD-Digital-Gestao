import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-slate-800 bg-operacional-panel/90 p-4 shadow-soft ${className}`}>
      {children}
    </section>
  );
}
