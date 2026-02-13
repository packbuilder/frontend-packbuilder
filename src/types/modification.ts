import z from "zod";
import { modSchema } from "./mod";
import { ModAction, ModificationState } from "./enums";

export const modificationSchema = z.object({
    id: z.number(),
    
    modId: z.number(),
    suggestionId: z.number(),
    state: z.coerce.string().pipe(z.enum(ModificationState)),
    modAction:  z.coerce.string().pipe(z.enum(ModAction)),
    mod: modSchema,
});

export type Modification = z.infer<typeof modificationSchema>