import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { Select } from '../components/Select';
import { StatusBadge } from '../components/StatusBadge';
import { useOperational } from '../contexts/OperationalContext';
import { gerarLinhasEscala } from '../lib/escalaGenerator';
import { readStore, writeStore } from '../lib/storage';
import type { EscalaHoraria as EscalaHorariaItem, EscalaFuncao } from '../types/domain';

function displayMilitar(item: Pick<EscalaHorariaItem, 'graduacao' | 'militar_nome'>) {
  return `${item.graduacao ? `${item.graduacao} PM ` : ''}${item.militar_nome || 'Definir pelo Cabo de Dia'}`;
}

function formatMilitar(item: Pick<EscalaFuncao, 'graduacao' | 'militar_nome'>) {
  return `${item.graduacao} PM ${item.militar_nome}`;
}

function isViaturaDaEscalaHoraria(viatura: { prefixo: string; tipo: string }) {
  const text = `${viatura.prefixo} ${viatura.tipo}`.toLowerCase();
  return /\bur\b/.test(text) || /\bab\b/.test(text) || text.includes('abs') || text.includes('canil') || /\bcn\b/.test(text);
}

function belongsToViatura(funcao: EscalaFuncao, prefixo: string) {
  return funcao.funcao.toLowerCase().includes(prefixo.toLowerCase());
}

function belongsToPapel(funcao: EscalaFuncao, papel: string) {
  return funcao.funcao.toLowerCase().startsWith(papel.toLowerCase());
}

function nomesDaViatura(funcoes: EscalaFuncao[], prefixo: string, papel: string) {
  const lancados = funcoes.filter((funcao) => belongsToViatura(funcao, prefixo) && belongsToPapel(funcao, papel));
  return lancados.length > 0
    ? lancados.map((funcao) => formatMilitar(funcao)).join(' / ')
    : 'Definir pelo Cabo de Dia';
}

export function EscalaHoraria() {
  const {
    escala,
    funcoes,
    escalaHoraria,
    rondantes,
    generateEscalaHoraria,
    updateEscalaHoraria,
    generateRondantes,
    updateRondante,
    prontidoes,
    viaturas
  } = useOperational();
  const [inicioNoturno, setInicioNoturno] = useState<'22:00' | '23:00'>('23:00');
  const viaturasAtivas = viaturas.filter((viatura) => viatura.ativa);
  const elegiveis = funcoes.filter((item) => {
    const viatura = viaturasAtivas.find((viaturaAtiva) => belongsToViatura(item, viaturaAtiva.prefixo));
    const graduacao = item.graduacao.trim().toLowerCase();
    const sdOuCb = graduacao === 'sd' || graduacao === 'cb' || graduacao.includes('soldado') || graduacao.includes('cabo');
    return Boolean(item.entra_escala_horaria && sdOuCb && viatura && isViaturaDaEscalaHoraria(viatura));
  });
  const bloqueados = funcoes.filter((item) => !elegiveis.some((elegivel) => elegivel.id === item.id));
  const quantidadeMaximaSugerida = elegiveis.length;
  const [quantidadeMilitares, setQuantidadeMilitares] = useState(Math.max(1, quantidadeMaximaSugerida));
  const quantidadeValida = quantidadeMaximaSugerida === 0
    ? 0
    : Math.max(1, Math.min(quantidadeMilitares, quantidadeMaximaSugerida));
  const [viaturasDocumentoIds, setViaturasDocumentoIds] = useState<string[]>(() => readStore('cd_viaturas_documento', []));
  const prontidao = prontidoes.find((item) => item.id === escala.prontidao_id)?.nome ?? 'Amarela';
  const previewRows: EscalaHorariaItem[] = gerarLinhasEscala({ guarnicao: [], inicioNoturno, telegrafista: escala.telegrafista }).map((linha) => ({
    id: linha.id,
    escala_id: 'preview',
    horario_inicio: linha.inicio,
    horario_fim: linha.fim,
    militar_nome: linha.militar || 'Definir pelo Cabo de Dia',
    graduacao: '',
    funcao: linha.cobertura,
    observacao: linha.criterio
  }));
  const documentoRows = escalaHoraria.length > 0 ? escalaHoraria : previewRows;
  const comandante = escala.comandante || 'Cmt da Prontidão';
  const oficialArea = escala.oficial_area || 'Definir Tenente';
  const adjuntoDia = escala.adjunto_dia || funcoes.find((item) => item.funcao.toLowerCase().includes('adjunto'))?.militar_nome;
  const viaturasHora = viaturasAtivas.filter(isViaturaDaEscalaHoraria);
  const viaturasDocumento = viaturasDocumentoIds
    .map((id) => viaturasAtivas.find((viatura) => viatura.id === id))
    .filter((viatura): viatura is (typeof viaturasAtivas)[number] => Boolean(viatura));

  useEffect(() => {
    const idsValidos = viaturasDocumentoIds.filter((id) => viaturasAtivas.some((viatura) => viatura.id === id)).slice(0, 4);
    if (idsValidos.length !== viaturasDocumentoIds.length) setViaturasDocumentoIds(idsValidos);
    writeStore('cd_viaturas_documento', idsValidos);
  }, [viaturasDocumentoIds, viaturasAtivas]);

  function toggleViaturaDocumento(id: string) {
    setViaturasDocumentoIds((atuais) => {
      if (atuais.includes(id)) return atuais.filter((item) => item !== id);
      if (atuais.length >= 4) return atuais;
      return [...atuais, id];
    });
  }
  const resumo = useMemo(() => {
    const inicio = inicioNoturno === '22:00' ? '22h00' : '23h00';
    if (quantidadeValida === 0) return 'Nenhum Sd/Cb vinculado a UR, ABS/AB ou Canil. Complete a Escala do Dia antes de gerar.';
    return `${quantidadeValida} militares dividindo o período de ${inicio} às 06h00. Telegrafista permanece fixo no último horário das 06h00 às 07h30.`;
  }, [inicioNoturno, quantidadeValida]);

  return (
    <div className="grid gap-4">
      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <h3 className="text-lg font-bold">Escala horária rotativa</h3>
            <p className="text-sm text-slate-400">Somente Sd e Cb das VTRs UR, ABS/AB e Canil entram automaticamente. Sgt e Oficiais ficam fora, salvo inclusão manual pelo Cabo de Dia.</p>
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
              max={Math.max(1, quantidadeMaximaSugerida)}
              value={quantidadeMilitares}
              disabled={quantidadeMaximaSugerida === 0}
              onChange={(event) => setQuantidadeMilitares(Number(event.target.value))}
            />
            <Button disabled={quantidadeValida === 0} onClick={() => generateEscalaHoraria({ inicioNoturno, quantidadeMilitares: quantidadeValida })}>Gerar escala noturna</Button>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">Pré-elegíveis por graduação</h3>
          <p className="mb-3 text-sm text-slate-400">Entram na escala de hora somente se estiverem nas guarnições UR, ABS/AB ou Canil.</p>
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
      <Card>
        <h3 className="font-bold">Viaturas no documento</h3>
        <p className="mt-1 text-sm text-slate-400">O Cabo de Dia define até quatro viaturas. A ordem de seleção será a ordem das colunas.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {viaturasAtivas.map((viatura) => {
            const selecionada = viaturasDocumentoIds.includes(viatura.id);
            const limiteAtingido = viaturasDocumentoIds.length >= 4 && !selecionada;
            return (
              <button
                key={viatura.id}
                type="button"
                disabled={limiteAtingido}
                onClick={() => toggleViaturaDocumento(viatura.id)}
                className={`min-h-12 rounded-lg border px-3 py-2 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${selecionada ? 'border-operacional-accent bg-operacional-accent text-slate-950' : 'border-slate-700 bg-slate-950 text-white'}`}
              >
                {selecionada ? `${viaturasDocumentoIds.indexOf(viatura.id) + 1}. ` : ''}{viatura.prefixo}
              </button>
            );
          })}
        </div>
      </Card>
      {escalaHoraria.length > 0 && (
        <Card>
          <h3 className="mb-2 font-bold">Escala completa gerada</h3>
          <p className="text-sm text-slate-400">A prévia do documento abaixo já está usando estes horários. Linhas em aberto continuam para ajuste manual do Cabo de Dia.</p>
        </Card>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {escalaHoraria.map((item) => (
          <Card key={item.id}>
            <div className="grid grid-cols-2 gap-2">
              <FormInput label="Início" type="time" value={item.horario_inicio} onChange={(event) => updateEscalaHoraria(item.id, { horario_inicio: event.target.value })} />
              <FormInput label="Fim" type="time" value={item.horario_fim} onChange={(event) => updateEscalaHoraria(item.id, { horario_fim: event.target.value })} />
            </div>
            <div className="mt-3 grid gap-2">
              <FormInput label="Graduação" value={item.graduacao} placeholder="Sd, Cb, Sgt..." onChange={(event) => updateEscalaHoraria(item.id, { graduacao: event.target.value })} />
              <FormInput label="Militar" value={item.militar_nome} onChange={(event) => updateEscalaHoraria(item.id, { militar_nome: event.target.value })} />
              <FormInput label="Função" value={item.funcao} onChange={(event) => updateEscalaHoraria(item.id, { funcao: event.target.value })} />
              <Select label="OBS" value={item.observacao} onChange={(event) => updateEscalaHoraria(item.id, { observacao: event.target.value })}>
                {[item.observacao, 'Fixo', 'Rotativo', 'Motorista UR', 'Motorista AB', 'Motorista CN', 'Revezamento 2x1', 'Alternado pelo Canil', 'Telegrafista', 'Manual (Cabo de Dia)']
                  .filter((value, index, values) => value && values.indexOf(value) === index)
                  .map((value) => <option key={value}>{value}</option>)}
              </Select>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold">Rondantes</h3>
            <p className="text-sm text-slate-400">A geração automática considera somente Sgt. Todas as faixas permanecem editáveis.</p>
          </div>
          <Button type="button" variant="secondary" onClick={generateRondantes}>Gerar rondantes</Button>
        </div>
        {rondantes.length === 0 ? (
          <p className="mt-3 rounded-lg bg-slate-950 p-3 text-sm text-slate-400">Nenhum Sgt disponível ou rondantes ainda não gerados.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {rondantes.map((ronda) => (
              <div key={ronda.id} className="grid gap-2 rounded-lg bg-slate-950 p-3 sm:grid-cols-[120px_120px_1fr]">
                <FormInput label="Início" type="time" value={ronda.horario_inicio} onChange={(event) => updateRondante(ronda.id, { horario_inicio: event.target.value })} />
                <FormInput label="Fim" type="time" value={ronda.horario_fim} onChange={(event) => updateRondante(ronda.id, { horario_fim: event.target.value })} />
                <FormInput label="Sgt rondante" value={ronda.militar_nome} onChange={(event) => updateRondante(ronda.id, { militar_nome: event.target.value })} />
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Modelo do documento pronto</h3>
            <p className="text-sm text-slate-400">Prévia visual da escala completa com guarnições reais lançadas na Escala do Dia.</p>
          </div>
          <span className="rounded-full bg-slate-950 px-3 py-2 text-xs font-bold text-operacional-accent">A4 vertical</span>
        </div>
        <div className="overflow-x-auto rounded-lg bg-slate-950 p-3">
          <div className="mx-auto w-[794px] bg-white p-5 text-[11px] leading-tight text-slate-950 shadow-2xl">
            <div className="border-2 border-blue-300">
              <div className="bg-blue-200 py-2 text-center font-bold uppercase">
                <p>POLICIA MILITAR DO ESTADO DE SAO PAULO</p>
                <p>CORPO DE BOMBEIROS</p>
                <p>POSTO DE BOMBEIROS IPIRANGA</p>
                <p>{new Date(escala.data_servico_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} - Prontidão {prontidao}</p>
              </div>
              <table className="w-full border-collapse text-center">
                <tbody>
                  <tr>
                    <td className="border border-slate-500 font-bold">Oficial de Área 1º GB</td>
                    <td className="border border-slate-500">{oficialArea}</td>
                    <td className="border border-slate-500 font-bold">Telegrafista</td>
                    <td className="border border-slate-500">{escala.telegrafista}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-500 font-bold">Cmt de Prontidão</td>
                    <td className="border border-slate-500">{comandante}</td>
                    <td className="border border-slate-500 font-bold">Refeitório</td>
                    <td className="border border-slate-500">Básica</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-500 font-bold">Adjunto de Dia</td>
                    <td className="border border-slate-500">{adjuntoDia || 'Definir pelo Cabo de Dia'}</td>
                    <td className="border border-slate-500 font-bold">Ch. dos Motoristas</td>
                    <td className="border border-slate-500">{escala.chefe_motoristas}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-500 font-bold">Cb de Dia</td>
                    <td className="border border-slate-500">{escala.cabo_dia}</td>
                    <td className="border border-slate-500 font-bold">OBS:</td>
                    <td className="border border-slate-500">Escala gerada pelo CD Digital</td>
                  </tr>
                </tbody>
              </table>
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-slate-500">Início</th>
                    <th className="border border-slate-500">às</th>
                    <th className="border border-slate-500">Final</th>
                    <th className="border border-slate-500">Nomes</th>
                    <th className="border border-slate-500">Função</th>
                    <th className="border border-slate-500">OBS</th>
                  </tr>
                </thead>
                <tbody>
                  {documentoRows.map((row) => (
                    <tr key={`${row.horario_inicio}-${row.horario_fim}-${row.militar_nome}`}>
                      <td className="border border-slate-500">{row.horario_inicio}</td>
                      <td className="border border-slate-500">às</td>
                      <td className="border border-slate-500">{row.horario_fim}</td>
                      <td className="border border-slate-500 text-left pl-2">{displayMilitar(row)}</td>
                      <td className="border border-slate-500">{row.funcao}</td>
                      <td className="border border-slate-500 font-bold">{row.observacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border border-slate-500 py-1 text-center font-bold">Obs: Na ausência do sentinela divida a hora com o próximo ao meio.</div>
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="bg-blue-100"><th className="border border-slate-500" colSpan={4}>Rondantes</th></tr>
                </thead>
                <tbody>
                  {rondantes.map((ronda) => (
                    <tr key={ronda.horario_inicio}>
                      <td className="border border-slate-500">{ronda.horario_inicio}</td>
                      <td className="border border-slate-500">às</td>
                      <td className="border border-slate-500">{ronda.horario_fim}</td>
                      <td className="border border-slate-500 text-left pl-2">{ronda.militar_nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border border-slate-500 bg-blue-50 px-2 py-1 text-center font-bold">
                Critério da escala de hora: somente UR, ABS/AB e Canil entram no rodízio. Viaturas consideradas: {viaturasHora.map((viatura) => viatura.prefixo).join(', ') || 'Definir UR, ABS/AB e Canil'}.
              </div>
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-slate-500">FUNÇÃO</th>
                    {viaturasDocumento.length > 0
                      ? viaturasDocumento.map((viatura) => <th key={viatura.id} className="border border-slate-500">{viatura.prefixo}</th>)
                      : <th className="border border-slate-500">Definir VTRs</th>}
                  </tr>
                </thead>
                <tbody>
                  {['CMT', 'MOT', 'AUX', 'AUX', 'Estagiário'].map((funcao, index) => (
                    <tr key={funcao + index}>
                      <td className="border border-slate-500 font-bold">{funcao}</td>
                      {viaturasDocumento.length > 0 ? viaturasDocumento.map((viatura) => (
                        <td key={`${viatura.id}-${funcao}`} className="border border-slate-500">{nomesDaViatura(funcoes, viatura.prefixo, funcao)}</td>
                      )) : <td className="border border-slate-500">Definir pelo Cabo de Dia</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-blue-100 border border-slate-500 py-1 text-center font-bold">ALTERAÇÕES DE SERVIÇO</div>
              <div className="min-h-14 border border-slate-500 p-2 text-center">{escala.observacoes || 'Sem alterações lançadas.'}</div>
              <div className="bg-blue-100 border border-slate-500 py-1 text-center font-bold">Manutenção do Quartel</div>
              <div className="grid grid-cols-2">
                <div className="border border-slate-500 p-2">Barracão de Vtrs<br />Rancho - Aux da UR<br />Piscina - Aux do AB</div>
                <div className="border border-slate-500 p-2">Paineiras<br />Quadra<br />Recolher lixo do PB e Banheiros</div>
              </div>
              <div className="grid grid-cols-2 pt-8 text-center">
                <div className="border-t border-slate-700 mx-10 py-1">{escala.cabo_dia}<br />Cb de Dia</div>
                <div className="border-t border-slate-700 mx-10 py-1">{comandante}<br />Cmt Prontidão</div>
              </div>
              <div className="bg-blue-200 p-1 text-center text-[9px]">Nós Policiais Militares, sob a proteção de Deus estamos compromissados com a Defesa da Vida, da Integridade Física e da Dignidade da Pessoa Humana</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
