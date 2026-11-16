import { describe, expect, it } from "vitest";
import { formatEuroCents } from "./format-currency";

describe("formatEuroCents", () => {
  it("formats cents as euro with Italian separators", () => {
    expect(formatEuroCents(1234567)).toBe("12.345,67\u00a0€");
  });
});
