import z from "zod";
import { dateSchema } from ".";
import { userSchema } from "./user";
import { modpackSchema } from "./modpack";
import { modificationSchema } from "./modification";
import { modLoader } from "./version";

export enum SuggestionState {
    Unverified = "0",
    Verified = "1",
    VerificationPending = "2"
}

export const suggestionSchema = z.object({
    id: z.number(),
    createdAt: dateSchema,
    updatedAt: dateSchema,
    user: userSchema,
    modpack: modpackSchema,
    
    username: z.string(),
    userId: z.number(),
    state: z.enum(SuggestionState),
    gameVersion: z.string(),
    modLoader: z.enum(modLoader),
    modpackSlug: z.string(),
    memo: z.string(),
    
    modifications: z.array(modificationSchema),
    conflictingModifications: z.array(modificationSchema)
});

export type Suggestion = z.infer<typeof suggestionSchema>