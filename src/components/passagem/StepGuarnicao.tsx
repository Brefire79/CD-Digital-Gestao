import { Plus, Trash2 } from 'lucide-react';
import {
  FUNCOES_GUARNICAO,
  inferirTipoVtrPlantao,
  usePassagem,
  type ClasseVtr,
  type FuncaoGuarnicao,
  type TipoVtrPlantao
} from '../../store/passagem';
import { StepShell, inputClass } from './Field';
import { StepNav } from './WizardLayout';

const funcaoLabels: Record<FuncaoGuarnicao, string> = {
  Comandante: 'CMT da VTR',
  Condutor: 'Mot VTR',
  Telegrafista: 'Telegrafista',
  Operador: 'Operador',
  Auxiliar: 'Auxiliar',
  Estagiário: 'Estagiário'
};

const tipoLabels: Record<TipoVtrPlantao, string> = {
  incendio: 'VTR de Incêndio',
  resgate: 'Unidade de Resgate',
  canil: 'Viatura do Canil',
  od: 'Viatura OD (informativa)',
  outra: 'Outra VTR'
};

function classeDaVtr(tipo: TipoVtrPlantao): ClasseVtr {
  if (tipo === 'resgate') return 'UR';
  if (tipo === 'incendio') return 'ABS';
  if (tipo === 'canil') return 'CANIL';
  if (tipo === 'od') return 'OD';
  return '';
}

export function StepGuarnicao() {
  const vtrs = usePassagem((s) => s.vtrs);
  const guarnicao = usePassagem((s) => s.guarnicao);
  const addMembro = usePassagem((s) => s.addMembro);
  const updateMembro = usePassagem((s) => s.updateMembro);
  const removeMembro = usePassagem((s) => s.removeMembro);
  const next = usePassagem((s) => s.next);
  const prev = usePassagem((s) => s.prev);

  const membrosSemVtr = guarnicao.filter((m) => !m.vtrId);

  return (
    <StepShell
      numero={2}
      titulo="Guarnição"
      instrucao="Complete os militares por VTR. Incêndio e UR seguem CMT, Mot, Auxiliar e Estagiário opcional."
    >
      <div className="grid gap-4">
        {vtrs.map((vtr) => {
          const tipo = vtr.tipoPlantao ?? inferirTipoVtrPlantao(vtr.prefixo);
          const membros = guarnicao.filter((m) => m.vtrId === vtr.id);
          const classe = classeDaVtr(tipo);

          return (
            <section key={vtr.id} className="rounded-lg border border-line bg-surface p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-ink">{vtr.prefixo}</h3>
                  <p className="text-xs font-semibold text-neutral-500">{tipoLabels[tipo]}</p>
                </div>
                {tipo === 'outra' ? (
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-neutral-500">
                    Cabo de Dia complementa
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                    Postos abertos
                  </span>
                )}
              </div>

              {membros.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line bg-white p-3 text-sm text-neutral-500">
                  Esta VTR foi registrada sem guarnição automática. O Cabo de Dia pode complementar depois.
                </p>
              ) : (
                <div className="grid gap-2">
                  <div className="hidden grid-cols-[132px_1fr_40px] gap-2 px-1 text-[11px] font-bold uppercase tracking-wide text-neutral-500 sm:grid">
                    <span>Posto</span>
                    <span>Nome / Graduação</span>
                    <span />
                  </div>
                  {membros.map((m) => (
                    <div key={m.id} className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[132px_1fr_40px]">
                      <select
                        className={`${inputClass} col-span-2 sm:col-span-1`}
                        value={m.funcao}
                        onChange={(e) => updateMembro(m.id, { funcao: e.target.value as FuncaoGuarnicao })}
                      >
                        {FUNCOES_GUARNICAO.map((f) => (
                          <option key={f} value={f}>
                            {funcaoLabels[f]}
                          </option>
                        ))}
                      </select>
                      <input
                        className={inputClass}
                        placeholder={m.opcional ? 'Estagiário, se houver' : 'Ex.: 1º Sgt Andrade'}
                        value={m.nome}
                        onChange={(e) => updateMembro(m.id, { nome: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => removeMembro(m.id)}
                        className="hidden place-items-center text-neutral-400 transition hover:text-primary sm:grid"
                        aria-label="Remover membro"
                      >
                        <Trash2 size={18} />
                      </button>
                      {m.opcional && (
                        <p className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 sm:col-start-2">
                          Opcional
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tipo !== 'od' && (
                <button
                  type="button"
                  onClick={() => addMembro({ vtrId: vtr.id, vtrPrefixo: vtr.prefixo, viatura: classe })}
                  className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg border border-primary px-3 py-2 text-xs font-bold uppercase text-primary transition hover:bg-primary hover:text-white"
                >
                  <Plus size={14} /> Adicionar reforço
                </button>
              )}
            </section>
          );
        })}

        {vtrs.length === 0 && (
          <p className="rounded-lg border border-dashed border-line bg-surface p-4 text-sm text-neutral-500">
            Nenhuma VTR lançada. Volte para adicionar as VTRs do posto antes de completar a guarnição.
          </p>
        )}

        {membrosSemVtr.length > 0 && (
          <section className="rounded-lg border border-line bg-white p-3">
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-ink">Complementos do plantão</h3>
            <div className="grid gap-2">
              {membrosSemVtr.map((m) => (
                <div key={m.id} className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_150px_40px]">
                  <input
                    className={inputClass}
                    placeholder="Ex.: 1º Sgt Andrade"
                    value={m.nome}
                    onChange={(e) => updateMembro(m.id, { nome: e.target.value })}
                  />
                  <select
                    className={`${inputClass} col-span-2 sm:col-span-1`}
                    value={m.funcao}
                    onChange={(e) => updateMembro(m.id, { funcao: e.target.value as FuncaoGuarnicao })}
                  >
                    {FUNCOES_GUARNICAO.map((f) => (
                      <option key={f} value={f}>
                        {funcaoLabels[f]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeMembro(m.id)}
                    className="hidden place-items-center text-neutral-400 transition hover:text-primary sm:grid"
                    aria-label="Remover membro"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() => addMembro()}
          className="inline-flex w-fit items-center gap-1 rounded-lg border border-primary px-4 py-2 text-sm font-bold uppercase text-primary transition hover:bg-primary hover:text-white"
        >
          <Plus size={16} /> Adicionar complemento
        </button>
      </div>

      <StepNav onNext={next} onPrev={prev} />
    </StepShell>
  );
}
