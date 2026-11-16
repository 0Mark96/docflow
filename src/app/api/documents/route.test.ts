import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const { GET, POST } = await import("./route");

const USER = {
  userId: "11111111-1111-4111-8111-111111111111",
  email: "a@example.test",
  companyId: "aaaaaaaa-0000-4000-8000-000000000001",
  companyName: "Alfa",
};

describe("/api/documents", () => {
  beforeEach(() => getCurrentUser.mockReset());

  it("answers 401 to logged-out requests", async () => {
    getCurrentUser.mockResolvedValue(null);
    const list = await GET(new Request("http://test/api/documents"));
    const upload = await POST(
      new Request("http://test/api/documents", { method: "POST" }),
    );
    expect([list.status, upload.status]).toEqual([401, 401]);
    expect((await list.json()).error.code).toBe("unauthenticated");
  });

  it("rejects an invalid query string", async () => {
    getCurrentUser.mockResolvedValue(USER);
    const response = await GET(
      new Request("http://test/api/documents?page=0&kind=docx"),
    );
    expect(response.status).toBe(400);
  });

  it("asks for a file when the form has none", async () => {
    getCurrentUser.mockResolvedValue(USER);
    const form = new FormData();
    form.set("note", "x");
    const response = await POST(
      new Request("http://test/api/documents", { method: "POST", body: form }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("file_missing");
  });

  it("rejects an oversized body from its Content-Length", async () => {
    getCurrentUser.mockResolvedValue(USER);
    const response = await POST(
      new Request("http://test/api/documents", {
        method: "POST",
        headers: { "content-length": String(10 * 1024 * 1024) },
      }),
    );
    expect(response.status).toBe(413);
  });
});
