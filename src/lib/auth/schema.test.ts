import { describe, expect, it } from "vitest";

import { loginSchema } from "./schema";

describe("loginSchema", () => {
  it("normalizes a valid email", () => {
    expect(
      loginSchema.parse({ email: "  Anna@Officina-Esempio.TEST " }),
    ).toEqual({
      email: "anna@officina-esempio.test",
    });
  });

  it.each(["", "anna", "anna@", "@esempio.it", "anna@esempio"])(
    "rejects %j",
    (email) => {
      const result = loginSchema.safeParse({ email });
      expect(result.success).toBe(false);
    },
  );
});
