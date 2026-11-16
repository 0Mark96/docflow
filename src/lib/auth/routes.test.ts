import { describe, expect, it } from "vitest";

import {
  HOME_AFTER_LOGIN,
  isApiPath,
  isPublicPath,
  safeNextPath,
} from "./routes";

describe("isPublicPath", () => {
  it("allows the login page and the auth callback", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
  });

  it("treats every other page as private", () => {
    expect(isPublicPath("/documents")).toBe(false);
    expect(isPublicPath("/documents/table")).toBe(false);
    expect(isPublicPath("/chat")).toBe(false);
    expect(isPublicPath("/authx")).toBe(false);
  });
});

describe("isApiPath", () => {
  it("matches API routes only", () => {
    expect(isApiPath("/api")).toBe(true);
    expect(isApiPath("/api/documents")).toBe(true);
    expect(isApiPath("/apis")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("keeps a same-site path", () => {
    expect(safeNextPath("/documents?type=pdf")).toBe("/documents?type=pdf");
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
  ])("falls back to the default page for %s", (next) => {
    expect(safeNextPath(next)).toBe(HOME_AFTER_LOGIN);
  });
});
