import z from "zod";
import { passwordSchema } from "../propertySchemas/passwordSchema";

export const changeEmailDtoSchema = z.object({
    newEmail: z.email("Please enter a valid email address."),
    password: passwordSchema,
});

export type ChangeEmailDto = z.infer<typeof changeEmailDtoSchema>