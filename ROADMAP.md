# Roadmap - Evolucao CD Digital

## Fase 1 - Base da escala completa

- [Implementado] Modelar guarnicoes por viatura dinamica na tela Escala do Dia.
- [Implementado] Adicionar funcoes fixas por viatura: CMT, MOT, AUX e Estagiario.
- [Implementado] Reunir prefixo, CMT, MOT, AUX e Estagiario no cadastro de VTR da Passagem 360.
- [Implementado] Classificar Incendio, Resgate, Canil, OD e outras VTRs, mantendo OD apenas informativa.
- [Implementado] Identificar viaturas elegiveis para quarto de hora: UR, ABS/AB e Canil.
- [Implementado] Permitir ao Cabo de Dia selecionar e ordenar ate quatro viaturas no documento.
- [Implementado] Preservar viaturas retiradas de uso no historico, sem exclusao direta pela interface.
- [Implementado] Adicionar campos independentes de Oficial de Area, Comandante da Prontidao, Adjunto de Dia, Cabo de Dia, Telegrafista e Chefe dos Motoristas.
- [Implementado] Gerar a faixa diurna de 07h30 as 22h00 na escala completa.
- [Implementado] Sugerir automaticamente a faixa de almoco com base nos elegiveis do Auto Bomba.
- [Implementado] Manter horario de 17h00 as 18h00 em aberto para escolha do Cabo de Dia.

## Fase 2 - Gerador horario noturno refinado

- [Implementado] Gerar escala a partir de 22h00 ou 23h00, conforme decisao do Cabo de Dia.
- [Implementado] Se iniciar 23h00, manter 22h00 as 23h00 com Telegrafista/Fixo.
- [Implementado] Priorizar sequencia: Motorista UR, Motorista AB e Motorista Canil.
- [Implementado] Se motorista do Canil for Sgt ou superior, distribuir para demais integrantes elegiveis da guarnicao do Canil.
- [Implementado] Manter 06h00 as 07h30 com Telegrafista/Fixo.
- [Implementado] Permitir horarios quebrados, como 23h08.
- [Implementado] Permitir ajuste manual posterior de horario, militar, funcao e OBS.

## Fase 3 - Rondantes e campos do documento

- [Implementado] Gerar rondantes automaticamente somente com Sgt e permitir ajuste manual.
- [Implementado] Impedir Oficiais, Sd e Cb de entrar automaticamente em rondantes.
- [Implementado] Fixar a ronda entre 00h00 e 06h00 e excluir Sgt vinculado a OD.
- [Implementado] Criar opcoes padrao de OBS: Fixo, Rotativo, Motorista UR, Motorista AB, Motorista CN, Revezamento 2x1, Alternado pelo Canil e Telegrafista.
- [Implementado] Incluir Alteracoes de Servico e Manutencao do Quartel como campo do preenchimento da escala do dia.

## Fase 3.1 - Dashboard operacional

- [Implementado] Exibir data e hora do plantao em fonte grande.
- [Implementado] Exibir prontidao atual, cor operacional e status.
- [Implementado] Permitir abrir/ocultar calendario 24x48 e salvar preferencia local.

## Fase 4 - PDF operacional

- [Implementado] Gerar PDFs A4 da escala, livro, pendencias e plantao completo com dados reais.
- [Implementado parcial] Reproduzir a estrutura do documento fisico do quartel.
- [Implementado] Incluir cabecalho, escala horaria, rondantes, guarnicoes, alteracoes e manutencao.
- Permitir assinatura desenhada na tela em versao futura.
- [Implementado] Paginar automaticamente conteudo extenso sem cortar registros.

## Fase 5 - Modelos e historico

- [Implementado local] Arquivar plantao completo por data e Prontidao no dispositivo.
- [Implementado local] Reutilizar os dados persistidos da ultima operacao e sincronizar Escala do Dia com Passagem 360.
- [Implementado no app; requer OAuth configurado] Salvar o PDF do Livro dos Motoristas em `Prontidao/Livro dos Motoristas/Ano` antes de encerrar o plantao.
- Salvar os demais documentos e escalas em Google Drive para consulta futura.
- Exportar modelo em Google Sheets preservando a estrutura de planilha.
