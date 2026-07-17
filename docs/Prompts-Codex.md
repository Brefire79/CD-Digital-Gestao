# Prompts de Continuidade - Codex e Claude Code

## Continuar a implementação

```text
Continue o CD Digital a partir do estado atual, sem reiniciar o projeto. Leia AGENTS.md, claude.mb, agentes.mb, PRD.md, ROADMAP.md e docs/. Depois inspecione src/store/passagem.ts, src/components/passagem, src/lib/escalaGenerator.ts, src/lib/googleDrive.ts, src/lib/livroMotoristasPdf.ts, src/contexts/OperationalContext.tsx e supabase/schema.sql. Preserve as regras operacionais e valide com tsc -b e vite build.
```

## Próxima prioridade recomendada

```text
Implemente e valide a persistência Supabase do ciclo do Livro dos Motoristas e dos metadados do backup do Drive. Preserve o fallback local, não salve tokens OAuth e não permita que uma falha remota encerre o Livro. Atualize schema, RLS, documentação e testes.
```

## Testar Google Drive

```text
Configure VITE_GOOGLE_CLIENT_ID sem expor client secret. Valide em uma conta Google real: criação de Prontidão Azul/Livro dos Motoristas/2026, upload do PDF, substituição do arquivo do mesmo plantão, registro do link retornado e manutenção do Livro aberto quando a autorização ou o upload falhar.
```

## Ajustar regra operacional

```text
Altere a regra operacional [descrever]. Atualize código, supabase/schema.sql quando necessário, README.md, PRD.md, ROADMAP.md, claude.mb, agentes.mb, AGENTS.md e docs/. Não remova comportamento existente sem confirmação. Valide tipos, build e fluxo local.
```

## Auditoria antes de publicar

```text
Audite o CD Digital para plantão piloto. Verifique autenticação, RLS, migração do localStorage, prontidão 24x48, escala 22h/23h, Telegrafista, rondantes, Livro, pendências, PDF, OAuth Drive, PWA mobile e recuperação de falhas. Liste bloqueadores antes de alterar e implemente correções pequenas com validação.
```
