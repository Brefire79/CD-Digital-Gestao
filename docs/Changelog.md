# Changelog - CD Digital

## Unreleased - 17/07/2026

### Interface

- Novo menu pós-login Troca de SV Digital.
- Cabeçalho do Livro ajustado ao modelo da Estação de Bombeiros Ipiranga.
- Data operacional por extenso e prontidão correspondente ao dia.

### Viaturas e escala

- Cadastro conjunto de prefixo, CMT, MOT, AUX e Estagiário.
- Telegrafista independente na aba Viaturas.
- Sgt e Cb de Dia podem revisar os postos.
- OD informativa, sem escala horária ou ronda automática.
- Escala noturna 22h/23h, horários fixos do Telegrafista e prioridade dos motoristas.
- Rondantes Sgt das 00h às 06h.

### Livro dos Motoristas

- Sincronização com as VTRs do plantão.
- Inclusão de VTR administrativa, estacionada e de pernoite.
- S/N e C/N editáveis até o término do plantão.
- Relato obrigatório para C/N.
- Pendência para revisão, assinatura e encerramento pelo Chefe dos Motoristas.
- Histórico local do Livro encerrado.

### PDF e Google Drive

- Novo PDF paginado específico do Livro.
- OAuth Google Identity Services sem client secret no frontend.
- Criação automática de `Prontidão/Livro dos Motoristas/Ano`.
- Criação ou substituição do PDF do mesmo plantão.
- Encerramento bloqueado quando o backup não é confirmado.
- Registro do caminho, ID e link retornados pelo Google Drive.

### Documentação

- README, PRD, ROADMAP, arquivos de agentes e pasta `docs/` sincronizados com as regras atuais.
