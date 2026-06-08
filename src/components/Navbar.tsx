import { ClipboardCheck, FileText, Home, ListChecks, Truck, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/escala-dia', label: 'Escala', icon: Users },
  { to: '/passagem-servico', label: 'Passagem', icon: ClipboardCheck },
  { to: '/livro-motoristas', label: 'Viaturas', icon: Truck },
  { to: '/pendencias', label: 'Pendências', icon: ListChecks },
  { to: '/relatorios', label: 'Relatórios', icon: FileText }
];

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 px-2 pb-2 pt-2 backdrop-blur md:bottom-auto md:left-0 md:top-0 md:h-screen md:w-64 md:border-r md:border-t-0 md:px-4 md:py-6">
      <div className="hidden pb-6 md:block">
        <p className="text-xs uppercase tracking-widest text-operacional-accent">CD Digital</p>
        <h1 className="mt-1 text-xl font-bold text-white">Prontidão Operacional</h1>
      </div>
      <div className="grid grid-cols-6 gap-1 md:grid-cols-1 md:gap-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center rounded-lg px-2 text-[11px] font-semibold transition md:min-h-12 md:flex-row md:justify-start md:gap-3 md:text-sm ${
                isActive ? 'bg-operacional-accent text-slate-950' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
