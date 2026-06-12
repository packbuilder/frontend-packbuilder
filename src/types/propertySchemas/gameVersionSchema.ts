import z from "zod";

export const gameVersionSchema = z.string()
    .trim()
    .min(1, "Game version is required.")
    .max(50, "Game version should not be longer than 50 characters")
    .regex(/^\d+\.\d+(\.\d+)?$/,"Invalid Minecraft version");