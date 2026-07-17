import { useEffect, useState } from 'react';
import { CheckCircle2, LockKeyhole, Plus, Trash2 } from 'lucide-react';
import { usePassagem, type Novidade } from '../../store/passagem';
import { useOperational } from '../../contexts/OperationalContext';
import { formatarDataOperacional, getCurrentProntidaoName } from '../../lib/prontidaoScale';
import { gerarPdfLivroMotoristas } from '../../lib/livroMotoristasPdf';
import { salvarLivroNoDrive } from '../../lib/googleDrive';
import { Field, Segmented, StepShell, inputClass } from './Field';
import { StepNav } from './WizardLayout';

export function StepLivro() {
  const livro = usePassagem((s) => s.livro);
  const livroFechamento = usePassagem((s) => s.livroFechamento);
  const vtrs = usePassagem((s) => s.vtrs);
  const header = usePassagem((s) => s.header);
  const updateLivroVtr = usePassagem((s) => s.updateLivroVtr);
  const addLivroVtr = usePassagem((s) => s.addLivroVtr);
  const removeLivroVtr = usePassagem((s) => s.removeLivroVtr);
  const sincronizarLivroComVtrs = usePassagem((s) => s.sincronizarLivroComVtrs);
  const encerrarLivro = usePassagem((s) => s.encerrarLivro);
  const setHeader = usePassagem((s) => s.setHeader);
  const { pendencias, addPendencias, updatePendencia } = useOperational();
  const next = usePassagem((s) => s.next);
  const prev = usePassagem((s) => s.prev);
  const [prefixoExtra, setPrefixoExtra] = useState('');
  const [tipoExtra, setTipoExtra] = useState('Viatura administrativa');
  const [confirmouAssinatura, setConfirmouAssinatura] = useState(false);
  const [salvandoDrive, setSalvandoDrive] = useState(false);
  const [erroDrive, setErroDrive] = useState('');
  const agora = new Date();
  const dataHoje = formatarDataOperacional(agora);
  const prontidaoHoje = getCurrentProntidaoName();
  const fechado = livroFechamento.status === 'encerrado';
  const relatosPendentes = livro.filter((item) => item.novidade === 'C/N' && !item.relato.trim());
  const origemFechamento = `fechamento-livro-${dataHoje}-${prontidaoHoje}`;
  const pendenciaFechamento = pendencias.find((item) => item.origem_id === origemFechamento);

  useEffect(() => {
    sincronizarLivroComVtrs();
  }, [sincronizarLivroComVtrs, vtrs]);

  useEffect(() => {
    if (header.data !== dataHoje || header.prontidao !== prontidaoHoje) {
      setHeader({ data: dataHoje, prontidao: prontidaoHoje });
    }
  }, [dataHoje, header.data, header.prontidao, prontidaoHoje, setHeader]);

  useEffect(() => {
    if (!fechado) {
      addPendencias([{
        origem: 'livro_motoristas',
        origem_id: origemFechamento,
        tipo: 'Fechamento do Livro',
        alvo: 'Chefe dos Motoristas',
        descricao: 'Revisar, assinar e encerrar o Livro dos Motoristas ao término do plantão.'
      }]);
    }
  }, [addPendencias, fechado, origemFechamento]);

  function adicionarExtra() {
    addLivroVtr(prefixoExtra, tipoExtra);
    setPrefixoExtra('');
  }

  async function fecharLivro() {
    const assinante = header.chefeMotoristas.trim();
    if (!assinante || !confirmouAssinatura || relatosPendentes.length > 0 || livro.length === 0) return;
    setErroDrive('');
    setSalvandoDrive(true);
    try {
      const encerradoEm = new Date();
      const pdf = await gerarPdfLivroMotoristas({ header, livro, assinante, encerradoEm });
      const codigoData = `${String(encerradoEm.getDate()).padStart(2, '0')}${encerradoEm.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}${String(encerradoEm.getFullYear()).slice(-2)}`;
      const nomeArquivo = `${codigoData}-Livro-dos-Motoristas-${prontidaoHoje}.pdf`;
      const backup = await salvarLivroNoDrive({ prontidao: prontidaoHoje, ano: encerradoEm.getFullYear(), nomeArquivo, pdf });
      encerrarLivro(assinante, backup);
      if (pendenciaFechamento) {
        updatePendencia(
          pendenciaFechamento.id,
          'Resolvida',
          `Livro assinado por ${assinante}, encerrado e salvo em ${backup.caminho}/${backup.nomeArquivo}.`
        );
      }
    } catch (error) {
      setErroDrive(error instanceof Error ? error.message : 'Não foi possível salvar o Livro no Google Drive.');
    } finally {
      setSalvandoDrive(false);
    }
  }

  return (
    <StepShell
      numero={5}
      titulo="Livro dos Motoristas"
      instrucao="Documento operacional por viatura. Marque S/N ou C/N; ao selecionar C/N, anote o relato. Os dados podem ser atualizados até o término do plantão."
    >
      {/* Cabeçalho oficial */}
      <div className="rounded-lg border border-line bg-charcoal px-4 py-3 text-center text-white">
        <p className="text-[11px] font-semibold text-primarySoft">Polícia Militar do Estado de São Paulo</p>
        <p className="text-xs font-bold text-white">Corpo de Bombeiros</p>
        <p className="text-sm font-extrabold">Estação de Bombeiros Ipiranga</p>
        <p className="text-[11px] text-neutral-400">
          {header.prontidao} - {header.data}
        </p>
      </div>

      {!fechado && <section className="mt-4 rounded-xl border border-white bg-white p-4 shadow-[0_3px_10px_rgba(15,92,153,0.08)]">
        <p className="text-xs font-bold uppercase tracking-wide text-[#0F5C99]">Adicionar VTR extra</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Use para viatura administrativa, estacionada no quartel ou que irá pernoitar. Ela será incluída somente no Livro dos Motoristas.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_190px_auto]">
          <input
            className={inputClass}
            placeholder="Prefixo da VTR"
            value={prefixoExtra}
            onChange={(e) => setPrefixoExtra(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarExtra())}
          />
          <select className={inputClass} value={tipoExtra} onChange={(e) => setTipoExtra(e.target.value)}>
            <option>Viatura administrativa</option>
            <option>Estacionada no quartel</option>
            <option>Pernoite no quartel</option>
            <option>Outra viatura adicional</option>
          </select>
          <button
            type="button"
            onClick={adicionarExtra}
            disabled={!prefixoExtra.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-[10px] bg-[#0F5C99] px-4 text-xs font-bold uppercase text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} /> Adicionar
          </button>
        </div>
      </section>}

      {/* Linhas de VTR */}
      <div className="mt-4 grid gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">VTRs do Livro dos Motoristas</p>
        {livro.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#B9D6E8] bg-white/60 p-4 text-sm text-[#4A6B85]">
            Nenhuma VTR cadastrada. Adicione as viaturas do plantão na primeira etapa ou inclua uma VTR extra acima.
          </div>
        )}
        {livro.map((v) => {
          const comNovidade = v.novidade === 'C/N';
          return (
            <div key={v.id} className="rounded-lg border border-line p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink">{v.prefixo}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                      v.origem === 'adicional' ? 'bg-amber-100 text-amber-700' : 'bg-[#EAF4FC] text-[#0F5C99]'
                    }`}>
                      {v.origem === 'adicional' ? 'Adicional' : 'Plantão'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{v.tipo}</p>
                </div>
                <div className="flex items-center gap-2">
                  {fechado ? (
                    <span className={`rounded-lg px-4 py-2 text-sm font-bold ${v.novidade === 'C/N' ? 'bg-red-50 text-primary' : 'bg-emerald-100 text-emerald-700'}`}>
                      {v.novidade}
                    </span>
                  ) : <>
                  <Segmented<Novidade>
                    value={v.novidade}
                    onChange={(novidade) => updateLivroVtr(v.id, { novidade })}
                    options={[
                      { value: 'S/N', label: 'S/N', tone: 'ok' },
                      { value: 'C/N', label: 'C/N', tone: 'alert' }
                    ]}
                  />
                  {v.origem === 'adicional' && (
                    <button
                      type="button"
                      onClick={() => removeLivroVtr(v.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-neutral-400 transition hover:border-primary hover:text-primary"
                      aria-label={`Remover ${v.prefixo} do Livro dos Motoristas`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  </>}
                </div>
              </div>
              {comNovidade && (
                fechado ? (
                  <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">{v.relato || 'Sem relato informado.'}</p>
                ) : <textarea
                  rows={2}
                  className={`${inputClass} mt-3`}
                  placeholder="Relato da novidade: o que foi identificado, manutenção relatada ou feita..."
                  value={v.relato}
                  onChange={(e) => updateLivroVtr(v.id, { relato: e.target.value })}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4">
        <Field label="Obs Geral: relatos">
          <textarea
            rows={2}
            className={inputClass}
            placeholder="Observações gerais do livro..."
            value={header.obsGeralLivro}
            onChange={(e) => setHeader({ obsGeralLivro: e.target.value })}
            disabled={fechado}
          />
        </Field>
        <Field label="Chefe dos Motoristas (da escala/cabeçalho)">
          <input
            className={inputClass}
            placeholder="Preenchido a partir da escala"
            value={header.chefeMotoristas}
            onChange={(e) => setHeader({ chefeMotoristas: e.target.value })}
            disabled={fechado}
          />
        </Field>
      </div>

      <section className={`mt-5 rounded-xl border p-4 ${fechado ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        {fechado ? (
          <div className="flex items-start gap-3 text-emerald-800">
            <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-bold">Livro assinado e encerrado</p>
              <p className="mt-1 text-sm">
                {livroFechamento.assinadoPor} · {new Date(livroFechamento.encerradoEm).toLocaleString('pt-BR')}
              </p>
              <p className="mt-2 text-xs">O registro foi preservado. No próximo plantão, o Livro será iniciado sem as VTRs do turno encerrado.</p>
              {livroFechamento.backupDrive && (
                <a
                  href={livroFechamento.backupDrive.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-bold underline"
                >
                  Abrir backup em {livroFechamento.backupDrive.caminho}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3 text-amber-900">
              <LockKeyhole className="mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-bold">Pendência do Chefe dos Motoristas</p>
                <p className="mt-1 text-sm">Ao término do plantão, revise as VTRs, assine e encerre o Livro.</p>
              </div>
            </div>
            {relatosPendentes.length > 0 && (
              <p className="mt-3 rounded-lg bg-white/70 p-2 text-xs font-semibold text-primary">
                Preencha o relato de {relatosPendentes.length} VTR(s) marcada(s) com C/N antes do fechamento.
              </p>
            )}
            {erroDrive && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-white p-3 text-xs font-semibold text-primary">
                {erroDrive} O Livro continua aberto e a pendência não foi encerrada.
              </p>
            )}
            <label className="mt-4 flex items-start gap-2 text-sm text-amber-950">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#0F5C99]"
                checked={confirmouAssinatura}
                onChange={(e) => setConfirmouAssinatura(e.target.checked)}
              />
              Confirmo a revisão e a assinatura eletrônica do Chefe dos Motoristas informado acima.
            </label>
            <button
              type="button"
              onClick={fecharLivro}
              disabled={salvandoDrive || !header.chefeMotoristas.trim() || !confirmouAssinatura || relatosPendentes.length > 0 || livro.length === 0}
              className="mt-4 w-full rounded-[10px] bg-[#0F5C99] px-4 py-3 text-sm font-bold uppercase text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvandoDrive ? 'Salvando no Drive...' : 'Assinar, salvar no Drive e encerrar'}
            </button>
          </div>
        )}
      </section>

      <StepNav onNext={next} onPrev={prev} />
    </StepShell>
  );
}
