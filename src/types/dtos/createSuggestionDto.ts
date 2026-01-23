import z from "zod";
import { ModPlatform } from "../enums";

export const createSuggestionDtoSchema = z.object({
    memo: z.string(),
    gameVersion: z.string(),
    modPlatform: z.enum(ModPlatform)
});

export type CreateSuggestionDto = z.infer<typeof createSuggestionDtoSchema>