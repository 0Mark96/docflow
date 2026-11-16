"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Modal dialog on the native <dialog> element: the browser traps focus,
 * closes on Esc and returns focus to the opener.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Id of the dialog's heading. */
  labelledBy: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Without this the browser focuses the first link or button.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className="bg-background text-foreground shadow-pop backdrop:bg-foreground/35 open:animate-rise m-auto w-[min(460px,calc(100%-32px))] rounded-2xl p-0"
    >
      {open ? <div className="grid gap-3.5 p-[22px]">{children}</div> : null}
    </dialog>
  );
}

export function DialogTitle({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2 id={id} className="text-[17px] font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export function DialogActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2">{children}</div>;
}
