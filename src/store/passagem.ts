import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  gerarLinhasEscala,
  gerarRondantes,
  type ClasseVtr,
  type FaixaRondante
} from '../lib/escalaGenerator';
import type { Escala, EscalaFuncao, Viatura } from '../types/domain';
import { formatarDataOperacional, getCurrentProntidaoName } from '../lib/prontidaoScale';
import type { DriveLivroBackup } from '../lib/googleDrive';

export type { ClasseVtr } from '../lib/escalaGenerator';

export type Perfil = 'sgt' | 'cabo_dia' | 'operacional';

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;
export type PassagemTela = 'menu' | 'operacional';

export const STEP_LABELS = ['VTR', 'Guarnição', 'Ronda', 'Escala', 'Livro', 'Revisar'] as const;

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function dataAtualPlantao(): string {
  return formatarDataOperacional();
}

// ---------- VTR ----------
export type TipoVtrPlantao = 'incendio' | 'resgate' | 'canil' | 'od' | 'outra';

export interface VtrItem {
  id: string;
  prefixo: string;
  tipoPlantao?: TipoVtrPlantao;
}

// ---------- Guarnição ----------
export type FuncaoGuarnicao = 'Comandante' | 'Condutor' | 'Telegrafista' | 'Operador' | 'Auxiliar' | 'Estagiário';
export const FUNCOES_GUARNICAO: FuncaoGuarnicao[] = ['Comandante', 'Condutor', 'Telegrafista', 'Operador', 'Auxiliar', 'Estagiário'];

export interface GuarnicaoMembro {
  id: string;
  nome: string;
  funcao: FuncaoGuarnicao;
  vtrId?: string;
  vtrPrefixo?: string;
  opcional?: boolean;
  /** Classe da VTR para priorização na escala horária (ABS → UR → CANIL → OD). */
  viatura?: ClasseVtr;
  /** Override manual de quem puxa hora. undefined = automático por graduação (Sd/Cb). */
  puxaHora?: boolean;
}

export function inferirTipoVtrPlantao(prefixo: string): TipoVtrPlantao {
  const valor = prefixo.trim().toUpperCase();
  if (/\bUR\b/.test(valor) || valor.startsWith('UR-') || valor.startsWith('UR ')) return 'resgate';
  if (
    /\b(ABS|AB|ABT|AT|AR)\b/.test(valor) ||
    valor.startsWith('ABS-') ||
    valor.startsWith('AB-') ||
    valor.startsWith('ABT-') ||
    valor.startsWith('AT-') ||
    valor.startsWith('AR-')
  ) {
    return 'incendio';
  }
  if (/\b(UT|VO)\b/.test(valor) || valor.includes('CANIL')) return 'canil';
  if (/\bOD\b/.test(valor) || valor.startsWith('OD-') || valor.startsWith('OD ')) return 'od';
  return 'outra';
}

function classePorTipoVtr(tipoPlantao: TipoVtrPlantao): ClasseVtr {
  if (tipoPlantao === 'resgate') return 'UR';
  if (tipoPlantao === 'incendio') return 'ABS';
  if (tipoPlantao === 'canil') return 'CANIL';
  if (tipoPlantao === 'od') return 'OD';
  return '';
}

export interface TripulacaoVtr {
  cmt?: string;
  mot?: string;
  aux?: string;
  estagiario?: string;
}

function criarPostosGuarnicao(vtr: VtrItem, tripulacao: TripulacaoVtr = {}): GuarnicaoMembro[] {
  const classe = classePorTipoVtr(vtr.tipoPlantao ?? 'outra');
  return [
    { funcao: 'Comandante' as const, opcional: false, nome: tripulacao.cmt ?? '' },
    { funcao: 'Condutor' as const, opcional: false, nome: tripulacao.mot ?? '' },
    { funcao: 'Auxiliar' as const, opcional: false, nome: tripulacao.aux ?? '' },
    { funcao: 'Estagiário' as const, opcional: true, nome: tripulacao.estagiario ?? '' }
  ].map((posto) => ({
    id: uid('mil'),
    nome: posto.nome,
    funcao: posto.funcao,
    vtrId: vtr.id,
    vtrPrefixo: vtr.prefixo,
    viatura: classe,
    opcional: posto.opcional
  }));
}

function classeDaViatura(viatura: Viatura): ClasseVtr {
  const valor = `${viatura.prefixo} ${viatura.tipo}`.toUpperCase();
  if (/\bUR\b/.test(valor) || valor.includes('RESGATE')) return 'UR';
  if (/\b(ABS|AB|ABT)\b/.test(valor) || valor.includes('BOMBA')) return 'ABS';
  if (valor.includes('CANIL') || /\bCN\b/.test(valor)) return 'CANIL';
  return 'OD';
}

function funcaoDaEscala(funcao: string): FuncaoGuarnicao {
  const valor = funcao.toUpperCase();
  if (valor.startsWith('CMT')) return 'Comandante';
  if (valor.startsWith('MOT')) return 'Condutor';
  if (valor.startsWith('TELEG')) return 'Telegrafista';
  if (valor.startsWith('AUX')) return 'Auxiliar';
  if (valor.startsWith('ESTAG')) return 'Estagiário';
  return 'Operador';
}

// ---------- Ronda ----------
export type RondaStatus = 'em_ordem' | 'alteracao' | 'na';

export interface RondaPonto {
  id: string;
  nome: string;
  status: RondaStatus;
  relato: string;
}

export interface RondaState {
  pontos: RondaPonto[];
  glpCheios: number;
  glpVazios: number;
  telegrafia: {
    armamento: RondaStatus;
    computador: RondaStatus;
    impressora: RondaStatus;
    coletes: RondaStatus;
  };
  observacoes: string;
  fotos: string[];
}

// ---------- Escala de Hora ----------
export interface EscalaLinha {
  id: string;
  inicio: string;
  fim: string;
  cobertura: string;
  militar: string;
  criterio: string;
}

// ---------- Livro dos Motoristas ----------
export type Novidade = 'S/N' | 'C/N';

export interface LivroVtr {
  id: string;
  prefixo: string;
  tipo: string;
  novidade: Novidade;
  relato: string;
  origem?: 'plantao' | 'adicional';
}

export interface LivroFechamento {
  status: 'aberto' | 'encerrado';
  assinadoPor: string;
  encerradoEm: string;
  backupDrive?: DriveLivroBackup;
}

export interface LivroEncerrado {
  id: string;
  data: string;
  prontidao: string;
  chefeMotoristas: string;
  encerradoEm: string;
  vtrs: LivroVtr[];
  backupDrive: DriveLivroBackup;
}

// ---------- Cabeçalho operacional ----------
export interface HeaderInfo {
  quartel: string;
  data: string;
  prontidao: string;
  login: string;
  caboDia: string;
  chefeMotoristas: string;
  telegrafista: string;
  delegacaoLivro: string;
  obsGeralLivro: string;
}

// ---------- Configuração e rondantes da escala ----------
export interface EscalaConfig {
  inicioNoturno: '22:00' | '23:00';
}

export interface RondanteFaixa {
  id: string;
  inicio: string;
  fim: string;
  militar: string;
}

// ---------- Seeds ----------
const initialRondaPontos: RondaPonto[] = [
  'Musculação',
  'Pátio de Viaturas',
  'Compressor PA',
  'Casa de Máquinas',
  'GLPs - Cilindros de Gás',
  'Compressor Ar',
  'Churrasqueira',
  'Refeitório',
  'Telégrafo (armamento, coletes, computador, impressora)'
].map((nome, i) => ({ id: `ronda-${i + 1}`, nome, status: 'em_ordem' as RondaStatus, relato: '' }));

const initialEscalaHorarios: EscalaLinha[] = [
  ['07:30', '12:00'],
  ['12:00', '14:00'],
  ['14:00', '16:00'],
  ['16:00', '17:00'],
  ['17:00', '18:00'],
  ['18:00', '22:00'],
  ['22:00', '23:08'],
  ['23:08', '00:16'],
  ['00:16', '01:24'],
  ['01:24', '02:32'],
  ['02:32', '03:40'],
  ['03:40', '04:48'],
  ['04:48', '06:00'],
  ['06:00', '07:30']
].map(([inicio, fim], i) => ({
  id: `escala-${i + 1}`,
  inicio,
  fim,
  cobertura: 'Operacional',
  militar: '',
  criterio:
    inicio === '12:00'
      ? '2 militares ABS/AB + 1 militar VTR Canil'
      : inicio === '06:00'
        ? 'Telegrafista (fixo)'
        : 'Rotativo'
}));

const initialLivroVtrs: LivroVtr[] = [];

function tipoLivroPorPlantao(tipo: TipoVtrPlantao): string {
  if (tipo === 'incendio') return 'Viatura de incêndio';
  if (tipo === 'resgate') return 'Unidade de Resgate';
  if (tipo === 'canil') return 'Canil';
  if (tipo === 'od') return 'Viatura OD';
  return 'Outra viatura do plantão';
}

function mesmoPrefixo(a: string, b: string): boolean {
  return a.trim().toUpperCase() === b.trim().toUpperCase();
}

// ---------- Store ----------
interface PassagemState {
  perfil: Perfil;
  step: WizardStep;
  tela: PassagemTela;
  header: HeaderInfo;
  vtrs: VtrItem[];
  guarnicao: GuarnicaoMembro[];
  ronda: RondaState;
  escala: EscalaLinha[];
  escalaConfig: EscalaConfig;
  rondantes: RondanteFaixa[];
  livro: LivroVtr[];
  livroFechamento: LivroFechamento;
  historicoLivros: LivroEncerrado[];

  // navegação
  setStep: (step: WizardStep) => void;
  abrirTela: (step: WizardStep) => void;
  voltarMenu: () => void;
  next: () => void;
  prev: () => void;
  iniciarTroca: (perfil: Perfil, header: Partial<HeaderInfo>) => void;
  resetWizard: () => void;
  sincronizarOperacao: (escala: Escala, funcoes: EscalaFuncao[], viaturas: Viatura[], prontidao: string) => void;

  // VTR
  addVtr: (prefixo: string, tipoPlantao?: TipoVtrPlantao | 'auto', tripulacao?: TripulacaoVtr) => void;
  removeVtr: (id: string) => void;

  // Guarnição
  addMembro: (patch?: Partial<GuarnicaoMembro>) => void;
  updateMembro: (id: string, patch: Partial<GuarnicaoMembro>) => void;
  removeMembro: (id: string) => void;

  // Ronda
  setRondaStatus: (id: string, status: RondaStatus) => void;
  setRondaRelato: (id: string, relato: string) => void;
  setTelegrafia: (campo: keyof RondaState['telegrafia'], status: RondaStatus) => void;
  setRondaCampo: (patch: Partial<Pick<RondaState, 'glpCheios' | 'glpVazios' | 'observacoes'>>) => void;
  addRondaFoto: (nome: string) => void;

  // Escala
  updateEscalaLinha: (id: string, patch: Partial<EscalaLinha>) => void;
  setEscalaConfig: (patch: Partial<EscalaConfig>) => void;
  gerarEscalaAutomatica: () => void;

  // Rondantes
  gerarRondantesAuto: () => void;
  updateRondante: (id: string, patch: Partial<RondanteFaixa>) => void;

  // Livro
  updateLivroVtr: (id: string, patch: Partial<LivroVtr>) => void;
  addLivroVtr: (prefixo: string, tipo: string) => void;
  removeLivroVtr: (id: string) => void;
  sincronizarLivroComVtrs: () => void;
  encerrarLivro: (assinadoPor: string, backupDrive: DriveLivroBackup) => void;

  // Header
  setHeader: (patch: Partial<HeaderInfo>) => void;

  // Derivados
  temAlteracaoRonda: () => boolean;
}

function inferStepInicial(perfil: Perfil): WizardStep {
  // Cabo de Dia inicia na Ronda (mas pode voltar). Sgt inicia em VTR.
  return perfil === 'cabo_dia' ? 2 : 0;
}

const initialState = {
  perfil: 'operacional' as Perfil,
  step: 0 as WizardStep,
  tela: 'menu' as PassagemTela,
  header: {
    quartel: '1º GBM — Sede',
    data: dataAtualPlantao(),
    prontidao: getCurrentProntidaoName(),
    login: '',
    caboDia: '',
    chefeMotoristas: '',
    telegrafista: '',
    delegacaoLivro: '',
    obsGeralLivro: ''
  } as HeaderInfo,
  vtrs: [] as VtrItem[],
  guarnicao: [] as GuarnicaoMembro[],
  ronda: {
    pontos: initialRondaPontos,
    glpCheios: 0,
    glpVazios: 0,
    telegrafia: { armamento: 'em_ordem', computador: 'em_ordem', impressora: 'em_ordem', coletes: 'em_ordem' },
    observacoes: '',
    fotos: []
  } as RondaState,
  escala: initialEscalaHorarios,
  escalaConfig: { inicioNoturno: '22:00' } as EscalaConfig,
  rondantes: [] as RondanteFaixa[],
  livro: initialLivroVtrs,
  livroFechamento: { status: 'aberto', assinadoPor: '', encerradoEm: '' } as LivroFechamento,
  historicoLivros: [] as LivroEncerrado[]
};

export const usePassagem = create<PassagemState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setStep: (step) => set({ step }),
        abrirTela: (step) => set({ step, tela: 'operacional' }),
        voltarMenu: () => set({ tela: 'menu' }),
        next: () => set((s) => ({ step: Math.min(5, s.step + 1) as WizardStep })),
        prev: () => set((s) => ({ step: Math.max(0, s.step - 1) as WizardStep })),

        iniciarTroca: (perfil, header) =>
          set((s) => {
            const novoPlantao = s.livroFechamento.status === 'encerrado';
            return {
              perfil,
              step: inferStepInicial(perfil),
              tela: 'menu',
              header: {
                ...s.header,
                ...header,
                data: dataAtualPlantao(),
                prontidao: getCurrentProntidaoName()
              },
              ...(novoPlantao
                ? {
                    vtrs: [],
                    guarnicao: [],
                    livro: [],
                    rondantes: [],
                    escala: initialEscalaHorarios.map((linha) => ({ ...linha })),
                    ronda: {
                      ...initialState.ronda,
                      pontos: initialRondaPontos.map((ponto) => ({ ...ponto })),
                      fotos: []
                    },
                    livroFechamento: { status: 'aberto' as const, assinadoPor: '', encerradoEm: '' }
                  }
                : { livro: s.livro.map((v) => v) })
            };
          }),

        resetWizard: () => set({ ...initialState, livro: [] }),

        sincronizarOperacao: (escala, funcoes, viaturas, prontidao) =>
          set((s) => {
            const ativas = viaturas.filter((viatura) => viatura.ativa);
            const vtrs: VtrItem[] = ativas.map((viatura) => ({
              id: `operacional-${viatura.id}`,
              prefixo: viatura.prefixo,
              tipoPlantao: inferirTipoVtrPlantao(viatura.prefixo)
            }));
            const guarnicao = funcoes
              .flatMap<GuarnicaoMembro>((item) => {
                const viatura = ativas.find((vtr) => item.funcao.toLowerCase().includes(vtr.prefixo.toLowerCase()));
                if (!viatura) return [];
                return [{
                  id: `operacional-${item.id}`,
                  nome: `${item.graduacao} PM ${item.militar_nome}`,
                  funcao: funcaoDaEscala(item.funcao),
                  vtrId: `operacional-${viatura.id}`,
                  vtrPrefixo: viatura.prefixo,
                  viatura: classeDaViatura(viatura),
                  puxaHora: item.entra_escala_horaria
                }];
              });
            const livroPlantao = ativas.map((viatura) => {
              const existente = s.livro.find((item) => item.prefixo === viatura.prefixo);
              return existente ? { ...existente, origem: 'plantao' as const, tipo: viatura.tipo } : {
                id: `operacional-livro-${viatura.id}`,
                prefixo: viatura.prefixo,
                tipo: viatura.tipo,
                novidade: 'S/N' as const,
                relato: '',
                origem: 'plantao' as const
              };
            });
            const adicionais = s.livro.filter(
              (item) => item.origem === 'adicional' && !livroPlantao.some((vtr) => mesmoPrefixo(vtr.prefixo, item.prefixo))
            );
            return {
              header: {
                ...s.header,
                data: formatarDataOperacional(new Date(escala.data_servico_inicio)),
                prontidao,
                caboDia: escala.cabo_dia,
                chefeMotoristas: escala.chefe_motoristas,
                telegrafista: escala.telegrafista
              },
              vtrs,
              guarnicao,
              livro: [...livroPlantao, ...adicionais]
            };
          }),

        addVtr: (prefixo, tipoPlantao = 'auto', tripulacao = {}) => {
          const valor = prefixo.trim();
          if (!valor) return;
          set((s) => {
            const tipoResolvido = tipoPlantao === 'auto' ? inferirTipoVtrPlantao(valor) : tipoPlantao;
            if (s.vtrs.some((item) => mesmoPrefixo(item.prefixo, valor))) return s;
            const vtr: VtrItem = { id: uid('vtr'), prefixo: valor, tipoPlantao: tipoResolvido };
            const existenteLivro = s.livro.find((item) => mesmoPrefixo(item.prefixo, valor));
            const livroVtr: LivroVtr = existenteLivro
              ? { ...existenteLivro, prefixo: valor.toUpperCase(), tipo: tipoLivroPorPlantao(tipoResolvido), origem: 'plantao' }
              : {
                  id: uid('livro'),
                  prefixo: valor.toUpperCase(),
                  tipo: tipoLivroPorPlantao(tipoResolvido),
                  novidade: 'S/N',
                  relato: '',
                  origem: 'plantao'
                };
            return {
              vtrs: [...s.vtrs, vtr],
              guarnicao: [...s.guarnicao, ...criarPostosGuarnicao(vtr, tripulacao)],
              livro: [...s.livro.filter((item) => !mesmoPrefixo(item.prefixo, valor)), livroVtr]
            };
          });
        },
        removeVtr: (id) =>
          set((s) => {
            const removida = s.vtrs.find((v) => v.id === id);
            return {
              vtrs: s.vtrs.filter((v) => v.id !== id),
              guarnicao: s.guarnicao.filter((m) => m.vtrId !== id),
              livro: removida
                ? s.livro.filter((item) => item.origem === 'adicional' || !mesmoPrefixo(item.prefixo, removida.prefixo))
                : s.livro
            };
          }),

        addMembro: (patch) =>
          set((s) => ({ guarnicao: [...s.guarnicao, { id: uid('mil'), nome: '', funcao: 'Auxiliar', ...patch }] })),
        updateMembro: (id, patch) =>
          set((s) => ({ guarnicao: s.guarnicao.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
        removeMembro: (id) => set((s) => ({ guarnicao: s.guarnicao.filter((m) => m.id !== id) })),

        setRondaStatus: (id, status) =>
          set((s) => ({
            ronda: {
              ...s.ronda,
              pontos: s.ronda.pontos.map((p) => (p.id === id ? { ...p, status, relato: status === 'em_ordem' ? '' : p.relato } : p))
            }
          })),
        setRondaRelato: (id, relato) =>
          set((s) => ({ ronda: { ...s.ronda, pontos: s.ronda.pontos.map((p) => (p.id === id ? { ...p, relato } : p)) } })),
        setTelegrafia: (campo, status) =>
          set((s) => ({ ronda: { ...s.ronda, telegrafia: { ...s.ronda.telegrafia, [campo]: status } } })),
        setRondaCampo: (patch) => set((s) => ({ ronda: { ...s.ronda, ...patch } })),
        addRondaFoto: (nome) => set((s) => ({ ronda: { ...s.ronda, fotos: [...s.ronda.fotos, nome] } })),

        updateEscalaLinha: (id, patch) =>
          set((s) => ({ escala: s.escala.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),

        setEscalaConfig: (patch) => set((s) => ({ escalaConfig: { ...s.escalaConfig, ...patch } })),

        gerarEscalaAutomatica: () =>
          set((s) => ({
            escala: gerarLinhasEscala({
              guarnicao: s.guarnicao,
              inicioNoturno: s.escalaConfig.inicioNoturno,
              telegrafista: s.header.telegrafista ?? ''
            })
          })),

        gerarRondantesAuto: () =>
          set((s) => ({
            rondantes: gerarRondantes(s.guarnicao).map((f: FaixaRondante, i) => ({ id: `rond-${i + 1}`, ...f }))
          })),

        updateRondante: (id, patch) =>
          set((s) => ({ rondantes: s.rondantes.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

        updateLivroVtr: (id, patch) =>
          set((s) => s.livroFechamento.status === 'encerrado'
            ? s
            : { livro: s.livro.map((v) => (v.id === id ? { ...v, ...patch } : v)) }),
        addLivroVtr: (prefixo, tipo) => {
          const valor = prefixo.trim().toUpperCase();
          if (!valor) return;
          set((s) => {
            if (s.livroFechamento.status === 'encerrado') return s;
            if (s.livro.some((item) => mesmoPrefixo(item.prefixo, valor))) return s;
            return {
              livro: [
                ...s.livro,
                { id: uid('livro'), prefixo: valor, tipo: tipo.trim() || 'Viatura adicional', novidade: 'S/N', relato: '', origem: 'adicional' }
              ]
            };
          });
        },
        removeLivroVtr: (id) =>
          set((s) => s.livroFechamento.status === 'encerrado'
            ? s
            : { livro: s.livro.filter((item) => item.id !== id || item.origem !== 'adicional') }),
        sincronizarLivroComVtrs: () =>
          set((s) => {
            if (s.livroFechamento.status === 'encerrado') return s;
            const livroPlantao = s.vtrs.map((vtr) => {
              const existente = s.livro.find((item) => mesmoPrefixo(item.prefixo, vtr.prefixo));
              const tipo = vtr.tipoPlantao ?? inferirTipoVtrPlantao(vtr.prefixo);
              return existente
                ? { ...existente, prefixo: vtr.prefixo.toUpperCase(), tipo: tipoLivroPorPlantao(tipo), origem: 'plantao' as const }
                : {
                    id: uid('livro'),
                    prefixo: vtr.prefixo.toUpperCase(),
                    tipo: tipoLivroPorPlantao(tipo),
                    novidade: 'S/N' as const,
                    relato: '',
                    origem: 'plantao' as const
                  };
            });
            const adicionais = s.livro.filter(
              (item) => item.origem === 'adicional' && !livroPlantao.some((vtr) => mesmoPrefixo(vtr.prefixo, item.prefixo))
            );
            return { livro: [...livroPlantao, ...adicionais] };
          }),
        encerrarLivro: (assinadoPor, backupDrive) => {
          const nome = assinadoPor.trim();
          if (!nome) return;
          set((s) => {
            if (s.livroFechamento.status === 'encerrado') return s;
            const encerradoEm = new Date().toISOString();
            const registro: LivroEncerrado = {
              id: uid('livro-encerrado'),
              data: s.header.data,
              prontidao: s.header.prontidao,
              chefeMotoristas: nome,
              encerradoEm,
              vtrs: s.livro.map((item) => ({ ...item })),
              backupDrive
            };
            return {
              header: { ...s.header, chefeMotoristas: nome },
              livroFechamento: { status: 'encerrado', assinadoPor: nome, encerradoEm, backupDrive },
              historicoLivros: [registro, ...s.historicoLivros]
            };
          });
        },

        setHeader: (patch) => set((s) => ({ header: { ...s.header, ...patch } })),

        temAlteracaoRonda: () => {
          const { ronda } = get();
          const pontoAlt = ronda.pontos.some((p) => p.status === 'alteracao');
          const telAlt = Object.values(ronda.telegrafia).some((v) => v === 'alteracao');
          return pontoAlt || telAlt;
        }
      }),
      {
        name: 'cd_passagem_360',
        version: 2,
        migrate: (persistido, versao) => {
          const state = persistido as Partial<PassagemState>;
          if (versao >= 2) return state as PassagemState;
          const vtrs = state.vtrs ?? [];
          const livroAnterior = state.livro ?? [];
          const livro = vtrs.map((vtr) => {
            const existente = livroAnterior.find((item) => mesmoPrefixo(item.prefixo, vtr.prefixo));
            const tipo = vtr.tipoPlantao ?? inferirTipoVtrPlantao(vtr.prefixo);
            return existente
              ? { ...existente, prefixo: vtr.prefixo.toUpperCase(), tipo: tipoLivroPorPlantao(tipo), origem: 'plantao' as const }
              : {
                  id: uid('livro'),
                  prefixo: vtr.prefixo.toUpperCase(),
                  tipo: tipoLivroPorPlantao(tipo),
                  novidade: 'S/N' as const,
                  relato: '',
                  origem: 'plantao' as const
                };
          });
          return { ...state, livro } as PassagemState;
        }
      }
    )
  )
);
