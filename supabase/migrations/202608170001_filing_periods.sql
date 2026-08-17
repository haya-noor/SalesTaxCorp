create table public.filing_periods (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  period_year int not null check (period_year between 2000 and 2100),
  period_month int not null check (period_month between 1 and 12),
  due_date date,
  prepared_date date,
  alert_title text,
  alert_body text,
  footnote text,
  file_path text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, period_year, period_month)
);

create index filing_periods_store_id_idx on public.filing_periods(store_id);
create index filing_periods_store_published_idx
  on public.filing_periods(store_id, published);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger filing_periods_set_updated_at
  before update on public.filing_periods
  for each row execute procedure public.set_updated_at();

alter table public.filing_periods enable row level security;

create policy "admins manage filing periods"
  on public.filing_periods
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "clients read their published filing periods"
  on public.filing_periods
  for select
  to authenticated
  using (
    published = true
    and store_id in (
      select store.id
      from public.stores as store
      where store.client_id = (select public.current_active_client_id())
        and store.status = 'active'
    )
  );

grant select, insert, update, delete on public.filing_periods to authenticated;
grant select, insert, update, delete on public.filing_periods to service_role;

-- Private storage bucket for the uploaded report HTML files.
-- Files are never served directly from Supabase Storage; the app always
-- proxies them through /api/reports/[periodId]/file, which checks
-- requireStoreAccess() and published = true before issuing a short-lived
-- signed URL with the service role key. No storage RLS policies are
-- needed for client reads because clients never call Storage directly.
insert into storage.buckets (id, name, public)
values ('client-reports', 'client-reports', false)
on conflict (id) do nothing;
