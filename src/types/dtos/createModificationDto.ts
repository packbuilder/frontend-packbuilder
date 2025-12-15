import z from "zod";
import { ModPlatform } from "../mod";
import { ModAction } from "../modification";

export const createModificationDtoSchema = z.object({
    modReferenceId: z.string(),
    modAction: z.nativeEnum(ModAction),
    modPlatform: z.nativeEnum(ModPlatform)
});

export type CreateModificationDto = z.infer<typeof createModificationDtoSchema>