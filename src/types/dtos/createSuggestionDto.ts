import z from "zod";
import { ModLoader } from "../enums";
import { gameVersionSchema } from "../propertySchemas/gameVersionSchema";
import { memoSchema } from "../propertySchemas/memoSchema";

export const createSuggestionDtoSchema = z.object({
    memo: memoSchema,
    gameVersion: gameVersionSchema,
    modLoader: z.enum(ModLoader).transform(Number)
});

export type CreateSuggestionDto = z.infer<typeof createSuggestionDtoSchema>