create table public.client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  file_name text not null,
  file_path text not null,
  file_hash text not null,
  file_size bigint not null,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (client_id, file_hash)
);

create index client_documents_client_id_idx on public.client_documents(client_id);
create index client_documents_file_hash_idx on public.client_documents(file_hash);

grant select, insert, update, delete on public.client_documents to authenticated;
grant select, insert, update, delete on public.client_documents to service_role;
