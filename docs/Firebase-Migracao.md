# Migração Supabase → Firebase

Data: 17/07/2026. Migração executada com Claude Code; continuidade prevista no Codex.

## Contexto

O Supabase era usado **somente para autenticação** (e-mail/senha via
`@supabase/supabase-js`), com fallback de "modo demonstração" em `localStorage`.
Os dados operacionais (escalas, viaturas, pendências, Livro dos Motoristas etc.)
sempre ficaram no `localStorage` (`OperationalContext` + store Zustand
`usePassagem`). O `supabase/schema.sql` descrevia o banco planejado, mas nunca
foi consumido pelo código do app.

## O que já foi feito

- Dependência `@supabase/supabase-js` removida; `firebase` (Web SDK modular) instalada.
- `src/lib/firebase.ts` criado: inicialização condicional a partir das variáveis
  `VITE_FIREBASE_*`; exporta `isFirebaseConfigured`, `firebaseApp` e `firebaseAuth`.
- `src/contexts/AuthContext.tsx` reescrito com Firebase Auth
  (`signInWithEmailAndPassword`, `onAuthStateChanged`, `signOut`). O contexto agora
  expõe um tipo próprio `AuthUser { id, email }` (desacoplado do SDK); o campo
  `session` foi removido (ninguém o consumia). O modo demonstração local foi
  preservado exatamente como era.
- `vite.config.ts`: chunk `supabase-vendor` → `firebase-vendor`.
- `src/components/Layout.tsx`: selo "Supabase conectado" → "Firebase conectado".
- `.env.example` atualizado para as variáveis `VITE_FIREBASE_*`.
- Resíduos removidos: `src/lib/supabase.ts` e `supabase/schema.sql`.
- O schema Postgres foi **portado, não perdido**: coleções, seeds, automações e
  regras de acesso equivalentes estão em:
  - `firebase/DATA-MODEL.md` — modelo de dados Firestore completo;
  - `firebase/firestore.rules` — Security Rules equivalentes às antigas RLS;
  - `firebase/storage.rules` — anexos (antigo bucket `cd-digital-anexos`).
- Documentação atualizada (README, AGENTS.md, PRD.md, claude.mb, agents.mb,
  agentes.mb, docs/*).

## Configuração necessária (console do Firebase)

1. Criar projeto e registrar app Web; copiar as credenciais para `.env.local`.
2. Ativar **Authentication** → provedor E-mail/senha; criar os usuários.
3. Ativar **Firestore** e **Storage**; publicar `firebase/firestore.rules` e
   `firebase/storage.rules` (via console ou `firebase deploy --only firestore:rules,storage`).
4. Criar documentos em `profiles/{uid}` com `nome`, `nomeGuerra`, `graduacao`, `role`.
5. Semear `prontidoes` e `setoresQuartel` (listas em `firebase/DATA-MODEL.md`).

Sem as variáveis `VITE_FIREBASE_*`, o app continua abrindo em modo demonstração —
comportamento idêntico ao anterior.

## Próximos passos (para o Codex)

1. **Perfil real no login**: após autenticar, ler `profiles/{uid}` no Firestore e
   usar o `role` real em vez de inferir o perfil pelo texto do login
   (`inferirPerfil` em `src/components/passagem/perfil.ts`).
2. **Persistência Firestore** dos agregados que hoje usam só `localStorage`
   (prioridade: ciclo do Livro dos Motoristas + metadados do backup no Drive —
   ver `docs/Backlog.md` P0/P1). Manter o fallback local.
3. **Automações**: implementar as regras "checklist com alteração → pendência",
   "relato C/N → pendência" e histórico de pendências como Cloud Functions (ou
   transações no cliente até lá) — especificação em `firebase/DATA-MODEL.md`,
   seção "Automations".
4. **Anexos**: upload de fotos de checklist/pendências para
   `cd-digital-anexos/` no Cloud Storage.
5. **Revisão de segurança**: revisar as Security Rules antes do plantão piloto
   (as regras publicadas leem o `role` de `profiles/{uid}` — cada escrita faz um
   `get()` extra; avaliar migrar o papel para *custom claims* do Auth se o custo
   de leitura incomodar).

## Validação executada

- `npm run build` (`tsc -b` + `vite build`) aprovado após a migração.
