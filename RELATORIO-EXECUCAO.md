# Relatório de Execução — Passagem 360

Registro do que foi implementado e validado nesta sessão. Use junto com `PRD.md` e `RELATORIO-TECNICO-CLAUDE.md`.

## Atualização consolidada — 17/07/2026

- Menu pós-login atualizado para Viaturas, Ronda Quartel, Escala de Hora, Livro dos Motoristas e Relatórios.
- Viaturas agora reúnem prefixo, CMT, MOT, AUX e Estagiário; Telegrafista é informado separadamente na mesma aba.
- Sgt e Cb de Dia podem revisar os postos.
- Escala horária implementa início 22h/23h, horários fixos do Telegrafista, prioridade MOT Resgate → MOT Incêndio → MOT Canil, alternância de guarnições e edição pelo Cabo de Dia.
- Rondantes automáticos usam somente Sgt das 00h00 às 06h00 e excluem Sgt da OD.
- Livro dos Motoristas replica as VTRs do plantão e aceita VTRs administrativas, estacionadas e de pernoite.
- C/N abre relato obrigatório; o Livro permanece aberto até revisão e assinatura do Chefe dos Motoristas.
- Cabeçalho oficial: Polícia Militar do Estado de São Paulo, Corpo de Bombeiros, Estação de Bombeiros Ipiranga e `Prontidão - data por extenso`.
- PDF próprio do Livro implementado com paginação.
- Encerramento integrado ao Google Drive em `Prontidão correspondente/Livro dos Motoristas/Ano` e bloqueado até confirmação do upload.
- A integração Drive requer `VITE_GOOGLE_CLIENT_ID`, Drive API habilitada e origem OAuth autorizada; nenhum client secret é usado no frontend.
- Validação atual: `tsc -b`, build Vite/PWA e rota local aprovados. O upload real ainda depende da configuração OAuth do ambiente.

## Contexto encontrado

O repositório `main` continha apenas a base anterior (Dashboard, Escala, Livro, Pendências em tema escuro navy). O fluxo **Passagem 360** descrito no PRD/relatório técnico **ainda não estava commitado** — existia só como mockup e especificação. Esta sessão implementou o fluxo do zero, alinhado aos mockups e ao PRD.

## O que foi implementado

### Design tokens (mockup)
`tailwind.config.js`: adicionados `primary #C8102E`, `charcoal #16181C`, `surface #F4F3F1`, `line #D9DBDE`, `ink`, raio `lg = 8px`, sombra `card`. A paleta antiga (`operacional.*`) foi preservada para não quebrar as telas legadas.

### Login (`src/pages/Login.tsx`)
Reescrito conforme o mockup: painel escuro à esquerda com a marca e o título "Passagem de Serviço Operacional Digital."; à direita formulário com Login militar, Senha, Prontidão entrante (Azul/Verde/Amarela), Quartel, Data e CTA "Iniciar troca de serviço". Inclui atalhos de teste **Entrar como Sgt** e **Entrar como Cabo de Dia**. Integra com o `AuthContext` (modo demo) e inicializa a store da passagem.

### Wizard Passagem 360 (`src/components/passagem/`)
- `WizardLayout.tsx` — shell com painel escuro + conteúdo claro; botão **Configurações** só na aba VTR (desktop no topo do painel; mobile no topo do conteúdo). O drawer abre os módulos reais de plantão, administração, relatórios e calendário.
- `StepProgress.tsx` — trilha de etapas (VTR · Guarnição · Ronda · Escala · Livro) com estados ativo/concluído e navegação.
- `StepVTR.tsx` — prefixo, adicionar (aceita múltiplos separados por vírgula), listar, remover.
- `StepGuarnicao.tsx` — nome/graduação + função (CMT/MOT/AUX/Estagiário), adicionar/remover.
- `StepRondas.tsx` — roteiro de 8 setores (Musculação → Telegrafia), status Em ordem/Alteração/N/A, GLP cheios/vazios, sub-itens da Telegrafia (armamento, computador, impressora, coletes), observações 0/500, fotos. Alteração marca situação anormal.
- `StepEscala.tsx` — escala 07:30→07:30 totalmente editável (início/fim/cobertura/militar/critério), delegação do livro e prévia do documento.
- `StepLivro.tsx` — formato documento: cabeçalho oficial, VTRs em linhas (`ABS-01104`, `UR-01101`, `UT-03 CANIL`, `AO-01101`) com S/N · C/N e relato, Obs Geral e Chefe dos Motoristas. **Sem KM obrigatório** (conforme PRD).
- `StepReview.tsx` — resumo das etapas, geração de PDF (pdf-lib, A4 vertical, carregado sob demanda) e criação de pendências a partir de alterações da ronda e C/N do livro.
- `perfil.ts` — infere perfil do login (Sgt → inicia em VTR; Cabo de Dia → inicia na Ronda, podendo voltar).

### Store (`src/store/passagem.ts`)
Zustand com `persist` + `devtools`. Estado: `perfil`, `step`, `header`, `vtrs`, `guarnicao`, `ronda`, `escala`, `livro` e ações. Reexport em `src/components/passagem/usePassagemStore.ts`.

### Integração
- `src/App.tsx` — `/passagem-servico` agora roda em tela cheia (fora do `Layout`/navbar), ainda protegida por login.
- `OperationalContext` — novo método `addPendencias` para o wizard persistir pendências de Ronda/Livro.
- `src/lib/passagemPdf.ts` — gerador de PDF simplificado (evoluirá para o modelo oficial completo).

## Decisão confirmada (mockup × PRD) — Livro sem KM

O mockup da etapa 5 mostrava KM inicial/final + assinatura, mas o **modelo oficial não usa KM**. Confirmado com o usuário: a etapa Livro segue o texto do PRD — formato documento, por VTR, com S/N · C/N, relato individual, "Obs Geral" e Chefe dos Motoristas automático, **sem KM**. `StepLivro.tsx` está alinhado.

## Gerador automático da escala horária (Regra Crítica do PRD)

Implementado em `src/lib/escalaGenerator.ts` (regras puras, sem dependência da store) e exposto na aba Escala.

- **Elegibilidade:** apenas Sd e Cb participam automaticamente (graduação inferida do nome, como no `perfil.ts`); Sgt/Oficiais só por inclusão manual (checkbox).
- **Início noturno:** Cabo de Dia escolhe 22:00 ou 23:00. Quando 23:00, a faixa 22:00–23:00 vira posto fixo do Telegrafista.
- **Distribuição:** período início→06:00 dividido de forma equilibrada (gera minutos quebrados; reproduz o modelo físico — 22:00→06:00 em 7 dá 1h08 por faixa e 1h12 na última).
- **Prioridade:** o início da escala é dos **motoristas** (função Condutor), na ordem **UR → ABS (Bomba) → Canil**; em seguida os demais integrantes pela mesma ordem de classe.
- **Postos fixos do Telegrafista:** 22:00–23:00 (se início 23:00) e 06:00–07:30; o Telegrafista não entra na distribuição rotativa.
- **Canil Sgt+:** não entra (consequência natural da regra de elegibilidade).
- **Almoço:** 12:00–14:00 com critério Revezamento 2x1 (2 ABS + 1 Canil), sugerindo militar do ABS.
- **Rondantes:** somente Sgt — 1 Sgt cobre o período integral; 2+ dividem em faixas iguais. Editáveis na aba.
- Tudo permanece **editável** após a geração. Telegrafista e rondantes entram no PDF e no resumo da revisão.

Store: novos campos `escalaConfig.inicioNoturno`, `rondantes`, `header.telegrafista` e, no membro da guarnição, `viatura` (classe) e `puxaHora` (override). Ações `setEscalaConfig`, `gerarEscalaAutomatica`, `gerarRondantesAuto`, `updateRondante`. Lógica validada por asserts (faixas, postos fixos, prioridade, exclusão de Sgt e telegrafista).

## Validação

- `npx tsc -b` → sem erros.
- `npm run build` → sucesso; pdf-lib isolado em chunk próprio (carregado só ao gerar PDF).
- Lógica do gerador validada com suíte de asserts (graduação, divisão de período, postos fixos, prioridade, rondantes).
- Não foi possível capturar screenshots neste ambiente (sem navegador). Recomenda-se rodar `npm run dev` e revisar VTR → Revisar em desktop e mobile.

## Próximos passos

1. Vincular VTRs do Livro às viaturas reais cadastradas (e puxar a classe da VTR direto do vínculo, dispensando o select manual de classe na aba Escala).
2. Evoluir o PDF para o modelo oficial fiel (uma página A4, layout do documento físico).
3. Transformar o drawer de Configurações em telas reais.
4. Persistência via Firebase (Firestore)/repository e calendário operacional.

## Fechamento do MVP operacional

- Escala Horária editável por linha, com opções operacionais de OBS.
- Rondantes gerados apenas com Sgt, persistidos e editáveis.
- Escala do Dia sincronizada com os dados da Passagem 360.
- Relatórios com geração real de cinco PDFs operacionais.
- Encerramento com histórico completo por plantão no dispositivo.
- Schema atualizado com perfil `sgt`, RLS da Passagem/Checklist e suporte a postos fixos e ajustes manuais.
