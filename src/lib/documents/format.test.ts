import { describe, expect, it } from "vitest";
import { formatDate, formatFileSize } from "./format";

describe("formatFileSize", () => {
  it("shows kilobytes, at least 1", () => {
    expect(formatFileSize(10)).toBe("1 KB");
    expect(formatFileSize(18 * 1024)).toBe("18 KB");
  });
  it("shows megabytes with a decimal comma", () => {
    expect(formatFileSize(1.84 * 1024 * 1024)).toBe("1,8 MB");
  });
});

describe("formatDate", () => {
  it("formats in Italian time", () => {
    expect(formatDate("2026-11-05T23:30:00Z")).toBe("06/11/2026");
  });
});
