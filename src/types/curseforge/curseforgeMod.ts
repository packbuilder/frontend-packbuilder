import z from "zod";
import { curseForgeModVersionSchema } from "./curseForgeModVersions";

export const curseForgeModSchema = z.object({
    referenceId: z.string(),
    name: z.string(),
    slug: z.string(),
    logoUrl: z.string(),
    websiteLink: z.string(),
    
    dependencies: z.array(z.string()),
    modVersions: z.array(curseForgeModVersionSchema).optional(),
});

export type CurseForgeMod = z.infer<typeof curseForgeModSchema>