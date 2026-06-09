import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { escalaFuncoesSeed, escalaSeed, pendenciasSeed, prontidoesSeed, setoresSeed, viaturasSeed } from '../data/seeds';
import { readStore, uid, writeStore } from '../lib/storage';
import type { ChecklistItem, Escala, EscalaFuncao, EscalaHoraria, Pendencia, RelatoViatura, SetorQuartel, Viatura } from '../types/domain';

interface OperationalContextValue {
  prontidoes: typeof prontidoesSeed;
  viaturas: Viatura[];
  setores: SetorQuartel[];
  escala: Escala;
  funcoes: EscalaFuncao[];
  escalaHoraria: EscalaHoraria[];
  checklist: ChecklistItem[];
  relatos: RelatoViatura[];
  pendencias: Pendencia[];
  saveViatura: (viatura: Omit<Viatura, 'id'> & { id?: string }) => void;
  saveSetor: (setor: Omit<SetorQuartel, 'id'> & { id?: string }) => void;
  saveEscala: (escala: Escala) => void;
  saveFuncao: (funcao: Omit<EscalaFuncao, 'id' | 'escala_id'>) => void;
  generateEscalaHoraria: (options?: { inicioNoturno?: '22:00' | '23:00'; quantidadeMilitares?: number }) => void;
  updateChecklist: (item: ChecklistItem) => void;
  updateRelato: (relato: RelatoViatura) => void;
  updatePendencia: (id: string, status: Pendencia['status'], descricao: string) => void;
  archiveViatura: (id: string, transferidaPara: string, observacao: string) => void;
  deleteViatura: (id: string) => void;
}

const OperationalContext = createContext<OperationalContextValue | undefined>(undefined);

function allowsEscalaHoraria(graduacao: string) {
  const normalized = graduacao.trim().toLowerCase();
  return normalized === 'sd' || normalized === 'cb' || normalized.includes('soldado') || normalized.includes('cabo');
}

function initialChecklist(): ChecklistItem[] {
  return setoresSeed.map((setor) => ({
    id: `check-${setor.id}`,
    setor_id: setor.id,
    setor_nome: setor.nome,
    status: 'OK',
    observacao: ''
  }));
}

function initialRelatos(): RelatoViatura[] {
  return viaturasSeed.map((viatura) => ({
    id: `relato-${viatura.id}`,
    viatura_id: viatura.id,
    prefixo: viatura.prefixo,
    situacao: 'Operacional',
    tem_novidade: false,
    relato: '',
    relato_anterior: 'Sem alteração registrada no plantão anterior.'
  }));
}

function normalizeViatura(viatura: Viatura): Viatura {
  return {
    ...viatura,
    estacao_atual: viatura.estacao_atual || 'EB Centro',
    status_operacional: viatura.status_operacional || (viatura.ativa ? 'Rodando' : 'Histórico')
  };
}

function formatTime(totalMinutes: number) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function OperationalProvider({ children }: { children: ReactNode }) {
  const [viaturas, setViaturas] = useState(() => readStore('cd_viaturas', viaturasSeed).map(normalizeViatura));
  const [setores, setSetores] = useState(() => readStore('cd_setores', setoresSeed));
  const [escala, setEscala] = useState(() => readStore('cd_escala', escalaSeed));
  const [funcoes, setFuncoes] = useState(() => readStore('cd_funcoes', escalaFuncoesSeed));
  const [escalaHoraria, setEscalaHoraria] = useState(() => readStore<EscalaHoraria[]>('cd_escala_horaria', []));
  const [checklist, setChecklist] = useState(() => readStore('cd_checklist', initialChecklist()));
  const [relatos, setRelatos] = useState(() => readStore('cd_relatos', initialRelatos()));
  const [pendencias, setPendencias] = useState(() => readStore('cd_pendencias', pendenciasSeed));

  const persistPendencias = (next: Pendencia[]) => {
    setPendencias(next);
    writeStore('cd_pendencias', next);
  };

  const value = useMemo<OperationalContextValue>(() => ({
    prontidoes: prontidoesSeed,
    viaturas,
    setores,
    escala,
    funcoes,
    escalaHoraria,
    checklist,
    relatos,
    pendencias,
    saveViatura(viatura) {
      const next = viatura.id
        ? viaturas.map((item) => (item.id === viatura.id ? normalizeViatura({ ...item, ...viatura, updated_at: new Date().toISOString() } as Viatura) : item))
        : [normalizeViatura({ ...viatura, id: uid('vtr'), updated_at: new Date().toISOString() }), ...viaturas];
      setViaturas(next);
      writeStore('cd_viaturas', next);
    },
    saveSetor(setor) {
      const next = setor.id
        ? setores.map((item) => (item.id === setor.id ? { ...item, ...setor } as SetorQuartel : item))
        : [{ ...setor, id: uid('setor') }, ...setores];
      setSetores(next);
      writeStore('cd_setores', next);
    },
    saveEscala(nextEscala) {
      setEscala(nextEscala);
      writeStore('cd_escala', nextEscala);
    },
    saveFuncao(funcao) {
      const nextFuncao: EscalaFuncao = {
        ...funcao,
        id: uid('funcao'),
        escala_id: escala.id,
        entra_escala_horaria: allowsEscalaHoraria(funcao.graduacao)
      };
      const next = [nextFuncao, ...funcoes];
      setFuncoes(next);
      writeStore('cd_funcoes', next);
    },
    generateEscalaHoraria(options) {
      const inicioNoturno = options?.inicioNoturno ?? '23:00';
      const criteriosHora = ['Motorista UR', 'Motorista AB', 'Motorista Canil'];
      const elegiveisDaHora = funcoes.filter((funcao) => {
        const text = funcao.funcao.toLowerCase();
        const pertenceViaturaHora = /\bur\b/.test(text) || /\bab\b/.test(text) || text.includes('abs') || text.includes('canil') || /\bcn\b/.test(text);
        return funcao.entra_escala_horaria && allowsEscalaHoraria(funcao.graduacao) && pertenceViaturaHora;
      });
      const limiteOperacional = Math.max(1, elegiveisDaHora.length || criteriosHora.length);
      const quantidadeMilitares = Math.max(1, Math.min(options?.quantidadeMilitares ?? limiteOperacional, limiteOperacional));
      const militaresDaNoite = Array.from({ length: quantidadeMilitares }, (_, index) => elegiveisDaHora[index] ?? {
        militar_nome: `Definir ${criteriosHora[index % criteriosHora.length]}`,
        graduacao: '',
        funcao: criteriosHora[index % criteriosHora.length]
      });
      const telegrafista = funcoes.find((funcao) => funcao.funcao.toLowerCase().includes('telegraf')) ?? {
        militar_nome: escala.telegrafista,
        graduacao: '',
        funcao: 'Telegrafista'
      };
      const inicioMinutos = inicioNoturno === '22:00' ? 22 * 60 : 23 * 60;
      const fimMinutos = 24 * 60 + 6 * 60;
      const duracaoBase = Math.floor((fimMinutos - inicioMinutos) / quantidadeMilitares);
      const sobra = (fimMinutos - inicioMinutos) % quantidadeMilitares;
      const linhasFixas: EscalaHoraria[] = inicioNoturno === '23:00'
        ? [{
            id: uid('horaria'),
            escala_id: escala.id,
            horario_inicio: '22:00',
            horario_fim: '23:00',
            militar_nome: telegrafista.militar_nome,
            graduacao: telegrafista.graduacao,
            funcao: 'Telegrafista',
            observacao: 'Fixo'
          }]
        : [];

      const linhasMilitares = militaresDaNoite.map((funcao, index) => {
        const minutosAnteriores = index * duracaoBase + Math.min(index, sobra);
        const duracao = duracaoBase + (index < sobra ? 1 : 0);
        const inicio = inicioMinutos + minutosAnteriores;
        const fim = inicio + duracao;
        return {
          id: uid('horaria'),
          escala_id: escala.id,
          horario_inicio: formatTime(inicio),
          horario_fim: formatTime(fim),
          militar_nome: funcao.militar_nome,
          graduacao: funcao.graduacao,
          funcao: funcao.funcao,
          observacao: index < criteriosHora.length ? criteriosHora[index] : 'Rotativo'
        };
      });

      const next: EscalaHoraria[] = [
        ...linhasFixas,
        ...linhasMilitares,
        {
          id: uid('horaria'),
          escala_id: escala.id,
          horario_inicio: '06:00',
          horario_fim: '07:30',
          militar_nome: telegrafista.militar_nome,
          graduacao: telegrafista.graduacao,
          funcao: 'Telegrafista',
          observacao: 'Fixo'
        }
      ];
      setEscalaHoraria(next);
      writeStore('cd_escala_horaria', next);
    },
    updateChecklist(item) {
      const nextChecklist = checklist.map((current) => (current.id === item.id ? item : current));
      setChecklist(nextChecklist);
      writeStore('cd_checklist', nextChecklist);

      if (item.status === 'Com alteração') {
        const exists = pendencias.some((pendencia) => pendencia.origem_id === item.id);
        if (!exists) {
          persistPendencias([
            {
              id: uid('pend'),
              origem: 'passagem_servico',
              origem_id: item.id,
              tipo: 'Setor do Quartel',
              setor_id: item.setor_id,
              alvo: item.setor_nome,
              descricao: item.observacao || `Alteração registrada em ${item.setor_nome}.`,
              foto_url: item.foto_url,
              prontidao_id: escala.prontidao_id,
              responsavel: escala.cabo_dia,
              status: 'Aberta',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              historico: ['Pendência criada automaticamente pelo checklist da passagem.']
            },
            ...pendencias
          ]);
        }
      }
    },
    updateRelato(relato) {
      const nextRelatos = relatos.map((current) => (current.id === relato.id ? relato : current));
      setRelatos(nextRelatos);
      writeStore('cd_relatos', nextRelatos);

      if (relato.tem_novidade) {
        const exists = pendencias.some((pendencia) => pendencia.origem_id === relato.id);
        if (!exists) {
          persistPendencias([
            {
              id: uid('pend'),
              origem: 'livro_motoristas',
              origem_id: relato.id,
              tipo: 'Viatura',
              viatura_id: relato.viatura_id,
              alvo: relato.prefixo,
              descricao: relato.relato || `Novidade registrada na viatura ${relato.prefixo}.`,
              prontidao_id: escala.prontidao_id,
              responsavel: escala.chefe_motoristas,
              status: 'Aberta',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              historico: ['Pendência criada automaticamente pelo livro dos motoristas.']
            },
            ...pendencias
          ]);
        }
      }
    },
    updatePendencia(id, status, descricao) {
      const next = pendencias.map((pendencia) => {
        if (pendencia.id !== id) return pendencia;
        return {
          ...pendencia,
          status,
          updated_at: new Date().toISOString(),
          historico: [...pendencia.historico, descricao || `Status atualizado para ${status}.`]
        };
      });
      persistPendencias(next);
    },
    archiveViatura(id, transferidaPara, observacao) {
      const next: Viatura[] = viaturas.map((viatura) => {
        if (viatura.id !== id) return viatura;
        return {
          ...viatura,
          ativa: false,
          status_operacional: 'Histórico' as const,
          transferida_para: transferidaPara,
          observacao_historico: observacao,
          updated_at: new Date().toISOString()
        };
      });
      setViaturas(next);
      writeStore('cd_viaturas', next);
    },
    deleteViatura(id) {
      const next = viaturas.filter((viatura) => viatura.id !== id);
      setViaturas(next);
      writeStore('cd_viaturas', next);
    }
  }), [checklist, escala, escalaHoraria, funcoes, pendencias, relatos, setores, viaturas]);

  return <OperationalContext.Provider value={value}>{children}</OperationalContext.Provider>;
}

export function useOperational() {
  const context = useContext(OperationalContext);
  if (!context) throw new Error('useOperational deve ser usado dentro de OperationalProvider');
  return context;
}
