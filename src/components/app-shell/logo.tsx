/** DocFlow mark: a white sheet on the accent square, as in the mockup. */
export function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-0.5 text-[16.5px] font-semibold tracking-tight">
      <svg
        viewBox="0 0 28 28"
        className="size-7 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="28" height="28" rx="8" className="fill-accent" />
        <path
          d="M10 6h7l3 3v12a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"
          fill="#fff"
        />
        <path
          d="M11.5 13h6M11.5 16.5h6"
          className="stroke-accent"
          strokeWidth="2"
        />
      </svg>
      DocFlow
    </div>
  );
}
