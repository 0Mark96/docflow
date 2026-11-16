import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { LOGIN_PATH } from "./routes";

export type CurrentUser = {
  userId: string;
  email: string;
  companyId: string;
  companyName: string;
};

/**
 * The logged-in user and their company, or null when nobody is logged in.
 * Use it in Route Handlers (answer 401 on null). It reads cookies, so in a page or
 * layout call it inside a <Suspense> boundary (Cache Components).
 * Deduplicated per request with React cache().
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();

  // getClaims() verifies the session token; getSession() alone would trust the cookie.
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (authError || !userId) return null;

  // RLS lets a user read only their own profile and company.
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id, companies ( name )")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !profile || !profile.companies) return null;

  return {
    userId,
    email: auth.claims.email ?? "",
    companyId: profile.company_id,
    companyName: profile.companies.name,
  };
});

/**
 * Like getCurrentUser(), but redirects to the login page when nobody is logged in.
 * Use it in pages, layouts and Server Actions.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
}
