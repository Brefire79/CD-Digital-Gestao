import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Escala, EscalaFuncao, EscalaHoraria, Pendencia, RelatoViatura, Rondante } from '../types/domain';

export type RelatorioOperacional = 'plantao' | 'escala-dia' | 'escala-horaria' | 'livro' | 'pendencias';

export interface DadosRelatorioOperacional {
  escala: Escala;
  funcoes: EscalaFuncao[];
  escalaHoraria: EscalaHoraria[];
  rondantes: Rondante[];
  relatos: RelatoViatura[];
  pendencias: Pendencia[];
  prontidao: string;
}

const A4: [number, number] = [595.28, 841.89];
const INK = rgb(0.08, 0.1, 0.14);
const MUTED = rgb(0.38, 0.42, 0.48);
const RED = rgb(0.73, 0.05, 0.15);

function textoSeguro(value: unknown) {
  return String(value ?? '')
    .replace(/[–—]/g, '-')
    .replace(/→/g, '->')
    .replace(/·/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function quebrarTexto(texto: string, font: PDFFont, size: number, largura: number) {
  const palavras = textoSeguro(texto).split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = '';
  palavras.forEach((palavra) => {
    const candidata = atual ? `${atual} ${palavra}` : palavra;
    if (font.widthOfTextAtSize(candidata, size) <= largura) atual = candidata;
    else {
      if (atual) linhas.push(atual);
      atual = palavra;
    }
  });
  if (atual) linhas.push(atual);
  return linhas.length ? linhas : ['-'];
}

export async function gerarPdfOperacional(tipo: RelatorioOperacional, dados: DadosRelatorioOperacional) {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 36;
  let page: PDFPage;
  let y: number;

  const novaPagina = () => {
    page = doc.addPage(A4);
    y = page.getHeight() - margin;
    page.drawRectangle({ x: margin, y: y - 42, width: page.getWidth() - margin * 2, height: 42, color: rgb(0.08, 0.09, 0.11) });
    page.drawText('CD DIGITAL - CORPO DE BOMBEIROS', { x: margin + 10, y: y - 18, size: 11, font: bold, color: rgb(1, 1, 1) });
    page.drawText(`Prontidao ${textoSeguro(dados.prontidao)}`, { x: margin + 10, y: y - 33, size: 8, font: regular, color: rgb(0.8, 0.82, 0.85) });
    y -= 58;
  };

  const garantir = (altura = 34) => {
    if (y - altura < margin + 16) novaPagina();
  };

  const linha = (texto: string, opcoes?: { bold?: boolean; color?: typeof INK; size?: number; indent?: number }) => {
    const size = opcoes?.size ?? 8.5;
    const font = opcoes?.bold ? bold : regular;
    const indent = opcoes?.indent ?? 0;
    const linhas = quebrarTexto(texto, font, size, A4[0] - margin * 2 - indent);
    garantir(linhas.length * (size + 3));
    linhas.forEach((item) => {
      page.drawText(item, { x: margin + indent, y, size, font, color: opcoes?.color ?? INK });
      y -= size + 3;
    });
  };

  const titulo = (texto: string) => {
    garantir(30);
    y -= 4;
    page.drawText(textoSeguro(texto).toUpperCase(), { x: margin, y, size: 10, font: bold, color: RED });
    y -= 6;
    page.drawLine({ start: { x: margin, y }, end: { x: A4[0] - margin, y }, thickness: 0.6, color: rgb(0.82, 0.84, 0.87) });
    y -= 13;
  };

  const cabecalho = () => {
    titulo('Identificacao do plantao');
    linha(`Servico: ${new Date(dados.escala.data_servico_inicio).toLocaleString('pt-BR')} ate ${new Date(dados.escala.data_servico_fim).toLocaleString('pt-BR')}`);
    linha(`Oficial de Area: ${dados.escala.oficial_area || '-'} | Comandante: ${dados.escala.comandante || '-'}`);
    linha(`Adjunto: ${dados.escala.adjunto_dia || '-'} | Cabo de Dia: ${dados.escala.cabo_dia || '-'}`);
    linha(`Telegrafista: ${dados.escala.telegrafista || '-'} | Chefe dos Motoristas: ${dados.escala.chefe_motoristas || '-'}`);
  };

  const escalaDia = () => {
    titulo('Guarnicoes e funcoes');
    dados.funcoes.forEach((item) => linha(`${item.graduacao} PM ${item.militar_nome} - ${item.funcao}`));
    if (!dados.funcoes.length) linha('Nenhum militar lancado.', { color: MUTED });
    titulo('Alteracoes de servico e manutencao');
    linha(dados.escala.observacoes || 'Sem alteracoes registradas.');
  };

  const escalaHoraria = () => {
    titulo('Escala horaria');
    dados.escalaHoraria.forEach((item) => linha(`${item.horario_inicio}-${item.horario_fim} | ${item.graduacao} PM ${item.militar_nome} | ${item.funcao} | ${item.observacao}`));
    if (!dados.escalaHoraria.length) linha('Escala horaria ainda nao gerada.', { color: MUTED });
    titulo('Rondantes');
    dados.rondantes.forEach((item) => linha(`${item.horario_inicio}-${item.horario_fim} | ${item.militar_nome}`));
    if (!dados.rondantes.length) linha('Rondantes ainda nao gerados.', { color: MUTED });
  };

  const livro = () => {
    titulo('Livro dos Motoristas');
    dados.relatos.forEach((item) => linha(`${item.prefixo} | ${item.situacao} | ${item.tem_novidade ? 'COM NOVIDADES' : 'SEM NOVIDADES'} | ${item.tem_novidade ? item.relato : item.relato_anterior}`));
    if (!dados.relatos.length) linha('Nenhuma viatura no livro.', { color: MUTED });
  };

  const pendencias = () => {
    titulo('Pendencias');
    dados.pendencias.forEach((item) => {
      linha(`${item.status} | ${item.tipo} | ${item.alvo}`, { bold: true });
      linha(item.descricao, { indent: 10 });
      item.historico.slice(-3).forEach((historico) => linha(`Historico: ${historico}`, { indent: 10, size: 7.5, color: MUTED }));
    });
    if (!dados.pendencias.length) linha('Nenhuma pendencia registrada.', { color: MUTED });
  };

  novaPagina();
  const nomes: Record<RelatorioOperacional, string> = {
    plantao: 'Relatorio completo do plantao',
    'escala-dia': 'Escala do Dia',
    'escala-horaria': 'Escala Horaria',
    livro: 'Livro dos Motoristas',
    pendencias: 'Relatorio de Pendencias'
  };
  linha(nomes[tipo], { bold: true, size: 16 });
  linha(`Gerado em ${new Date().toLocaleString('pt-BR')}`, { color: MUTED, size: 8 });
  cabecalho();
  if (tipo === 'plantao' || tipo === 'escala-dia') escalaDia();
  if (tipo === 'plantao' || tipo === 'escala-horaria') escalaHoraria();
  if (tipo === 'plantao' || tipo === 'livro') livro();
  if (tipo === 'plantao' || tipo === 'pendencias') pendencias();

  doc.setTitle(nomes[tipo]);
  doc.setSubject('Registro operacional do CD Digital');
  return doc.save();
}
