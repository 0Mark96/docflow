import type { ComponentPropsWithRef } from "react";

type InputProps = ComponentPropsWithRef<"input">;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`border-line-strong bg-background text-foreground placeholder:text-faint aria-invalid:border-err min-w-0 rounded-md border px-3 py-2.5 text-[15px] ${className}`}
      {...props}
    />
  );
}
