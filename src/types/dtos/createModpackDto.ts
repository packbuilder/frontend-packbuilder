import z from "zod";
import { ImageType, ModLoader } from "../enums";

export const createModpackDtoSchema = z.object({
    name: z.string(),
    modLoader: z.enum(ModLoader).transform(Number),
    gameVersion: z.string(),
    imageType: z.enum(ImageType).transform(Number),
    imageValue: z.string()
});

export type CreateModpackDto = z.infer<typeof createModpackDtoSchema>