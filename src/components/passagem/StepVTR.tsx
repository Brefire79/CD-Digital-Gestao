import { useState } from 'react';
import { Info, Plus, Trash2 } from 'lucide-react';
import { inferirTipoVtrPlantao, usePassagem, type TipoVtrPlantao } from '../../store/passagem';
import { Field, StepShell, inputClass } from './Field';
import { StepNav } from './WizardLayout';

const tipoLabels: Record<TipoVtrPlantao, string> = {
  incendio: 'VTR de Incêndio',
  resgate: 'Unidade de Resgate',
  canil: 'Viatura do Canil',
  od: 'Viatura OD (informativa)',
  outra: 'Outra VTR'
};

const tripulacaoVazia = { cmt: '', mot: '', aux: '', estagiario: '' };

export function StepVTR() {
  const vtrs = usePassagem((s) => s.vtrs);
  const addVtr = usePassagem((s) => s.addVtr);
  const removeVtr = usePassagem((s) => s.removeVtr);
  const header = usePassagem((s) => s.header);
  const guarnicao = usePassagem((s) => s.guarnicao);
  const addMembro = usePassagem((s) => s.addMembro);
  const updateMembro = usePassagem((s) => s.updateMembro);
  const setHeader = usePassagem((s) => s.setHeader);
  const next = usePassagem((s) => s.next);
  const [prefixo, setPrefixo] = useState('');
  const [tipoPlantao, setTipoPlantao] = useState<TipoVtrPlantao | 'auto'>('auto');
  const [tripulacao, setTripulacao] = useState(tripulacaoVazia);
  const [telegrafista, setTelegrafista] = useState(header.telegrafista);

  function adicionar() {
    // Aceita múltiplos prefixos separados por vírgula (ex.: ABT-123, AR-50).
    prefixo
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((valor) => addVtr(valor, tipoPlantao, tripulacao));
    setPrefixo('');
    setTripulacao(tripulacaoVazia);
  }

  function adicionarTelegrafista() {
    const nome = telegrafista.trim();
    if (!nome) return;
    const existente = guarnicao.find((m) => m.funcao === 'Telegrafista');
    setHeader({ telegrafista: nome });
    if (existente) {
      updateMembro(existente.id, { nome, puxaHora: false });
    } else {
      addMembro({ nome, funcao: 'Telegrafista', puxaHora: false });
    }
  }

  const tipoPrevisto = tipoPlantao === 'auto' ? inferirTipoVtrPlantao(prefixo) : tipoPlantao;
  const membrosPorVtr = usePassagem((s) => s.guarnicao);

  return (
    <StepShell
      numero={1}
      titulo="Viatura (VTR)"
      instrucao="Informe a VTR e sua guarnição. O Sgt e o Cb de Dia poderão revisar todos os postos antes de avançar."
    >
      <div className="grid gap-3">
        <Field label="Prefixo da VTR">
          <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
            <input
              className={inputClass}
              placeholder="Ex.: ABS-01104, ABT-123, UR-01101"
              value={prefixo}
              onChange={(e) => setPrefixo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), adicionar())}
            />
            <select
              className={inputClass}
              value={tipoPlantao}
              onChange={(e) => setTipoPlantao(e.target.value as TipoVtrPlantao | 'auto')}
            >
              <option value="auto">Detectar tipo</option>
              <option value="incendio">VTR de Incêndio</option>
              <option value="resgate">Unidade de Resgate</option>
              <option value="canil">Viatura do Canil</option>
              <option value="od">Viatura OD</option>
              <option value="outra">Outra VTR</option>
            </select>
          </div>
          <p className="mt-2 text-xs text-neutral-500">Classificação prevista: {tipoLabels[tipoPrevisto]}.</p>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {([
            ['cmt', 'CMT', 'Nome'],
            ['mot', 'MOT', 'Nome'],
            ['aux', 'AUX', 'Nome (se houver)'],
            ['estagiario', 'Estagiário', 'Nome (se houver)']
          ] as const).map(([campo, label, placeholder]) => (
            <Field key={campo} label={label}>
              <input
                className={inputClass}
                placeholder={placeholder}
                value={tripulacao[campo]}
                onChange={(e) => setTripulacao((atual) => ({ ...atual, [campo]: e.target.value }))}
              />
            </Field>
          ))}
        </div>

        <button
          type="button"
          onClick={adicionar}
          disabled={!prefixo.trim()}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0F5C99] px-4 text-sm font-bold uppercase text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} /> Adicionar viatura
        </button>

        <section className="rounded-xl border border-white bg-white p-4 shadow-[0_3px_10px_rgba(15,92,153,0.08)]">
          <Field label="Telegrafista do plantão">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                className={inputClass}
                placeholder="Ex.: Sd PM Souza"
                value={telegrafista}
                onChange={(e) => setTelegrafista(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTelegrafista())}
              />
              <button
                type="button"
                onClick={adicionarTelegrafista}
                disabled={!telegrafista.trim()}
                className="min-h-11 rounded-[10px] bg-[#0F5C99] px-4 text-xs font-bold uppercase text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </Field>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            O policial ficará disponível para os horários fixos da Escala de Hora e para o documento do plantão.
          </p>
          {header.telegrafista && (
            <p className="mt-2 rounded-lg bg-[#EAF4FC] px-3 py-2 text-xs font-semibold text-[#0F5C99]">
              Telegrafista cadastrado: {header.telegrafista}
            </p>
          )}
        </section>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
            Viatura(s) adicionada(s)
          </p>
          {vtrs.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-line bg-surface p-4 text-sm text-neutral-500">
              <Info size={16} /> Adicione todas as viaturas que estão sob responsabilidade do quartel.
            </div>
          ) : (
            <ul className="grid gap-2">
              {vtrs.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3"
                >
                  <div>
                    <span className="font-bold text-ink">{v.prefixo}</span>
                    <p className="text-xs text-neutral-500">
                      {tipoLabels[v.tipoPlantao ?? inferirTipoVtrPlantao(v.prefixo)]}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {membrosPorVtr
                        .filter((m) => m.vtrId === v.id && m.nome.trim())
                        .map((m) => (
                          <span key={m.id} className="rounded-lg bg-[#EAF4FC] px-2 py-1 text-[11px] font-semibold text-[#0F5C99]">
                            {m.funcao === 'Comandante' ? 'CMT' : m.funcao === 'Condutor' ? 'MOT' : m.funcao === 'Estagiário' ? 'ESTAGIÁRIO' : 'AUX'}: {m.nome}
                          </span>
                        ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVtr(v.id)}
                    className="text-neutral-400 transition hover:text-primary"
                    aria-label={`Remover ${v.prefixo}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <StepNav onNext={next} nextLabel="Revisar guarnições" showPrev={false} />
    </StepShell>
  );
}
