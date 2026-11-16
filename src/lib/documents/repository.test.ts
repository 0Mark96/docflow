import { readFileSync } from "node:fs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { DocumentError } from "./errors";
import { deleteDocumentWith, uploadDocumentWith } from "./repository";

const USER = {
  userId: "11111111-1111-4111-8111-111111111111",
  companyId: "aaaaaaaa-0000-4000-8000-000000000001",
};
const pdfBytes = readFileSync(
  new URL(
    "../../../fixtures/documents/preventivo_gialli_trasporti_2026-087.pdf",
    import.meta.url,
  ),
);
const pdfFile = (name = "preventivo.pdf") =>
  new File([pdfBytes], name, { type: "application/pdf" });

type Row = Record<string, unknown>;

/** Just enough of the Supabase client for the upload and delete paths. */
function fakeSupabase(
  options: { rows?: Row[]; insertError?: { code: string } } = {},
) {
  const rows = [...(options.rows ?? [])];
  const objects = new Set<string>();
  const calls: string[] = [];

  const query = (table: string) => {
    const filters: [string, unknown][] = [];
    let action: "select" | "delete" = "select";
    let inserted: Row | null = null;
    const match = () =>
      rows.filter((r) => filters.every(([k, v]) => r[k] === v));
    const builder = {
      select: () => builder,
      eq: (k: string, v: unknown) => (filters.push([k, v]), builder),
      maybeSingle: async () => ({ data: match()[0] ?? null, error: null }),
      insert: (row: Row) => {
        calls.push(`insert ${table}`);
        inserted = {
          status: "uploaded",
          error_message: null,
          created_at: "2026-11-16T10:00:00Z",
          ...row,
        };
        return builder;
      },
      single: async () => {
        if (options.insertError)
          return { data: null, error: options.insertError };
        rows.push(inserted!);
        return { data: inserted, error: null };
      },
      delete: () => ((action = "delete"), builder),
      then: (resolve: (v: unknown) => void) => {
        if (action === "delete") {
          calls.push(`delete ${table}`);
          for (const r of match()) rows.splice(rows.indexOf(r), 1);
        }
        resolve({ error: null });
      },
    };
    return builder;
  };

  const client = {
    from: query,
    storage: {
      from: () => ({
        upload: async (path: string) => (
          calls.push(`upload ${path}`),
          objects.add(path),
          { error: null }
        ),
        remove: async (paths: string[]) => (
          paths.forEach((p) => (calls.push(`remove ${p}`), objects.delete(p))),
          { data: [], error: null }
        ),
      }),
    },
  };
  return { client: client as unknown as SupabaseClient, rows, objects, calls };
}

describe("uploadDocumentWith", () => {
  it("stores the file under the company folder and returns the document", async () => {
    const fake = fakeSupabase();
    const document = await uploadDocumentWith(fake.client, USER, pdfFile());
    expect(document).toMatchObject({
      fileName: "preventivo.pdf",
      mimeType: "application/pdf",
      kind: "pdf",
      status: "uploaded",
      sizeBytes: pdfBytes.byteLength,
    });
    expect([...fake.objects]).toEqual([`${USER.companyId}/${document.id}.pdf`]);
    expect(fake.rows[0]).toMatchObject({
      company_id: USER.companyId,
      created_by: USER.userId,
    });
  });

  it("rejects the same content under another name, pointing to the existing document", async () => {
    const fake = fakeSupabase();
    const first = await uploadDocumentWith(fake.client, USER, pdfFile());
    const error = await uploadDocumentWith(
      fake.client,
      USER,
      pdfFile("copia.pdf"),
    ).catch((e) => e);
    expect(error).toBeInstanceOf(DocumentError);
    expect(error.code).toBe("duplicate_file");
    expect(error.details.existingDocumentId).toBe(first.id);
    expect(fake.objects.size).toBe(1);
  });

  it("rejects empty, too large and unsupported files before touching Storage", async () => {
    const fake = fakeSupabase();
    const codes = await Promise.all(
      [
        new File([], "vuoto.pdf"),
        new File([new Uint8Array(4 * 1024 * 1024 + 1)], "grande.pdf"),
        new File(["ciao"], "finto.pdf"),
      ].map((f) =>
        uploadDocumentWith(fake.client, USER, f).catch(
          (e: DocumentError) => e.code,
        ),
      ),
    );
    expect(codes).toEqual(["file_empty", "file_too_large", "unsupported_type"]);
    expect(fake.calls).toEqual([]);
  });

  it("removes the stored file when the row cannot be created", async () => {
    const fake = fakeSupabase({ insertError: { code: "42501" } });
    await expect(
      uploadDocumentWith(fake.client, USER, pdfFile()),
    ).rejects.toBeTruthy();
    expect(fake.objects.size).toBe(0);
    expect(fake.calls.at(-1)).toMatch(/^remove /);
  });
});

describe("deleteDocumentWith", () => {
  it("removes the file before the row", async () => {
    const fake = fakeSupabase();
    const document = await uploadDocumentWith(fake.client, USER, pdfFile());
    fake.calls.length = 0;
    await deleteDocumentWith(fake.client, document.id);
    expect(fake.calls).toEqual([
      `remove ${USER.companyId}/${document.id}.pdf`,
      "delete documents",
    ]);
    expect(fake.rows).toHaveLength(0);
    expect(fake.objects.size).toBe(0);
  });

  it("answers not_found for a malformed or unknown id", async () => {
    const fake = fakeSupabase();
    for (const id of ["not-a-uuid", "3f1c2a52-8a3e-4d5b-9b2e-1c2d3e4f5a6b"]) {
      const error = await deleteDocumentWith(fake.client, id).catch((e) => e);
      expect(error.code).toBe("not_found");
    }
  });
});
