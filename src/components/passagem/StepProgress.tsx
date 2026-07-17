import { BookOpen, Check, Clock, ClipboardList, Truck, Users } from 'lucide-react';
import { usePassagem, type WizardStep } from '../../store/passagem';

const RAIL = [
  { step: 0 as WizardStep, label: 'VTR', Icon: Truck },
  { step: 1 as WizardStep, label: 'Guarnição', Icon: Users },
  { step: 2 as WizardStep, label: 'Ronda', Icon: ClipboardList },
  { step: 3 as WizardStep, label: 'Escala', Icon: Clock },
  { step: 4 as WizardStep, label: 'Livro', Icon: BookOpen }
];

export function StepProgress({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const step = usePassagem((s) => s.step);
  const setStep = usePassagem((s) => s.setStep);

  // Etapas já abertas são navegáveis (Cabo de Dia pode voltar para conferir VTR/Guarnição).
  const muted = variant === 'dark' ? 'text-neutral-500' : 'text-neutral-400';
  const labelBase = variant === 'dark' ? 'text-neutral-400' : 'text-neutral-500';

  return (
    <nav aria-label="Etapas da passagem" className="flex items-center justify-between gap-1">
      {RAIL.map(({ step: s, label, Icon }) => {
        const done = step > s || step === 5;
        const active = step === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full border text-[13px] transition ${
                active
                  ? 'border-primary bg-primary text-white'
                  : done
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : `border-line ${muted}`
              }`}
            >
              {done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wide ${
                active ? 'text-primary' : done ? 'text-emerald-700' : labelBase
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
