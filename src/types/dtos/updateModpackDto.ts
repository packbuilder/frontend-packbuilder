import z from "zod";
import { ImageType } from "../enums";
import { imageValueSchema } from "../propertySchemas/imageValueSchema";
import { nameSchema } from "../propertySchemas/nameSchema";

export const updateModpackDtoSchema = z.object({
    name: nameSchema,
    imageValue: imageValueSchema.optional(),
    imageType: z.enum(ImageType).transform(Number).optional()
});

export type UpdateModpackDto = z.infer<typeof updateModpackDtoSchema>