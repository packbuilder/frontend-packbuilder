import z from "zod";
import { versionSchema } from "./version";
import { userSchema } from "./user";

export const modpackSchema = z.object({
    id: z.number(),
    user: userSchema,
    
    name: z.string(),
    slug: z.string(),
    avatar: z.string().nullable(),
    userId: z.number(),
    versions: z.array(versionSchema)
});

export type Modpack = z.infer<typeof modpackSchema>