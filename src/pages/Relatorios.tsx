import { FileDown } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const reports = [
  'PDF da passagem de serviço',
  'PDF do livro dos motoristas',
  'PDF da escala do dia',
  'PDF da escala horária',
  'Relatório de pendências'
];

export function Relatorios() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report}>
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-operacional-accent">
            <FileDown size={24} />
          </div>
          <h3 className="font-bold">{report}</h3>
          <p className="mt-2 text-sm text-slate-400">Estrutura pronta para geração em PDF no MVP.</p>
          <Button className="mt-4 w-full" variant="secondary">Preparar relatório</Button>
        </Card>
      ))}
    </div>
  );
}
