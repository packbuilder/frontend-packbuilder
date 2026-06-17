import z from "zod";

export const memoSchema = z.string()
    .max(300, "Suggestion memo cannot exceed 300 characters.")
    .nonempty()
    .regex(/^[\p{L}\p{N} .,!?'"()\-]+$/u, {message: "Your memo contains invalid characters"})
    .trim();