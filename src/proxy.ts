import { NextResponse, type NextRequest } from "next/server";

import {
  HOME_AFTER_LOGIN,
  LOGIN_PATH,
  isApiPath,
  isPublicPath,
} from "@/lib/auth/routes";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Runs before every page and API request:
 * - refreshes the login session;
 * - a logged-out visit to a private page goes to the login page;
 * - a logged-in visit to the login page goes to the documents.
 * API routes are never redirected: they answer 401 themselves (getCurrentUser()).
 * This is a first gate for navigation; data access is still checked by RLS.
 */
export async function proxy(request: NextRequest) {
  const { response, isLoggedIn } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (isApiPath(pathname)) return response;

  if (!isLoggedIn && !isPublicPath(pathname)) {
    return redirectKeepingCookies(request, response, LOGIN_PATH);
  }

  if (isLoggedIn && pathname === LOGIN_PATH) {
    return redirectKeepingCookies(request, response, HOME_AFTER_LOGIN);
  }

  return response;
}

function redirectKeepingCookies(
  request: NextRequest,
  response: NextResponse,
  path: string,
) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
