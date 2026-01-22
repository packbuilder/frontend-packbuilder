import z from "zod";
import { versionModSchema } from "./versionMod";

export enum modLoader {
    Any = "0",
    Forge = "1",
    Cauldron = "2",
    LiteLoader = "3",
    Fabric = "4",
    Quilt = "5",
    NeoForge = "6",
}

export const versionSchema = z.object({
    id: z.number(),
    modpackId: z.number(),
    iterations: z.number(),
    gameVersion: z.string(),
    modLoader: z.enum(modLoader),

    versionMods: z.array(versionModSchema)
})

export type Version = z.infer<typeof versionSchema>