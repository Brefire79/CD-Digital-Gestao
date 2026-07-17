import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePassagem } from '../../store/passagem';

const TITULOS = ['Viaturas', 'Viaturas', 'Ronda Quartel', 'Escala de Hora', 'Livro dos Motoristas', 'Relatórios'];
const CORES_PRONTIDAO: Record<string, string> = {
  Azul: '#2E9BE6',
  Verde: '#1E8E5A',
  Amarela: '#E8B33D'
};

export function WizardLayout({ children }: { children: ReactNode }) {
  const step = usePassagem((s) => s.step);
  const header = usePassagem((s) => s.header);
  const voltarMenu = usePassagem((s) => s.voltarMenu);
  const cor = CORES_PRONTIDAO[header.prontidao] ?? CORES_PRONTIDAO.Azul;

  return (
    <div className="passagem-stage">
      <div className="passagem-device">
        <header className="passagem-screen-header">
          <button type="button" onClick={voltarMenu} className="passagem-icon-button" aria-label="Voltar ao menu">
            <ArrowLeft size={18} />
          </button>
          <h1 className="passagem-screen-title">{TITULOS[step]}</h1>
          <div className="passagem-header-pill">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cor }} />
            {header.prontidao.toUpperCase()}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#D9EEFA] px-4 py-4 sm:px-5">
          <div className="mx-auto w-full max-w-2xl">{children}</div>
        </main>

        <footer className="passagem-footer">Corpo de Bombeiros · SP</footer>
      </div>
    </div>
  );
}

export function StepNav({
  onNext,
  onPrev,
  nextLabel = 'Próximo',
  showPrev = true
}: {
  onNext: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  showPrev?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {showPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="min-h-12 rounded-xl border border-[#C9DCE9] bg-white px-5 text-sm font-bold text-[#4A6B85] transition hover:border-[#0F5C99]"
        >
          Voltar
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        className="min-h-12 flex-1 rounded-xl bg-[#0F5C99] px-5 text-sm font-bold uppercase text-white transition hover:brightness-110"
      >
        {nextLabel} →
      </button>
    </div>
  );
}
