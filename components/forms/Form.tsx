"use client";

import { useFormStatus } from "react-dom";

/** Estado devolvido pelas Server Actions de formulário. */
export interface FormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Valores para repreencher o formulário após erro (nunca senhas). */
  values?: Record<string, string>;
}

export const INITIAL_FORM_STATE: FormState = { status: "idle" };

interface FieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  defaultValue?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  multiline?: boolean;
}

export function Field({ name, label, type = "text", autoComplete, defaultValue, hint, error, required, maxLength, multiline }: FieldProps) {
  const id = `field-${name}`;
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const inputClass = `w-full rounded-card border bg-surface px-4 text-base text-fg transition-colors placeholder:text-subtle focus:outline-none focus:ring-1 ${
    error ? "border-copper/70 focus:ring-copper/70" : "border-line hover:border-line-strong focus:border-accent/60 focus:ring-accent/60"
  }`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
        {!required && <span className="ml-1 font-normal text-subtle">(opcional)</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          defaultValue={defaultValue}
          maxLength={maxLength}
          rows={4}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} mt-2 py-3`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          required={required}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} mt-2 min-h-[48px]`}
        />
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-copper">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-fg px-6 text-sm font-medium text-bg transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Mensagem geral do formulário, anunciada a leitores de tela. */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return <div role="status" aria-live="polite" />;
  const isError = state.status === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={`border-l-2 py-1 pl-4 text-sm leading-relaxed ${isError ? "border-copper text-copper" : "border-accent text-fg"}`}
    >
      {state.message}
    </div>
  );
}
