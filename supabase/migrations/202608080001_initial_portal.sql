create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'client');
create type public.profile_status as enum ('pending', 'active', 'suspended');
create type public.entity_status as enum ('active', 'suspended');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(trim(company_name)) between 2 and 120),
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  display_name text not null check (char_length(trim(display_name)) between 2 and 120),
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (client_id, display_name)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  requested_company_name text check (
    requested_company_name is null
    or char_length(trim(requested_company_name)) between 2 and 120
  ),
  role public.user_role not null default 'client',
  client_id uuid references public.clients(id) on delete restrict,
  status public.profile_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint profiles_role_state_check check (
    (
      role = 'admin'
      and client_id is null
      and status = 'active'
    )
    or
    (
      role = 'client'
      and (
        (status = 'pending' and client_id is null)
        or (status = 'active' and client_id is not null)
        or status = 'suspended'
      )
    )
  )
);

create index profiles_client_id_idx on public.profiles(client_id);
create index profiles_status_idx on public.profiles(status);
create index stores_client_id_idx on public.stores(client_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    requested_company_name,
    role,
    client_id,
    status
  )
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        'Client user'
      ),
      120
    ),
    nullif(
      left(trim(new.raw_user_meta_data ->> 'requested_company_name'), 120),
      ''
    ),
    'client',
    null,
    'pending'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.current_active_client_id()
returns uuid
language sql
stable
security definer set search_path = ''
as $$
  select profile.client_id
  from public.profiles as profile
  join public.clients as client on client.id = profile.client_id
  where profile.id = (select auth.uid())
    and profile.role = 'client'
    and profile.status = 'active'
    and client.status = 'active'
  limit 1;
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.current_active_client_id() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_active_client_id() to authenticated;

alter table public.clients enable row level security;
alter table public.stores enable row level security;
alter table public.profiles enable row level security;

create policy "admins manage clients"
  on public.clients
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "clients read their active company"
  on public.clients
  for select
  to authenticated
  using (
    status = 'active'
    and id = (select public.current_active_client_id())
  );

create policy "admins manage stores"
  on public.stores
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "clients read their active stores"
  on public.stores
  for select
  to authenticated
  using (
    status = 'active'
    and client_id = (select public.current_active_client_id())
  );

create policy "admins manage profiles"
  on public.profiles
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "users read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.stores to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

grant select, insert, update, delete on public.clients to service_role;
grant select, insert, update, delete on public.stores to service_role;
grant select, insert, update, delete on public.profiles to service_role;
