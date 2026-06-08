export type Role = 'admin' | 'cabo_dia' | 'motorista' | 'militar';
export type ProntidaoNome = 'Amarela' | 'Azul' | 'Verde';
export type StatusChecklist = 'OK' | 'Com alteração';
export type StatusPendencia = 'Aberta' | 'Em andamento' | 'Resolvida' | 'Arquivada';
export type OrigemPendencia = 'passagem_servico' | 'livro_motoristas';

export interface Profile {
  id: string;
  user_id: string;
  nome: string;
  nome_guerra: string;
  graduacao: string;
  role: Role;
}

export interface Prontidao {
  id: string;
  nome: ProntidaoNome;
}

export interface Viatura {
  id: string;
  prefixo: string;
  tipo: string;
  ativa: boolean;
  estacao_atual: string;
  status_operacional: 'Rodando' | 'Reserva' | 'Manutenção' | 'Transferida' | 'Histórico';
  transferida_para?: string;
  observacao_historico?: string;
  updated_at?: string;
}

export interface SetorQuartel {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export interface Escala {
  id: string;
  data_servico_inicio: string;
  data_servico_fim: string;
  prontidao_id: string;
  comandante: string;
  cabo_dia: string;
  telegrafista: string;
  chefe_motoristas: string;
  observacoes: string;
}

export interface EscalaFuncao {
  id: string;
  escala_id: string;
  militar_nome: string;
  graduacao: string;
  funcao: string;
  entra_escala_horaria: boolean;
}

export interface EscalaHoraria {
  id: string;
  escala_id: string;
  horario_inicio: string;
  horario_fim: string;
  militar_nome: string;
  graduacao: string;
  funcao: string;
  observacao: string;
}

export interface ChecklistItem {
  id: string;
  setor_id: string;
  setor_nome: string;
  status: StatusChecklist;
  observacao: string;
  foto_url?: string;
}

export interface RelatoViatura {
  id: string;
  viatura_id: string;
  prefixo: string;
  situacao: string;
  tem_novidade: boolean;
  relato: string;
  relato_anterior: string;
}

export interface Pendencia {
  id: string;
  origem: OrigemPendencia;
  origem_id: string;
  tipo: string;
  setor_id?: string;
  viatura_id?: string;
  alvo: string;
  descricao: string;
  foto_url?: string;
  prontidao_id: string;
  responsavel: string;
  status: StatusPendencia;
  created_at: string;
  updated_at: string;
  historico: string[];
}
