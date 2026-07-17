import { Wand2, Shield, RotateCcw } from 'lucide-react';
import { usePassagem, type ClasseVtr } from '../../store/passagem';
import { inferirGraduacao, elegivelAutomatico } from '../../lib/escalaGenerator';
import { Field, StepShell, Segmented, inputClass } from './Field';
import { StepNav } from './WizardLayout';

const CLASSES: ClasseVtr[] = ['ABS', 'UR', 'CANIL', 'OD'];

export function StepEscala() {
  const escala = usePassagem((s) => s.escala);
  const guarnicao = usePassagem((s) => s.guarnicao);
  const header = usePassagem((s) => s.header);
  const escalaConfig = usePassagem((s) => s.escalaConfig);
  const rondantes = usePassagem((s) => s.rondantes);
  const updateEscalaLinha = usePassagem((s) => s.updateEscalaLinha);
  const updateMembro = usePassagem((s) => s.updateMembro);
  const setHeader = usePassagem((s) => s.setHeader);
  const setEscalaConfig = usePassagem((s) => s.setEscalaConfig);
  const gerarEscalaAutomatica = usePassagem((s) => s.gerarEscalaAutomatica);
  const gerarRondantesAuto = usePassagem((s) => s.gerarRondantesAuto);
  const updateRondante = usePassagem((s) => s.updateRondante);
  const next = usePassagem((s) => s.next);
  const prev = usePassagem((s) => s.prev);

  const nomes = guarnicao.map((m) => m.nome).filter(Boolean);

  return (
    <StepShell numero={4} titulo="Escala de Hora" instrucao="Gere a escala automática e ajuste o que precisar (07:30 às 07:30).">
      <div className="grid gap-5">
        {/* ---------- Geração automática ---------- */}
        <div className="rounded-lg border border-line bg-surface p-4">
          <div className="mb-3 flex items-center gap-2">
            <Wand2 size={16} className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Geração automática</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Início da distribuição noturna">
              <Segmented
                value={escalaConfig.inicioNoturno}
                onChange={(v) => setEscalaConfig({ inicioNoturno: v })}
                options={[
                  { value: '22:00', label: '22:00' },
                  { value: '23:00', label: '23:00' }
                ]}
              />
            </Field>
            <Field label="Telegrafista (postos fixos)">
              <select
                className={inputClass}
                value={header.telegrafista}
                onChange={(e) => setHeader({ telegrafista: e.target.value })}
              >
                <option value="">Selecionar militar...</option>
                {nomes.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Militares que puxam hora */}
          <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
            Militares que puxam hora (Sd/Cb automáticos)
          </p>
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            {guarnicao.length === 0 && (
              <p className="p-3 text-xs text-neutral-500">Cadastre a guarnição na etapa anterior.</p>
            )}
            {guarnicao.map((m) => {
              const grad = inferirGraduacao(m.nome);
              const marcado = m.puxaHora ?? elegivelAutomatico(grad);
              return (
                <div key={m.id} className="flex items-center gap-3 border-b border-line/70 px-3 py-2 last:border-0">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={marcado}
                    onChange={(e) => updateMembro(m.id, { puxaHora: e.target.checked })}
                  />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
                    {m.nome || <span className="text-neutral-400">(sem nome)</span>}
                  </span>
                  <span className="rounded bg-charcoal px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    {grad}
                  </span>
                  <select
                    className="rounded border border-line px-2 py-1 text-xs"
                    value={m.viatura ?? ''}
                    onChange={(e) => updateMembro(m.id, { viatura: e.target.value as ClasseVtr })}
                  >
                    <option value="">VTR…</option>
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={gerarEscalaAutomatica}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase text-white transition hover:bg-primary/90"
          >
            <Wand2 size={16} /> Gerar escala automática
          </button>
          <p className="mt-2 text-[11px] text-neutral-500">
            Distribui {escalaConfig.inicioNoturno}→06:00 entre os elegíveis, começando pelos motoristas
            (UR → ABS → Canil). Telegrafista assume os postos fixos. Tudo permanece editável abaixo.
          </p>
        </div>

        {/* ---------- Delegação do livro ---------- */}
        <Field label="Delegação do Livro dos Motoristas">
          <select
            className={inputClass}
            value={header.delegacaoLivro}
            onChange={(e) => setHeader({ delegacaoLivro: e.target.value })}
          >
            <option value="">Selecionar militar...</option>
            {nomes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>

        {/* ---------- Tabela editável ---------- */}
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="grid grid-cols-[100px_1fr_1fr] bg-charcoal px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white sm:grid-cols-[120px_1fr_1fr_1fr]">
            <span>Horário</span>
            <span className="hidden sm:block">Cobertura</span>
            <span>Militar</span>
            <span>Critério</span>
          </div>
          <div className="divide-y divide-line">
            {escala.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-[100px_1fr_1fr] items-center gap-2 px-3 py-2 sm:grid-cols-[120px_1fr_1fr_1fr]"
              >
                <div className="flex items-center gap-1 text-xs font-semibold text-ink">
                  <input
                    className="w-[44px] rounded border border-line px-1 py-1 text-center text-xs"
                    value={l.inicio}
                    onChange={(e) => updateEscalaLinha(l.id, { inicio: e.target.value })}
                  />
                  <span className="text-neutral-400">–</span>
                  <input
                    className="w-[44px] rounded border border-line px-1 py-1 text-center text-xs"
                    value={l.fim}
                    onChange={(e) => updateEscalaLinha(l.id, { fim: e.target.value })}
                  />
                </div>
                <input
                  className="hidden rounded border border-line px-2 py-1.5 text-xs sm:block"
                  value={l.cobertura}
                  onChange={(e) => updateEscalaLinha(l.id, { cobertura: e.target.value })}
                />
                <select
                  className="rounded border border-line px-2 py-1.5 text-xs"
                  value={l.militar}
                  onChange={(e) => updateEscalaLinha(l.id, { militar: e.target.value })}
                >
                  <option value="">—</option>
                  {nomes.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded border border-line px-2 py-1.5 text-xs"
                  value={l.criterio}
                  onChange={(e) => updateEscalaLinha(l.id, { criterio: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Rondantes ---------- */}
        <div className="rounded-lg border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Rondantes (Sgt)</h3>
            </div>
            <button
              type="button"
              onClick={gerarRondantesAuto}
              className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-1.5 text-xs font-bold uppercase text-primary transition hover:bg-primary hover:text-white"
            >
              <RotateCcw size={14} /> Gerar
            </button>
          </div>
          {rondantes.length === 0 ? (
            <p className="text-xs text-neutral-500">
              Gera automaticamente a partir dos Sgt da guarnição: 1 Sgt cobre o período integral; 2+ dividem em faixas.
            </p>
          ) : (
            <div className="grid gap-2">
              {rondantes.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <input
                    className="w-[52px] rounded border border-line px-1 py-1 text-center text-xs"
                    value={r.inicio}
                    onChange={(e) => updateRondante(r.id, { inicio: e.target.value })}
                  />
                  <span className="text-neutral-400">–</span>
                  <input
                    className="w-[52px] rounded border border-line px-1 py-1 text-center text-xs"
                    value={r.fim}
                    onChange={(e) => updateRondante(r.id, { fim: e.target.value })}
                  />
                  <input
                    className="flex-1 rounded border border-line px-2 py-1.5 text-xs"
                    value={r.militar}
                    onChange={(e) => updateRondante(r.id, { militar: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------- Prévia do documento ---------- */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Prévia do documento</p>
          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="text-center text-xs font-bold uppercase text-ink">Escala de Hora · {header.prontidao}</p>
            <p className="mb-3 text-center text-[11px] text-neutral-500">
              {header.quartel} · {header.data}
            </p>
            <table className="w-full text-[11px]">
              <tbody>
                {escala.map((l) => (
                  <tr key={l.id} className="border-t border-line/70">
                    <td className="py-1 pr-2 font-semibold text-ink">
                      {l.inicio} – {l.fim}
                    </td>
                    <td className="py-1 text-neutral-600">{l.militar || '—'}</td>
                    <td className="py-1 pl-2 text-right text-neutral-500">{l.criterio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rondantes.length > 0 && (
              <div className="mt-3 border-t border-line pt-2">
                <p className="text-[11px] font-bold uppercase text-ink">Rondantes</p>
                {rondantes.map((r) => (
                  <p key={r.id} className="text-[11px] text-neutral-600">
                    {r.inicio} – {r.fim}: {r.militar || '—'}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <StepNav onNext={next} onPrev={prev} />
    </StepShell>
  );
}
