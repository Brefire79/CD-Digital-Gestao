import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { HeaderInfo, LivroVtr } from '../store/passagem';

const A4: [number, number] = [595.28, 841.89];
const RED = rgb(0.76, 0.05, 0.12);
const INK = rgb(0.08, 0.09, 0.11);
const GRAY = rgb(0.38, 0.4, 0.43);

export interface LivroMotoristasPdfData {
  header: HeaderInfo;
  livro: LivroVtr[];
  assinante: string;
  encerradoEm: Date;
}

function quebrarTexto(texto: string, fonte: PDFFont, tamanho: number, largura: number): string[] {
  const palavras = texto.trim().split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of palavras) {
    const candidata = atual ? `${atual} ${palavra}` : palavra;
    if (fonte.widthOfTextAtSize(candidata, tamanho) <= largura) atual = candidata;
    else {
      if (atual) linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas.length ? linhas : ['—'];
}

export async function gerarPdfLivroMotoristas(data: LivroMotoristasPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 38;
  const contentWidth = A4[0] - margin * 2;
  let page!: PDFPage;
  let y!: number;

  const novaPagina = () => {
    page = doc.addPage(A4);
    y = A4[1] - margin;
    page.drawRectangle({ x: margin, y: y - 62, width: contentWidth, height: 62, color: INK });
    const centralizar = (texto: string, tamanho: number, fonte: PDFFont, yy: number, cor: ReturnType<typeof rgb>) => {
      const largura = fonte.widthOfTextAtSize(texto, tamanho);
      page.drawText(texto, { x: margin + (contentWidth - largura) / 2, y: yy, size: tamanho, font: fonte, color: cor });
    };
    centralizar('Polícia Militar do Estado de São Paulo', 8.5, bold, y - 15, rgb(0.98, 0.22, 0.32));
    centralizar('Corpo de Bombeiros', 9, bold, y - 28, rgb(1, 1, 1));
    centralizar('Estação de Bombeiros Ipiranga', 12.5, bold, y - 43, rgb(1, 1, 1));
    centralizar(`${data.header.prontidao} - ${data.header.data}`, 8.5, regular, y - 56, rgb(0.76, 0.78, 0.8));
    y -= 82;
  };

  const garantirEspaco = (altura: number) => {
    if (y - altura < 70) novaPagina();
  };

  novaPagina();
  page.drawText('LIVRO DOS MOTORISTAS', { x: margin, y, size: 15, font: bold, color: INK });
  y -= 18;
  page.drawText('Documento operacional por viatura - situação e novidades do plantão.', { x: margin, y, size: 9, font: regular, color: GRAY });
  y -= 22;

  data.livro.forEach((item) => {
    const relato = item.novidade === 'C/N' ? item.relato : 'Sem novidades.';
    const linhas = quebrarTexto(relato || 'Relato não informado.', regular, 8.5, contentWidth - 24);
    const altura = 42 + linhas.length * 11;
    garantirEspaco(altura);
    page.drawRectangle({ x: margin, y: y - altura + 8, width: contentWidth, height: altura, borderColor: rgb(0.78, 0.83, 0.87), borderWidth: 0.7 });
    page.drawText(item.prefixo, { x: margin + 12, y: y - 12, size: 11, font: bold, color: INK });
    page.drawText(item.tipo, { x: margin + 150, y: y - 12, size: 8.5, font: regular, color: GRAY });
    page.drawText(item.novidade, { x: margin + contentWidth - 45, y: y - 12, size: 10, font: bold, color: item.novidade === 'C/N' ? RED : rgb(0.02, 0.55, 0.42) });
    linhas.forEach((linha, index) => page.drawText(linha, { x: margin + 12, y: y - 31 - index * 11, size: 8.5, font: regular, color: GRAY }));
    y -= altura + 8;
  });

  if (data.header.obsGeralLivro.trim()) {
    const linhas = quebrarTexto(data.header.obsGeralLivro, regular, 8.5, contentWidth - 24);
    garantirEspaco(35 + linhas.length * 11);
    page.drawText('OBSERVAÇÕES GERAIS', { x: margin, y, size: 9, font: bold, color: RED });
    y -= 15;
    linhas.forEach((linha, index) => page.drawText(linha, { x: margin, y: y - index * 11, size: 8.5, font: regular, color: GRAY }));
    y -= linhas.length * 11 + 15;
  }

  garantirEspaco(80);
  page.drawLine({ start: { x: margin + 80, y: y - 28 }, end: { x: margin + contentWidth - 80, y: y - 28 }, thickness: 0.7, color: GRAY });
  page.drawText(data.assinante, { x: margin + 80, y: y - 43, size: 9, font: bold, color: INK });
  page.drawText(`Chefe dos Motoristas - assinado eletronicamente em ${data.encerradoEm.toLocaleString('pt-BR')}`, {
    x: margin + 80, y: y - 56, size: 7.5, font: regular, color: GRAY
  });

  doc.getPages().forEach((pagina, index) => {
    pagina.drawText(`CD Digital - Livro dos Motoristas | Página ${index + 1} de ${doc.getPageCount()}`, {
      x: margin, y: 32, size: 7, font: regular, color: GRAY
    });
  });

  return doc.save();
}
