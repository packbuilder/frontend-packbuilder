import z from "zod";
import { dateSchema } from ".";

export enum ModPlatform {
    Thunderstore = "0",
    CurseForge = "1"
}

export const modSchema = z.object({
    id: z.number(),
    createdAt: dateSchema,
    updatedAt: dateSchema,
    
    referenceId: z.string(),
    platform: z.enum(ModPlatform),
});

export type Mod = z.infer<typeof modSchema>