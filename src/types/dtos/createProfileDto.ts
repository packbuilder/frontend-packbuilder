import z from "zod";
import { ImageType } from "../enums";

export const createUserDtoSchema = z.object({
    name: z.string(),
    password: z.string(),
    email: z.string(),
    imageType: z.enum(ImageType).transform(Number),
    imageValue: z.string()
});

export type CreateUserDto = z.infer<typeof createUserDtoSchema>