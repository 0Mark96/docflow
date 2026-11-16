const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

/** Formats an amount expressed in euro cents, e.g. 1234567 -> "12.345,67 €". */
export function formatEuroCents(cents: number): string {
  return euroFormatter.format(cents / 100);
}
