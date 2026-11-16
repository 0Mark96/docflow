"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocsIcon, TableIcon } from "@/components/ui/icons";

const itemClasses =
  "relative flex items-center gap-2.5 rounded-md px-2.5 py-[7px] font-medium [&_svg]:size-[17px] [&_svg]:shrink-0";

/**
 * Sidebar menu. `pathname` is null while the URL is not known yet (static
 * shell): every entry is then shown as not current.
 */
export function NavLinks({ pathname }: { pathname: string | null }) {
  const current = (href: string) =>
    pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
  return (
    <div className="flex flex-col gap-px">
      <Link
        href="/documents"
        aria-current={current("/documents") ? "page" : undefined}
        className={`${itemClasses} ${
          current("/documents")
            ? "bg-background text-foreground [&_svg]:text-accent shadow-[0_1px_2px_rgb(20_24_33/0.08),0_0_0_1px_var(--color-line)]"
            : "text-muted hover:text-foreground hover:bg-[#eef0f5]"
        }`}
      >
        <DocsIcon />
        <span>File caricati</span>
      </Link>
      {/* Not built yet (M3): visible, so the user knows it is coming. */}
      <span
        aria-disabled="true"
        className={`${itemClasses} text-faint cursor-default`}
      >
        <TableIcon />
        <span>Tabella dati</span>
        <span className="ml-auto text-xs font-normal">presto</span>
      </span>
    </div>
  );
}

export function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}
