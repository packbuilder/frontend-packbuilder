import z from "zod";
import { ModPlatform } from "./enums";


export const modSchema = z.object({
    id: z.number(),
    
    referenceId: z.string(),
    platform: z.coerce.string().pipe(z.enum(ModPlatform)),
});

export type Mod = z.infer<typeof modSchema>