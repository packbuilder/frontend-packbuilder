import z from "zod";

export const userSchema = z.object({
    id: z.number(),
    
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
    isVerified: z.boolean()
});

export type User = z.infer<typeof userSchema>