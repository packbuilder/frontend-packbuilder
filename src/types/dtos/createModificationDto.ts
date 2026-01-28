import z from "zod";
import { ModAction, ModPlatform } from "../enums";

export const createModificationDtoSchema = z.object({
    modReferenceId: z.string(),
    modAction: z.enum(ModAction).transform(Number),
    modPlatform: z.enum(ModPlatform).transform(Number)
});

export type CreateModificationDto = z.infer<typeof createModificationDtoSchema>