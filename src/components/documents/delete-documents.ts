import { apiErrorSchema } from "@/lib/documents/types";

/**
 * Deletes documents one by one through the API. Returns the ids that could
 * not be deleted, with the server's message.
 */
export async function deleteDocuments(
  ids: string[],
): Promise<{ failed: { id: string; message: string }[] }> {
  const failed: { id: string; message: string }[] = [];
  for (const id of ids) {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      // 404: already gone, which is what the user wanted.
      if (response.ok || response.status === 404) continue;
      const parsed = apiErrorSchema.safeParse(
        await response.json().catch(() => null),
      );
      failed.push({
        id,
        message: parsed.success
          ? parsed.data.error.message
          : "Errore del server, riprova.",
      });
    } catch {
      failed.push({ id, message: "Connessione assente, riprova tra poco." });
    }
  }
  return { failed };
}
