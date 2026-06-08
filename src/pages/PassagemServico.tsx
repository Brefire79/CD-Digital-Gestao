import { ChangeEvent } from 'react';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { StatusBadge } from '../components/StatusBadge';
import { TextArea } from '../components/TextArea';
import { useOperational } from '../contexts/OperationalContext';

export function PassagemServico() {
  const { checklist, updateChecklist, escala } = useOperational();

  function handleFoto(event: ChangeEvent<HTMLInputElement>, id: string) {
    const file = event.target.files?.[0];
    const item = checklist.find((current) => current.id === id);
    if (!file || !item) return;
    updateChecklist({ ...item, foto_url: file.name });
  }

  return (
    <div className="grid gap-4">
      <Card>
        <h3 className="text-lg font-bold">Checklist da passagem</h3>
        <p className="mt-1 text-sm text-slate-400">Cabo de Dia saindo: {escala.cabo_dia}. Qualquer item com alteração cria pendência automaticamente.</p>
      </Card>
      <div className="grid gap-3">
        {checklist.map((item) => (
          <Card key={item.id}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{item.setor_nome}</h3>
                <p className="text-sm text-slate-400">Setor do Quartel</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
              <Select label="Status" value={item.status} onChange={(event) => updateChecklist({ ...item, status: event.target.value as typeof item.status })}>
                <option>OK</option>
                <option>Com alteração</option>
              </Select>
              <TextArea label="Observação" value={item.observacao} onChange={(event) => updateChecklist({ ...item, observacao: event.target.value })} placeholder="Descreva a alteração, se houver." />
            </div>
            <label className="mt-3 block text-sm text-slate-300">
              Foto opcional
              <input className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm" type="file" accept="image/*" onChange={(event) => handleFoto(event, item.id)} />
            </label>
          </Card>
        ))}
      </div>
    </div>
  );
}
