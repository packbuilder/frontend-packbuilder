import z from "zod";

export const versionModSchema = z.object({
    modId: z.number(),
    versionIteration: z.number(),
})

export type VersionMod = z.infer<typeof versionModSchema>