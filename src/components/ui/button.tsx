import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-accent bg-accent text-white shadow-[inset_0_-1px_0_rgb(0_0_0/0.15)] hover:bg-accent-hover",
  secondary:
    "border-line-strong bg-background text-foreground shadow-[0_1px_0_rgb(20_24_33/0.04)] hover:bg-panel",
  danger: "border-err bg-err text-white hover:bg-err-hover",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-panel",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-[13px]",
  md: "px-3.5 py-[7px] text-sm",
  lg: "px-5 py-2.5 text-[15px]",
};

/** Classes of a button, also for links that look like buttons. */
export function buttonClasses({
  variant = "secondary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}

/** Square icon-only button; `label` is read by screen readers and shown as tooltip. */
export function iconButtonClasses(tone: "default" | "danger" = "default") {
  return `inline-grid place-items-center rounded-md p-1.5 text-faint transition-colors hover:bg-panel hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent [&_svg]:size-4 ${
    tone === "danger" ? "hover:bg-err-soft hover:text-err" : ""
  }`;
}
