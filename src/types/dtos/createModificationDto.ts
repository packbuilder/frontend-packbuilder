import z from "zod";
import { ModAction, ModPlatform } from "../enums";

export const createModificationDtoSchema = z.object({
    modReferenceId: z.string(),
    modAction: z.enum(ModAction),
    modPlatform: z.enum(ModPlatform)
});

export type CreateModificationDto = z.infer<typeof createModificationDtoSchema>