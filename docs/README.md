# Documentacao de Implementacao - CD Digital

Esta pasta centraliza os documentos de orientacao do CD Digital - Gestao de Prontidao Operacional.

## Mapa dos documentos

- [PRD](PRD.md): avaliacao do app atual, objetivos, usuarios, modulos e criterios de aceite.
- [MVP](MVP.md): escopo minimo para validar a operacao no plantao.
- [Arquitetura](Arquitetura.md): stack, organizacao do codigo, estado, dados e integracoes.
- [Backlog](Backlog.md): proximas entregas por prioridade operacional.
- [Fluxograma](Fluxograma.md): fluxo principal do app em Mermaid.
- [Regras de Negocio](Regras-de-Negocio.md): regras criticas para implementacao e testes.
- [Prompts de Continuidade](Prompts-Codex.md): prompts recomendados para Codex e Claude Code.
- [Checklist de Testes](Checklist-Testes.md): roteiro de validacao manual e tecnica.
- [Changelog](Changelog.md): historico de mudancas relevantes.

## Regra de manutencao

Quando uma regra operacional mudar, atualizar tambem `PRD.md`, `README.md`, `ROADMAP.md`, `claude.mb`, `agentes.mb` e estes documentos.

## Estado de 17/07/2026

O fluxo do Livro dos Motoristas já inclui sincronização de VTRs, VTRs adicionais, assinatura do Chefe dos Motoristas, PDF próprio e bloqueio do encerramento até confirmação do backup em `Prontidão/Livro dos Motoristas/Ano` no Google Drive. A integração depende de `VITE_GOOGLE_CLIENT_ID` e ainda precisa de teste com uma conta Google real antes do plantão piloto.
