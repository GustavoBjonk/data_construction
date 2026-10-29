import { z } from "zod";

/** bcrypt (usado pelo Supabase Auth) ignora bytes além de 72. */
const PASSWORD_MAX = 72;
export const PASSWORD_MIN = 8;

const email = z.string().trim().toLowerCase().pipe(z.email({ message: "Informe um e-mail válido." })).pipe(z.string().max(254));

const password = z
  .string()
  .min(PASSWORD_MIN, { message: `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.` })
  .max(PASSWORD_MAX, { message: `A senha pode ter no máximo ${PASSWORD_MAX} caracteres.` })
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), {
    message: "Use letras e números na senha.",
  });

const displayName = z
  .string()
  .trim()
  .min(2, { message: "Informe um nome com pelo menos 2 caracteres." })
  .max(60, { message: "O nome pode ter no máximo 60 caracteres." });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { message: "Informe a senha." }).max(PASSWORD_MAX),
});

export const signUpSchema = z
  .object({
    displayName,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const passwordResetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, { message })
    .transform((value) => (value === "" ? null : value));

export const profileSchema = z.object({
  displayName,
  username: z
    .string()
    .trim()
    .toLowerCase()
    .transform((value) => (value === "" ? null : value))
    .pipe(
      z
        .string()
        .regex(/^[a-z0-9_]{3,30}$/, { message: "Use de 3 a 30 letras minúsculas, números ou _." })
        .nullable(),
    ),
  bio: optionalText(280, "A bio pode ter no máximo 280 caracteres."),
  interests: z
    .string()
    .transform((value) =>
      [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))],
    )
    .pipe(
      z
        .array(z.string().max(40, { message: "Cada interesse pode ter até 40 caracteres." }))
        .max(10, { message: "Informe no máximo 10 interesses." }),
    ),
});


/** Primeira mensagem por campo, no formato usado pelos formulários. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}
