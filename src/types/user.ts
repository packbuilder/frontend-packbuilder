import z from "zod";
import { ImageType } from "./enums";

export const userSchema = z.object({
    id: z.number(),
    
    name: z.string(),
    email: z.string(),
    imageValue: z.string(),
    imageType: z.coerce.string().pipe(z.enum(ImageType)),
    emailVerified: z.boolean()
});

export type User = z.infer<typeof userSchema>