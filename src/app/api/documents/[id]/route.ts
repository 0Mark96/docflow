/** TEMPORARY MOCK of the documents API (plan m2-02). Keep m2-02's version on rebase. */
import { getDocument, mockDeleteDocument } from "@/lib/documents/service";
import { apiError } from "../mock-errors";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/documents/[id]">,
) {
  const document = await getDocument((await params).id);
  if (!document) return apiError(404, "not_found", "Documento non trovato.");
  return Response.json({ document });
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/documents/[id]">,
) {
  const deleted = await mockDeleteDocument((await params).id);
  if (!deleted) return apiError(404, "not_found", "Documento non trovato.");
  return new Response(null, { status: 204 });
}
