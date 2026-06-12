import z from "zod";

export const memoSchema = z.string()
    .max(64, "Suggestion memo cannot exceed 64 characters.")
    .regex(/^[\p{L}\p{N}\s.,!?'"()\-]+$/u, {message: "Your memo contains invalid characters"});