import z from "zod";
import { ConflictState } from "./enums";
import { modSchema } from "./mod";

export const versionModSchema = z.object({
    modId: z.number(),
    versionIteration: z.number(),
    conflictState: z.coerce.string().pipe(z.enum(ConflictState)),
    mod: modSchema
})

export type VersionMod = z.infer<typeof versionModSchema>