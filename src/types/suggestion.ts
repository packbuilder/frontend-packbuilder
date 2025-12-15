import z from "zod";
import { userSchema } from "./user";
import { modpackSchema } from "./modpack";
import { modificationSchema } from "./modification";
import { ModLoader, SuggestionState } from "./enums";

export const suggestionSchema = z.object({
    id: z.number(),
    user: userSchema.nullable(),
    modpack: modpackSchema.nullable(),
    
    userId: z.number(),
    state: z.coerce.string().pipe(z.enum(SuggestionState)),
    gameVersion: z.string(),
    modLoader: z.coerce.string().pipe(z.enum(ModLoader)),
    modpackId: z.number(),
    memo: z.string(),
    
    modifications: z.array(modificationSchema)
});

export type Suggestion = z.infer<typeof suggestionSchema>