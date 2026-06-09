import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { Select } from '../components/Select';
import { TextArea } from '../components/TextArea';
import { StatusBadge } from '../components/StatusBadge';
import { useOperational } from '../contexts/OperationalContext';
import type { EscalaFuncao, Viatura } from '../types/domain';

const funcoesViatura = ['CMT', 'MOT', 'AUX', 'AUX', 'Estagiário'];
const funcoesRapidas = ['Cabo de Dia', 'Telegrafia', 'Chefe dos Motoristas', 'Adjunto de Dia'];

function isGraduacaoHora(graduacao: string) {
  const normalized = graduacao.trim().toLowerCase();
  return normalized === 'sd' || normalized === 'cb' || normalized.includes('soldado') || normalized.includes('cabo');
}

function isViaturaHora(viatura: Viatura) {
  const text = `${viatura.prefixo} ${viatura.tipo}`.toLowerCase();
  return /\bur\b/.test(text) || /\bab\b/.test(text) || text.includes('abs') || text.includes('canil') || /\bcn\b/.test(text);
}

function belongsToViatura(funcao: EscalaFuncao, viatura: Viatura) {
  return funcao.funcao.toLowerCase().includes(viatura.prefixo.toLowerCase());
}

function belongsToPapel(funcao: EscalaFuncao, papel: string) {
  return funcao.funcao.toLowerCase().startsWith(papel.toLowerCase());
}

function canEnterHora(funcao: EscalaFuncao, viaturas: Viatura[]) {
  const viatura = viaturas.find((item) => belongsToViatura(funcao, item));
  return Boolean(viatura && isViaturaHora(viatura) && isGraduacaoHora(funcao.graduacao));
}

export function EscalaDia() {
  const { escala, prontidoes, funcoes, viaturas, saveEscala, saveFuncao, deleteFuncao } = useOperational();
  const [draft, setDraft] = useState(escala);
  const [militar, setMilitar] = useState('');
  const [graduacao, setGraduacao] = useState('Sd');
  const [funcaoManual, setFuncaoManual] = useState('');
  const [funcaoRapida, setFuncaoRapida] = useState(funcoesRapidas[0]);
  const [viaturaId, setViaturaId] = useState('');
  const [papelViatura, setPapelViatura] = useState('MOT');
  const viaturasAtivas = viaturas.filter((viatura) => viatura.ativa);
  const viaturasHora = viaturasAtivas.filter(isViaturaHora);
  const selectedViatura = viaturasAtivas.find((viatura) => viatura.id === viaturaId);

  const funcoesOrdenadas = useMemo(() => {
    return [...funcoes].sort((a, b) => a.funcao.localeCompare(b.funcao));
  }, [funcoes]);

  function handleEscala(event: FormEvent) {
    event.preventDefault();
    saveEscala(draft);
  }

  function handleFuncao(event: FormEvent) {
    event.preventDefault();
    const funcao = selectedViatura ? `${papelViatura} ${selectedViatura.prefixo}` : funcaoManual || funcaoRapida;
    saveFuncao({ militar_nome: militar, graduacao, funcao, entra_escala_horaria: false });
    setMilitar('');
    setFuncaoManual('');
  }

  return (
    <div className="grid gap-4">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Escala do Dia</h3>
            <p className="text-sm text-slate-400">Monte o cabeçalho do serviço e a guarnição que alimenta a escala horária.</p>
          </div>
          <Link to="/escala-horaria"><Button variant="secondary">Prévia PDF</Button></Link>
        </div>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleEscala}>
          <FormInput label="Data início" type="datetime-local" value={draft.data_servico_inicio} onChange={(event) => setDraft({ ...draft, data_servico_inicio: event.target.value })} />
          <FormInput label="Data fim" type="datetime-local" value={draft.data_servico_fim} onChange={(event) => setDraft({ ...draft, data_servico_fim: event.target.value })} />
          <Select label="Prontidão" value={draft.prontidao_id} onChange={(event) => setDraft({ ...draft, prontidao_id: event.target.value })}>
            {prontidoes.map((prontidao) => <option key={prontidao.id} value={prontidao.id}>{prontidao.nome}</option>)}
          </Select>
          <FormInput label="Oficial de Área 1º GB" value={draft.oficial_area} onChange={(event) => setDraft({ ...draft, oficial_area: event.target.value })} placeholder="Ex: 1º Ten PM Magno" />
          <FormInput label="Comandante da Prontidão" value={draft.comandante} onChange={(event) => setDraft({ ...draft, comandante: event.target.value })} />
          <FormInput label="Adjunto de Dia" value={draft.adjunto_dia} onChange={(event) => setDraft({ ...draft, adjunto_dia: event.target.value })} placeholder="Ex: 2º Sgt PM Luis" />
          <FormInput label="Cabo de Dia" value={draft.cabo_dia} onChange={(event) => setDraft({ ...draft, cabo_dia: event.target.value })} />
          <FormInput label="Telegrafista" value={draft.telegrafista} onChange={(event) => setDraft({ ...draft, telegrafista: event.target.value })} />
          <FormInput label="Chefe dos Motoristas" value={draft.chefe_motoristas} onChange={(event) => setDraft({ ...draft, chefe_motoristas: event.target.value })} />
          <div className="sm:col-span-2">
            <TextArea label="Alterações de Serviço / Manutenção do Quartel" value={draft.observacoes} onChange={(event) => setDraft({ ...draft, observacoes: event.target.value })} />
          </div>
          <Button className="sm:col-span-2">Salvar escala do dia</Button>
        </form>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <h3 className="mb-2 text-lg font-bold">Adicionar militar ao plantão</h3>
          <p className="mb-4 text-sm text-slate-400">Use VTR para CMT/MOT/AUX/Estagiário ou função rápida para cabeçalho.</p>
          <form className="grid gap-3" onSubmit={handleFuncao}>
            <FormInput label="Nome de guerra" value={militar} onChange={(event) => setMilitar(event.target.value)} required />
            <Select label="Graduação" value={graduacao} onChange={(event) => setGraduacao(event.target.value)}>
              <option>Sd</option>
              <option>Cb</option>
              <option>Sgt</option>
              <option>Ten</option>
              <option>Cap</option>
            </Select>
            <Select label="Vincular em viatura" value={viaturaId} onChange={(event) => setViaturaId(event.target.value)}>
              <option value="">Sem viatura / função rápida</option>
              {viaturasAtivas.map((viatura) => <option key={viatura.id} value={viatura.id}>{viatura.prefixo} - {viatura.tipo}</option>)}
            </Select>
            {selectedViatura ? (
              <Select label="Função na viatura" value={papelViatura} onChange={(event) => setPapelViatura(event.target.value)}>
                {funcoesViatura.map((funcao, index) => <option key={`${funcao}-${index}`}>{funcao}</option>)}
              </Select>
            ) : (
              <>
                <Select label="Função rápida" value={funcaoRapida} onChange={(event) => setFuncaoRapida(event.target.value)}>
                  {funcoesRapidas.map((funcao) => <option key={funcao}>{funcao}</option>)}
                </Select>
                <FormInput label="Ou função manual" value={funcaoManual} onChange={(event) => setFuncaoManual(event.target.value)} placeholder="Ex: Refeitório, Rondante, Apoio" />
              </>
            )}
            <Button>Adicionar à escala</Button>
          </form>
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold">Guarnições por Viatura</h3>
                <p className="text-sm text-slate-400">Somente UR, ABS/AB e Canil serão considerados na escala de hora.</p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-2 text-xs font-bold text-operacional-accent">
                Hora: {viaturasHora.map((viatura) => viatura.prefixo).join(', ') || 'definir'}
              </span>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {viaturasAtivas.map((viatura) => (
                <div key={viatura.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black">{viatura.prefixo}</h4>
                      <p className="text-sm text-slate-400">{viatura.tipo}</p>
                    </div>
                    <StatusBadge status={isViaturaHora(viatura) ? 'OK' : 'Arquivada'} />
                  </div>
                  <div className="grid gap-2">
                    {funcoesViatura.map((papel, index) => {
                      const lancados = funcoes.filter((funcao) => belongsToViatura(funcao, viatura) && belongsToPapel(funcao, papel));
                      return (
                        <div key={`${papel}-${index}`} className="rounded-lg bg-slate-900 p-2">
                          <p className="text-xs font-bold text-slate-400">{papel}</p>
                          {lancados.length > 0 ? lancados.map((funcao) => (
                            <p key={funcao.id} className="text-sm font-semibold">{funcao.graduacao} PM {funcao.militar_nome}</p>
                          )) : <p className="text-sm text-slate-500">Definir pelo Cabo de Dia</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-lg font-bold">Militares lançados</h3>
            <div className="grid gap-2">
              {funcoesOrdenadas.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950 p-3">
                  <div>
                    <h4 className="font-bold">{item.graduacao} PM {item.militar_nome}</h4>
                    <p className="text-sm text-slate-400">{item.funcao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={canEnterHora(item, viaturasAtivas) ? 'OK' : 'Arquivada'} />
                    <Button type="button" variant="ghost" onClick={() => deleteFuncao(item.id)}>Remover</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
