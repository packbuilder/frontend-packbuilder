import z from "zod";

export const imageValueSchema = z.string()
    .nonempty("Image value is required")
    .max(50, "Image value should not be longer than 100 characters")
    .trim();