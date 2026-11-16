import { describe, expect, it, vi } from "vitest";
import { DocumentError, errorResponse, toErrorResponse } from "./errors";
import { apiErrorSchema } from "./types";

describe("errorResponse", () => {
  it("follows the contract shape and status", async () => {
    const response = errorResponse("file_too_large");
    expect(response.status).toBe(413);
    const body = apiErrorSchema.parse(await response.json());
    expect(body.error).toEqual({
      code: "file_too_large",
      message: "Il file supera il limite di 4 MB.",
    });
  });

  it("carries the existing document id for duplicates", async () => {
    const id = "3f1c2a52-8a3e-4d5b-9b2e-1c2d3e4f5a6b";
    const response = errorResponse("duplicate_file", {
      existingDocumentId: id,
    });
    expect(response.status).toBe(409);
    expect((await response.json()).error.existingDocumentId).toBe(id);
  });
});

describe("toErrorResponse", () => {
  it("maps a DocumentError to its code", () => {
    expect(toErrorResponse(new DocumentError("not_found"), "get").status).toBe(
      404,
    );
  });

  it("hides unexpected errors and does not log their message", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = toErrorResponse(
      new Error("secret content of fattura.pdf"),
      "upload",
    );
    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe("server_error");
    expect(JSON.stringify(log.mock.calls)).not.toContain("fattura.pdf");
    log.mockRestore();
  });
});
