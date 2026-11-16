"use client";

import { useState } from "react";
import { UploadIcon } from "@/components/ui/icons";
import { MAX_UPLOAD_BYTES } from "@/lib/documents/types";
import { useUpload } from "./upload-provider";

const MAX_MB = MAX_UPLOAD_BYTES / 1024 / 1024;

export function DropZone() {
  const { openPicker, upload, uploading } = useUpload();
  const [over, setOver] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Carica documenti"
      aria-busy={uploading > 0}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        upload(event.dataTransfer.files);
      }}
      className={`group focus-visible:outline-accent flex cursor-pointer flex-wrap items-center gap-4 rounded-[14px] border-[1.5px] px-5 py-[18px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-nowrap ${
        over
          ? "border-accent bg-accent-soft border-solid"
          : "border-line-strong hover:border-accent hover:bg-accent-soft border-dashed"
      }`}
    >
      <div
        className={`bg-accent-soft text-accent grid size-[42px] shrink-0 place-items-center rounded-xl transition-transform ${
          over ? "-translate-y-[3px]" : ""
        }`}
      >
        <UploadIcon className="size-[21px]" />
      </div>
      <div className="min-w-0">
        {uploading > 0 ? (
          <>
            <b className="font-semibold">
              {uploading === 1
                ? "Sto caricando un file…"
                : `Sto caricando ${uploading} file…`}
            </b>
            <div className="bg-background mt-1.5 h-[3px] w-[120px] overflow-hidden rounded-full">
              <i className="animate-slide bg-accent block h-full w-2/5 rounded-full" />
            </div>
          </>
        ) : (
          <>
            <b className="font-semibold">Trascina qui i file da caricare</b>
            <small className="text-muted block text-[13px]">
              PDF, TXT o fattura elettronica XML, fino a {MAX_MB} MB ciascuno.
              Puoi caricarne più di uno insieme.
            </small>
          </>
        )}
      </div>
      <span
        aria-hidden="true"
        className="border-accent bg-accent group-hover:bg-accent-hover inline-flex items-center rounded-md border px-3.5 py-[7px] text-sm font-medium whitespace-nowrap text-white sm:ml-auto"
      >
        Scegli file
      </span>
    </div>
  );
}
