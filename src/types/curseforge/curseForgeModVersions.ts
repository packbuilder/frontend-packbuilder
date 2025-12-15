import z from "zod";

export const curseForgeModVersionSchema = z.object({
    gameVersion: z.string(),
    fileId: z.number(),
    fileName: z.string(),
    modLoader: z.number()
});

export type CurseForgeModVersion = z.infer<typeof curseForgeModVersionSchema>