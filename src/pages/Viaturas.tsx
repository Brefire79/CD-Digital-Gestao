import { FormEvent, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { Select } from '../components/Select';
import { StatusBadge } from '../components/StatusBadge';
import { TextArea } from '../components/TextArea';
import { useOperational } from '../contexts/OperationalContext';
import type { Viatura } from '../types/domain';

export function Viaturas() {
  const { viaturas, saveViatura, archiveViatura, deleteViatura } = useOperational();
  const [editingId, setEditingId] = useState<string | undefined>();
  const [prefixo, setPrefixo] = useState('');
  const [tipo, setTipo] = useState('');
  const [ativa, setAtiva] = useState('true');
  const [estacaoAtual, setEstacaoAtual] = useState('EB Centro');
  const [statusOperacional, setStatusOperacional] = useState<Viatura['status_operacional']>('Rodando');
  const [transferidaPara, setTransferidaPara] = useState('');
  const [observacaoHistorico, setObservacaoHistorico] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveViatura({
      id: editingId,
      prefixo,
      tipo,
      ativa: ativa === 'true',
      estacao_atual: estacaoAtual,
      status_operacional: ativa === 'true' ? statusOperacional : 'Histórico',
      transferida_para: transferidaPara,
      observacao_historico: observacaoHistorico
    });
    clearForm();
  }

  function clearForm() {
    setEditingId(undefined);
    setPrefixo('');
    setTipo('');
    setAtiva('true');
    setEstacaoAtual('EB Centro');
    setStatusOperacional('Rodando');
    setTransferidaPara('');
    setObservacaoHistorico('');
  }

  function handleEdit(viatura: Viatura) {
    setEditingId(viatura.id);
    setPrefixo(viatura.prefixo);
    setTipo(viatura.tipo);
    setAtiva(String(viatura.ativa));
    setEstacaoAtual(viatura.estacao_atual);
    setStatusOperacional(viatura.status_operacional);
    setTransferidaPara(viatura.transferida_para ?? '');
    setObservacaoHistorico(viatura.observacao_historico ?? '');
  }

  function handleArchive(viatura: Viatura) {
    const destino = viatura.transferida_para || transferidaPara || 'Informar destino/estação';
    archiveViatura(viatura.id, destino, viatura.observacao_historico || 'Viatura mantida no histórico operacional.');
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card>
        <h3 className="mb-4 text-lg font-bold">{editingId ? 'Editar viatura' : 'Cadastrar viatura'}</h3>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <FormInput label="Prefixo" value={prefixo} onChange={(event) => setPrefixo(event.target.value)} placeholder="UR-101" required />
          <FormInput label="Tipo" value={tipo} onChange={(event) => setTipo(event.target.value)} placeholder="Unidade de Resgate" required />
          <FormInput label="Estação de Bombeiros atual" value={estacaoAtual} onChange={(event) => setEstacaoAtual(event.target.value)} placeholder="EB Centro" required />
          <Select label="Status operacional" value={statusOperacional} onChange={(event) => setStatusOperacional(event.target.value as Viatura['status_operacional'])}>
            <option>Rodando</option>
            <option>Reserva</option>
            <option>Manutenção</option>
            <option>Transferida</option>
            <option>Histórico</option>
          </Select>
          <Select label="Situação" value={ativa} onChange={(event) => setAtiva(event.target.value)}>
            <option value="true">Ativa</option>
            <option value="false">Histórico</option>
          </Select>
          <FormInput label="Transferida para" value={transferidaPara} onChange={(event) => setTransferidaPara(event.target.value)} placeholder="EB Norte, outro quartel ou destino" />
          <TextArea label="Informações de histórico" value={observacaoHistorico} onChange={(event) => setObservacaoHistorico(event.target.value)} placeholder="Informe motivo, data, destino ou estação onde a VTR está rodando." />
          <div className="grid grid-cols-2 gap-2">
            <Button>{editingId ? 'Atualizar' : 'Salvar'}</Button>
            <Button type="button" variant="secondary" onClick={clearForm}>Limpar</Button>
          </div>
        </form>
      </Card>
      <div className="grid gap-3">
        {viaturas.map((viatura) => (
          <Card key={viatura.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">{viatura.prefixo}</h3>
                <p className="text-sm text-slate-400">{viatura.tipo}</p>
                <p className="mt-2 text-sm text-slate-300">Rodando em: {viatura.estacao_atual}</p>
                {viatura.transferida_para && <p className="text-sm text-slate-400">Transferida para: {viatura.transferida_para}</p>}
              </div>
              <StatusBadge status={viatura.ativa ? 'OK' : 'Arquivada'} />
            </div>
            {viatura.observacao_historico && (
              <div className="mt-3 rounded-lg bg-slate-950 p-3 text-sm text-slate-400">
                {viatura.observacao_historico}
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button type="button" variant="secondary" onClick={() => handleEdit(viatura)}>Editar</Button>
              <Button type="button" variant="ghost" onClick={() => handleArchive(viatura)}>Histórico</Button>
              <Button type="button" variant="danger" onClick={() => deleteViatura(viatura.id)}>Excluir</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
