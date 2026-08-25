import z from "zod";
import { curseForgeModVersionSchema } from "./curseForgeModVersions";
import { curseForgeAuthorSchema } from "./curseforgeAuthor";

export const curseForgeModSchema = z.object({
    referenceId: z.string(),
    name: z.string(),
    slug: z.string(),
    logoUrl: z.string().nullable(),
    summary: z.string(),
    dateModified: z.string(),
    downloadCount: z.number(),
    websiteLink: z.string(),

    modVersions: z.array(curseForgeModVersionSchema).optional(),
    authors: z.array(curseForgeAuthorSchema)
});

export type CurseForgeMod = z.infer<typeof curseForgeModSchema>