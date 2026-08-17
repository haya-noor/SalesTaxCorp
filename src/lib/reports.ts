/*
This file contains shared helpers for looking up filing periods (monthly
reports) for a store. Used by both the client Reports page and the
report-file API route.
*/
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type FilingPeriod = Database["public"]["Tables"]["filing_periods"]["Row"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthName(periodMonth: number) {
  return MONTH_NAMES[periodMonth - 1] ?? "";
}

// Returns the distinct years that have at least one published period for a store, newest first.
export async function listPublishedYears(
  supabase: SupabaseClient<Database>,
  storeId: string,
) {
  const { data } = await supabase
    .from("filing_periods")
    .select("period_year")
    .eq("store_id", storeId)
    .eq("published", true)
    .order("period_year", { ascending: false });

  return Array.from(new Set((data ?? []).map((row) => row.period_year)));
}

// Returns the published periods for a store/year, ordered by month.
export async function listPublishedPeriods(
  supabase: SupabaseClient<Database>,
  storeId: string,
  year: number,
) {
  const { data } = await supabase
    .from("filing_periods")
    .select("*")
    .eq("store_id", storeId)
    .eq("period_year", year)
    .eq("published", true)
    .order("period_month");

  return data ?? [];
}

// Returns every published period for a store, oldest first. Used to drive
// the previous/next month navigation across year boundaries.
export async function listAllPublishedPeriods(
  supabase: SupabaseClient<Database>,
  storeId: string,
) {
  const { data } = await supabase
    .from("filing_periods")
    .select("*")
    .eq("store_id", storeId)
    .eq("published", true)
    .order("period_year")
    .order("period_month");

  return data ?? [];
}

export async function getPublishedPeriod(
  supabase: SupabaseClient<Database>,
  storeId: string,
  periodId: string,
) {
  const { data } = await supabase
    .from("filing_periods")
    .select("*")
    .eq("id", periodId)
    .eq("store_id", storeId)
    .eq("published", true)
    .maybeSingle();

  return data;
}
