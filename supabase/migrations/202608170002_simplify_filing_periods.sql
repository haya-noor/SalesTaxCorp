-- The report file itself already carries due dates, prepared dates, and
-- alert text (baked in by the generator), so filing_periods only needs to
-- track which store/month/year a published file belongs to.
alter table public.filing_periods
  drop column if exists due_date,
  drop column if exists prepared_date,
  drop column if exists alert_title,
  drop column if exists alert_body,
  drop column if exists footnote;
