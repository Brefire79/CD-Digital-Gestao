# PRD - CD Digital - Gestao de Prontidao Operacional

## Visao do Produto

Sistema PWA para digitalizacao da passagem de servico, escalas, livro dos motoristas, pendencias e relatorios operacionais de prontidoes.

## Objetivo

Substituir controles em papel e comunicacao verbal por um sistema centralizado, auditavel e acessivel por celular.

## Usuarios

- Administrador
- Cabo de Dia
- Motorista
- Militar

## Stack Tecnologico

- React + Vite + TypeScript
- Firebase
- Firestore
- Firebase Auth
- Cloud Storage for Firebase
- Tailwind CSS
- PWA

## Modulos MVP

- Login
- Dashboard
- Escala de Servico
- Escala Horaria
- Passagem de Servico
- Livro dos Motoristas
- Pendencias
- Relatorios
- Administracao

## Regra Critica - Escala Completa e Escala Horaria Noturna

O sistema possui um gerador automatico da escala completa utilizada pelo Corpo de Bombeiros, com foco especial na escala horaria noturna e evolucao continua do PDF para maior fidelidade ao documento fisico utilizado no quartel.

### Objetivo

Ao final do preenchimento da escala, o sistema deve gerar a escala diaria completa, incluindo a faixa diurna de 07h30 as 22h00, a faixa noturna de 22h00/23h00 ate 06h00 e o posto fixo final de 06h00 as 07h30.

### Entrada do Cabo de Dia

- Quantidade de militares que irao puxar hora.
- Horario de inicio da distribuicao noturna:
  - 22h00
  - 23h00
- Guarnicoes das viaturas do plantao:
  - UR
  - ABS / Auto Bomba
  - Canil
- Dados de Oficial de Area, Comandante da Prontidao e Adjunto de Dia devem ser campos independentes, preenchidos ou conferidos pelo Cabo de Dia.
- Alteracoes de Servico e Manutencao do Quartel, preenchidas pelo Cabo de Dia conforme o dia.

### Regras de Calculo

- O Cabo de Dia decide se a distribuicao comeca as 22h00 ou 23h00, conforme o efetivo disponivel.
- Quando o inicio escolhido for 23h00, o horario de 22h00 as 23h00 fica com o Telegrafista como posto fixo.
- Quando houver horario de 17h00 as 18h00 em aberto, o Cabo de Dia escolhe manualmente quem ira tirar esse horario.
- O periodo escolhido ate 06h00 deve ser dividido automaticamente e de forma equilibrada entre os militares selecionados das viaturas elegiveis.
- A sequencia noturna deve priorizar:
  - Motorista UR.
  - Motorista AB.
  - Motorista Canil.
- Se o motorista do Canil for Sgt ou superior, ele nao entra automaticamente na escala horaria; a hora deve cair sobre os demais integrantes elegiveis da guarnicao do Canil.
- O ultimo horario fixo, de 06h00 as 07h30, e sempre do militar que esta na funcao de Telegrafista.
- O sistema deve calcular:
  - Horario inicial.
  - Horario final.
  - Distribuicao equilibrada.
  - Sequencia dos militares.
- O calculo pode gerar horarios com minutos quebrados, como 23h08, quando necessario.
- O Cabo de Dia deve poder ajustar manualmente apos a geracao.

### Faixa Diurna

- A escala completa deve incluir a faixa diurna de 07h30 as 22h00.
- O sistema pode sugerir automaticamente:
  - 2 escalas para auxiliares do Auto Bomba.
  - 1 sugestao para o Canil.
- O restante da faixa diurna pode ser preenchido ou ajustado manualmente pelo Cabo de Dia.

### Participantes Automaticos

Participam automaticamente:

- Soldados
- Cabos

Nao participam automaticamente:

- Sargentos
- Oficiais

Excecao:

- Inclusao manual pelo Cabo de Dia.

### Rondantes

- A lista de rondantes deve considerar somente militares Sgt conforme a pratica operacional.
- Oficiais, Sd e Cb nao devem ser usados automaticamente como rondantes.
- O periodo de ronda e sempre de 00h00 as 06h00.
- Sgt vinculado a viatura OD nao participa da ronda automatica.
- Se houver apenas um Sgt disponivel, a ronda fica com o mesmo militar durante todo o periodo.
- Se houver dois ou mais Sgt disponiveis, o sistema divide o periodo de ronda em duas faixas.
- O Cabo de Dia deve poder ajustar manualmente os rondantes antes de gerar o PDF.

### Viaturas e Guarnicoes

- As viaturas devem permitir funcoes fixas por coluna:
  - CMT.
  - MOT.
  - AUX.
  - Estagiario.
- Na Passagem de Servico, o cadastro de VTR deve reunir prefixo, CMT, MOT, AUX e Estagiario na mesma tela para Incendio, Resgate, Canil, OD e demais classes.
- A mesma aba deve permitir cadastrar o Telegrafista do plantao para reutilizacao posterior na Escala de Hora e no documento. Sgt e Cb de Dia podem revisar os postos antes de avancar.
- A VTR OD deve aparecer apenas como informacao no documento, sem participar da escala horaria ou da ronda automatica.
- O app deve permitir colunas dinamicas de viaturas conforme o plantao.
- A tela Escala do Dia deve ser o ponto principal para o Cabo de Dia montar as guarnicoes por viatura.
- Cada militar lancado deve poder ser vinculado a uma viatura ativa ou a uma funcao de cabecalho do plantao.
- A escala horaria automatica considera apenas integrantes elegiveis das viaturas UR, ABS/AB e Canil.
- Demais viaturas do documento podem aparecer na distribuicao do plantao, mas nao entram nos criterios da escala horaria.
- A montagem da distribuicao das viaturas deve ser definida pelo Cabo de Dia; o sistema nao deve preencher nomes aleatorios nessa tabela.
- O Cabo de Dia pode selecionar e ordenar ate quatro viaturas para as colunas do documento; a escolha deve permanecer salva no dispositivo.
- Viaturas retiradas de uso devem permanecer no historico operacional, sem exclusao direta pela interface.

### Opcoes Padrao de OBS

A coluna OBS deve oferecer opcoes prontas baseadas no modelo da escala:

- Fixo.
- Rotativo.
- Motorista UR.
- Motorista AB.
- Motorista CN.
- Revezamento 2x1.
- Alternado pelo Canil.
- Telegrafista.

### Edicao Manual

O Cabo de Dia podera alterar:

- Nome do militar.
- Funcao.
- Observacoes.

### Modelos

O sistema deve permitir reutilizar modelos anteriores, especialmente escalas de plantao da mesma prontidao.

### PDF Futuro

O PDF final deve reproduzir visualmente o modelo operacional atual do quartel, incluindo:

- Cabecalho.
- Comandante da Prontidao.
- Cabo de Dia.
- Telegrafista.
- Chefe dos Motoristas.
- Escala Horaria.
- Rondantes.
- Distribuicao de Viaturas.
- Alteracoes de Servico.
- Assinaturas.

### Regras do PDF

- O PDF deve sair em uma unica pagina A4 vertical, como o modelo fisico.
- O layout deve ser o mais proximo possivel do documento fisico, mesmo que precise reduzir fonte.
- As assinaturas finais devem permitir assinatura desenhada na tela, mantendo nome e cargo no rodape.
- O modelo deve ser salvo por prontidao e por escala.
- Escalas devem ficar salvas para consulta futura no Google Drive.
- Exportacao futura para Google Sheets deve preservar o modelo de planilha.

## Regras de Negocio Gerais

- Somente Sd e Cb participam automaticamente da escala horaria.
- Alteracoes geram pendencias.
- Novidades em viaturas geram pendencias.
- O Livro dos Motoristas deve listar automaticamente as VTRs do plantao e permitir VTRs adicionais administrativas, estacionadas ou de pernoite. Cada linha usa S/N ou C/N, abre relato ao marcar C/N e permanece editavel ate o termino do plantao.
- O cabecalho do Livro deve exibir, em linhas separadas, Policia Militar do Estado de Sao Paulo, Corpo de Bombeiros, Estacao de Bombeiros Ipiranga e `Prontidao - data por extenso`.
- No fim do plantao, o Chefe dos Motoristas deve revisar, assinar e encerrar o Livro. O encerramento fica bloqueado se houver C/N sem relato ou se o backup PDF no Google Drive nao for confirmado.
- O backup do Livro deve usar a pasta `Prontidao correspondente/Livro dos Motoristas/Ano`, substituindo o arquivo do mesmo plantao quando ele ja existir.
- Historico e obrigatorio.
- Cada plantao deve estar vinculado a uma prontidao.
- Todo registro deve manter data e hora.
- A escala gerada deve permitir ajuste manual de horario, militar, funcao e OBS.
- Rondantes gerados automaticamente devem usar somente Sgt e permanecer editaveis.
- O encerramento deve arquivar uma copia do plantao para consulta historica.
- Os relatorios do MVP devem usar dados reais do plantao, sem botoes demonstrativos.

## Fluxo Principal

Login > Menu Troca de SV Digital > Viaturas > Ronda Quartel > Escala de Hora > Livro dos Motoristas > Relatorios

## Futuras Versoes

- QR Codes.
- IA com OpenAI/Claude.
- Notificacoes.
- Multiquartel.
- Analises inteligentes.
- Geracao completa de PDF.
- Salvamento/exportacao em Google Sheets.
