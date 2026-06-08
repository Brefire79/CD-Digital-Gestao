import type { Escala, EscalaFuncao, Pendencia, Prontidao, SetorQuartel, Viatura } from '../types/domain';

export const prontidoesSeed: Prontidao[] = [
  { id: 'prontidao-amarela', nome: 'Amarela' },
  { id: 'prontidao-azul', nome: 'Azul' },
  { id: 'prontidao-verde', nome: 'Verde' }
];

export const setoresSeed: SetorQuartel[] = [
  'Academia / Musculação',
  'Máquina de encher cilindro / compressor',
  'Máquina de lavar roupa',
  'Secadora',
  'Gás de cozinha',
  'Cilindro compressor',
  'Churrasqueira',
  'Piscina',
  'Refeitório',
  'Telegrafia'
].map((nome, index) => ({
  id: `setor-${index + 1}`,
  nome,
  ordem: index + 1,
  ativo: true
}));

export const viaturasSeed: Viatura[] = [
  { id: 'vtr-1', prefixo: 'UR-101', tipo: 'Unidade de Resgate', ativa: true, estacao_atual: 'EB Centro', status_operacional: 'Rodando' },
  { id: 'vtr-2', prefixo: 'AB-202', tipo: 'Auto Bomba', ativa: true, estacao_atual: 'EB Centro', status_operacional: 'Rodando' },
  { id: 'vtr-3', prefixo: 'AT-303', tipo: 'Auto Tanque', ativa: true, estacao_atual: 'EB Apoio', status_operacional: 'Reserva' }
];

export const escalaSeed: Escala = {
  id: 'escala-demo',
  data_servico_inicio: new Date().toISOString().slice(0, 16),
  data_servico_fim: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  prontidao_id: 'prontidao-amarela',
  comandante: '1º Ten PM Souza',
  cabo_dia: 'Cb PM Oliveira',
  telegrafista: 'Sd PM Lima',
  chefe_motoristas: 'Sgt PM Rocha',
  observacoes: 'Plantão operacional de 24 horas.'
};

export const escalaFuncoesSeed: EscalaFuncao[] = [
  { id: 'func-1', escala_id: 'escala-demo', militar_nome: 'Oliveira', graduacao: 'Cb', funcao: 'Cabo de Dia', entra_escala_horaria: true },
  { id: 'func-2', escala_id: 'escala-demo', militar_nome: 'Lima', graduacao: 'Sd', funcao: 'Telegrafia', entra_escala_horaria: true },
  { id: 'func-3', escala_id: 'escala-demo', militar_nome: 'Rocha', graduacao: 'Sgt', funcao: 'Chefe dos motoristas', entra_escala_horaria: false },
  { id: 'func-4', escala_id: 'escala-demo', militar_nome: 'Souza', graduacao: 'Ten', funcao: 'Comandante da Prontidão', entra_escala_horaria: false }
];

export const pendenciasSeed: Pendencia[] = [
  {
    id: 'pend-1',
    origem: 'passagem_servico',
    origem_id: 'checklist-demo',
    tipo: 'Setor do Quartel',
    setor_id: 'setor-2',
    alvo: 'Máquina de encher cilindro / compressor',
    descricao: 'Ruído acima do normal durante teste de funcionamento.',
    prontidao_id: 'prontidao-amarela',
    responsavel: 'Cb PM Oliveira',
    status: 'Aberta',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    historico: ['Pendência criada na passagem de serviço.']
  }
];
