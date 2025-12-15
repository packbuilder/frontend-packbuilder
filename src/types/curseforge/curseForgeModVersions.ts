import z from "zod";
import { ModLoader } from "../enums";

export const curseForgeModVersionSchema = z.object({
    gameVersion: z.string(),
    fileId: z.number(),
    fileName: z.string(),
    modLoader: z.enum(ModLoader).transform(Number)
});

export type CurseForgeModVersion = z.infer<typeof curseForgeModVersionSchema>