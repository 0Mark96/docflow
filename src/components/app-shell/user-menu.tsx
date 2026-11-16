/** User block at the bottom of the sidebar: who is logged in, for which company. */
export function UserMenu({
  email,
  companyName,
  signOut,
}: {
  email: string;
  companyName: string;
  /** Server Action that ends the session (from the login task). */
  signOut?: () => Promise<void>;
}) {
  const name = email.split("@")[0] ?? email;
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="text-muted flex items-center gap-2.5 px-1.5 py-1 text-[13px]">
      <div
        aria-hidden="true"
        className="bg-accent-soft text-accent grid size-[30px] shrink-0 place-items-center rounded-full text-xs font-semibold"
      >
        {initials}
      </div>
      <div className="min-w-0">
        <b className="text-foreground block truncate leading-tight font-medium">
          {name}
        </b>
        <span className="block truncate">{companyName}</span>
      </div>
      {signOut ? (
        <form action={signOut} className="ml-auto">
          <button
            type="submit"
            className="text-accent text-[13px] font-medium hover:underline"
          >
            Esci
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-1.5 py-1" aria-hidden="true">
      <div className="bg-line size-[30px] rounded-full" />
      <div className="grid gap-1.5">
        <div className="bg-line h-3 w-20 rounded" />
        <div className="bg-line h-3 w-28 rounded" />
      </div>
    </div>
  );
}
