/** TEMPORARY MOCK of the documents API (plan m2-02). Keep m2-02's version on rebase. */
import { listDocuments, mockCreateDocument } from "@/lib/documents/service";
import { checkFile } from "@/lib/documents/upload-checks";
import { listDocumentsQuerySchema } from "@/lib/documents/types";
import { apiError } from "./mock-errors";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = listDocumentsQuerySchema.safeParse(params);
  if (!query.success) {
    return apiError(400, "invalid_request", "Richiesta non valida.");
  }
  return Response.json(await listDocuments(query.data));
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return apiError(400, "file_missing", "Nessun file nella richiesta.");
  }
  const check = checkFile(file);
  if (!check.ok) {
    const code =
      file.size === 0
        ? "file_empty"
        : check.reason.startsWith("supera")
          ? "file_too_large"
          : "unsupported_type";
    const status = {
      file_empty: 400,
      file_too_large: 413,
      unsupported_type: 415,
    }[code];
    return apiError(status, code, `${file.name}: ${check.reason}.`);
  }
  // Slow enough to see the uploading state.
  await new Promise((resolve) => setTimeout(resolve, 600));
  const result = await mockCreateDocument(file, check.kind);
  if ("duplicateOf" in result) {
    return apiError(
      409,
      "duplicate_file",
      `Questo file è già caricato come «${result.duplicateOf.fileName}».`,
      result.duplicateOf.id,
    );
  }
  return Response.json({ document: result.document }, { status: 201 });
}
