import z from "zod";
import { dateSchema } from ".";
import { modSchema } from "./mod";
import { ModAction } from "./enums";

export const modificationSchema = z.object({
    id: z.number(),
    createdAt: dateSchema,
    updatedAt: dateSchema,
    
    modId: z.number(),
    suggestionId: z.number(),
    isConflicting: z.boolean(),
    modAction: z.enum(ModAction),
    mod: modSchema,
});

export type Modification = z.infer<typeof modificationSchema>