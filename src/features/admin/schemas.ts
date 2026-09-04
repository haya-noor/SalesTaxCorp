/*
This file defines reusable Zod validation schemas for admin-related form data.
It validates IDs, client/company names, and the data required when approving a pending client
account.
*/

import { z } from "zod";

export const idSchema = z.uuid();

export function normalizeCompanyName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export const clientSchema = z.object({
  companyName: z
    .string()
    .transform(normalizeCompanyName)
    .pipe(z.string().min(2).max(120)),
});

export const approveUserSchema = z.object({
  profileId: idSchema,
  clientId: idSchema,
});
