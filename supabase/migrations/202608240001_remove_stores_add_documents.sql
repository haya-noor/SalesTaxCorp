-- Removes the store concept entirely: filing_periods now belong directly to
-- a client, and the stores table is dropped. Also adds a human-readable
-- client_code (assigned when a client user is first approved) and a
-- client_documents table + storage bucket for client-uploaded files.

-- filing_periods: switch from store_id to client_id
drop policy if exists "clients read their published filing periods" on public.filing_periods;

alter table public.filing_periods
  add column client_id uuid references public.clients(id) on delete restrict;

update public.filing_periods as fp
set client_id = s.client_id
from public.stores as s
where s.id = fp.store_id;

alter table public.filing_periods
  alter column client_id set not null;

drop index if exists filing_periods_store_id_idx;
drop index if exists filing_periods_store_published_idx;
alter table public.filing_periods
  drop constraint if exists filing_periods_store_id_period_year_period_month_key;
alter table public.filing_periods
  drop column store_id;

alter table public.filing_periods
  add constraint filing_periods_client_id_period_year_period_month_key
  unique (client_id, period_year, period_month);

create index filing_periods_client_id_idx on public.filing_periods(client_id);
create index filing_periods_client_published_idx
  on public.filing_periods(client_id, published);

create policy "clients read their published filing periods"
  on public.filing_periods
  for select
  to authenticated
  using (
    published = true
    and client_id = (select public.current_active_client_id())
  );

-- Drop stores entirely
drop policy if exists "admins manage stores" on public.stores;
drop policy if exists "clients read their active stores" on public.stores;
drop table if exists public.stores;

-- Human-readable client identifier, e.g. "johnsmith1"
alter table public.clients add column client_code text unique;

-- Private storage for client-uploaded documents. Clients can only insert;
-- they can never read the bucket or the client_documents rows back, so an
-- upload only ever results in a confirmation message, never a visible file
-- list. Admins have full access, mirroring the client-reports bucket.
create table public.client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  original_filename text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

create index client_documents_client_id_idx on public.client_documents(client_id);

alter table public.client_documents enable row level security;

create policy "admins manage client documents"
  on public.client_documents
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "clients upload their own documents"
  on public.client_documents
  for insert
  to authenticated
  with check (
    client_id = (select public.current_active_client_id())
    and uploaded_by = (select auth.uid())
  );

grant select, insert, update, delete on public.client_documents to authenticated;
grant select, insert, update, delete on public.client_documents to service_role;

insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;
