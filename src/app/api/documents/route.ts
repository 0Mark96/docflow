import { getCurrentUser } from "@/lib/auth/current-user";
import { errorResponse, toErrorResponse } from "@/lib/documents/errors";
import {
  listDocumentsWith,
  uploadDocumentWith,
} from "@/lib/documents/repository";
import {
  listDocumentsQuerySchema,
  MAX_UPLOAD_BYTES,
} from "@/lib/documents/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Room for the multipart boundaries and headers around the file. */
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("unauthenticated");

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = listDocumentsQuerySchema.safeParse(params);
  if (!query.success) return errorResponse("invalid_request");

  try {
    const supabase = await createSupabaseServerClient();
    return Response.json(await listDocumentsWith(supabase, query.data));
  } catch (error) {
    return toErrorResponse(error, "list");
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("unauthenticated");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD_BYTES) {
    return errorResponse("file_too_large");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("invalid_request");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return errorResponse("file_missing");

  try {
    const supabase = await createSupabaseServerClient();
    const document = await uploadDocumentWith(supabase, user, file);
    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "upload");
  }
}
