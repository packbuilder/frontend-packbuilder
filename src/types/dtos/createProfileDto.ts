import z from "zod";
import { ImageType } from "../enums";
import { nameSchema } from "../propertySchemas/nameSchema";
import { passwordSchema } from "../propertySchemas/passwordSchema";
import { imageValueSchema } from "../propertySchemas/imageValueSchema";
import { emailSchema } from "../propertySchemas/emailSchema";

export const createUserDtoSchema = z.object({
    name: nameSchema,
    password: passwordSchema,
    email: emailSchema,
    imageType: z.enum(ImageType).transform(Number),
    imageValue: imageValueSchema
});

export type CreateUserDto = z.infer<typeof createUserDtoSchema>