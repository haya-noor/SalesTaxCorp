import { z } from "zod";
import {
  meetsPasswordRequirements,
  PASSWORD_REQUIREMENTS,
} from "@/lib/password-policy";

const passwordSchema = z
  .string()
  .min(8, PASSWORD_REQUIREMENTS)
  .max(72, "Password must be 72 characters or fewer.")
  .refine(meetsPasswordRequirements, PASSWORD_REQUIREMENTS);

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    companyName: z.string().trim().min(2).max(120),
    email: z.email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password.").max(72),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "Choose a password different from your current password.",
    path: ["newPassword"],
  });
