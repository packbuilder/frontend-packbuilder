import z from "zod";

export const userTokenSchema = z.object({
    id: z.number(),
    emailVerified: z.boolean(),
});

export type UserToken = z.infer<typeof userTokenSchema>