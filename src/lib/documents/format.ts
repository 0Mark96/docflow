/** "18 KB", "1,8 MB". Sizes under 1 KB round up to 1 KB, as in the mockup. */
export function formatFileSize(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(1).replace(".", ",")} MB`;
}

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Rome",
});

/** ISO timestamp to "06/11/2026" in Italian time. */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
