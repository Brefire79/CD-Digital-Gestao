create extension if not exists "pgcrypto";
create schema if not exists private;

create type public.user_role as enum ('admin', 'cabo_dia', 'motorista', 'militar');
create type public.prontidao_nome as enum ('Amarela', 'Azul', 'Verde');
create type public.checklist_status as enum ('OK', 'Com alteração');
create type public.pendencia_status as enum ('Aberta', 'Em andamento', 'Resolvida', 'Arquivada');
create type public.pendencia_origem as enum ('passagem_servico', 'livro_motoristas');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  nome_guerra text not null,
  graduacao text not null,
  role public.user_role not null default 'militar',
  created_at timestamptz not null default now()
);

create table public.prontidoes (
  id uuid primary key default gen_random_uuid(),
  nome public.prontidao_nome not null unique,
  created_at timestamptz not null default now()
);

create table public.viaturas (
  id uuid primary key default gen_random_uuid(),
  prefixo text not null unique,
  tipo text not null,
  estacao_atual text not null default 'EB Centro',
  status_operacional text not null default 'Rodando',
  transferida_para text,
  observacao_historico text,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint viatura_status_operacional check (status_operacional in ('Rodando', 'Reserva', 'Manutenção', 'Transferida', 'Histórico'))
);

create table public.setores_quartel (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ordem integer not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.escalas (
  id uuid primary key default gen_random_uuid(),
  data_servico_inicio timestamptz not null,
  data_servico_fim timestamptz not null,
  prontidao_id uuid not null references public.prontidoes(id),
  comandante text not null,
  cabo_dia text not null,
  telegrafista text not null,
  chefe_motoristas text not null,
  observacoes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint plantao_24h check (data_servico_fim > data_servico_inicio)
);

create table public.escala_funcoes (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid not null references public.escalas(id) on delete cascade,
  militar_nome text not null,
  graduacao text not null,
  funcao text not null,
  entra_escala_horaria boolean not null default false,
  created_at timestamptz not null default now(),
  constraint apenas_sd_cb_auto check (
    entra_escala_horaria is false
    or lower(graduacao) in ('sd', 'soldado', 'cb', 'cabo')
  )
);

create table public.escala_horaria (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid not null references public.escalas(id) on delete cascade,
  horario_inicio time not null,
  horario_fim time not null,
  militar_nome text not null,
  graduacao text not null,
  funcao text not null,
  observacao text,
  created_at timestamptz not null default now(),
  constraint escala_horaria_sd_cb check (lower(graduacao) in ('sd', 'soldado', 'cb', 'cabo'))
);

create table public.passagens_servico (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid not null references public.escalas(id) on delete cascade,
  prontidao_id uuid not null references public.prontidoes(id),
  cabo_dia_sai text not null,
  cabo_dia_entra text not null,
  observacoes_gerais text,
  assinatura_saida boolean not null default false,
  assinatura_entrada boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.checklist_passagem (
  id uuid primary key default gen_random_uuid(),
  passagem_id uuid not null references public.passagens_servico(id) on delete cascade,
  setor_id uuid not null references public.setores_quartel(id),
  status public.checklist_status not null default 'OK',
  observacao text,
  foto_url text,
  created_at timestamptz not null default now()
);

create table public.livro_motoristas (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid not null references public.escalas(id) on delete cascade,
  prontidao_id uuid not null references public.prontidoes(id),
  data_servico_inicio timestamptz not null,
  data_servico_fim timestamptz not null,
  responsavel_graduacao text not null,
  responsavel_nome_guerra text not null,
  assinatura_confirmada boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.relatos_viaturas (
  id uuid primary key default gen_random_uuid(),
  livro_motoristas_id uuid not null references public.livro_motoristas(id) on delete cascade,
  viatura_id uuid not null references public.viaturas(id),
  situacao text not null,
  tem_novidade boolean not null default false,
  relato text,
  relato_anterior text,
  created_at timestamptz not null default now(),
  constraint relato_obrigatorio_quando_novidade check (tem_novidade is false or nullif(trim(relato), '') is not null)
);

create table public.pendencias (
  id uuid primary key default gen_random_uuid(),
  origem public.pendencia_origem not null,
  origem_id uuid not null,
  tipo text not null,
  setor_id uuid references public.setores_quartel(id),
  viatura_id uuid references public.viaturas(id),
  descricao text not null,
  foto_url text,
  prontidao_id uuid not null references public.prontidoes(id),
  responsavel text,
  status public.pendencia_status not null default 'Aberta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.historico_pendencias (
  id uuid primary key default gen_random_uuid(),
  pendencia_id uuid not null references public.pendencias(id) on delete cascade,
  descricao text not null,
  status_anterior public.pendencia_status,
  status_novo public.pendencia_status,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.pendencias(status);
create index on public.pendencias(origem, origem_id);
create unique index pendencias_origem_unica on public.pendencias(origem, origem_id);
create index on public.escala_horaria(escala_id, horario_inicio);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function private.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pendencias_touch_updated_at
before update on public.pendencias
for each row execute function public.touch_updated_at();

create or replace function private.criar_pendencia_checklist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dados_passagem record;
begin
  if new.status = 'Com alteração' then
    select ps.prontidao_id, ps.cabo_dia_sai
      into dados_passagem
    from public.passagens_servico ps
    where ps.id = new.passagem_id;

    insert into public.pendencias (
      origem, origem_id, tipo, setor_id, descricao, foto_url, prontidao_id, responsavel
    )
    values (
      'passagem_servico',
      new.id,
      'Setor do Quartel',
      new.setor_id,
      coalesce(nullif(trim(new.observacao), ''), 'Alteração registrada no checklist da passagem.'),
      new.foto_url,
      dados_passagem.prontidao_id,
      dados_passagem.cabo_dia_sai
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger checklist_cria_pendencia
after insert or update of status, observacao, foto_url on public.checklist_passagem
for each row execute function private.criar_pendencia_checklist();

create or replace function private.criar_pendencia_viatura()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dados_livro record;
begin
  if new.tem_novidade then
    select lm.prontidao_id, lm.responsavel_graduacao, lm.responsavel_nome_guerra
      into dados_livro
    from public.livro_motoristas lm
    where lm.id = new.livro_motoristas_id;

    insert into public.pendencias (
      origem, origem_id, tipo, viatura_id, descricao, prontidao_id, responsavel
    )
    values (
      'livro_motoristas',
      new.id,
      'Viatura',
      new.viatura_id,
      coalesce(nullif(trim(new.relato), ''), 'Novidade registrada no livro dos motoristas.'),
      dados_livro.prontidao_id,
      concat_ws(' ', dados_livro.responsavel_graduacao, dados_livro.responsavel_nome_guerra)
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger relato_viatura_cria_pendencia
after insert or update of tem_novidade, relato on public.relatos_viaturas
for each row execute function private.criar_pendencia_viatura();

create or replace function private.registrar_historico_pendencia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.historico_pendencias (pendencia_id, descricao, status_novo, created_by)
    values (new.id, 'Pendência criada automaticamente.', new.status, auth.uid());
  elsif old.status is distinct from new.status then
    insert into public.historico_pendencias (pendencia_id, descricao, status_anterior, status_novo, created_by)
    values (new.id, 'Status da pendência atualizado.', old.status, new.status, auth.uid());
  end if;

  return new;
end;
$$;

create trigger pendencias_historico
after insert or update of status on public.pendencias
for each row execute function private.registrar_historico_pendencia();

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.current_role() to authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

alter table public.profiles enable row level security;
alter table public.prontidoes enable row level security;
alter table public.viaturas enable row level security;
alter table public.setores_quartel enable row level security;
alter table public.escalas enable row level security;
alter table public.escala_funcoes enable row level security;
alter table public.escala_horaria enable row level security;
alter table public.passagens_servico enable row level security;
alter table public.checklist_passagem enable row level security;
alter table public.livro_motoristas enable row level security;
alter table public.relatos_viaturas enable row level security;
alter table public.pendencias enable row level security;
alter table public.historico_pendencias enable row level security;

create policy "usuarios autenticados consultam perfis" on public.profiles for select to authenticated using (true);
create policy "admin gerencia perfis" on public.profiles for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "usuarios autenticados consultam base operacional" on public.prontidoes for select to authenticated using (true);
create policy "admin gerencia prontidoes" on public.prontidoes for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "usuarios autenticados consultam viaturas" on public.viaturas for select to authenticated using (true);
create policy "admin gerencia viaturas" on public.viaturas for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "usuarios autenticados consultam setores" on public.setores_quartel for select to authenticated using (true);
create policy "admin gerencia setores" on public.setores_quartel for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "usuarios autenticados consultam escalas" on public.escalas for select to authenticated using (true);
create policy "admin e cabo criam escalas" on public.escalas for insert to authenticated with check (private.current_role() in ('admin', 'cabo_dia'));
create policy "admin e cabo atualizam escalas" on public.escalas for update to authenticated using (private.current_role() in ('admin', 'cabo_dia')) with check (private.current_role() in ('admin', 'cabo_dia'));

create policy "usuarios autenticados consultam funcoes" on public.escala_funcoes for select to authenticated using (true);
create policy "admin e cabo gerenciam funcoes" on public.escala_funcoes for all to authenticated using (private.current_role() in ('admin', 'cabo_dia')) with check (private.current_role() in ('admin', 'cabo_dia'));

create policy "usuarios autenticados consultam escala horaria" on public.escala_horaria for select to authenticated using (true);
create policy "admin e cabo gerenciam escala horaria" on public.escala_horaria for all to authenticated using (private.current_role() in ('admin', 'cabo_dia')) with check (private.current_role() in ('admin', 'cabo_dia'));

create policy "usuarios autenticados consultam passagens" on public.passagens_servico for select to authenticated using (true);
create policy "admin e cabo gerenciam passagens" on public.passagens_servico for all to authenticated using (private.current_role() in ('admin', 'cabo_dia')) with check (private.current_role() in ('admin', 'cabo_dia'));

create policy "usuarios autenticados consultam checklist" on public.checklist_passagem for select to authenticated using (true);
create policy "admin e cabo gerenciam checklist" on public.checklist_passagem for all to authenticated using (private.current_role() in ('admin', 'cabo_dia')) with check (private.current_role() in ('admin', 'cabo_dia'));

create policy "usuarios autenticados consultam livro" on public.livro_motoristas for select to authenticated using (true);
create policy "admin motorista e cabo gerenciam livro" on public.livro_motoristas for all to authenticated using (private.current_role() in ('admin', 'cabo_dia', 'motorista')) with check (private.current_role() in ('admin', 'cabo_dia', 'motorista'));

create policy "usuarios autenticados consultam relatos" on public.relatos_viaturas for select to authenticated using (true);
create policy "admin motorista e cabo gerenciam relatos" on public.relatos_viaturas for all to authenticated using (private.current_role() in ('admin', 'cabo_dia', 'motorista')) with check (private.current_role() in ('admin', 'cabo_dia', 'motorista'));

create policy "usuarios autenticados consultam pendencias" on public.pendencias for select to authenticated using (true);
create policy "admin e cabo gerenciam pendencias" on public.pendencias for all to authenticated using (private.current_role() in ('admin', 'cabo_dia')) with check (private.current_role() in ('admin', 'cabo_dia'));

create policy "usuarios autenticados consultam historico" on public.historico_pendencias for select to authenticated using (true);
create policy "admin e cabo registram historico" on public.historico_pendencias for insert to authenticated with check (private.current_role() in ('admin', 'cabo_dia'));

insert into public.prontidoes (nome) values ('Amarela'), ('Azul'), ('Verde')
on conflict (nome) do nothing;

insert into public.setores_quartel (nome, ordem) values
  ('Academia / Musculação', 1),
  ('Máquina de encher cilindro / compressor', 2),
  ('Máquina de lavar roupa', 3),
  ('Secadora', 4),
  ('Gás de cozinha', 5),
  ('Cilindro compressor', 6),
  ('Churrasqueira', 7),
  ('Piscina', 8),
  ('Refeitório', 9),
  ('Telegrafia', 10)
on conflict (nome) do nothing;

insert into storage.buckets (id, name, public)
values ('cd-digital-anexos', 'cd-digital-anexos', false)
on conflict (id) do nothing;

create policy "usuarios autenticados enviam anexos"
on storage.objects for insert to authenticated
with check (bucket_id = 'cd-digital-anexos');

create policy "usuarios autenticados leem anexos"
on storage.objects for select to authenticated
using (bucket_id = 'cd-digital-anexos');
