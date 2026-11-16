import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DocumentsTable } from "@/components/documents/documents-table";
import { DropZone } from "@/components/documents/drop-zone";
import { EmptyUploadButton } from "@/components/documents/empty-upload-button";
import { buttonClasses } from "@/components/ui/button";
import { DocsIcon } from "@/components/ui/icons";
import {
  DOCUMENT_TABS,
  listSearch,
  parseListParams,
  tabFilter,
  type ListParams,
} from "@/lib/documents/list-params";
import { listDocuments } from "@/lib/documents/service";
import { DEFAULT_PAGE_SIZE } from "@/lib/documents/types";

export const metadata: Metadata = { title: "File caricati · DocFlow" };

export default function DocumentsPage({
  searchParams,
}: PageProps<"/documents">) {
  return (
    <>
      <div>
        <h1 className="text-[23px] leading-tight font-semibold tracking-tight text-balance">
          File caricati
        </h1>
        <p className="text-muted mt-1">
          I file della tua azienda e il loro stato. Fornitori, importi e
          scadenze arriveranno in Tabella dati.
        </p>
      </div>
      <DropZone />
      <section
        aria-label="Elenco documenti"
        className="border-line bg-background shadow-card min-w-0 rounded-[14px] border"
      >
        <Suspense fallback={<ListSkeleton />}>
          <DocumentsList searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function DocumentsList({
  searchParams,
}: {
  searchParams: PageProps<"/documents">["searchParams"];
}) {
  const params = parseListParams(await searchParams);
  const list = await listDocuments({
    page: params.page,
    pageSize: DEFAULT_PAGE_SIZE,
    ...tabFilter(params.tab),
  });
  const pages = Math.max(1, Math.ceil(list.total / list.pageSize));

  return (
    <>
      <div className="border-line flex flex-wrap items-center gap-2.5 border-b px-3.5 py-3">
        <nav
          aria-label="Filtra per tipo"
          className="bg-panel flex flex-wrap gap-0.5 rounded-lg p-[3px]"
        >
          {DOCUMENT_TABS.filter(
            // "Con errori" appears only when there is something to show.
            (tab) =>
              tab.value !== "errori" ||
              list.counts.failed > 0 ||
              params.tab === "errori",
          ).map((tab) => {
            const current = tab.value === params.tab;
            return (
              <Link
                key={tab.value}
                href={`/documents${listSearch({ tab: tab.value, page: 1 })}`}
                aria-current={current ? "page" : undefined}
                scroll={false}
                className={`inline-flex items-center gap-1.5 rounded-md px-[11px] py-1 text-[13px] font-medium ${
                  current
                    ? "bg-background text-foreground shadow-[0_1px_2px_rgb(20_24_33/0.12)]"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className="text-faint text-[11.5px] tabular-nums">
                  {list.counts[tab.count]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {list.documents.length > 0 ? (
        <DocumentsTable
          documents={list.documents}
          listQuery={listSearch(params).slice(1)}
        />
      ) : (
        <EmptyState
          params={params}
          companyIsEmpty={list.counts.all === 0}
          pages={pages}
        />
      )}

      {pages > 1 ? (
        <Pagination params={params} pages={pages} total={list.total} />
      ) : null}
    </>
  );
}

function EmptyState({
  params,
  companyIsEmpty,
  pages,
}: {
  params: ListParams;
  companyIsEmpty: boolean;
  pages: number;
}) {
  const beyondLastPage = params.page > pages;
  return (
    <div className="text-muted grid justify-items-center gap-2 px-4 py-11 text-center">
      <div className="bg-panel text-faint grid size-[46px] place-items-center rounded-[14px]">
        <DocsIcon className="size-[22px]" />
      </div>
      {companyIsEmpty ? (
        <>
          <b className="text-foreground font-semibold">
            Non hai ancora caricato documenti
          </b>
          <span>
            Carica la prima fattura o il primo contratto per iniziare.
          </span>
          <EmptyUploadButton />
        </>
      ) : beyondLastPage ? (
        <>
          <b className="text-foreground font-semibold">Questa pagina è vuota</b>
          <Link
            href={`/documents${listSearch({ tab: params.tab, page: pages })}`}
            className={buttonClasses()}
          >
            Vai all&apos;ultima pagina
          </Link>
        </>
      ) : (
        <>
          <b className="text-foreground font-semibold">
            Nessun documento in questa vista
          </b>
          <span>Prova un altro filtro.</span>
          <Link href="/documents" className={buttonClasses()}>
            Mostra tutti
          </Link>
        </>
      )}
    </div>
  );
}

function Pagination({
  params,
  pages,
  total,
}: {
  params: ListParams;
  pages: number;
  total: number;
}) {
  const href = (page: number) =>
    `/documents${listSearch({ tab: params.tab, page })}`;
  const prev = params.page > 1 ? Math.min(params.page - 1, pages) : null;
  const next = params.page < pages ? params.page + 1 : null;
  return (
    <nav
      aria-label="Pagine"
      className="border-line text-muted flex flex-wrap items-center justify-between gap-3 border-t px-3.5 py-3 text-[13px]"
    >
      <span>
        Pagina {Math.min(params.page, pages)} di {pages}, {total} documenti
      </span>
      <div className="flex gap-2">
        {prev ? (
          <Link href={href(prev)} className={buttonClasses({ size: "sm" })}>
            Precedente
          </Link>
        ) : null}
        {next ? (
          <Link href={href(next)} className={buttonClasses({ size: "sm" })}>
            Successiva
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

function ListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Caricamento elenco"
      className="grid gap-3 p-4"
    >
      <div className="bg-panel h-7 w-80 max-w-full rounded-lg" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="bg-panel h-[38px] w-8 rounded" />
          <div className="grid flex-1 gap-1.5">
            <div className="bg-panel h-3.5 w-1/3 rounded" />
            <div className="bg-panel h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
