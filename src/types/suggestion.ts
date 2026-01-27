import z from "zod";
import { userSchema } from "./user";
import { modpackSchema } from "./modpack";
import { modificationSchema } from "./modification";
import { ModLoader, SuggestionState } from "./enums";

export const suggestionSchema = z.object({
    id: z.number(),
    user: userSchema.nullable(),
    modpack: modpackSchema.nullable(),
    
    username: z.string(),
    userId: z.number(),
    state: z.coerce.string().pipe(z.enum(SuggestionState)),
    gameVersion: z.string(),
    modLoader: z.coerce.string().pipe(z.enum(ModLoader)),
    modpackSlug: z.string(),
    memo: z.string(),
    
    modifications: z.array(modificationSchema),
    conflictingModifications: z.array(modificationSchema)
});

export type Suggestion = z.infer<typeof suggestionSchema>