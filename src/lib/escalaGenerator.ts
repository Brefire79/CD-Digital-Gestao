// Regras puras de geração da escala horária e dos rondantes.
// Mantido sem dependência da store para ser facilmente testável e reutilizável.
//
// Base operacional (PRD - Regra Crítica - Escala Completa):
// - Participam automaticamente apenas Sd e Cb. Sgt/Oficiais só por inclusão manual.
// - Início noturno escolhido pelo Cabo de Dia: 22:00 ou 23:00.
// - Se início = 23:00, a faixa 22:00–23:00 fica com o Telegrafista (posto fixo).
// - Distribuição até 06:00 dividida de forma equilibrada entre os elegíveis.
// - Início da escala prioriza os MOTORISTAS, na ordem UR → ABS (Bomba) → Canil;
//   depois os demais integrantes pela mesma ordem de classe.
// - Posto fixo final 06:00–07:30 é sempre do Telegrafista.
// - Motorista do Canil Sgt+ não entra (consequência natural da regra de elegibilidade).
// - Rondantes consideram somente Sgt; 1 Sgt = período integral, 2+ = divisão em faixas.

export type Graduacao = 'Sd' | 'Cb' | 'Sgt' | 'Of' | 'Outro';
export type ClasseVtr = 'ABS' | 'UR' | 'CANIL' | 'OD' | '';

export interface MembroBruto {
  id: string;
  nome: string;
  viatura?: ClasseVtr;
  /** Função na guarnição (Comandante/Condutor/...). Condutor = motorista. */
  funcao?: string;
  /** Override manual de elegibilidade. undefined = automático por graduação. */
  puxaHora?: boolean;
}

export interface LinhaGerada {
  id: string;
  inicio: string;
  fim: string;
  cobertura: string;
  militar: string;
  criterio: string;
}

export interface FaixaRondante {
  inicio: string;
  fim: string;
  militar: string;
}

// ---------- Graduação ----------

/** Infere a graduação a partir do texto do nome (ex.: "1º Sgt Andrade" -> Sgt). */
export function inferirGraduacao(nome: string): Graduacao {
  const n = ` ${nome.trim().toLowerCase()} `;
  if (/\b(asp|subten|sub ten|ten|cap|maj|cel|cmt)\b/.test(n) || n.includes('tenente') || n.includes('capit')) {
    return 'Of';
  }
  if (n.includes('sgt') || n.includes('sargento')) return 'Sgt';
  if (/\bcb\b/.test(n) || n.includes('cabo')) return 'Cb';
  if (/\bsd\b/.test(n) || n.includes('soldado')) return 'Sd';
  return 'Outro';
}

/** Apenas Sd e Cb participam automaticamente da escala horária. */
export function elegivelAutomatico(grad: Graduacao): boolean {
  return grad === 'Sd' || grad === 'Cb';
}

// ---------- Tempo ----------

export function hhmmToMin(valor: string): number {
  const [h = '0', m = '0'] = valor.split(':');
  const hh = parseInt(h, 10) || 0;
  const mm = parseInt(m, 10) || 0;
  return (hh % 24) * 60 + mm;
}

export function minToHHMM(min: number): string {
  const total = ((min % 1440) + 1440) % 1440;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Divide [inicio, fim] em n faixas. Quando fim <= inicio, considera virada de meia-noite.
 * As n-1 primeiras faixas recebem a duração base (floor) e a última fecha exatamente em fim,
 * reproduzindo o modelo físico (ex.: 22:00→06:00 em 7 = 68min cada e 72min na última).
 */
export function dividirPeriodo(inicioMin: number, fimMinRaw: number, n: number): Array<[number, number]> {
  if (n <= 0) return [];
  let fimMin = fimMinRaw;
  if (fimMin <= inicioMin) fimMin += 1440;
  const base = Math.floor((fimMin - inicioMin) / n);
  const faixas: Array<[number, number]> = [];
  let cursor = inicioMin;
  for (let i = 0; i < n; i++) {
    const ini = cursor;
    const fim = i === n - 1 ? fimMin : cursor + base;
    faixas.push([ini % 1440, fim % 1440]);
    cursor = fim;
  }
  return faixas;
}

// ---------- Elegibilidade e ordenação ----------

const ORDEM_CLASSE: Record<string, number> = { UR: 0, ABS: 1, CANIL: 2, OD: 3, '': 9 };

/** Motorista = função Condutor/MOT. São eles que iniciam a distribuição noturna. */
export function ehMotorista(funcao?: string): boolean {
  const f = (funcao ?? '').toLowerCase();
  return f.includes('condutor') || f.includes('motorista') || /\bmot\b/.test(f);
}

export interface MembroElegivel {
  id: string;
  nome: string;
  viatura: ClasseVtr;
  grad: Graduacao;
  funcao?: string;
}

/** Lista de militares que efetivamente puxam hora, já com graduação e classe resolvidas. */
export function elegiveisParaHora(guarnicao: MembroBruto[]): MembroElegivel[] {
  return guarnicao
    .filter((m) => m.nome.trim())
    .map((m) => ({
      id: m.id,
      nome: m.nome.trim(),
      viatura: (m.viatura ?? '') as ClasseVtr,
      grad: inferirGraduacao(m.nome),
      funcao: m.funcao,
      puxaHora: m.puxaHora
    }))
    .filter((m) => m.viatura !== 'OD' && (m.puxaHora ?? elegivelAutomatico(m.grad)))
    .map(({ id, nome, viatura, grad, funcao }) => ({ id, nome, viatura, grad, funcao }));
}

/**
 * Prioridade do início da escala de hora: primeiro os MOTORISTAS, na ordem
 * UR → ABS (Bomba) → Canil; em seguida os demais integrantes pela mesma ordem de classe.
 */
export function ordenarPorPrioridade(membros: MembroElegivel[]): MembroElegivel[] {
  const motoristas = membros
    .filter((m) => ehMotorista(m.funcao))
    .map((m, i) => ({ m, i }))
    .sort((a, b) => (ORDEM_CLASSE[a.m.viatura] ?? 9) - (ORDEM_CLASSE[b.m.viatura] ?? 9) || a.i - b.i)
    .map(({ m }) => m);
  const demais = membros.filter((m) => !ehMotorista(m.funcao));
  const filas = (['ABS', 'UR', 'CANIL'] as ClasseVtr[]).map((classe) => demais.filter((m) => m.viatura === classe));
  const alternados: MembroElegivel[] = [];
  while (filas.some((fila) => fila.length > 0)) {
    filas.forEach((fila) => {
      const proximo = fila.shift();
      if (proximo) alternados.push(proximo);
    });
  }
  const semClasse = demais.filter((m) => !['ABS', 'UR', 'CANIL'].includes(m.viatura));
  return [...motoristas, ...alternados, ...semClasse];
}

// ---------- Geração da escala completa ----------

export interface GerarEscalaParams {
  guarnicao: MembroBruto[];
  inicioNoturno: '22:00' | '23:00';
  telegrafista: string;
}

export function gerarLinhasEscala(params: GerarEscalaParams): LinhaGerada[] {
  const { inicioNoturno, telegrafista } = params;
  const tel = telegrafista.trim();
  // O Telegrafista ocupa os postos fixos e não entra na distribuição rotativa.
  const elegiveis = ordenarPorPrioridade(elegiveisParaHora(params.guarnicao)).filter((m) => m.nome !== tel);

  const linhas: LinhaGerada[] = [];
  let seq = 1;
  const add = (inicio: string, fim: string, militar: string, criterio: string, cobertura = 'Operacional') => {
    linhas.push({ id: `escala-${seq++}`, inicio, fim, militar, criterio, cobertura });
  };

  // --- Faixa diurna (modelo; militar ajustado manualmente, exceto almoço sugerido) ---
  add('07:30', '12:00', '', 'Rotativo');

  const ehAuxiliar = (m: MembroElegivel) => (m.funcao ?? '').toLowerCase().includes('aux');
  const auxAbs = elegiveis.filter((m) => m.viatura === 'ABS' && ehAuxiliar(m)).slice(0, 2);
  const canil = elegiveis.find((m) => m.viatura === 'CANIL');
  const almoco = [...auxAbs, ...(canil ? [canil] : [])];
  add('12:00', '14:00', almoco.map((m) => m.nome).join(' / '), 'Almoço · 2 auxiliares do incêndio + 1 integrante do Canil');

  add('14:00', '16:00', '', 'Rotativo');
  add('16:00', '17:00', '', 'Rotativo');
  const nomesAlmoco = new Set(almoco.map((m) => m.nome));
  const sugestao17 = elegiveis.find((m) => ['UR', 'ABS'].includes(m.viatura) && ehAuxiliar(m) && !nomesAlmoco.has(m.nome));
  add('17:00', '18:00', sugestao17?.nome ?? '', 'Sugestão automática · Cabo de Dia pode alterar');
  add('18:00', '22:00', '', 'Rotativo');

  // --- Posto fixo 22:00–23:00 quando a distribuição começa às 23:00 ---
  if (inicioNoturno === '23:00') {
    add('22:00', '23:00', tel, 'Telegrafista (posto fixo)');
  }

  // --- Distribuição noturna equilibrada até 06:00 ---
  const faixas = dividirPeriodo(hhmmToMin(inicioNoturno), hhmmToMin('06:00'), elegiveis.length);
  faixas.forEach(([ini, fim], i) => {
    const m = elegiveis[i];
    add(minToHHMM(ini), minToHHMM(fim), m?.nome ?? '', m?.viatura ? m.viatura : 'Rotativo');
  });

  // --- Posto fixo final ---
  add('06:00', '07:30', tel, 'Telegrafista (posto fixo)');

  return linhas;
}

// ---------- Rondantes ----------

export function gerarRondantes(
  guarnicao: MembroBruto[],
  inicio = '00:00',
  fim = '06:00'
): FaixaRondante[] {
  const sgts = guarnicao.filter(
    (m) => m.nome.trim() && m.viatura !== 'OD' && inferirGraduacao(m.nome) === 'Sgt'
  );
  if (sgts.length === 0) return [];
  if (sgts.length === 1) return [{ inicio, fim, militar: sgts[0].nome.trim() }];
  const faixas = dividirPeriodo(hhmmToMin(inicio), hhmmToMin(fim), sgts.length);
  return faixas.map(([i, f], idx) => ({
    inicio: minToHHMM(i),
    fim: minToHHMM(f),
    militar: sgts[idx].nome.trim()
  }));
}
