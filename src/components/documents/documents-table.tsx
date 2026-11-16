"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { iconButtonClasses } from "@/components/ui/button";
import { DownloadIcon, EyeIcon, TrashIcon, XIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatFileSize } from "@/lib/documents/format";
import type { Document } from "@/lib/documents/types";
import { DeleteDialog } from "./delete-dialog";
import { FileTypeBadge } from "./file-type-badge";
import { StatusBadge } from "./status-badge";

/**
 * List of "File caricati". `listQuery` is the current tab and page
 * (e.g. "tipo=pdf&pagina=2"): the detail link carries it, so its back link
 * returns here.
 */
export function DocumentsTable({
  documents,
  listQuery,
}: {
  documents: Document[];
  listQuery: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<Document[]>([]);

  // Coming back from a detail page (#doc-<id>): scroll to the row and flash it.
  useEffect(() => {
    const row = window.location.hash
      ? document.getElementById(window.location.hash.slice(1))
      : null;
    if (!row) return;
    row.scrollIntoView({ block: "center" });
    row.animate(
      [
        { backgroundColor: "var(--color-accent-soft)" },
        { backgroundColor: "transparent" },
      ],
      { duration: 1600, easing: "ease-out" },
    );
  }, []);

  // Keep only selections that are still on this page.
  const visible = new Set(documents.map((d) => d.id));
  const selectedHere = [...selected].filter((id) => visible.has(id));
  const allSelected =
    documents.length > 0 && selectedHere.length === documents.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const detailHref = (id: string) =>
    `/documents/${id}${listQuery ? `?da=${encodeURIComponent(listQuery)}` : ""}`;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-panel text-muted [&>th]:border-line text-left text-[12.5px] whitespace-nowrap [&>th]:border-b [&>th]:px-3.5 [&>th]:py-[9px] [&>th]:font-medium">
              <th className="w-[38px] !pr-0">
                <input
                  type="checkbox"
                  aria-label="Seleziona tutti"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? new Set() : new Set(visible))
                  }
                  className="accent-accent size-4 cursor-pointer"
                />
              </th>
              <th>Documento</th>
              <th className="max-sm:hidden">Caricato il</th>
              <th>Stato</th>
              <th>
                <span className="sr-only">Azioni</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const isSelected = selected.has(doc.id);
              return (
                <tr
                  key={doc.id}
                  id={`doc-${doc.id}`}
                  className={`group [&>td]:border-line scroll-mt-24 [&>td]:border-b [&>td]:px-3.5 [&>td]:py-[11px] [&>td]:align-middle last:[&>td]:border-b-0 ${
                    isSelected ? "bg-accent-soft" : "hover:bg-[#fafbfd]"
                  }`}
                >
                  <td className="!pr-0">
                    <input
                      type="checkbox"
                      aria-label={`Seleziona ${doc.fileName}`}
                      checked={isSelected}
                      onChange={() => toggle(doc.id)}
                      className="accent-accent size-4 cursor-pointer"
                    />
                  </td>
                  <td>
                    <div className="flex min-w-0 items-center gap-3">
                      <FileTypeBadge kind={doc.kind} />
                      <div className="min-w-0">
                        <Link
                          href={detailHref(doc.id)}
                          className="text-foreground hover:text-accent font-medium break-words"
                        >
                          {doc.fileName}
                        </Link>
                        <small className="text-faint block text-[12.5px]">
                          {formatFileSize(doc.sizeBytes)}
                          <span className="sm:hidden">
                            , {formatDate(doc.createdAt)}
                          </span>
                        </small>
                        {doc.status === "failed" && doc.errorMessage ? (
                          <span className="text-err mt-0.5 block text-[12.5px]">
                            {doc.errorMessage}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="text-sm whitespace-nowrap tabular-nums max-sm:hidden">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td>
                    <div className="flex justify-end gap-0.5 opacity-100 transition-opacity md:opacity-55 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                      <Link
                        href={detailHref(doc.id)}
                        title="Apri"
                        aria-label={`Apri ${doc.fileName}`}
                        className={iconButtonClasses()}
                      >
                        <EyeIcon />
                      </Link>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        title="Scarica"
                        aria-label={`Scarica ${doc.fileName}`}
                        className={iconButtonClasses()}
                      >
                        <DownloadIcon />
                      </a>
                      <button
                        type="button"
                        title="Elimina"
                        aria-label={`Elimina ${doc.fileName}`}
                        onClick={() => setToDelete([doc])}
                        className={iconButtonClasses("danger")}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedHere.length > 0 ? (
        <div
          role="region"
          aria-label="Azioni sui selezionati"
          className="animate-rise bg-foreground shadow-pop fixed bottom-[22px] left-1/2 z-15 flex max-w-[calc(100%-32px)] -translate-x-1/2 flex-wrap items-center gap-3 rounded-xl py-2 pr-2 pl-4 text-sm text-white"
        >
          <span>
            <b>{selectedHere.length}</b>{" "}
            {selectedHere.length === 1 ? "selezionato" : "selezionati"}
          </span>
          <button
            type="button"
            onClick={() =>
              setToDelete(documents.filter((d) => selected.has(d.id)))
            }
            className="bg-err hover:bg-err-hover inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium [&_svg]:size-4"
          >
            <TrashIcon />
            Elimina
          </button>
          <button
            type="button"
            aria-label="Deseleziona"
            onClick={() => setSelected(new Set())}
            className="grid place-items-center rounded-md p-1.5 hover:bg-white/15 [&_svg]:size-4"
          >
            <XIcon />
          </button>
        </div>
      ) : null}

      <DeleteDialog
        documents={toDelete}
        onClose={() => setToDelete([])}
        onDeleted={(deletedIds, error) => {
          const names = toDelete.filter((d) => deletedIds.includes(d.id));
          setToDelete([]);
          setSelected((prev) => {
            const next = new Set(prev);
            deletedIds.forEach((id) => next.delete(id));
            return next;
          });
          router.refresh();
          if (error) toast(`Non tutto è stato eliminato: ${error}`);
          else if (names.length === 1)
            toast(`${names[0]?.fileName} eliminato.`);
          else toast(`${names.length} documenti eliminati.`);
        }}
      />
    </>
  );
}
