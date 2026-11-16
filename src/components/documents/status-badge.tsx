import type { DocumentStatus } from "@/lib/documents/types";

const STATUS: Record<DocumentStatus, { label: string; className: string }> = {
  uploaded: { label: "Caricato", className: "text-muted" },
  processing: { label: "In elaborazione", className: "text-accent" },
  ready: { label: "Pronto", className: "text-ok" },
  failed: { label: "Non elaborato", className: "text-err" },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, className } = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap ${className}`}
    >
      <i
        aria-hidden="true"
        className={`size-[7px] rounded-full bg-current ${
          status === "processing" ? "animate-pulse-dot" : ""
        }`}
      />
      {label}
    </span>
  );
}
