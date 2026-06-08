import { FormEvent, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { Select } from '../components/Select';
import { StatusBadge } from '../components/StatusBadge';
import { useOperational } from '../contexts/OperationalContext';

export function Setores() {
  const { setores, saveSetor } = useOperational();
  const [nome, setNome] = useState('');
  const [ordem, setOrdem] = useState(setores.length + 1);
  const [ativo, setAtivo] = useState('true');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveSetor({ nome, ordem, ativo: ativo === 'true' });
    setNome('');
    setOrdem(ordem + 1);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card>
        <h3 className="mb-4 text-lg font-bold">Cadastrar setor do quartel</h3>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <FormInput label="Setor" value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Telegrafia" required />
          <FormInput label="Ordem" type="number" value={ordem} onChange={(event) => setOrdem(Number(event.target.value))} required />
          <Select label="Status" value={ativo} onChange={(event) => setAtivo(event.target.value)}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
          <Button>Salvar setor</Button>
        </form>
      </Card>
      <div className="grid gap-3">
        {setores.sort((a, b) => a.ordem - b.ordem).map((setor) => (
          <Card key={setor.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">{setor.ordem}. {setor.nome}</h3>
                <p className="text-sm text-slate-400">Checklist obrigatório na passagem de serviço.</p>
              </div>
              <StatusBadge status={setor.ativo ? 'OK' : 'Arquivada'} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
