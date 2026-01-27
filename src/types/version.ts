import z from "zod";
import { versionModSchema } from "./versionMod";
import { ModLoader } from "./enums";

export const versionSchema = z.object({
    id: z.number(),
    modpackId: z.number(),
    iterations: z.number(),
    gameVersion: z.string(),
    modLoader: z.coerce.string().pipe(z.enum(ModLoader)),

    versionMods: z.array(versionModSchema)
})

export type Version = z.infer<typeof versionSchema>