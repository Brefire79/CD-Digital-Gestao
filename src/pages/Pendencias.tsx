import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { StatusBadge } from '../components/StatusBadge';
import { TextArea } from '../components/TextArea';
import { useOperational } from '../contexts/OperationalContext';
import type { StatusPendencia } from '../types/domain';

export function Pendencias() {
  const { pendencias, updatePendencia } = useOperational();
  const [updates, setUpdates] = useState<Record<string, string>>({});

  return (
    <div className="grid gap-3">
      {pendencias.map((pendencia) => (
        <Card key={pendencia.id}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-operacional-accent">{pendencia.tipo}</p>
              <h3 className="text-lg font-bold">{pendencia.alvo}</h3>
              <p className="mt-1 text-sm text-slate-300">{pendencia.descricao}</p>
            </div>
            <StatusBadge status={pendencia.status} />
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
            <Select label="Status" value={pendencia.status} onChange={(event) => updatePendencia(pendencia.id, event.target.value as StatusPendencia, `Status alterado para ${event.target.value}.`)}>
              <option>Aberta</option>
              <option>Em andamento</option>
              <option>Resolvida</option>
              <option>Arquivada</option>
            </Select>
            <TextArea label="Histórico de atualização" value={updates[pendencia.id] ?? ''} onChange={(event) => setUpdates({ ...updates, [pendencia.id]: event.target.value })} placeholder="Informe a providência adotada." />
            <Button className="self-end" onClick={() => updatePendencia(pendencia.id, pendencia.status, updates[pendencia.id] ?? '')}>Registrar</Button>
          </div>
          <div className="mt-3 rounded-lg bg-slate-950 p-3 text-sm text-slate-400">
            {pendencia.historico.slice(-3).map((item) => <p key={item}>{item}</p>)}
          </div>
        </Card>
      ))}
    </div>
  );
}
