import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { Select } from '../components/Select';
import { StatusBadge } from '../components/StatusBadge';
import { useOperational } from '../contexts/OperationalContext';

export function EscalaHoraria() {
  const { funcoes, escalaHoraria, generateEscalaHoraria } = useOperational();
  const [inicioNoturno, setInicioNoturno] = useState<'22:00' | '23:00'>('23:00');
  const elegiveis = funcoes.filter((item) => item.entra_escala_horaria);
  const bloqueados = funcoes.filter((item) => !item.entra_escala_horaria);
  const [quantidadeMilitares, setQuantidadeMilitares] = useState(Math.max(1, elegiveis.length));
  const quantidadeValida = Math.max(1, Math.min(quantidadeMilitares, Math.max(1, elegiveis.length)));
  const resumo = useMemo(() => {
    const inicio = inicioNoturno === '22:00' ? '22h00' : '23h00';
    return `${quantidadeValida} militares dividindo o período de ${inicio} às 06h00. Telegrafista permanece fixo no último horário das 06h00 às 07h30.`;
  }, [inicioNoturno, quantidadeValida]);

  return (
    <div className="grid gap-4">
      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <h3 className="text-lg font-bold">Escala horária rotativa</h3>
            <p className="text-sm text-slate-400">Somente Sd e Cb entram automaticamente. Sgt e Oficiais ficam fora, salvo inclusão manual pelo Cabo de Dia.</p>
            <p className="mt-2 rounded-lg bg-slate-950 p-3 text-sm text-slate-300">{resumo}</p>
          </div>
          <div className="grid gap-3">
            <Select label="Início da escala noturna" value={inicioNoturno} onChange={(event) => setInicioNoturno(event.target.value as '22:00' | '23:00')}>
              <option value="22:00">22h00</option>
              <option value="23:00">23h00</option>
            </Select>
            <FormInput
              label="Quantidade de militares"
              type="number"
              min={1}
              max={Math.max(1, elegiveis.length)}
              value={quantidadeMilitares}
              onChange={(event) => setQuantidadeMilitares(Number(event.target.value))}
            />
            <Button onClick={() => generateEscalaHoraria({ inicioNoturno, quantidadeMilitares: quantidadeValida })}>Gerar escala noturna</Button>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">Militares elegíveis</h3>
          <div className="grid gap-2">
            {elegiveis.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                <span>{item.graduacao} PM {item.militar_nome}</span>
                <StatusBadge status="OK" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">Sgt e Oficiais fora da escala horária</h3>
          <div className="grid gap-2">
            {bloqueados.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                <span>{item.graduacao} PM {item.militar_nome}</span>
                <StatusBadge status="Arquivada" />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {escalaHoraria.map((item) => (
          <Card key={item.id}>
            <p className="text-sm text-slate-400">Horário</p>
            <h3 className="text-2xl font-black">{item.horario_inicio} - {item.horario_fim}</h3>
            <p className="mt-3 font-bold">{item.graduacao} PM {item.militar_nome}</p>
            <p className="text-sm text-slate-400">{item.funcao}</p>
            <p className="mt-2 text-xs font-bold text-operacional-accent">{item.observacao}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
