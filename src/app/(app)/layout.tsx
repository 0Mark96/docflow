import { Suspense, type ReactNode } from "react";
import { Logo } from "@/components/app-shell/logo";
import { ActiveNavLinks, NavLinks } from "@/components/app-shell/nav-link";
import { UserMenu, UserMenuSkeleton } from "@/components/app-shell/user-menu";
import { UploadButton } from "@/components/documents/upload-button";
import { UploadProvider } from "@/components/documents/upload-provider";
import { ToastProvider } from "@/components/ui/toast";

/**
 * TEMPORARY until the login task (m2-01) is merged: then this reads
 * `requireUser()` from "@/lib/auth/current-user" (redirects to "/" when
 * logged out) and passes `signOut` from "@/lib/auth/actions".
 */
async function CurrentUser() {
  const user = {
    email: "demo@officina-esempio.it",
    companyName: "Officina Esempio S.r.l.",
  };
  return <UserMenu email={user.email} companyName={user.companyName} />;
}

/** Shell of the logged-in app: sidebar on the left, page on the right. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <UploadProvider>
        <div className="grid min-h-full md:grid-cols-[244px_minmax(0,1fr)]">
          <nav
            aria-label="Menu principale"
            className="border-line bg-side flex flex-col gap-[18px] border-b px-3 py-[18px] md:sticky md:top-0 md:h-screen md:border-r md:border-b-0"
          >
            <Logo />
            <UploadButton />
            <Suspense fallback={<NavLinks pathname={null} />}>
              <ActiveNavLinks />
            </Suspense>
            <div className="md:mt-auto">
              <Suspense fallback={<UserMenuSkeleton />}>
                <CurrentUser />
              </Suspense>
            </div>
          </nav>
          <main className="min-w-0 px-4 pt-[26px] pb-16 md:px-8">
            <div className="flex max-w-[1140px] flex-col gap-5">{children}</div>
          </main>
        </div>
      </UploadProvider>
    </ToastProvider>
  );
}
