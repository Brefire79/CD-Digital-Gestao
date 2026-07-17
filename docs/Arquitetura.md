# Arquitetura - CD Digital

## Stack

- React 18, TypeScript e Vite.
- React Router.
- Tailwind CSS e Lucide React.
- Zustand com persistência para Passagem 360.
- Supabase Auth, PostgreSQL e Storage.
- `pdf-lib` para documentos operacionais.
- Google Identity Services e Google Drive REST API.
- PWA com `vite-plugin-pwa`.

## Organização

- `src/components/passagem`: telas e componentes do fluxo operacional.
- `src/pages`: rotas do app.
- `src/contexts/OperationalContext.tsx`: agregado operacional geral.
- `src/store/passagem.ts`: estado persistido, ciclo do Livro e Passagem 360.
- `src/lib/escalaGenerator.ts`: regra pura da escala e rondantes.
- `src/lib/livroMotoristasPdf.ts`: PDF paginado do Livro.
- `src/lib/googleDrive.ts`: OAuth, criação das pastas e upload/substituição do PDF.
- `src/lib/prontidaoScale.ts`: prontidão 24x48 e data operacional.
- `supabase/schema.sql`: schema, RLS, triggers e seeds.

## Estado

O app mantém dois agregados:

- `OperationalContext`: viaturas, escalas, checklist, pendências, relatórios e histórico geral.
- `usePassagem`: tela atual, cabeçalho, VTRs, guarnição, ronda, escala, rondantes, Livro, fechamento e histórico dos Livros.

O fallback local usa `localStorage`. Regras que exigem consistência multiusuário devem migrar gradualmente para serviços Supabase.

## Encerramento do Livro

```text
validar dados
  -> gerar PDF em memória
  -> solicitar OAuth Google
  -> localizar/criar Prontidão
  -> localizar/criar Livro dos Motoristas
  -> localizar/criar Ano
  -> criar ou substituir PDF do plantão
  -> registrar metadados do backup
  -> encerrar Livro e resolver pendência
```

Qualquer falha antes da confirmação do upload interrompe o fluxo sem alterar o status para encerrado.

## Segurança

- Nunca usar `service_role` ou Google client secret no frontend.
- `VITE_GOOGLE_CLIENT_ID` identifica o cliente OAuth e não concede acesso sozinho.
- O token OAuth é obtido durante a interação do usuário e não é persistido pela aplicação.
- O escopo `drive.file` limita o app aos arquivos criados ou autorizados para ele.
- RLS do Supabase deve ser revisada antes da produção.

## Próxima evolução arquitetural

1. Criar serviços por agregado em `src/services`.
2. Persistir o ciclo do Livro e metadados do Drive no Supabase.
3. Criar fila de reenvio para falhas offline, sem liberar o encerramento antes da confirmação.
4. Adicionar testes unitários para escala, prontidão e nome do arquivo.
5. Adicionar testes de integração para fechamento e migração do estado persistido.
