import z from "zod";

export const updateProfileDtoSchema = z.object({
    name: z.string().optional(),
    password: z.nullable(z.string()).optional(),
});

export type UpdateUserDto = z.infer<typeof updateProfileDtoSchema>