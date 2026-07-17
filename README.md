# CD Digital - Gestão de Prontidão Operacional

MVP PWA para digitalizar passagem de serviço, escala do dia, escala horária, livro dos motoristas, pendências e relatórios operacionais de prontidão.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Zustand (store da Passagem 360, com persist)
- pdf-lib (geração de PDF)
- Supabase Auth, PostgreSQL e Storage
- PWA com `vite-plugin-pwa`

## Passagem 360

Central mobile de troca de serviço em `/passagem-servico` (tela cheia, após o login), com menu na ordem: Viaturas → Ronda Quartel → Escala de Hora → Livro dos Motoristas → Relatórios. O módulo Viaturas reúne o prefixo e os postos CMT, MOT, AUX e Estagiário, mantendo uma revisão detalhada da guarnição.

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com as credenciais do Supabase:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_CLIENT_ID=
```

Sem as variáveis do Supabase, o app abre em modo demonstração local. Sem `VITE_GOOGLE_CLIENT_ID`, o Livro permanece aberto no encerramento e informa que o backup obrigatório no Drive ainda não está configurado.

## Supabase

1. Crie um projeto no Supabase.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Crie usuários no Supabase Auth.
4. Cadastre os perfis na tabela `profiles`.

O SQL inclui tabelas, seeds de prontidões e setores, RLS, bucket privado para anexos e gatilhos para criar pendências automaticamente quando houver alteração no checklist ou novidade em viatura.

## Telas

- Login
- Dashboard
- Escala do Dia
- Escala Horária
- Passagem de Serviço / Checklist do Quartel
- Livro dos Motoristas / Relato de Viaturas
- Pendências
- Relatórios
- Administração
- Viaturas
- Setores do Quartel

## Regras implementadas

- Checklist com status `Com alteração` cria pendência.
- Relato de viatura com `Com novidades` cria pendência.
- O Livro dos Motoristas replica as VTRs cadastradas no início do plantão e aceita VTRs adicionais administrativas, estacionadas ou de pernoite; S/N e C/N permanecem editáveis até o término do plantão.
- Ao término do plantão, o Chefe dos Motoristas revisa e assina o Livro. O encerramento somente é concluído após o PDF ser salvo em `Prontidão correspondente/Livro dos Motoristas/Ano` no Google Drive.
- O cabeçalho do Livro usa Polícia Militar do Estado de São Paulo, Corpo de Bombeiros, Estação de Bombeiros Ipiranga, prontidão do dia e data por extenso.
- Relato sem novidade preserva relato anterior como referência.
- Escala horária automática permite apenas `Sd` e `Cb`.
- `Sgt` e Oficiais ficam fora da escala horária automática.
- Escala horária noturna permite início às `22h00` ou `23h00`, definido pelo Cabo de Dia.
- Se iniciar às `23h00`, o trecho `22h00 às 23h00` fica como posto fixo do Telegrafista.
- O último horário fixo `06h00 às 07h30` é sempre do Telegrafista.
- A escala horária automática considera somente integrantes elegíveis vinculados às VTRs `UR`, `ABS/AB` e `Canil`.
- O Cabo de Dia seleciona e ordena até quatro viaturas para o documento; a escolha fica salva no dispositivo.
- Viaturas retiradas de uso são arquivadas no histórico operacional em vez de excluídas pela interface.
- A tela `Escala do Dia` monta cabeçalho, funções rápidas e guarnições por viatura com `CMT`, `MOT`, `AUX` e `Estagiário`.
- Na Passagem 360, Incêndio, Resgate, Canil e OD aceitam o lançamento dos postos `CMT`, `MOT`, `AUX` e `Estagiário` junto com o prefixo.
- A aba Viaturas também permite cadastrar o `Telegrafista` para reutilização nos horários fixos da Escala de Hora e no documento do plantão; Sgt e Cb de Dia podem revisar os postos.
- VTR OD permanece apenas informativa e não entra na escala de hora nem na ronda automática.
- Rondantes cobrem `00h00 às 06h00`, somente com Sgt que não estejam vinculados à OD.
- O Dashboard exibe data e hora do plantão em fonte grande e mantém o calendário 24x48 ocultável.
- Cada plantão é vinculado a uma prontidão.
- Registros no banco mantêm data e hora.
- A Escala do Dia sincroniza cabecalho, VTRs, guarnicoes e Livro com a Passagem 360.
- A Escala Horaria e os rondantes podem ser ajustados manualmente depois da geracao.
- Relatorios geram PDFs reais de Escala do Dia, Escala Horaria, Livro, Pendencias e plantao completo.
- O encerramento arquiva uma copia completa do plantao no historico local do dispositivo.

## PRD

O PRD versionado do projeto está em `PRD.md`.

## Documentação de implementação

A pasta `docs/` centraliza os documentos de orientação para continuidade do projeto:

- `docs/PRD.md`
- `docs/MVP.md`
- `docs/Arquitetura.md`
- `docs/Backlog.md`
- `docs/Fluxograma.md`
- `docs/Regras-de-Negocio.md`
- `docs/Prompts-Codex.md`
- `docs/Checklist-Testes.md`
- `docs/Changelog.md`

## Futuro

A tela de Administração já reserva a área para análises inteligentes futuras com OpenAI API ou Claude API, sem integração nesta versão.
