# Backlog - CD Digital

## P0 - Antes do plantão piloto

- [ ] Configurar Google Drive API e cliente OAuth Web.
- [ ] Cadastrar origens autorizadas de desenvolvimento e produção.
- [ ] Testar criação das três pastas e substituição do PDF em conta real.
- [ ] Validar visualmente todas as telas em celular.
- [ ] Testar fechamento, reabertura do app e início do próximo plantão.
- [ ] Revisar RLS do Supabase e permissões por perfil.
- [ ] Confirmar persistência remota das pendências e histórico do Livro.

## P1 - Operação completa

- [x] Sincronizar VTRs do plantão com o Livro.
- [x] Permitir VTR administrativa, estacionada e de pernoite.
- [x] Exigir relato para C/N.
- [x] Criar pendência de revisão do Chefe dos Motoristas.
- [x] Gerar PDF próprio do Livro.
- [x] Bloquear encerramento até backup confirmado no Drive.
- [x] Registrar link e caminho do backup.
- [ ] Persistir fechamento e metadados do Drive no Supabase.
- [ ] Exibir histórico de Livros encerrados em tela de consulta.

## P2 - Qualidade

- [ ] Testes unitários de `escalaGenerator.ts`.
- [ ] Testes de `prontidaoScale.ts` com datas de referência.
- [ ] Testes do ciclo aberto/encerrado e migração Zustand.
- [ ] Testes do gerador PDF com conteúdo extenso.
- [ ] Dividir o bundle principal com carregamento sob demanda.
- [ ] Melhorar PWA offline sem mascarar backup pendente.

## P3 - Evolução

- [ ] Backup dos demais documentos no Google Drive.
- [ ] Exportação Google Sheets.
- [ ] Notificações push.
- [ ] QR Codes.
- [ ] Multiquartel.
- [ ] IA para resumo de pendências e apoio operacional.
