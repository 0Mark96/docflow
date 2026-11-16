import { describe, expect, it } from "vitest";
import { checkFile } from "./upload-checks";
import { MAX_UPLOAD_BYTES } from "./types";

describe("checkFile", () => {
  it("accepts PDF, TXT and XML, case insensitive", () => {
    expect(checkFile({ name: "a.PDF", size: 10 })).toEqual({
      ok: true,
      kind: "pdf",
    });
    expect(checkFile({ name: "note.txt", size: 10 })).toEqual({
      ok: true,
      kind: "text",
    });
    expect(checkFile({ name: "fattura.xml", size: 10 })).toEqual({
      ok: true,
      kind: "fatturapa",
    });
  });

  it("rejects other formats, empty and large files", () => {
    expect(checkFile({ name: "foto.jpg", size: 10 }).ok).toBe(false);
    expect(checkFile({ name: "fattura.xml.p7m", size: 10 }).ok).toBe(false);
    expect(checkFile({ name: "senza_estensione", size: 10 }).ok).toBe(false);
    expect(checkFile({ name: "vuoto.pdf", size: 0 })).toEqual({
      ok: false,
      reason: "il file è vuoto",
    });
    expect(
      checkFile({ name: "grande.pdf", size: MAX_UPLOAD_BYTES + 1 }),
    ).toEqual({ ok: false, reason: "supera i 4 MB" });
  });
});
