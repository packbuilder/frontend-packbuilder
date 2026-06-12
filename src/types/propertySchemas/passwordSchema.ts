import z from "zod"

export const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters long.")
    .max(64, "Password cannot be longer than 64 characters.")