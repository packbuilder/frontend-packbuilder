import z from "zod";

export const updateModpackDtoSchema = z.object({
    name: z.string().optional(),
    avatar: z.string().optional()
});

export type UpdateModpackDto = z.infer<typeof updateModpackDtoSchema>