/**
 * TEMPORARY MOCK of the documents API (plan m2-02). The real endpoint answers
 * 302 to a signed Storage URL; the mock sends the bytes directly.
 */
import { mockReadFile } from "@/lib/documents/service";
import { apiError } from "../../mock-errors";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/documents/[id]/download">,
) {
  const file = await mockReadFile((await params).id);
  if (!file) return apiError(404, "not_found", "Documento non trovato.");
  return new Response(new Blob([file.bytes as BlobPart]), {
    headers: {
      "Content-Type": file.document.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.document.fileName)}`,
    },
  });
}
