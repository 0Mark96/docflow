import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  detectDocumentKind,
  sanitizeFileName,
  sha256Hex,
  storagePath,
} from "./validation";

const fixture = (name: string) =>
  new Uint8Array(
    readFileSync(
      new URL(`../../../fixtures/documents/${name}`, import.meta.url),
    ),
  );
const text = (s: string) => new TextEncoder().encode(s);

describe("detectDocumentKind", () => {
  it("accepts a real PDF", () => {
    expect(
      detectDocumentKind(
        "preventivo.pdf",
        fixture("preventivo_gialli_trasporti_2026-087.pdf"),
      ),
    ).toBe("pdf");
  });

  it("accepts a FatturaPA XML with a namespace prefix", () => {
    expect(
      detectDocumentKind("fattura.XML", fixture("fattura_minima.xml")),
    ).toBe("fatturapa");
  });

  it("accepts a FatturaPA root without prefix", () => {
    expect(
      detectDocumentKind(
        "f.xml",
        text('<?xml version="1.0"?><FatturaElettronica versione="FPR12">'),
      ),
    ).toBe("fatturapa");
  });

  it("accepts UTF-8 text", () => {
    expect(
      detectDocumentKind("contratto.txt", text("Scadenza: 31/12/2026 — €")),
    ).toBe("text");
  });

  it("rejects content that does not match the extension", () => {
    expect(detectDocumentKind("finto.pdf", text("not a pdf"))).toBeNull();
    expect(
      detectDocumentKind("altro.xml", text("<?xml version='1.0'?><Ordine/>")),
    ).toBeNull();
    expect(
      detectDocumentKind("bin.txt", new Uint8Array([0x48, 0x00, 0x49])),
    ).toBeNull();
    expect(
      detectDocumentKind(
        "latin1.txt",
        new Uint8Array([0x63, 0x61, 0x66, 0xe8]),
      ),
    ).toBeNull();
  });

  it("rejects other extensions, signed FatturaPA and files without extension", () => {
    expect(detectDocumentKind("foto.png", text("%PDF-1.4"))).toBeNull();
    expect(
      detectDocumentKind("fattura.xml.p7m", fixture("fattura_minima.xml")),
    ).toBeNull();
    expect(detectDocumentKind("pdf", text("%PDF-1.4"))).toBeNull();
  });
});

describe("sanitizeFileName", () => {
  it("keeps the base name only", () => {
    expect(sanitizeFileName("C:\\Users\\x\\fattura.pdf")).toBe("fattura.pdf");
    expect(sanitizeFileName("../../etc/passwd.txt")).toBe("passwd.txt");
  });

  it("removes control characters and trims", () => {
    expect(sanitizeFileName("  fat\u0000tura\n.pdf ")).toBe("fattura.pdf");
  });

  it("returns null when nothing is left", () => {
    expect(sanitizeFileName("   ")).toBeNull();
    expect(sanitizeFileName("..")).toBeNull();
  });

  it("shortens long names keeping the extension", () => {
    const name = sanitizeFileName(`${"a".repeat(300)}.pdf`);
    expect(name).toHaveLength(255);
    expect(name?.endsWith(".pdf")).toBe(true);
  });
});

describe("storagePath", () => {
  it("puts the file under the company folder, without the user's file name", () => {
    expect(storagePath("company-1", "doc-1", "fatturapa")).toBe(
      "company-1/doc-1.xml",
    );
    expect(storagePath("company-1", "doc-2", "text")).toBe(
      "company-1/doc-2.txt",
    );
  });
});

describe("sha256Hex", () => {
  it("hashes the content", async () => {
    expect(await sha256Hex(text("abc"))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
