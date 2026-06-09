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
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
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

## Regra Critica - Escala Horaria Noturna

O sistema deve possuir um gerador automatico da escala horaria noturna utilizada pelo Corpo de Bombeiros, com PDF futuro em layout semelhante ao documento fisico utilizado no quartel.

### Objetivo

Ao final do preenchimento da escala, o sistema deve gerar uma escala horaria noturna concentrada no periodo operacional entre 22h00 e 07h00, com foco principal no miolo de 22h00/23h00 ate 06h00.

### Entrada do Cabo de Dia

- Quantidade de militares que irao puxar hora.
- Horario de inicio da distribuicao noturna:
  - 22h00
  - 23h00

### Regras de Calculo

- O Cabo de Dia decide se a distribuicao comeca as 22h00 ou 23h00, conforme o efetivo disponivel.
- Quando o inicio escolhido for 23h00, o horario de 22h00 as 23h00 fica com o Telegrafista como posto fixo.
- O periodo escolhido ate 06h00 deve ser dividido automaticamente e de forma equilibrada entre os militares selecionados.
- O ultimo horario fixo, de 06h00 as 07h00, e sempre do militar que esta na funcao de Telegrafista.
- O sistema deve calcular:
  - Horario inicial.
  - Horario final.
  - Distribuicao equilibrada.
  - Sequencia dos militares.
- O Cabo de Dia deve poder ajustar manualmente apos a geracao.

### Participantes Automaticos

Participam automaticamente:

- Soldados
- Cabos

Nao participam automaticamente:

- Sargentos
- Oficiais

Excecao:

- Inclusao manual pelo Cabo de Dia.

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

## Regras de Negocio Gerais

- Somente Sd e Cb participam automaticamente da escala horaria.
- Alteracoes geram pendencias.
- Novidades em viaturas geram pendencias.
- Historico e obrigatorio.
- Cada plantao deve estar vinculado a uma prontidao.
- Todo registro deve manter data e hora.

## Fluxo Principal

Login > Dashboard > Escala > Escala Horaria > Passagem de Servico > Livro dos Motoristas > Pendencias > Relatorios

## Futuras Versoes

- QR Codes.
- IA com OpenAI/Claude.
- Notificacoes.
- Multiquartel.
- Analises inteligentes.
- Geracao completa de PDF.
- Salvamento/exportacao em Google Sheets.
