import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters long")
  .max(20, "Name cannot be longer than 20 characters")
  .regex(/^\p{L}+$/u, "All names may only contain letters with no spaces!");