import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type {
  EscalaLinha,
  GuarnicaoMembro,
  HeaderInfo,
  LivroVtr,
  RondaState,
  RondanteFaixa,
  VtrItem
} from '../store/passagem';

const RED = rgb(0.78, 0.06, 0.18);
const INK = rgb(0.09, 0.09, 0.11);
const GRAY = rgb(0.45, 0.45, 0.48);

const STATUS_LABEL: Record<string, string> = {
  em_ordem: 'Em ordem',
  alteracao: 'ALTERAÇÃO',
  na: 'N/A'
};

export interface PassagemData {
  header: HeaderInfo;
  vtrs: VtrItem[];
  guarnicao: GuarnicaoMembro[];
  ronda: RondaState;
  escala: EscalaLinha[];
  rondantes: RondanteFaixa[];
  livro: LivroVtr[];
}

export async function gerarPdfPassagem(data: PassagemData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 vertical
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  const width = page.getWidth() - margin * 2;
  let y = page.getHeight() - margin;

  const text = (s: string, x: number, yy: number, size: number, f = font, color = INK) =>
    page.drawText(s, { x, y: yy, size, font: f, color });

  // Cabeçalho
  page.drawRectangle({ x: margin, y: y - 46, width, height: 46, color: rgb(0.086, 0.094, 0.11) });
  text('CORPO DE BOMBEIROS', margin + 12, y - 20, 13, bold, rgb(1, 1, 1));
  text('Passagem de Serviço Operacional', margin + 12, y - 36, 9, font, rgb(0.8, 0.8, 0.82));
  text(data.header.prontidao.toUpperCase(), margin + width - 90, y - 20, 12, bold, RED);
  text(data.header.data, margin + width - 90, y - 36, 9, font, rgb(0.8, 0.8, 0.82));
  y -= 64;

  text(`${data.header.quartel}`, margin, y, 9, font, GRAY);
  if (data.header.caboDia) text(`Cabo de Dia: ${data.header.caboDia}`, margin + 200, y, 9, font, GRAY);
  if (data.header.telegrafista) text(`Telegrafista: ${data.header.telegrafista}`, margin + 360, y, 9, font, GRAY);
  y -= 22;

  const sectionTitle = (titulo: string) => {
    text(titulo.toUpperCase(), margin, y, 10, bold, RED);
    page.drawLine({
      start: { x: margin, y: y - 4 },
      end: { x: margin + width, y: y - 4 },
      thickness: 0.6,
      color: rgb(0.85, 0.86, 0.87)
    });
    y -= 18;
  };

  // VTRs
  sectionTitle('Viaturas');
  text(data.vtrs.map((v) => v.prefixo).join('   ·   ') || '—', margin, y, 10, font);
  y -= 24;

  // Guarnição
  sectionTitle(`Guarnição (${data.guarnicao.length})`);
  data.guarnicao.forEach((m) => {
    text(`${m.nome || '—'}`, margin, y, 9, font);
    text(m.funcao, margin + 300, y, 9, font, GRAY);
    y -= 13;
  });
  y -= 12;

  // Ronda
  sectionTitle('Ronda');
  data.ronda.pontos.forEach((p) => {
    const alt = p.status === 'alteracao';
    text(p.nome, margin, y, 9, font);
    text(STATUS_LABEL[p.status], margin + 300, y, 9, alt ? bold : font, alt ? RED : GRAY);
    y -= 13;
  });
  text(
    `Telegrafia — armamento: ${STATUS_LABEL[data.ronda.telegrafia.armamento]} · computador: ${STATUS_LABEL[data.ronda.telegrafia.computador]} · impressora: ${STATUS_LABEL[data.ronda.telegrafia.impressora]} · coletes: ${STATUS_LABEL[data.ronda.telegrafia.coletes]}`,
    margin,
    y,
    7.5,
    font,
    GRAY
  );
  y -= 12;
  text(`GLP — cheios: ${data.ronda.glpCheios} · vazios: ${data.ronda.glpVazios}`, margin, y, 8, font, GRAY);
  y -= 20;

  // Escala
  sectionTitle('Escala de Hora');
  data.escala.forEach((l) => {
    if (y < 120) return;
    text(`${l.inicio}–${l.fim}`, margin, y, 8, bold);
    text(l.militar || '—', margin + 70, y, 8, font);
    text(l.criterio, margin + 250, y, 7.5, font, GRAY);
    y -= 11;
  });
  y -= 14;

  // Rondantes
  if (data.rondantes.length > 0) {
    sectionTitle('Rondantes (Sgt)');
    data.rondantes.forEach((r) => {
      if (y < 120) return;
      text(`${r.inicio}–${r.fim}`, margin, y, 9, bold);
      text(r.militar || '—', margin + 70, y, 9, font);
      y -= 13;
    });
    y -= 8;
  }

  // Livro
  sectionTitle('Livro dos Motoristas');
  data.livro.forEach((v) => {
    const cn = v.novidade === 'C/N';
    text(v.prefixo, margin, y, 9, bold);
    text(v.novidade, margin + 120, y, 9, cn ? bold : font, cn ? RED : GRAY);
    if (cn && v.relato) text(v.relato.slice(0, 70), margin + 160, y, 8, font, GRAY);
    y -= 13;
  });
  if (data.header.chefeMotoristas) {
    y -= 4;
    text(`Chefe dos Motoristas: ${data.header.chefeMotoristas}`, margin, y, 9, font, GRAY);
  }

  // Rodapé
  text(
    `Gerado pelo CD Digital em ${new Date().toLocaleString('pt-BR')}`,
    margin,
    margin - 8,
    7,
    font,
    GRAY
  );

  return doc.save();
}

export function baixarPdf(bytes: Uint8Array, nome: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}
