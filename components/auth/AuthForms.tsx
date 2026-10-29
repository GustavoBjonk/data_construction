"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormMessage, INITIAL_FORM_STATE, SubmitButton } from "@/components/forms/Form";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
  updateProfileAction,
} from "@/lib/auth/actions";
import { PASSWORD_MIN } from "@/lib/auth/schemas";

const PASSWORD_HINT = `Mínimo de ${PASSWORD_MIN} caracteres, com letras e números.`;

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signInAction, INITIAL_FORM_STATE);
  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field name="email" label="E-mail" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <Field name="password" label="Senha" type="password" autoComplete="current-password" required error={state.fieldErrors?.password} />
      <div className="flex justify-end">
        <Link href="/recuperar-senha" className="inline-flex min-h-[44px] items-center text-sm text-muted hover:text-fg">
          Esqueci minha senha
        </Link>
      </div>
      <SubmitButton pendingLabel="Entrando...">Entrar</SubmitButton>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, INITIAL_FORM_STATE);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} noValidate className="space-y-5">
      <FormMessage state={state} />
      <Field name="displayName" label="Nome público" autoComplete="name" required maxLength={60} defaultValue={state.values?.displayName} error={state.fieldErrors?.displayName} hint="Aparece no seu perfil e nas suas participações." />
      <Field name="email" label="E-mail" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} hint="Não é exibido publicamente." />
      <Field name="password" label="Senha" type="password" autoComplete="new-password" required error={state.fieldErrors?.password} hint={PASSWORD_HINT} />
      <Field name="confirmPassword" label="Confirme a senha" type="password" autoComplete="new-password" required error={state.fieldErrors?.confirmPassword} />
      <SubmitButton pendingLabel="Criando conta...">Criar conta</SubmitButton>
    </form>
  );
}

export function PasswordResetRequestForm() {
  const [state, action] = useActionState(requestPasswordResetAction, INITIAL_FORM_STATE);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} noValidate className="space-y-5">
      <FormMessage state={state} />
      <Field name="email" label="E-mail da conta" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <SubmitButton pendingLabel="Enviando...">Enviar link</SubmitButton>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, INITIAL_FORM_STATE);
  return (
    <form action={action} noValidate className="space-y-5">
      <FormMessage state={state} />
      <Field name="password" label="Nova senha" type="password" autoComplete="new-password" required error={state.fieldErrors?.password} hint={PASSWORD_HINT} />
      <Field name="confirmPassword" label="Confirme a nova senha" type="password" autoComplete="new-password" required error={state.fieldErrors?.confirmPassword} />
      <SubmitButton pendingLabel="Salvando...">Salvar nova senha</SubmitButton>
    </form>
  );
}

interface ProfileValues {
  displayName: string;
  username: string;
  bio: string;
  interests: string;
}

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const [state, action] = useActionState(updateProfileAction, INITIAL_FORM_STATE);
  const values = state.values ?? initial;
  return (
    <form action={action} noValidate className="space-y-5">
      <FormMessage state={state} />
      <Field name="displayName" label="Nome público" required maxLength={60} defaultValue={values.displayName} error={state.fieldErrors?.displayName} />
      <Field name="username" label="Nome de usuário" maxLength={30} defaultValue={values.username} error={state.fieldErrors?.username} hint="De 3 a 30 letras minúsculas, números ou _." />
      <Field name="bio" label="Bio curta" multiline maxLength={280} defaultValue={values.bio} error={state.fieldErrors?.bio} />
      <Field name="interests" label="Áreas de interesse" maxLength={400} defaultValue={values.interests} error={state.fieldErrors?.interests} hint="Separe por vírgulas. Ex.: SQL, Python, Engenharia de Dados" />
      <div className="sm:max-w-xs">
        <SubmitButton pendingLabel="Salvando...">Salvar perfil</SubmitButton>
      </div>
    </form>
  );
}
