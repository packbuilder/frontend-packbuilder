import z from "zod";
import { ConflictState } from "./enums";
import { modSchema } from "./mod";
import { paginatedResponseSchema } from "./paginatedResponse";

export const versionModSchema = z.object({
    modId: z.number(),
    versionIteration: z.number(),
    conflictState: z.coerce.string().pipe(z.enum(ConflictState)),
    mod: modSchema
})

export const paginatedVersionModSchema = paginatedResponseSchema(versionModSchema);

export type VersionMod = z.infer<typeof versionModSchema>;

export type PaginatedVersionModSchema = z.infer<typeof paginatedVersionModSchema>;