import { z } from "zod";
import { idSchema } from "./schemas";

const formBooleanSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const uploadReportSchema = z.object({
  clientId: idSchema,
  periodYear: z.coerce.number().int().min(2000).max(2100),
  periodMonth: z.coerce.number().int().min(1).max(12),
  published: formBooleanSchema.optional(),
});

export const setPeriodPublishedSchema = z.object({
  periodId: idSchema,
  clientId: idSchema,
  published: formBooleanSchema,
});

export const deleteReportSchema = z.object({
  periodId: idSchema,
  clientId: idSchema,
});
