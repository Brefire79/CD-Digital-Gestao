# Modelo de dados Firestore — CD Digital

Este documento porta o antigo `supabase/schema.sql` (Postgres) para o Firestore.
O app hoje persiste tudo em `localStorage`; este modelo é a referência para quando
a sincronização com o backend for implementada (ver `docs/Firebase-Migracao.md`).

## Convenções

- IDs de documento: automáticos do Firestore (substituem `gen_random_uuid()`).
- Timestamps: `createdAt` / `updatedAt` com `serverTimestamp()` (substituem `created_at` / `updated_at`).
- Enums do Postgres viram strings validadas no app e nas regras:
  - `role`: `admin | cabo_dia | sgt | motorista | militar`
  - `prontidao`: `Amarela | Azul | Verde`
  - `checklistStatus`: `OK | Com alteração`
  - `pendenciaStatus`: `Aberta | Em andamento | Resolvida | Arquivada`
  - `pendenciaOrigem`: `passagem_servico | livro_motoristas`

## Coleções

### `profiles/{uid}`
Documento por usuário do Firebase Auth (o ID do documento é o `uid` do Auth —
substitui a FK `user_id -> auth.users`).

| Campo | Tipo | Observação |
|---|---|---|
| `nome` | string | obrigatório |
| `nomeGuerra` | string | obrigatório |
| `graduacao` | string | obrigatório |
| `role` | string | default `militar` |
| `createdAt` | timestamp | |

### `prontidoes/{id}`
Seed fixo: `Amarela`, `Azul`, `Verde` (campo `nome`, único).

### `viaturas/{id}`
| Campo | Tipo | Observação |
|---|---|---|
| `prefixo` | string | único (validar no app) |
| `tipo` | string | |
| `estacaoAtual` | string | default `EB Centro` |
| `statusOperacional` | string | `Rodando \| Reserva \| Manutenção \| Transferida \| Histórico` |
| `transferidaPara` | string? | |
| `observacaoHistorico` | string? | |
| `ativa` | boolean | default `true` |
| `createdAt` / `updatedAt` | timestamp | |

### `setoresQuartel/{id}`
`nome` (único), `ordem` (number), `ativo` (boolean), `createdAt`.
Seed: Academia/Musculação, Máquina de encher cilindro/compressor, Máquina de lavar
roupa, Secadora, Gás de cozinha, Cilindro compressor, Churrasqueira, Piscina,
Refeitório, Telegrafia (ordem 1–10).

### `escalas/{id}`
| Campo | Tipo | Observação |
|---|---|---|
| `dataServicoInicio` / `dataServicoFim` | timestamp | validar `fim > inicio` (plantão 24h) |
| `prontidaoId` | string | ref `prontidoes` |
| `oficialArea` | string | default `''` |
| `comandante` | string | |
| `adjuntoDia` | string | default `''` |
| `caboDia` | string | |
| `telegrafista` | string | |
| `chefeMotoristas` | string | |
| `observacoes` | string? | |
| `createdBy` | string? | uid do Auth |
| `createdAt` | timestamp | |

Subcoleções:

- `escalas/{id}/funcoes/{funcaoId}`: `militarNome`, `graduacao`, `funcao`,
  `entraEscalaHoraria` (boolean, default `false`), `createdAt`.
  Regra de negócio: só Sd/Cb entram automaticamente na escala horária
  (`entraEscalaHoraria = true` exige graduação em `sd | soldado | cb | cabo`).
- `escalas/{id}/escalaHoraria/{linhaId}`: `horarioInicio`, `horarioFim` (string `HH:mm`),
  `militarNome`, `graduacao`, `funcao`, `observacao?`, `createdAt`.
  A escala final também tem Telegrafista fixo, linhas em aberto e inclusões manuais
  do Cabo de Dia (a restrição Sd/Cb vale só para inclusão automática).
  Índice sugerido: ordenar por `horarioInicio`.

### `passagensServico/{id}`
| Campo | Tipo |
|---|---|
| `escalaId` | string (ref `escalas`) |
| `prontidaoId` | string |
| `caboDiaSai` / `caboDiaEntra` | string |
| `observacoesGerais` | string? |
| `assinaturaSaida` / `assinaturaEntrada` | boolean (default `false`) |
| `createdAt` | timestamp |

Subcoleção `checklist/{itemId}`: `setorId` (ref `setoresQuartel`), `status`
(`OK | Com alteração`), `observacao?`, `fotoUrl?` (Cloud Storage), `createdAt`.

### `livrosMotoristas/{id}`
`escalaId`, `prontidaoId`, `dataServicoInicio`, `dataServicoFim`,
`responsavelGraduacao`, `responsavelNomeGuerra`, `assinaturaConfirmada`
(boolean, default `false`), `createdAt`.

Subcoleção `relatosViaturas/{relatoId}`: `viaturaId` (ref `viaturas`), `situacao`,
`temNovidade` (boolean), `relato?`, `relatoAnterior?`, `createdAt`.
Regra de negócio: se `temNovidade = true`, `relato` é obrigatório (não vazio).

### `pendencias/{id}`
| Campo | Tipo | Observação |
|---|---|---|
| `origem` | string | `passagem_servico \| livro_motoristas` |
| `origemId` | string | id do item de checklist ou do relato |
| `tipo` | string | `Setor do Quartel` ou `Viatura` |
| `setorId` | string? | quando origem = checklist |
| `viaturaId` | string? | quando origem = relato |
| `descricao` | string | |
| `fotoUrl` | string? | |
| `prontidaoId` | string | |
| `responsavel` | string? | |
| `status` | string | default `Aberta` |
| `createdAt` / `updatedAt` | timestamp | |

Unicidade: uma pendência por (`origem`, `origemId`) — usar id determinístico do
documento (ex.: `${origem}_${origemId}`) para reproduzir o índice único do Postgres.

Subcoleção `historico/{eventoId}`: `descricao`, `statusAnterior?`, `statusNovo?`,
`createdBy?` (uid), `createdAt`. Somente inserção (append-only).

## Automations (antigos triggers do Postgres)

Implementar como **Cloud Functions** (ou transações no cliente enquanto não houver
Functions):

1. **Checklist → Pendência**: ao criar/atualizar item de checklist com status
   `Com alteração`, criar pendência (`origem = passagem_servico`, `tipo = Setor do
   Quartel`) com descrição da observação (ou texto padrão), foto, prontidão e
   responsável (`caboDiaSai` da passagem). Idempotente (uma pendência por item).
2. **Relato de viatura → Pendência**: ao criar/atualizar relato com
   `temNovidade = true`, criar pendência (`origem = livro_motoristas`,
   `tipo = Viatura`) com relato, prontidão e responsável (graduação + nome de
   guerra do livro). Idempotente.
3. **Histórico de pendência**: ao criar pendência, registrar evento "Pendência
   criada automaticamente."; ao mudar `status`, registrar evento com
   `statusAnterior`/`statusNovo` e `createdBy`.
4. **`updatedAt`**: atualizar com `serverTimestamp()` a cada escrita em
   `pendencias` (no app ou via Function).

## Storage

Pasta `cd-digital-anexos/` no Cloud Storage (fotos de checklist e pendências),
acesso restrito a usuários autenticados — ver `firebase/storage.rules`.
