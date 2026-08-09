-- The server-side Supabase secret uses the service_role database role.
-- Explicit grants are required because these tables were created through SQL.
grant select, insert, update, delete on public.clients to service_role;
grant select, insert, update, delete on public.stores to service_role;
grant select, insert, update, delete on public.profiles to service_role;
