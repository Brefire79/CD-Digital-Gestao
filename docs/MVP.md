# MVP - CD Digital

## Objetivo

Validar uma troca de serviço completa de 24 horas em celular, desde a montagem das viaturas até o encerramento do Livro dos Motoristas.

## Incluído

- Login Firebase Auth e modo demonstrativo local.
- Menu pós-login: Viaturas, Ronda Quartel, Escala de Hora, Livro dos Motoristas e Relatórios.
- Prontidões Amarela, Azul e Verde em ciclo 24x48.
- Viaturas com CMT, MOT, AUX, Estagiário e Telegrafista independente.
- Escala horária automática e editável.
- Rondantes Sgt das 00h00 às 06h00.
- Ronda do quartel com alterações e pendências.
- Livro dos Motoristas sincronizado com as VTRs e com inclusão de VTR adicional.
- S/N, C/N e relato obrigatório para novidade.
- Revisão e assinatura eletrônica do Chefe dos Motoristas.
- PDF do Livro e backup obrigatório no Google Drive antes do encerramento.
- Relatórios PDF e histórico local do plantão.

## Dependências de ambiente

- Firebase: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID`.
- Google Drive: `VITE_GOOGLE_CLIENT_ID`, Drive API habilitada e origem OAuth autorizada.

## Não incluído

- Assinatura com certificado digital ou validade jurídica externa.
- IA operacional.
- Multiquartel.
- Notificações push.
- Google Sheets.
- Sincronização offline do upload para o Drive.

## Fluxo mínimo validável

1. Entrar no app.
2. Confirmar prontidão e data.
3. Informar viaturas, guarnições e Telegrafista.
4. Conferir ronda e pendências.
5. Gerar e ajustar a Escala de Hora.
6. Atualizar o Livro durante o plantão.
7. Preencher todos os relatos C/N.
8. Revisar e assinar como Chefe dos Motoristas.
9. Autorizar o Google Drive e confirmar o backup.
10. Verificar encerramento e início limpo do próximo plantão.

## Definição de pronto

- Build e checagem de tipos aprovados.
- Fluxo principal sem perda de dados.
- Backup confirmado em `Prontidão/Livro dos Motoristas/Ano`.
- Falhas de autenticação ou upload não encerram o Livro.
- QA mobile e regras operacionais aprovados pelo usuário.
