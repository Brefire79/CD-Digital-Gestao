import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePassagem, type WizardStep } from '../../store/passagem';
import { BrandMark } from './BrandMark';

const MODULOS: Array<{ titulo: string; step: WizardStep }> = [
  { titulo: 'Viaturas', step: 0 },
  { titulo: 'Ronda Quartel', step: 2 },
  { titulo: 'Escala de Hora', step: 3 },
  { titulo: 'Livro dos Motoristas', step: 4 },
  { titulo: 'Relatórios', step: 5 }
];

const CORES_PRONTIDAO: Record<string, string> = {
  Azul: '#2E9BE6',
  Verde: '#1E8E5A',
  Amarela: '#E8B33D'
};

export function PassagemMenu() {
  const header = usePassagem((s) => s.header);
  const abrirTela = usePassagem((s) => s.abrirTela);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const cor = CORES_PRONTIDAO[header.prontidao] ?? CORES_PRONTIDAO.Azul;

  async function sair() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="passagem-stage passagem-menu-stage">
      <div className="passagem-device passagem-menu-device">
        <header className="passagem-menu-header">
          <BrandMark size={44} className="border-2 border-[#E8B33D]" />
          <h1 className="passagem-brand-title">Troca de SV Digital</h1>
          <button type="button" onClick={sair} className="passagem-icon-button" aria-label="Encerrar sessão" title="Encerrar sessão">
            <LogOut size={17} />
          </button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col bg-[#D9EEFA]">
          <div className="passagem-menu-prontidao">
            <div className="passagem-prontidao-pill">
              <span className="h-[9px] w-[9px] rounded-full" style={{ backgroundColor: cor }} />
              PRONTIDÃO {header.prontidao.toUpperCase()}
            </div>
          </div>

          <nav className="passagem-menu-nav" aria-label="Módulos da troca de serviço">
            {MODULOS.map((modulo) => (
              <button
                key={modulo.titulo}
                type="button"
                onClick={() => abrirTela(modulo.step)}
                className="passagem-menu-card"
              >
                {modulo.titulo}
              </button>
            ))}
          </nav>
        </main>

        <footer className="passagem-footer">Corpo de Bombeiros · SP</footer>
      </div>
    </div>
  );
}
