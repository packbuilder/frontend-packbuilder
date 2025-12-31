import z from "zod";
import { dateSchema } from ".";
import { userSchema } from "./user";
import { modpackSchema } from "./modpack";
import { modificationSchema } from "./modification";

export const suggestionSchema = z.object({
    id: z.number(),
    createdAt: dateSchema,
    updatedAt: dateSchema,
    user: userSchema,
    modpack: modpackSchema,
    
    username: z.string(),
    userId: z.number(),
    isOutdated: z.boolean(),
    modpackSlug: z.string(),
    memo: z.string(),
    
    modifications: z.array(modificationSchema),
    conflictingModifications: z.array(modificationSchema)
});

export type Suggestion = z.infer<typeof suggestionSchema>