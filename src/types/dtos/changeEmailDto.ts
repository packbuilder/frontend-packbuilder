import z from "zod";
import { passwordSchema } from "../propertySchemas/passwordSchema";
import { emailSchema } from "../propertySchemas/emailSchema";

export const changeEmailDtoSchema = z.object({
    newEmail: emailSchema,
    password: passwordSchema,
});

export type ChangeEmailDto = z.infer<typeof changeEmailDtoSchema>