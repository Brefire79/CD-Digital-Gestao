# CD Digital - Gestão de Prontidão Operacional

MVP PWA para digitalizar passagem de serviço, escala do dia, escala horária, livro dos motoristas, pendências e relatórios operacionais de prontidão.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Supabase Auth, PostgreSQL e Storage
- PWA com `vite-plugin-pwa`

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
```

Sem essas variáveis, o app abre em modo demonstração local para validar o fluxo visual e funcional.

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
- Relato sem novidade preserva relato anterior como referência.
- Escala horária automática permite apenas `Sd` e `Cb`.
- `Sgt` e Oficiais ficam fora da escala horária automática.
- Escala horária noturna permite início às `22h00` ou `23h00`, definido pelo Cabo de Dia.
- Se iniciar às `23h00`, o trecho `22h00 às 23h00` fica como posto fixo do Telegrafista.
- O último horário fixo `06h00 às 07h30` é sempre do Telegrafista.
- A escala horária automática considera somente integrantes elegíveis vinculados às VTRs `UR`, `ABS/AB` e `Canil`.
- A tela `Escala do Dia` monta cabeçalho, funções rápidas e guarnições por viatura com `CMT`, `MOT`, `AUX`, `AUX` e `Estagiário`.
- O Dashboard exibe data e hora do plantão em fonte grande e mantém o calendário 24x48 ocultável.
- Cada plantão é vinculado a uma prontidão.
- Registros no banco mantêm data e hora.

## PRD

O PRD versionado do projeto está em `PRD.md`.

## Futuro

A tela de Administração já reserva a área para análises inteligentes futuras com OpenAI API ou Claude API, sem integração nesta versão.
