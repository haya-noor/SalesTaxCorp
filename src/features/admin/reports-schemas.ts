import { z } from "zod";
import { idSchema } from "./schemas";

export const uploadReportSchema = z.object({
  storeId: idSchema,
  periodYear: z.coerce.number().int().min(2000).max(2100),
  periodMonth: z.coerce.number().int().min(1).max(12),
  dueDate: z.string().optional(),
  preparedDate: z.string().optional(),
  alertTitle: z.string().trim().max(200).optional(),
  alertBody: z.string().trim().max(2000).optional(),
  footnote: z.string().trim().max(2000).optional(),
  published: z.coerce.boolean().optional(),
});

export const setPeriodPublishedSchema = z.object({
  periodId: idSchema,
  storeId: idSchema,
  published: z.coerce.boolean(),
});
