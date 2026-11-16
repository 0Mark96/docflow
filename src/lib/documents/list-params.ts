import type { DocumentCounts, ListDocumentsQuery } from "./types";

/**
 * Tabs of "File caricati" and their value in the URL (`?tipo=`).
 * Filters live in the URL so that reload and Back keep them.
 */
export const DOCUMENT_TABS = [
  { value: "", label: "Tutti", count: "all" },
  { value: "xml", label: "Fatture XML", count: "fatturapa" },
  { value: "pdf", label: "PDF", count: "pdf" },
  { value: "testo", label: "Testo", count: "text" },
  { value: "errori", label: "Con errori", count: "failed" },
] as const satisfies readonly {
  value: string;
  label: string;
  count: keyof DocumentCounts;
}[];

export type DocumentTab = (typeof DOCUMENT_TABS)[number]["value"];

export type ListParams = { tab: DocumentTab; page: number };

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Reads `?tipo=&pagina=`; unknown values fall back to the defaults. */
export function parseListParams(searchParams: SearchParams): ListParams {
  const tipo = first(searchParams.tipo) ?? "";
  const tab = DOCUMENT_TABS.find((t) => t.value === tipo)?.value ?? "";
  const page = Number.parseInt(first(searchParams.pagina) ?? "", 10);
  return { tab, page: Number.isInteger(page) && page > 0 ? page : 1 };
}

/** Query string for the list, without defaults: "" or "?tipo=pdf&pagina=2". */
export function listSearch({ tab, page }: ListParams): string {
  const params = new URLSearchParams();
  if (tab) params.set("tipo", tab);
  if (page > 1) params.set("pagina", String(page));
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Filters for `listDocuments`, from the tab. */
export function tabFilter(
  tab: DocumentTab,
): Pick<ListDocumentsQuery, "kind" | "status"> {
  switch (tab) {
    case "xml":
      return { kind: "fatturapa" };
    case "pdf":
      return { kind: "pdf" };
    case "testo":
      return { kind: "text" };
    case "errori":
      return { status: "failed" };
    default:
      return {};
  }
}

/**
 * The list URL saved in the detail page link (`?da=`), so its back link
 * returns to the same tab and page. Only our own params are kept.
 */
export function backToListHref(da: string | undefined, id: string): string {
  const params = parseListParams(
    Object.fromEntries(new URLSearchParams(da ?? "")),
  );
  return `/documents${listSearch(params)}#doc-${id}`;
}
