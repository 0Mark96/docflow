"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { LOGIN_PATH } from "./routes";
import { loginSchema } from "./schema";

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email: string };

/**
 * Sends the login link. A new email gets an account and its own company on first login
 * (database trigger). The link opens /auth/confirm (see supabase/templates/magic_link.html).
 */
export async function requestLoginLink(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const rawEmail = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email: rawEmail });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Email non valida.",
      email: rawEmail,
    };
  }

  const { email } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    // Only the error code goes to the log, never the email address.
    console.error("login link failed", {
      code: error.code,
      status: error.status,
    });
    const message =
      error.status === 429
        ? "Hai chiesto troppi link in poco tempo. Riprova tra qualche minuto."
        : "Non siamo riusciti a inviare il link. Riprova tra poco.";
    return { status: "error", message, email };
  }

  return { status: "sent", email };
}

/** Ends the session and goes back to the login page. */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}
