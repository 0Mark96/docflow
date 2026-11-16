"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type LoginState, requestLoginLink } from "@/lib/auth/actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm({ linkError }: { linkError?: boolean }) {
  const [state, formAction, pending] = useActionState(
    requestLoginLink,
    initialState,
  );
  const error =
    state.status === "error"
      ? state.message
      : state.status === "idle" && linkError
        ? "Il link non è più valido: è scaduto o è già stato usato. Chiedine uno nuovo."
        : null;

  return (
    <form
      id="accedi"
      action={formAction}
      noValidate
      className="border-line bg-background shadow-card mt-6.5 grid max-w-[520px] scroll-mt-24 gap-2 rounded-2xl border p-5"
    >
      <h2 className="mb-1 text-base font-semibold tracking-[-0.015em]">
        Accedi alla tua azienda
      </h2>
      <label htmlFor="email" className="text-[13px] font-medium">
        Email di lavoro
      </label>
      <div className="flex flex-wrap gap-2">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.status === "idle" ? "" : state.email}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={error ? "login-error" : "login-hint"}
          className="flex-[1_1_220px]"
        />
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? "Invio in corso…" : "Ricevi il link di accesso"}
        </Button>
      </div>
      {error ? (
        <p id="login-error" role="alert" className="text-err text-[12.5px]">
          {error}
        </p>
      ) : null}
      <p id="login-hint" className="text-faint text-[12.5px]">
        Niente password: ti mandiamo via email un link valido 15 minuti.
      </p>
      {state.status === "sent" ? (
        <p
          role="status"
          className="bg-ok-soft text-ok rounded-md px-3 py-2.5 text-[13.5px]"
        >
          Link inviato a <b>{state.email}</b>. Aprilo da questo dispositivo.
        </p>
      ) : null}
    </form>
  );
}
