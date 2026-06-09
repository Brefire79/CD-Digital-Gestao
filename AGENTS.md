# AGENTS - CD Digital

## Escopo

Estas instrucoes valem para todo o repositorio.

## Projeto

CD Digital - Gestao de Prontidao Operacional, um PWA mobile first para uso durante plantao de 24 horas no Corpo de Bombeiros.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Supabase Auth, PostgreSQL e Storage
- PWA

## Regras de trabalho

- Preserve a linguagem operacional: Prontidao, Cabo de Dia, Escala, Viatura, Pendencia, Passagem de Servico, Livro dos Motoristas e Setor do Quartel.
- Nao use termos genericos como Task, Project ou Employee.
- Priorize funcionalidade, clareza e poucos cliques.
- Use cards grandes, botoes faceis de tocar e status claros.
- Mantenha componentes em `src/components`, telas em `src/pages`, tipos em `src/types`, regras compartilhadas em `src/contexts` e schema em `supabase/schema.sql`.
- Atualize `PRD.md`, `README.md`, `ROADMAP.md`, `claude.mb` e `agentes.mb` quando uma regra operacional mudar.

## Regras operacionais criticas

- Prontidoes: Amarela, Azul e Verde em regime 24x48.
- Dashboard deve exibir data e hora do plantao em fonte grande e calendario 24x48 ocultavel.
- Escala do Dia e o ponto principal para montar cabecalho e guarnicoes por viatura.
- Campos do cabecalho: Oficial de Area, Comandante da Prontidao, Adjunto de Dia, Cabo de Dia, Telegrafista e Chefe dos Motoristas.
- Funcoes por viatura: CMT, MOT, AUX, AUX e Estagiario.
- Escala Horaria automatica considera apenas Sd/Cb vinculados as VTRs UR, ABS/AB e Canil.
- Sgt e Oficiais nao entram automaticamente na escala horaria.
- Rondantes devem considerar somente Sgt automaticamente.
- Se a escala noturna iniciar as 23h00, 22h00 as 23h00 fica com Telegrafista como posto fixo.
- O horario fixo de 06h00 as 07h30 e sempre do Telegrafista.
- Distribuicao de viaturas no documento deve ser definida pelo Cabo de Dia, sem nomes aleatorios.
- Checklist com `Com alteracao` cria pendencia.
- Livro dos Motoristas com `Com novidades` cria pendencia.
- Pendencias devem manter historico.

## Validacao

- Preferir validar com `tsc -b` e `vite build`.
- Nesta maquina, se `node_modules` no OneDrive falhar, usar a copia temporaria `C:\tmp\cd-digital-run` para validar o app local.
