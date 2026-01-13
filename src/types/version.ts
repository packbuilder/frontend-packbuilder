import z from "zod";
import { versionModSchema } from "./versionMod";

export const versionSchema = z.object({
    id: z.number(),
    modpackId: z.number(),
    iterations: z.number(),

    versionMods: z.array(versionModSchema)
})

export type Version = z.infer<typeof versionSchema>