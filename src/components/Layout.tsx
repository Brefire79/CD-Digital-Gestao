import { Menu, Shield, UserCircle } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { Navbar } from './Navbar';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/escala-dia': 'Escala do Dia',
  '/escala-horaria': 'Escala Horária',
  '/passagem-servico': 'Passagem de Serviço',
  '/checklist-quartel': 'Checklist do Quartel',
  '/livro-motoristas': 'Livro dos Motoristas',
  '/relato-viaturas': 'Relato de Viaturas',
  '/pendencias': 'Pendências',
  '/relatorios': 'Relatórios',
  '/admin': 'Administração',
  '/viaturas': 'Viaturas',
  '/setores': 'Setores do Quartel'
};

export function Layout() {
  const { pathname } = useLocation();
  const { user, signOut, demoMode } = useAuth();

  return (
    <div className="min-h-screen screen-gradient text-white">
      <Navbar />
      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-28 pt-4 md:ml-64 md:px-8 md:pb-10">
        <header className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-operacional-fire">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-operacional-accent">{demoMode ? 'Modo demonstração' : 'Supabase conectado'}</p>
              <h2 className="text-lg font-bold">{titles[pathname] ?? 'CD Digital'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
              <UserCircle size={18} />
              <span>{user?.email}</span>
            </div>
            <Button variant="ghost" className="hidden md:inline-flex" onClick={signOut}>Sair</Button>
            <Menu className="md:hidden" size={22} />
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
