import { AlertTriangle, Camera } from 'lucide-react';
import { usePassagem, type RondaStatus } from '../../store/passagem';
import { Field, STATUS_OPTS, Segmented, StepShell, inputClass } from './Field';
import { StepNav } from './WizardLayout';

const TELEGRAFIA_CAMPOS: { key: 'armamento' | 'computador' | 'impressora' | 'coletes'; label: string }[] = [
  { key: 'armamento', label: 'Armamento' },
  { key: 'computador', label: 'Computador' },
  { key: 'impressora', label: 'Impressora' },
  { key: 'coletes', label: 'Coletes' }
];

export function StepRondas() {
  const ronda = usePassagem((s) => s.ronda);
  const setRondaStatus = usePassagem((s) => s.setRondaStatus);
  const setRondaRelato = usePassagem((s) => s.setRondaRelato);
  const setTelegrafia = usePassagem((s) => s.setTelegrafia);
  const setRondaCampo = usePassagem((s) => s.setRondaCampo);
  const addRondaFoto = usePassagem((s) => s.addRondaFoto);
  const temAlteracao = usePassagem((s) => s.temAlteracaoRonda());
  const next = usePassagem((s) => s.next);
  const prev = usePassagem((s) => s.prev);

  return (
    <StepShell numero={3} titulo="Ronda Quartel" instrucao="Marque S/N quando estiver sem novidade ou C/N quando houver alteração.">
      {temAlteracao && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm font-semibold text-primary">
          <AlertTriangle size={16} /> Situação anormal — será gerada pendência ao finalizar.
        </div>
      )}

      <div className="grid gap-4">
        {ronda.pontos.map((p) => {
          const isGlp = p.nome.includes('GLP');
          const isTele = p.nome.startsWith('Telégrafo');
          return (
            <div key={p.id} className="rounded-xl border border-white bg-white p-4 shadow-[0_3px_10px_rgba(15,92,153,0.08)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-bold text-ink">{p.nome}</span>
                <Segmented<RondaStatus>
                  value={p.status}
                  onChange={(v) => setRondaStatus(p.id, v)}
                  options={STATUS_OPTS}
                />
              </div>

              {p.status === 'alteracao' && (
                <textarea
                  rows={2}
                  className={`${inputClass} mt-3 border-[#F1B0B4] bg-[#FFF5F5]`}
                  placeholder="Descreva o que foi identificado..."
                  value={p.relato ?? ''}
                  onChange={(e) => setRondaRelato(p.id, e.target.value)}
                />
              )}

              {isGlp && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field label="Cilindros cheios">
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={ronda.glpCheios}
                      onChange={(e) => setRondaCampo({ glpCheios: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Cilindros vazios">
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={ronda.glpVazios}
                      onChange={(e) => setRondaCampo({ glpVazios: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              )}

              {isTele && (
                <div className="mt-3 grid gap-2">
                  {TELEGRAFIA_CAMPOS.map(({ key, label }) => (
                    <div key={key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-neutral-600">{label}</span>
                      <Segmented<RondaStatus>
                        value={ronda.telegrafia[key]}
                        onChange={(v) => setTelegrafia(key, v)}
                        options={STATUS_OPTS}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <Field label="Observações da ronda (opcional)">
          <div className="relative">
            <textarea
              maxLength={500}
              rows={3}
              className={inputClass}
              placeholder="Descreva situações relevantes da ronda..."
              value={ronda.observacoes}
              onChange={(e) => setRondaCampo({ observacoes: e.target.value })}
            />
            <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-neutral-400">
              {ronda.observacoes.length}/500
            </span>
          </div>
        </Field>

        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Fotos (opcional)</p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface p-5 text-sm text-neutral-500 transition hover:border-primary">
            <Camera size={18} />
            <span>Adicionar fotos · JPG, PNG até 10MB cada</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => Array.from(e.target.files ?? []).forEach((f) => addRondaFoto(f.name))}
            />
          </label>
          {ronda.fotos.length > 0 && (
            <p className="mt-2 text-xs text-neutral-500">{ronda.fotos.length} foto(s): {ronda.fotos.join(', ')}</p>
          )}
        </div>
      </div>

      <StepNav onNext={next} onPrev={prev} />
    </StepShell>
  );
}
