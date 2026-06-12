import z from "zod";
import { ImageType } from "../enums";
import { nameSchema } from "../propertySchemas/nameSchema";
import { imageValueSchema } from "../propertySchemas/imageValueSchema";

export const updateProfileDtoSchema = z.object({
    name: nameSchema,
    imageValue: imageValueSchema.optional(),
    imageType: z.enum(ImageType).transform(Number).optional()
});

export type UpdateUserDto = z.infer<typeof updateProfileDtoSchema>