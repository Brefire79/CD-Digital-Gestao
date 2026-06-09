# Roadmap - Evolucao CD Digital

## Fase 1 - Base da escala completa

- Modelar guarnicoes por viatura dinamica.
- Adicionar funcoes fixas por viatura: CMT, MOT, AUX, AUX e Estagiario.
- Identificar viaturas elegiveis para quarto de hora: UR, ABS/AB e Canil.
- Permitir preenchimento do horario diurno de 07h30 as 22h00.
- Sugerir automaticamente 2 escalas para auxiliares do Auto Bomba e 1 sugestao para Canil.
- Permitir horario de 17h00 as 18h00 em aberto para escolha do Cabo de Dia.

## Fase 2 - Gerador horario noturno refinado

- Gerar escala a partir de 22h00 ou 23h00, conforme decisao do Cabo de Dia.
- Se iniciar 23h00, manter 22h00 as 23h00 com Telegrafista/Fixo.
- Priorizar sequencia: Motorista UR, Motorista AB e Motorista Canil.
- Se motorista do Canil for Sgt ou superior, distribuir para demais integrantes elegiveis da guarnicao do Canil.
- Manter 06h00 as 07h30 com Telegrafista/Fixo.
- Permitir horarios quebrados, como 23h08.
- Permitir ajuste manual posterior de militar, funcao e OBS.

## Fase 3 - Rondantes e campos do documento

- Gerar rondantes automaticamente com Comandante da Prontidao e Adjunto de Dia.
- Se forem a mesma pessoa, manter o mesmo militar no periodo inteiro.
- Criar opcoes padrao de OBS: Fixo, Rotativo, Motorista UR, Motorista AB, Motorista CN, Revezamento 2x1, Alternado pelo Canil e Telegrafista.
- Incluir Alteracoes de Servico e Manutencao do Quartel como campos do preenchimento da escala do dia.

## Fase 4 - PDF operacional

- Gerar PDF A4 vertical em uma pagina.
- Reproduzir layout do documento fisico do quartel.
- Incluir cabecalho, escala horaria, rondantes, distribuicao de viaturas, alteracoes, manutencao e assinaturas.
- Permitir assinatura desenhada na tela.
- Ajustar fonte e espacamento para preservar uma pagina.

## Fase 5 - Modelos e historico

- Salvar modelos por prontidao Amarela, Azul e Verde.
- Reutilizar modelo da ultima escala da mesma prontidao.
- Salvar escalas em Google Drive para consulta futura.
- Exportar modelo em Google Sheets preservando a estrutura de planilha.
