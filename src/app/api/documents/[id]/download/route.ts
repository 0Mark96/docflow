import { getCurrentUser } from "@/lib/auth/current-user";
import { errorResponse, toErrorResponse } from "@/lib/documents/errors";
import { getDownloadUrlWith } from "@/lib/documents/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/documents/[id]/download">,
) {
  if (!(await getCurrentUser())) return errorResponse("unauthenticated");
  const { id } = await ctx.params;
  try {
    const supabase = await createSupabaseServerClient();
    const url = await getDownloadUrlWith(supabase, id);
    return new Response(null, {
      status: 302,
      headers: { Location: url, "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error, "download");
  }
}
