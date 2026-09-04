-- Tracks the client's approval of the exact report file currently stored for
-- a filing period. Existing reports start as pending. Replacing a file clears
-- these fields so changed content must be approved again.
alter table public.filing_periods
  add column client_approved_at timestamptz,
  add column client_approved_by uuid references public.profiles(id) on delete set null;

comment on column public.filing_periods.client_approved_at is
  'When the client approved the currently stored report file; null means pending.';

comment on column public.filing_periods.client_approved_by is
  'Profile that approved the currently stored report file.';
