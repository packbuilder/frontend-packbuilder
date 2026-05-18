import z from "zod";
import { ImageType } from "../enums";

export const updateProfileDtoSchema = z.object({
    name: z.string().optional(),
    imageValue: z.string().optional(),
    imageType: z.enum(ImageType).transform(Number).optional()
});

export type UpdateUserDto = z.infer<typeof updateProfileDtoSchema>