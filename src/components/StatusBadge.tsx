import type { StatusChecklist, StatusPendencia } from '../types/domain';

const colors: Record<string, string> = {
  OK: 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30',
  'Com alteração': 'bg-red-400/15 text-red-200 ring-red-400/30',
  Aberta: 'bg-yellow-400/15 text-yellow-100 ring-yellow-400/30',
  'Em andamento': 'bg-sky-400/15 text-sky-100 ring-sky-400/30',
  Resolvida: 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30',
  Arquivada: 'bg-slate-500/20 text-slate-200 ring-slate-500/30'
};

export function StatusBadge({ status }: { status: StatusChecklist | StatusPendencia | string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${colors[status] ?? colors.Arquivada}`}>
      {status}
    </span>
  );
}
