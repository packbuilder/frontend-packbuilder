import z from "zod";
import { ModLoader } from "../enums";

export const createSuggestionDtoSchema = z.object({
    memo: z.string(),
    gameVersion: z.string(),
    modLoader: z.enum(ModLoader)
});

export type CreateSuggestionDto = z.infer<typeof createSuggestionDtoSchema>