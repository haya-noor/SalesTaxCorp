-- A company may only appear once, ignoring capitalization and surrounding or
-- repeated whitespace. This is the authoritative safeguard against duplicate
-- submissions and concurrent admin requests.
create unique index clients_company_name_normalized_key
  on public.clients (
    lower(regexp_replace(btrim(company_name), '[[:space:]]+', ' ', 'g'))
  );
