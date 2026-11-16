import type { DocumentKind } from "@/lib/documents/types";

const KIND: Record<DocumentKind, { short: string; className: string }> = {
  fatturapa: {
    short: "XML",
    className: "border-[#bfe3cf] bg-[#f6fbf8] text-ok",
  },
  pdf: { short: "PDF", className: "border-[#f2c9c4] bg-[#fef8f7] text-err" },
  text: {
    short: "TXT",
    className: "border-line-strong bg-background text-muted",
  },
};

export const KIND_LABEL: Record<DocumentKind, string> = {
  fatturapa: "Fattura elettronica XML",
  pdf: "PDF",
  text: "Testo",
};

/** Small sheet with the file type, the first thing the eye finds in a row. */
export function FileTypeBadge({ kind }: { kind: DocumentKind }) {
  const { short, className } = KIND[kind];
  return (
    <span
      aria-hidden="true"
      className={`grid h-[38px] w-8 shrink-0 place-items-center rounded-[4px_9px_4px_4px] border text-[9px] font-bold tracking-wide ${className}`}
    >
      {short}
    </span>
  );
}
