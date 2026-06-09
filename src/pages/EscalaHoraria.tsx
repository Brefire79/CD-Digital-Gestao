import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { Select } from '../components/Select';
import { StatusBadge } from '../components/StatusBadge';
import { useOperational } from '../contexts/OperationalContext';
import type { EscalaHoraria as EscalaHorariaItem, EscalaFuncao } from '../types/domain';

const dayRows = [
  { horario_inicio: '07:30', horario_fim: '12:00', militar_nome: 'Telegrafista', funcao: 'Telegrafista', observacao: 'Fixo' },
  { horario_inicio: '12:00', horario_fim: '14:00', militar_nome: 'Auxiliar do Auto Bomba', funcao: 'Alimentação', observacao: 'Revezamento 2x1' },
  { horario_inicio: '14:00', horario_fim: '16:00', militar_nome: 'Auxiliar do Auto Bomba', funcao: 'Alimentação', observacao: 'Alternado pelo Canil' },
  { horario_inicio: '16:00', horario_fim: '17:00', militar_nome: 'Telegrafista', funcao: 'Telegrafista', observacao: 'Fixo' },
  { horario_inicio: '17:00', horario_fim: '18:00', militar_nome: 'Escolha do Cabo de Dia', funcao: 'Definir no plantão', observacao: 'Aberto' },
  { horario_inicio: '18:00', horario_fim: '22:00', militar_nome: 'Telegrafista', funcao: 'Telegrafista', observacao: 'Fixo' }
];

function buildPreviewNightRows(inicioNoturno: '22:00' | '23:00') {
  const startsAt23 = inicioNoturno === '23:00';
  const rows: EscalaHorariaItem[] = [];

  if (startsAt23) {
    rows.push({
      id: 'preview-fixed-22',
      escala_id: 'preview',
      horario_inicio: '22:00',
      horario_fim: '23:00',
      militar_nome: 'Telegrafista',
      graduacao: '',
      funcao: 'Telegrafista',
      observacao: 'Fixo'
    });
  }

  const slots = startsAt23
    ? [['23:00', '00:10'], ['00:10', '01:20'], ['01:20', '02:30'], ['02:30', '03:40'], ['03:40', '04:50'], ['04:50', '06:00']]
    : [['22:00', '23:08'], ['23:08', '00:16'], ['00:16', '01:24'], ['01:24', '02:32'], ['02:32', '03:40'], ['03:40', '04:48'], ['04:48', '06:00']];

  slots.forEach(([inicio, fim], index) => {
    const criterio = index === 0 ? 'Motorista UR' : index === 1 ? 'Motorista AB' : index === 2 ? 'Motorista Canil' : 'Rotativo';
    rows.push({
      id: `preview-${inicio}`,
      escala_id: 'preview',
      horario_inicio: inicio,
      horario_fim: fim,
      militar_nome: index < 3 ? `Definir ${criterio}` : 'Definir pelo Cabo de Dia',
      graduacao: '',
      funcao: criterio,
      observacao: criterio
    });
  });

  rows.push({
    id: 'preview-fixed-06',
    escala_id: 'preview',
    horario_inicio: '06:00',
    horario_fim: '07:30',
    militar_nome: 'Telegrafista',
    graduacao: '',
    funcao: 'Telegrafista',
    observacao: 'Fixo'
  });

  return rows;
}

function displayMilitar(item: Pick<EscalaHorariaItem, 'graduacao' | 'militar_nome'>) {
  return `${item.graduacao ? `${item.graduacao} PM ` : ''}${item.militar_nome}`;
}

function hasGraduacao(row: unknown): row is Pick<EscalaHorariaItem, 'graduacao' | 'militar_nome'> {
  return typeof row === 'object' && row !== null && 'graduacao' in row && typeof (row as { graduacao?: unknown }).graduacao === 'string';
}

function formatMilitar(item: Pick<EscalaFuncao, 'graduacao' | 'militar_nome'>) {
  return `${item.graduacao} PM ${item.militar_nome}`;
}

function isSargento(graduacao: string) {
  const normalized = graduacao.toLowerCase();
  return normalized.includes('sgt') || normalized.includes('sargento');
}

function isViaturaDaEscalaHoraria(viatura: { prefixo: string; tipo: string }) {
  const text = `${viatura.prefixo} ${viatura.tipo}`.toLowerCase();
  return /\bur\b/.test(text) || /\bab\b/.test(text) || text.includes('abs') || text.includes('canil') || /\bcn\b/.test(text);
}

export function EscalaHoraria() {
  const { escala, funcoes, escalaHoraria, generateEscalaHoraria, prontidoes, viaturas } = useOperational();
  const [inicioNoturno, setInicioNoturno] = useState<'22:00' | '23:00'>('23:00');
  const elegiveis = funcoes.filter((item) => item.entra_escala_horaria);
  const bloqueados = funcoes.filter((item) => !item.entra_escala_horaria);
  const quantidadeMaximaSugerida = Math.max(1, elegiveis.length, 3);
  const [quantidadeMilitares, setQuantidadeMilitares] = useState(quantidadeMaximaSugerida);
  const quantidadeValida = Math.max(1, Math.min(quantidadeMilitares, quantidadeMaximaSugerida));
  const prontidao = prontidoes.find((item) => item.id === escala.prontidao_id)?.nome ?? 'Amarela';
  const previewNightRows = buildPreviewNightRows(inicioNoturno);
  const documentoRows = [...dayRows, ...previewNightRows];
  const comandante = escala.comandante || 'Cmt da Prontidão';
  const oficialArea = escala.oficial_area || 'Definir Tenente';
  const adjuntoDia = escala.adjunto_dia || funcoes.find((item) => item.funcao.toLowerCase().includes('adjunto'))?.militar_nome;
  const sargentosRonda = funcoes.filter((item) => isSargento(item.graduacao));
  const primeiroRondante = sargentosRonda[0] ? formatMilitar(sargentosRonda[0]) : 'Definir Sgt rondante';
  const segundoRondante = sargentosRonda[1] ? formatMilitar(sargentosRonda[1]) : primeiroRondante;
  const rondantes = primeiroRondante === segundoRondante
    ? [{ horario_inicio: '00:00', horario_fim: '06:00', militar_nome: primeiroRondante }]
    : [
        { horario_inicio: '00:00', horario_fim: '03:00', militar_nome: primeiroRondante },
        { horario_inicio: '03:00', horario_fim: '06:00', militar_nome: segundoRondante }
      ];
  const viaturasAtivas = viaturas.filter((viatura) => viatura.ativa);
  const viaturasHora = viaturasAtivas.filter(isViaturaDaEscalaHoraria);
  const viaturasDocumento = viaturasAtivas.slice(0, 4);
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
              max={quantidadeMaximaSugerida}
              value={quantidadeMilitares}
              onChange={(event) => setQuantidadeMilitares(Number(event.target.value))}
            />
            <Button onClick={() => generateEscalaHoraria({ inicioNoturno, quantidadeMilitares: quantidadeValida })}>Gerar escala noturna</Button>
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
      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Modelo do documento pronto</h3>
            <p className="text-sm text-slate-400">Prévia visual para o futuro PDF A4 da escala completa.</p>
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
                      <td className="border border-slate-500 text-left pl-2">{hasGraduacao(row) ? displayMilitar(row) : row.militar_nome}</td>
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
                    {viaturasDocumento.map((viatura) => <th key={viatura.id} className="border border-slate-500">{viatura.prefixo}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {['CMT', 'MOT', 'AUX', 'AUX', 'Estagiário'].map((funcao, index) => (
                    <tr key={funcao + index}>
                      <td className="border border-slate-500 font-bold">{funcao}</td>
                      {viaturasDocumento.map((viatura) => (
                        <td key={`${viatura.id}-${funcao}`} className="border border-slate-500">Definir pelo Cabo de Dia</td>
                      ))}
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
