"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogTitle } from "@/components/ui/dialog";
import { WarnIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { apiErrorSchema, ACCEPT_ATTRIBUTE } from "@/lib/documents/types";
import { checkFile } from "@/lib/documents/upload-checks";

type Rejected = { fileName: string; reason: string; existingId?: string };

type UploadContextValue = {
  /** Opens the file picker. Call it from a click: browsers require it. */
  openPicker: () => void;
  upload: (files: FileList | File[]) => void;
  /** Number of files being sent right now. */
  uploading: number;
};

const UploadContext = createContext<UploadContextValue | null>(null);

export function useUpload(): UploadContextValue {
  const value = useContext(UploadContext);
  if (!value) throw new Error("useUpload must be used inside UploadProvider");
  return value;
}

async function send(file: File): Promise<Rejected | null> {
  const body = new FormData();
  body.set("file", file);
  try {
    const response = await fetch("/api/documents", { method: "POST", body });
    if (response.ok) return null;
    const parsed = apiErrorSchema.safeParse(
      await response.json().catch(() => null),
    );
    if (!parsed.success) {
      return { fileName: file.name, reason: "errore del server, riprova." };
    }
    return {
      fileName: file.name,
      reason: parsed.data.error.message,
      existingId: parsed.data.error.existingDocumentId,
    };
  } catch {
    return {
      fileName: file.name,
      reason: "connessione assente, riprova tra poco.",
    };
  }
}

/**
 * One upload flow for the whole app: the sidebar button and the drop zone
 * of "File caricati" both use it. Files are checked in the browser first,
 * then sent one per request, as the API requires.
 */
export function UploadProvider({ children }: { children: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const router = useRouter();
  const toast = useToast();
  const titleId = useId();

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const upload = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!files.length) return;
      const bad: Rejected[] = [];
      const good: File[] = [];
      for (const file of files) {
        const check = checkFile(file);
        if (check.ok) good.push(file);
        else bad.push({ fileName: file.name, reason: check.reason });
      }

      setUploading((n) => n + good.length);
      const results = await Promise.all(
        good.map(async (file) => {
          const result = await send(file);
          setUploading((n) => n - 1);
          return result;
        }),
      );
      for (const result of results) if (result) bad.push(result);
      const okCount = good.length - results.filter(Boolean).length;

      if (okCount > 0) {
        if (window.location.pathname !== "/documents")
          router.push("/documents");
        else router.refresh();
      }
      if (bad.length) {
        setUploadedCount(okCount);
        setRejected(bad);
      } else if (okCount > 0) {
        toast(
          okCount === 1
            ? `${good[0]?.name} caricato.`
            : `${okCount} file caricati.`,
        );
      }
    },
    [router, toast],
  );

  return (
    <UploadContext.Provider value={{ openPicker, upload, uploading }}>
      {children}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        hidden
        onChange={(event) => {
          if (event.target.files) upload(event.target.files);
          // Lets the user pick the same file again after an error.
          event.target.value = "";
        }}
      />
      <Dialog
        open={rejected.length > 0}
        onClose={() => setRejected([])}
        labelledBy={titleId}
      >
        <div className="bg-err-soft text-err grid size-[38px] place-items-center rounded-full">
          <WarnIcon className="size-[19px]" />
        </div>
        <DialogTitle id={titleId}>
          {rejected.length === 1
            ? "Un file non è stato caricato"
            : `${rejected.length} file non sono stati caricati`}
        </DialogTitle>
        <ul className="text-muted grid gap-1.5">
          {rejected.map((r, i) => (
            <li key={`${r.fileName}-${i}`} className="break-words">
              <span className="text-foreground font-medium">{r.fileName}</span>:{" "}
              {r.reason}
              {r.existingId ? (
                <>
                  {" "}
                  <Link
                    href={`/documents/${r.existingId}`}
                    onClick={() => setRejected([])}
                    className="text-accent font-medium hover:underline"
                  >
                    Apri quello già caricato
                  </Link>
                </>
              ) : null}
            </li>
          ))}
        </ul>
        {uploadedCount > 0 ? (
          <p className="text-muted">
            {uploadedCount === 1
              ? "L'altro file è stato caricato."
              : `Gli altri ${uploadedCount} file sono stati caricati.`}
          </p>
        ) : null}
        <DialogActions>
          <Button
            variant="primary"
            data-autofocus
            onClick={() => setRejected([])}
          >
            Ho capito
          </Button>
        </DialogActions>
      </Dialog>
    </UploadContext.Provider>
  );
}
