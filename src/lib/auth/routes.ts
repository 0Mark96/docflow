/** Where a user lands after logging in. */
export const HOME_AFTER_LOGIN = "/documents";

/** The login page, which is also the public presentation of the product. */
export const LOGIN_PATH = "/";

/**
 * Paths that a logged-out visitor may open. Everything else is private.
 * API routes are not listed: they answer 401 themselves instead of redirecting.
 */
export function isPublicPath(pathname: string): boolean {
  return pathname === LOGIN_PATH || pathname.startsWith("/auth/");
}

export function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

/**
 * Validates a "next" redirect target taken from a URL, so a crafted link cannot send
 * the user to another website. Only same-site absolute paths are accepted.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return HOME_AFTER_LOGIN;
  }
  return next;
}
