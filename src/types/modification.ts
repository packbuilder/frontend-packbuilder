import z from "zod";
import { dateSchema } from ".";
import { modSchema } from "./mod";

export enum ModAction {
    Added = "0",
    Removed = "1",
    Updated = "2"
}

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