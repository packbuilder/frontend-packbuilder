import z from "zod";
import { ImageType, ModLoader } from "../enums";
import { nameSchema } from "../propertySchemas/nameSchema";
import { imageValueSchema } from "../propertySchemas/imageValueSchema";
import { gameVersionSchema } from "../propertySchemas/gameVersionSchema";

export const createModpackDtoSchema = z.object({
    name: nameSchema,
    modLoader: z.enum(ModLoader).transform(Number),
    gameVersion: gameVersionSchema,
    imageType: z.enum(ImageType).transform(Number),
    imageValue: imageValueSchema
});

export type CreateModpackDto = z.infer<typeof createModpackDtoSchema>