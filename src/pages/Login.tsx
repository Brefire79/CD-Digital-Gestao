import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/passagem/BrandMark';
import { inputClass } from '../components/passagem/Field';
import { inferirPerfil } from '../components/passagem/perfil';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentProntidaoName } from '../lib/prontidaoScale';
import { usePassagem, type Perfil } from '../store/passagem';

const PRONTIDOES = ['Azul', 'Verde', 'Amarela'] as const;

export function Login() {
  const { signIn, demoMode } = useAuth();
  const { iniciarTroca } = usePassagem();
  const navigate = useNavigate();
  const [login, setLogin] = useState('1sgt.andrade');
  const [senha, setSenha] = useState('');
  const [prontidao, setProntidao] = useState<(typeof PRONTIDOES)[number]>(getCurrentProntidaoName());
  const [quartel, setQuartel] = useState('1º GBM — Sede');
  const [data] = useState(
    new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar(perfilForcado?: Perfil) {
    setLoading(true);
    setError('');
    try {
      await signIn(login.includes('@') ? login : `${login}@quartel.local`, senha);
      const perfil = perfilForcado ?? inferirPerfil(login);
      iniciarTroca(perfil, { login, prontidao, quartel, data, caboDia: perfil === 'cabo_dia' ? login : '' });
      navigate('/passagem-servico');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    entrar();
  }

  return (
    <div className="passagem-stage">
      <div className="passagem-device bg-[#B3181F]">
        <section className="login-brand-panel">
          <div className="login-orb login-orb-top" />
          <div className="login-orb login-orb-bottom" />
          <BrandMark size={120} className="relative z-10 border-[3px] border-[#E8B33D] shadow-[0_8px_24px_rgba(0,0,0,0.25)]" />
          <h1 className="relative z-10 mt-4 font-condensed text-[30px] font-bold uppercase leading-none tracking-wide text-white">
            Troca de SV Digital
          </h1>
          <p className="relative z-10 mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F1C24B]">
            Corpo de Bombeiros · SP
          </p>
        </section>

        <form onSubmit={handleSubmit} className="login-form-panel">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8A8A8F]">Usuário</span>
            <input
              className={`${inputClass} bg-[#FAFAFA] py-3`}
              placeholder="RE ou matrícula"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8A8A8F]">Senha</span>
            <input
              type="password"
              className={`${inputClass} bg-[#FAFAFA] py-3`}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button
            type="button"
            onClick={() => setError('Para redefinir a senha, solicite o reset ao administrador da unidade.')}
            className="ml-auto mt-2 block text-sm font-semibold text-[#B3181F]"
          >
            Esqueci minha senha
          </button>

          <details className="mt-3 rounded-xl border border-[#E5E5E7] bg-[#FAFAFA] px-3 py-2 text-sm text-[#4A6B85]">
            <summary className="cursor-pointer font-semibold">Dados do plantão</summary>
            <div className="mt-3 grid gap-3">
              <div className="grid grid-cols-3 gap-2">
                {PRONTIDOES.map((nome) => (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => setProntidao(nome)}
                    className={`rounded-lg border px-2 py-2 text-xs font-bold ${
                      prontidao === nome ? 'border-[#2E9BE6] bg-[#EAF4FC] text-[#0F5C99]' : 'border-line bg-white'
                    }`}
                  >
                    {nome}
                  </button>
                ))}
              </div>
              <input className={inputClass} value={quartel} onChange={(e) => setQuartel(e.target.value)} aria-label="Quartel" />
              <input className={`${inputClass} bg-neutral-100`} value={data} readOnly aria-label="Data do plantão" />
            </div>
          </details>

          {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-[#B3181F]">{error}</p>}
          {demoMode && <p className="mt-3 text-xs text-amber-700">Modo demonstração local ativo.</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-[14px] bg-[#B3181F] px-5 py-3.5 text-base font-bold uppercase tracking-wide text-white shadow-[0_6px_16px_rgba(179,24,31,0.35)] transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {demoMode && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => entrar('sgt')} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-[#4A6B85]">
                Entrar como Sgt
              </button>
              <button type="button" onClick={() => entrar('cabo_dia')} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-[#4A6B85]">
                Entrar como Cabo de Dia
              </button>
            </div>
          )}

          <p className="mt-4 text-center text-[11px] text-[#A3A3A8]">Acesso restrito a guarnições autorizadas</p>
        </form>
      </div>
    </div>
  );
}
