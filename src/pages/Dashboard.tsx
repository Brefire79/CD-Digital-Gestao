import { CalendarClock, ClipboardCheck, FileText, ListChecks, Settings, Truck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { useOperational } from '../contexts/OperationalContext';
import { buildMonthlyScale, getCurrentProntidaoName, prontidaoColors } from '../lib/prontidaoScale';

export function Dashboard() {
  const { escala, pendencias, prontidoes, escalaHoraria, relatos } = useOperational();
  const [showCalendar, setShowCalendar] = useState(() => window.localStorage.getItem('cd_show_monthly_scale') === 'true');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const prontidao = getCurrentProntidaoName();
  const prontidaoDb = prontidoes.find((item) => item.nome === prontidao) ?? prontidoes.find((item) => item.id === escala.prontidao_id);
  const monthCells = buildMonthlyScale(currentDate.getFullYear(), currentDate.getMonth());
  const color = prontidaoColors[prontidao];
  const abertas = pendencias.filter((item) => item.status === 'Aberta').length;
  const dataPlantao = currentDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const horaPlantao = currentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  useEffect(() => {
    window.localStorage.setItem('cd_show_monthly_scale', String(showCalendar));
  }, [showCalendar]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDate(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const modules = [
    { to: '/passagem-servico', label: 'Passagem de Serviço', detail: 'Checklist e assinatura do Cabo de Dia', icon: ClipboardCheck },
    { to: '/escala-dia', label: 'Escala do Dia', detail: escala.cabo_dia, icon: Users },
    { to: '/escala-horaria', label: 'Escala Horária', detail: `${escalaHoraria.length} horários gerados`, icon: CalendarClock },
    { to: '/livro-motoristas', label: 'Livro dos Motoristas', detail: `${relatos.length} viaturas no plantão`, icon: Truck },
    { to: '/pendencias', label: 'Pendências Abertas', detail: `${abertas} itens exigem atenção`, icon: ListChecks },
    { to: '/relatorios', label: 'Relatórios', detail: 'PDFs preparados para geração', icon: FileText },
    { to: '/admin', label: 'Administração', detail: 'Usuários, viaturas, setores e prontidões', icon: Settings }
  ];

  return (
    <div className="grid gap-4">
      <Card className="bg-gradient-to-br from-operacional-panel to-slate-950">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr_auto] lg:items-center">
          <div>
            <p className="text-sm text-slate-300">Prontidão atual</p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-3xl font-black">{prontidao}</h2>
              <span className={`h-9 w-9 rounded-lg border-2 ${color.bg} ${color.border}`} aria-label={`Cor da prontidão ${prontidao}`} />
            </div>
            <p className="mt-2 text-sm text-slate-400">Regime 24x48 em rotação contínua. Referência operacional: {prontidaoDb?.nome ?? prontidao}.</p>
          </div>
          <div className="rounded-xl border border-operacional-accent/40 bg-slate-950/80 p-4 text-center shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-operacional-accent">Data e hora do plantão</p>
            <h1 className="mt-2 text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">{horaPlantao}</h1>
            <p className="mt-3 text-lg font-black capitalize text-slate-100 sm:text-2xl">{dataPlantao}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={abertas > 0 ? 'Aberta' : 'OK'} />
            <Button
              type="button"
              variant="secondary"
              className="min-h-10 px-3 py-2 text-xs"
              onClick={() => setShowCalendar((current) => !current)}
            >
              {showCalendar ? 'Ocultar calendário' : 'Ver escala 24x48'}
            </Button>
          </div>
        </div>
      </Card>
      {showCalendar && (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Escala 24x48 do mês</h3>
              <p className="text-sm text-slate-400">Turno de 24 horas e folga de 48 horas por prontidão.</p>
            </div>
            <span className="rounded-full bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {monthCells.map((cell) => {
              const cellColor = prontidaoColors[cell.prontidao];
              const isToday = cell.date.toDateString() === currentDate.toDateString();
              return (
                <div
                  key={cell.id}
                  className={`flex aspect-square flex-col justify-between rounded-md p-1.5 ${cellColor.bg} ${cellColor.text} ${cell.isCurrentMonth ? '' : 'opacity-35'} ${isToday ? 'ring-2 ring-white' : ''}`}
                >
                  <span className="text-right text-xs font-black">{cell.day}</span>
                  <span className="truncate text-left text-[9px] font-bold">{cell.prontidao}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ to, label, detail, icon: Icon }) => (
          <Link key={to} to={to} className="rounded-lg border border-slate-800 bg-operacional-panel p-4 transition hover:border-operacional-accent">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-operacional-accent">
              <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold">{label}</h3>
            <p className="mt-2 text-sm text-slate-400">{detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
