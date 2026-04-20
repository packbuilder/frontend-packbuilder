import z from "zod";

export const changeEmailDtoSchema = z.object({
    newEmail: z.string().optional(),
    password: z.nullable(z.string()).optional(),
});

export type ChangeEmailDto = z.infer<typeof changeEmailDtoSchema>