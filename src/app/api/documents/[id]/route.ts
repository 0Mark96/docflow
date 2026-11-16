import { getCurrentUser } from "@/lib/auth/current-user";
import { errorResponse, toErrorResponse } from "@/lib/documents/errors";
import {
  deleteDocumentWith,
  getDocumentWith,
} from "@/lib/documents/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/documents/[id]">,
) {
  if (!(await getCurrentUser())) return errorResponse("unauthenticated");
  const { id } = await ctx.params;
  try {
    const supabase = await createSupabaseServerClient();
    return Response.json({ document: await getDocumentWith(supabase, id) });
  } catch (error) {
    return toErrorResponse(error, "get");
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/documents/[id]">,
) {
  if (!(await getCurrentUser())) return errorResponse("unauthenticated");
  const { id } = await ctx.params;
  try {
    const supabase = await createSupabaseServerClient();
    await deleteDocumentWith(supabase, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error, "delete");
  }
}
