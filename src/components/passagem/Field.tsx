import type { ReactNode } from 'react';
import type { RondaStatus } from '../../store/passagem';

// Cabeçalho de cada etapa: número, título e instrução curta.
export function StepShell({
  numero,
  titulo,
  instrucao,
  children
}: {
  numero: number;
  titulo: string;
  instrucao: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 rounded-xl border border-white/80 bg-white/70 px-4 py-3 shadow-[0_3px_10px_rgba(15,92,153,0.06)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0F5C99]">Etapa {numero}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#4A6B85]">{instrucao}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

// Rótulo + campo.
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[#2E9BE6] focus:ring-2 focus:ring-[#2E9BE6]/20';

// Botão segmentado (Em ordem / Alteração / N/A, ou Sim / Não).
export function Segmented<T extends string>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; tone?: 'ok' | 'alert' | 'neutral' }[];
}) {
  return (
    <div className="inline-flex gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        const tone = opt.tone ?? 'neutral';
        const activeClass =
          tone === 'alert'
            ? 'bg-primary text-white border-primary'
            : tone === 'ok'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-ink text-white border-ink';
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
              active ? activeClass : 'border-line bg-white text-neutral-600 hover:border-neutral-400'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const STATUS_OPTS: { value: RondaStatus; label: string; tone: 'ok' | 'alert' | 'neutral' }[] = [
  { value: 'em_ordem', label: 'S/N', tone: 'ok' },
  { value: 'alteracao', label: 'C/N', tone: 'alert' },
  { value: 'na', label: 'N/A', tone: 'neutral' }
];
