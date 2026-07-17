import { useState } from 'react';
import { CheckCircle2, FileDown, Loader2 } from 'lucide-react';
import { usePassagem } from '../../store/passagem';
import { useOperational } from '../../contexts/OperationalContext';
import { StepShell } from './Field';

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 border-b border-line py-3 last:border-0">
      <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">{rotulo}</span>
      <div className="text-sm text-ink">{children}</div>
    </div>
  );
}

export function StepReview() {
  const state = usePassagem();
  const { addPendencias } = useOperational();
  const [gerando, setGerando] = useState(false);
  const [feito, setFeito] = useState(false);

  const alteracoesRonda = state.ronda.pontos.filter((p) => p.status === 'alteracao');
  const livroCN = state.livro.filter((v) => v.novidade === 'C/N');

  async function gerar() {
    setGerando(true);
    try {
      // Persiste pendências a partir de alterações da ronda e novidades do livro.
      addPendencias([
        ...alteracoesRonda.map((p) => ({
          origem: 'passagem_servico' as const,
          origem_id: `ronda-${p.id}`,
          tipo: 'Ronda',
          alvo: p.nome,
          descricao: p.relato || state.ronda.observacoes || `Alteração registrada em ${p.nome}.`
        })),
        ...livroCN.map((v) => ({
          origem: 'livro_motoristas' as const,
          origem_id: `livro-${v.id}`,
          tipo: 'Viatura',
          alvo: v.prefixo,
          descricao: v.relato || `Novidade na viatura ${v.prefixo}.`
        }))
      ]);

      const { gerarPdfPassagem, baixarPdf } = await import('../../lib/passagemPdf');
      const bytes = await gerarPdfPassagem({
        header: state.header,
        vtrs: state.vtrs,
        guarnicao: state.guarnicao,
        ronda: state.ronda,
        escala: state.escala,
        rondantes: state.rondantes,
        livro: state.livro
      });
      baixarPdf(bytes, `passagem-${state.header.prontidao}-${state.header.data}.pdf`.replace(/\s+/g, '-'));
      setFeito(true);
    } finally {
      setGerando(false);
    }
  }

  return (
    <StepShell numero={6} titulo="Revisar e Gerar PDF" instrucao="Revise as informações antes de gerar o PDF.">
      <div className="rounded-lg border border-line">
        <div className="px-4">
          <Linha rotulo="Viatura(s)">{state.vtrs.map((v) => v.prefixo).join(', ') || '—'}</Linha>
          <Linha rotulo="Guarnição">{state.guarnicao.length} militar(es) cadastrado(s)</Linha>
          <Linha rotulo="Ronda">
            Pontos vistoriados: {state.ronda.pontos.length}
            <br />
            Situação anormal: {alteracoesRonda.length > 0 ? `Sim (${alteracoesRonda.length})` : 'Não'}
          </Linha>
          <Linha rotulo="Escala de Hora">
            {state.escala.length} períodos · Delegação do livro: {state.header.delegacaoLivro || '—'}
            {state.header.telegrafista ? <><br />Telegrafista: {state.header.telegrafista}</> : null}
            {state.rondantes.length > 0 ? <><br />Rondantes: {state.rondantes.length} faixa(s)</> : null}
          </Linha>
          <Linha rotulo="Livro">
            {livroCN.length > 0 ? `${livroCN.length} viatura(s) C/N` : 'Todas S/N'}
            {state.header.chefeMotoristas ? ` · Chefe: ${state.header.chefeMotoristas}` : ''}
          </Linha>
        </div>
      </div>

      {(alteracoesRonda.length > 0 || livroCN.length > 0) && (
        <p className="mt-3 text-xs text-primary">
          {alteracoesRonda.length + livroCN.length} pendência(s) serão registradas ao gerar o PDF.
        </p>
      )}

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={gerar}
          disabled={gerando}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {gerando ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
          {gerando ? 'Gerando...' : 'Gerar PDF'}
        </button>
        <button
          type="button"
          onClick={() => state.prev()}
          className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-bold text-neutral-600 transition hover:border-neutral-400"
        >
          Voltar
        </button>
      </div>

      {feito && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={16} /> PDF gerado e pendências registradas.
        </div>
      )}
    </StepShell>
  );
}
