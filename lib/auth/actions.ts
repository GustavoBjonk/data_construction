"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/forms/Form";
import { isAuthEnabled } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";
import { safeRedirectPath } from "./redirect";
import {
  fieldErrors,
  newPasswordSchema,
  passwordResetRequestSchema,
  profileSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";
import { requireUser } from "./session";

const NOT_CONFIGURED: FormState = {
  status: "error",
  message: "A autenticação ainda não está configurada neste ambiente.",
};

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// -----------------------------------------------------------------------------
// Login, cadastro e recuperação
// -----------------------------------------------------------------------------

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isAuthEnabled()) return NOT_CONFIGURED;
  const parsed = signInSchema.safeParse({ email: text(formData, "email"), password: text(formData, "password") });
  const values = { email: text(formData, "email") };
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const message =
      error.code === "email_not_confirmed"
        ? "Confirme seu e-mail pelo link que enviamos antes de entrar."
        : error.status === 429
          ? "Muitas tentativas. Aguarde alguns minutos e tente novamente."
          : "E-mail ou senha incorretos.";
    return { status: "error", message, values };
  }

  redirect(safeRedirectPath(text(formData, "next")));
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isAuthEnabled()) return NOT_CONFIGURED;
  const values = { displayName: text(formData, "displayName"), email: text(formData, "email") };
  const parsed = signUpSchema.safeParse({
    ...values,
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Só o nome. O papel é sempre 'user' e definido no banco.
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: absoluteUrl("/auth/confirm?next=/conta"),
    },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { status: "error", fieldErrors: { password: "Senha fraca ou já exposta em vazamentos. Escolha outra." }, values };
    }
    if (error.status === 429) {
      return { status: "error", message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.", values };
    }
    // Erros como "e-mail já cadastrado" não são revelados (evita enumeração de contas).
    console.error("[auth] signUp:", error.code ?? error.message);
  }

  return {
    status: "success",
    message: "Se este e-mail puder ser cadastrado, você receberá um link de confirmação. Verifique também o spam.",
  };
}

export async function requestPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isAuthEnabled()) return NOT_CONFIGURED;
  const values = { email: text(formData, "email") };
  const parsed = passwordResetRequestSchema.safeParse(values);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: absoluteUrl("/auth/confirm?next=/redefinir-senha"),
  });
  if (error) console.error("[auth] resetPasswordForEmail:", error.code ?? error.message);

  // Mesma resposta exista ou não a conta.
  return {
    status: "success",
    message: "Se houver uma conta com este e-mail, enviamos um link para redefinir a senha.",
  };
}

export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isAuthEnabled()) return NOT_CONFIGURED;
  await requireUser("/redefinir-senha");
  const parsed = newPasswordSchema.safeParse({
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const message =
      error.code === "same_password"
        ? "A nova senha precisa ser diferente da atual."
        : error.code === "weak_password"
          ? "Senha fraca ou já exposta em vazamentos. Escolha outra."
          : "Não foi possível atualizar a senha. Solicite um novo link e tente novamente.";
    return { status: "error", message };
  }

  redirect("/conta?senha=atualizada");
}

export async function signOutAction(): Promise<void> {
  if (isAuthEnabled()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

// -----------------------------------------------------------------------------
// Perfil
// -----------------------------------------------------------------------------

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/conta");
  const values = {
    displayName: text(formData, "displayName"),
    username: text(formData, "username"),
    bio: text(formData, "bio"),
    interests: text(formData, "interests"),
  };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  // RLS garante que só o próprio perfil é alterado; o filtro por id é redundante de propósito.
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      username: parsed.data.username,
      bio: parsed.data.bio,
      interests: parsed.data.interests,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { status: "error", fieldErrors: { username: "Este nome de usuário já está em uso." }, values };
    console.error("[profile] update:", error.code);
    return { status: "error", message: "Não foi possível salvar o perfil. Tente novamente.", values };
  }

  revalidatePath("/conta");
  return { status: "success", message: "Perfil atualizado.", values };
}

