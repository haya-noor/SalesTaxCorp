import { z } from "zod";
import { idSchema } from "./schemas";

export const uploadReportSchema = z.object({
  storeId: idSchema,
  periodYear: z.coerce.number().int().min(2000).max(2100),
  periodMonth: z.coerce.number().int().min(1).max(12),
  published: z.coerce.boolean().optional(),
});

export const setPeriodPublishedSchema = z.object({
  periodId: idSchema,
  storeId: idSchema,
  published: z.coerce.boolean(),
});
