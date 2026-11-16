"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { DownloadIcon, TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import type { Document } from "@/lib/documents/types";
import { DeleteDialog } from "./delete-dialog";

/** Download and delete on the detail page; after delete, back to the list. */
export function DetailActions({
  document,
  backHref,
}: {
  document: Document;
  backHref: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/documents/${document.id}/download`}
        className={buttonClasses()}
      >
        <DownloadIcon />
        Scarica
      </a>
      <Button onClick={() => setConfirming(true)}>
        <TrashIcon />
        Elimina
      </Button>
      <DeleteDialog
        documents={confirming ? [document] : []}
        onClose={() => setConfirming(false)}
        onDeleted={(deletedIds, error) => {
          setConfirming(false);
          if (error) {
            toast(error);
            return;
          }
          if (deletedIds.length) {
            router.push(backHref);
            toast(`${document.fileName} eliminato.`);
          }
        }}
      />
    </div>
  );
}
