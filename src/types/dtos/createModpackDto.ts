import z from "zod";
import { ModLoader } from "../enums";

export const createModpackDtoSchema = z.object({
    name: z.string(),
    modLoader: z.enum(ModLoader).transform(Number),
    gameVersion: z.string()
});

export type CreateModpackDto = z.infer<typeof createModpackDtoSchema>