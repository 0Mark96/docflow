import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DetailActions } from "@/components/documents/detail-actions";
import {
  FileTypeBadge,
  KIND_LABEL,
} from "@/components/documents/file-type-badge";
import { StatusBadge } from "@/components/documents/status-badge";
import { buttonClasses } from "@/components/ui/button";
import { BackIcon, DocsIcon } from "@/components/ui/icons";
import { formatDate, formatFileSize } from "@/lib/documents/format";
import { backToListHref } from "@/lib/documents/list-params";
import { getDocument } from "@/lib/documents/service";

export const metadata: Metadata = { title: "Documento · DocFlow" };

export default function DocumentPage(props: PageProps<"/documents/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="bg-panel h-48 rounded-[14px]" aria-busy="true" />
      }
    >
      <DocumentDetail {...props} />
    </Suspense>
  );
}

async function DocumentDetail({
  params,
  searchParams,
}: PageProps<"/documents/[id]">) {
  const { id } = await params;
  const { da } = await searchParams;
  const backHref = backToListHref(typeof da === "string" ? da : undefined, id);
  const doc = await getDocument(id);

  if (!doc) {
    return (
      <div className="text-muted grid justify-items-center gap-2 px-4 py-11 text-center">
        <div className="bg-panel text-faint grid size-[46px] place-items-center rounded-[14px]">
          <DocsIcon className="size-[22px]" />
        </div>
        <b className="text-foreground font-semibold">
          Questo documento non esiste più
        </b>
        <span>Potrebbe essere stato eliminato.</span>
        <Link href="/documents" className={buttonClasses()}>
          Torna a File caricati
        </Link>
      </div>
    );
  }

  return (
    <>
      <div>
        <Link
          href={backHref}
          className="text-muted hover:text-foreground inline-flex items-center gap-1 text-[13px] [&_svg]:size-3.5"
        >
          <BackIcon />
          File caricati
        </Link>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <FileTypeBadge kind={doc.kind} />
          <h1 className="min-w-0 text-[23px] leading-tight font-semibold tracking-tight break-words">
            {doc.fileName}
          </h1>
        </div>
        <DetailActions
          document={doc}
          backHref={backHref.split("#")[0] ?? "/documents"}
        />
      </div>

      <section className="border-line bg-background shadow-card rounded-[14px] border p-5">
        <h2 className="text-[15px] font-semibold">File</h2>
        <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted">Tipo</dt>
          <dd>{KIND_LABEL[doc.kind]}</dd>
          <dt className="text-muted">Dimensione</dt>
          <dd className="tabular-nums">{formatFileSize(doc.sizeBytes)}</dd>
          <dt className="text-muted">Caricato il</dt>
          <dd className="tabular-nums">{formatDate(doc.createdAt)}</dd>
          <dt className="text-muted">Stato</dt>
          <dd>
            <StatusBadge status={doc.status} />
            {doc.status === "failed" && doc.errorMessage ? (
              <span className="text-err mt-0.5 block text-[13px]">
                {doc.errorMessage}
              </span>
            ) : null}
          </dd>
        </dl>
      </section>

      <section className="border-line-strong text-muted rounded-[14px] border border-dashed p-5 text-sm">
        <h2 className="text-foreground text-[15px] font-semibold">
          Dati letti dal documento
        </h2>
        <p className="mt-1">
          Fornitore, importo e scadenza compariranno qui quando DocFlow avrà
          letto il documento.
        </p>
      </section>
    </>
  );
}
