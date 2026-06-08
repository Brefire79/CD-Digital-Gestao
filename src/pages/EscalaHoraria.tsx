import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { useOperational } from '../contexts/OperationalContext';

export function EscalaHoraria() {
  const { funcoes, escalaHoraria, generateEscalaHoraria } = useOperational();
  const elegiveis = funcoes.filter((item) => item.entra_escala_horaria);
  const bloqueados = funcoes.filter((item) => !item.entra_escala_horaria);

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Escala horária rotativa</h3>
            <p className="text-sm text-slate-400">Somente Sd e Cb entram automaticamente. Sgt e Oficiais ficam fora, salvo ronda manual futura.</p>
          </div>
          <Button onClick={generateEscalaHoraria}>Gerar escala Sd/Cb</Button>
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
          </Card>
        ))}
      </div>
    </div>
  );
}
