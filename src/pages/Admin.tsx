import { Link } from 'react-router-dom';
import { Card } from '../components/Card';

const adminItems = [
  { to: '/viaturas', label: 'Viaturas', detail: 'Cadastro de prefixo, tipo e status.' },
  { to: '/setores', label: 'Setores do Quartel', detail: 'Itens obrigatórios do checklist.' },
  { to: '/escala-dia', label: 'Escala e Prontidões', detail: 'Serviço do dia e funções.' },
  { to: '/pendencias', label: 'Pendências', detail: 'Acompanhamento e histórico.' }
];

export function Admin() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {adminItems.map((item) => (
        <Link key={item.to} to={item.to}>
          <Card className="h-full transition hover:border-operacional-accent">
            <h3 className="text-lg font-bold">{item.label}</h3>
            <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
          </Card>
        </Link>
      ))}
      <Card className="sm:col-span-2">
        <h3 className="font-bold">Preparação para IA</h3>
        <p className="mt-2 text-sm text-slate-400">Ponto reservado para futuras análises inteligentes de pendências e relatórios, sem integração OpenAI/Claude nesta versão.</p>
      </Card>
    </div>
  );
}
