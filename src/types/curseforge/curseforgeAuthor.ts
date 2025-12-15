import z from "zod";

export const curseForgeAuthorSchema = z.object({
    id: z.number(),
    name: z.string(),
    url: z.string()
});

export type CurseForgeAuthor = z.infer<typeof curseForgeAuthorSchema>