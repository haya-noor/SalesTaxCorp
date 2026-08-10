/*
This file defines reusable Zod validation schemas for admin-related form data.
It validates IDs, client/company names, store data, and the data required when approving a pending client
account.
*/

import { z } from "zod";

export const idSchema = z.uuid();

export const clientSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
});

export const storeSchema = z.object({
  clientId: idSchema,
  displayName: z.string().trim().min(2).max(120),
});

export const approveUserSchema = z.object({
  profileId: idSchema,
  clientId: idSchema,
});

export const promoteAdminSchema = z.object({
  profileId: idSchema,
  confirmAdmin: z.literal("yes"),
});
