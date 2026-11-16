import { describe, expect, it } from "vitest";
import {
  backToListHref,
  listSearch,
  parseListParams,
  tabFilter,
} from "./list-params";

describe("parseListParams", () => {
  it("reads tab and page", () => {
    expect(parseListParams({ tipo: "pdf", pagina: "3" })).toEqual({
      tab: "pdf",
      page: 3,
    });
  });
  it("falls back to defaults on unknown values", () => {
    expect(parseListParams({ tipo: "zip", pagina: "-1" })).toEqual({
      tab: "",
      page: 1,
    });
    expect(parseListParams({ pagina: ["2", "5"] })).toEqual({
      tab: "",
      page: 2,
    });
  });
});

describe("listSearch", () => {
  it("omits defaults", () => {
    expect(listSearch({ tab: "", page: 1 })).toBe("");
    expect(listSearch({ tab: "errori", page: 2 })).toBe(
      "?tipo=errori&pagina=2",
    );
  });
});

describe("tabFilter", () => {
  it("maps tabs to API filters", () => {
    expect(tabFilter("xml")).toEqual({ kind: "fatturapa" });
    expect(tabFilter("errori")).toEqual({ status: "failed" });
    expect(tabFilter("")).toEqual({});
  });
});

describe("backToListHref", () => {
  it("returns to the same tab and page, at the row", () => {
    expect(backToListHref("tipo=pdf&pagina=2", "abc")).toBe(
      "/documents?tipo=pdf&pagina=2#doc-abc",
    );
  });
  it("drops anything that is not a list param", () => {
    expect(backToListHref("x=https://evil.example", "abc")).toBe(
      "/documents#doc-abc",
    );
    expect(backToListHref(undefined, "abc")).toBe("/documents#doc-abc");
  });
});
