import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    companyName: z.string().trim().min(2).max(120),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters.").max(72),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
