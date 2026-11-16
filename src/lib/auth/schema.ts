import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Controlla l'indirizzo email: manca qualcosa." })),
});

export type LoginInput = z.infer<typeof loginSchema>;
