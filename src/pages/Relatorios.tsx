import { useState } from 'react';
import { Archive, CheckCircle2, FileDown, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useOperational } from '../contexts/OperationalContext';
import type { RelatorioOperacional } from '../lib/operationalPdf';

const reports = [
  { tipo: 'plantao' as const, titulo: 'PDF completo do plantão', detalhe: 'Cabeçalho, guarnições, escala, rondantes, livro e pendências.' },
  { tipo: 'livro' as const, titulo: 'PDF do Livro dos Motoristas', detalhe: 'Situação, novidades e relatos por viatura.' },
  { tipo: 'escala-dia' as const, titulo: 'PDF da Escala do Dia', detalhe: 'Cabeçalho, funções, guarnições e alterações.' },
  { tipo: 'escala-horaria' as const, titulo: 'PDF da Escala Horária', detalhe: 'Faixas editadas e rondantes do plantão.' },
  { tipo: 'pendencias' as const, titulo: 'Relatório de Pendências', detalhe: 'Status, descrições e histórico operacional.' }
];

export function Relatorios() {
  const { escala, funcoes, escalaHoraria, rondantes, relatos, pendencias, prontidoes, historicoPlantoes, encerrarPlantao } = useOperational();
  const [gerando, setGerando] = useState<RelatorioOperacional | null>(null);
  const [mensagem, setMensagem] = useState('');
  const prontidao = prontidoes.find((item) => item.id === escala.prontidao_id)?.nome ?? 'Amarela';

  async function gerar(tipo: RelatorioOperacional) {
    setGerando(tipo);
    setMensagem('');
    try {
      const [{ gerarPdfOperacional }, { baixarPdf }] = await Promise.all([
        import('../lib/operationalPdf'),
        import('../lib/passagemPdf')
      ]);
      const bytes = await gerarPdfOperacional(tipo, { escala, funcoes, escalaHoraria, rondantes, relatos, pendencias, prontidao });
      baixarPdf(bytes, `${tipo}-${prontidao}-${escala.data_servico_inicio.slice(0, 10)}.pdf`);
      setMensagem('PDF gerado com os dados atuais do plantão.');
    } catch (error) {
      setMensagem(error instanceof Error ? `Não foi possível gerar o PDF: ${error.message}` : 'Não foi possível gerar o PDF.');
    } finally {
      setGerando(null);
    }
  }

  function arquivar() {
    encerrarPlantao();
    setMensagem('Plantão arquivado no histórico local com sucesso.');
  }

  return (
    <div className="grid gap-4">
      {mensagem && <div className="flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-950/50 p-3 text-sm text-emerald-200"><CheckCircle2 size={18} />{mensagem}</div>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.tipo}>
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-operacional-accent">
            <FileDown size={24} />
          </div>
          <h3 className="font-bold">{report.titulo}</h3>
          <p className="mt-2 text-sm text-slate-400">{report.detalhe}</p>
          <Button className="mt-4 w-full" variant="secondary" disabled={gerando !== null} onClick={() => gerar(report.tipo)}>
            {gerando === report.tipo ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} />Gerando</span> : 'Gerar PDF'}
          </Button>
        </Card>
      ))}
      </div>
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold">Encerramento e histórico do plantão</h3>
            <p className="mt-1 text-sm text-slate-400">Cria uma cópia imutável dos dados atuais para consulta futura neste dispositivo.</p>
          </div>
          <Button type="button" onClick={arquivar}><span className="inline-flex items-center gap-2"><Archive size={17} />Arquivar plantão</span></Button>
        </div>
        <div className="mt-4 grid gap-2">
          {historicoPlantoes.slice(0, 8).map((plantao) => (
            <div key={plantao.id} className="rounded-lg bg-slate-950 p-3 text-sm text-slate-300">
              <strong>Prontidão {prontidoes.find((item) => item.id === plantao.escala.prontidao_id)?.nome ?? '-'}</strong>
              <span className="ml-2 text-slate-500">{new Date(plantao.escala.data_servico_inicio).toLocaleString('pt-BR')} · arquivado em {new Date(plantao.encerrado_em).toLocaleString('pt-BR')}</span>
            </div>
          ))}
          {historicoPlantoes.length === 0 && <p className="text-sm text-slate-500">Nenhum plantão arquivado ainda.</p>}
        </div>
      </Card>
    </div>
  );
}
