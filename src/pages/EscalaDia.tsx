import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { Select } from '../components/Select';
import { TextArea } from '../components/TextArea';
import { StatusBadge } from '../components/StatusBadge';
import { useOperational } from '../contexts/OperationalContext';

export function EscalaDia() {
  const { escala, prontidoes, funcoes, saveEscala, saveFuncao } = useOperational();
  const [draft, setDraft] = useState(escala);
  const [militar, setMilitar] = useState('');
  const [graduacao, setGraduacao] = useState('Sd');
  const [funcao, setFuncao] = useState('');

  function handleEscala(event: FormEvent) {
    event.preventDefault();
    saveEscala(draft);
  }

  function handleFuncao(event: FormEvent) {
    event.preventDefault();
    saveFuncao({ militar_nome: militar, graduacao, funcao, entra_escala_horaria: false });
    setMilitar('');
    setFuncao('');
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Serviço de 24 horas</h3>
            <p className="text-sm text-slate-400">Cada plantão deve estar vinculado a uma prontidão.</p>
          </div>
          <Link to="/escala-horaria"><Button variant="secondary">Escala Horária</Button></Link>
        </div>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleEscala}>
          <FormInput label="Data início" type="datetime-local" value={draft.data_servico_inicio} onChange={(event) => setDraft({ ...draft, data_servico_inicio: event.target.value })} />
          <FormInput label="Data fim" type="datetime-local" value={draft.data_servico_fim} onChange={(event) => setDraft({ ...draft, data_servico_fim: event.target.value })} />
          <Select label="Prontidão" value={draft.prontidao_id} onChange={(event) => setDraft({ ...draft, prontidao_id: event.target.value })}>
            {prontidoes.map((prontidao) => <option key={prontidao.id} value={prontidao.id}>{prontidao.nome}</option>)}
          </Select>
          <FormInput label="Comandante da prontidão" value={draft.comandante} onChange={(event) => setDraft({ ...draft, comandante: event.target.value })} />
          <FormInput label="Cabo de Dia" value={draft.cabo_dia} onChange={(event) => setDraft({ ...draft, cabo_dia: event.target.value })} />
          <FormInput label="Telegrafista" value={draft.telegrafista} onChange={(event) => setDraft({ ...draft, telegrafista: event.target.value })} />
          <FormInput label="Chefe dos motoristas" value={draft.chefe_motoristas} onChange={(event) => setDraft({ ...draft, chefe_motoristas: event.target.value })} />
          <div className="sm:col-span-2">
            <TextArea label="Observações" value={draft.observacoes} onChange={(event) => setDraft({ ...draft, observacoes: event.target.value })} />
          </div>
          <Button className="sm:col-span-2">Salvar escala do dia</Button>
        </form>
      </Card>
      <div className="grid gap-4">
        <Card>
          <h3 className="mb-4 text-lg font-bold">Adicionar militar/função</h3>
          <form className="grid gap-3" onSubmit={handleFuncao}>
            <FormInput label="Nome de guerra" value={militar} onChange={(event) => setMilitar(event.target.value)} required />
            <Select label="Graduação" value={graduacao} onChange={(event) => setGraduacao(event.target.value)}>
              <option>Sd</option>
              <option>Cb</option>
              <option>Sgt</option>
              <option>Ten</option>
              <option>Cap</option>
            </Select>
            <FormInput label="Função" value={funcao} onChange={(event) => setFuncao(event.target.value)} placeholder="Motorista AB-202" required />
            <Button>Adicionar à escala</Button>
          </form>
        </Card>
        <div className="grid gap-3">
          {funcoes.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold">{item.graduacao} PM {item.militar_nome}</h4>
                  <p className="text-sm text-slate-400">{item.funcao}</p>
                </div>
                <StatusBadge status={item.entra_escala_horaria ? 'OK' : 'Arquivada'} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
