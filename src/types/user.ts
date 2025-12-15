import z from "zod";
import { dateSchema } from ".";

export const userSchema = z.object({
    id: z.number(),
    createdAt: dateSchema,
    updatedAt: dateSchema,
    
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
});

export type User = z.infer<typeof userSchema>