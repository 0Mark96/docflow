"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogTitle } from "@/components/ui/dialog";
import { TrashIcon } from "@/components/ui/icons";
import { deleteDocuments } from "./delete-documents";

/** Confirmation before deleting one or more documents. */
export function DeleteDialog({
  documents,
  onClose,
  onDeleted,
}: {
  /** Documents to delete; an empty list keeps the dialog closed. */
  documents: { id: string; fileName: string }[];
  onClose: () => void;
  onDeleted: (deletedIds: string[], error: string | null) => void;
}) {
  const titleId = useId();
  const [busy, setBusy] = useState(false);
  const one = documents.length === 1;

  async function confirm() {
    setBusy(true);
    const ids = documents.map((d) => d.id);
    const { failed } = await deleteDocuments(ids);
    setBusy(false);
    const failedIds = new Set(failed.map((f) => f.id));
    onDeleted(
      ids.filter((id) => !failedIds.has(id)),
      failed[0]?.message ?? null,
    );
  }

  return (
    <Dialog
      open={documents.length > 0}
      onClose={() => {
        if (!busy) onClose();
      }}
      labelledBy={titleId}
    >
      <div className="bg-err-soft text-err grid size-[38px] place-items-center rounded-full">
        <TrashIcon className="size-[19px]" />
      </div>
      <DialogTitle id={titleId}>
        {one
          ? `Eliminare ${documents[0]?.fileName}?`
          : `Eliminare ${documents.length} documenti?`}
      </DialogTitle>
      <p className="text-muted">
        {one
          ? "Il file viene cancellato e sparisce da File caricati."
          : "I file vengono cancellati e spariscono da File caricati."}{" "}
        Non si può annullare.
      </p>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Annulla
        </Button>
        <Button variant="danger" onClick={confirm} disabled={busy}>
          <TrashIcon />
          {busy ? "Elimino…" : one ? "Elimina" : `Elimina ${documents.length}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
