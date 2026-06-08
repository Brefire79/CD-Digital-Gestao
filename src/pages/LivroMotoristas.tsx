import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { StatusBadge } from '../components/StatusBadge';
import { TextArea } from '../components/TextArea';
import { useOperational } from '../contexts/OperationalContext';

export function LivroMotoristas() {
  const { escala, prontidoes, relatos, updateRelato } = useOperational();
  const prontidao = prontidoes.find((item) => item.id === escala.prontidao_id)?.nome ?? 'Amarela';

  return (
    <div className="grid gap-4">
      <Card>
        <p className="text-center text-xs font-bold uppercase text-slate-300">Polícia Militar do Estado de São Paulo</p>
        <p className="text-center text-xs font-bold uppercase text-slate-300">Corpo de Bombeiros</p>
        <h3 className="mt-3 text-center text-xl font-black">Livro dos Motoristas</h3>
        <p className="mt-2 text-center text-sm text-slate-400">Prontidão: {prontidao} | Serviço de {escala.data_servico_inicio} para {escala.data_servico_fim}</p>
      </Card>
      <div className="grid gap-3">
        {relatos.map((relato) => (
          <Card key={relato.id}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black">{relato.prefixo}</h3>
                <p className="text-sm text-slate-400">Relato por viatura no plantão</p>
              </div>
              <StatusBadge status={relato.tem_novidade ? 'Com alteração' : 'OK'} />
            </div>
            <div className="grid gap-3 md:grid-cols-[220px_220px_1fr]">
              <Select label="Situação" value={relato.situacao} onChange={(event) => updateRelato({ ...relato, situacao: event.target.value })}>
                <option>Operacional</option>
                <option>Baixada</option>
                <option>Manutenção</option>
                <option>Reserva</option>
              </Select>
              <Select label="Novidades" value={relato.tem_novidade ? 'sim' : 'nao'} onChange={(event) => updateRelato({ ...relato, tem_novidade: event.target.value === 'sim' })}>
                <option value="nao">Sem novidades</option>
                <option value="sim">Com novidades</option>
              </Select>
              <TextArea
                label={relato.tem_novidade ? 'Relato obrigatório' : 'Relato anterior como referência'}
                value={relato.tem_novidade ? relato.relato : relato.relato_anterior}
                disabled={!relato.tem_novidade}
                onChange={(event) => updateRelato({ ...relato, relato: event.target.value })}
              />
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
          <p>Responsável: {escala.chefe_motoristas}</p>
          <p>Assinatura digital: Confirmada</p>
          <p>Data/hora: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </Card>
    </div>
  );
}
