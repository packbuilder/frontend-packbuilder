import z from "zod";
import { versionSchema } from "./version";
import { userSchema } from "./user";
import { dateSchema } from ".";

export const modpackSchema = z.object({
    id: z.number(),
    createdAt: dateSchema,
    updatedAt: dateSchema,
    user: userSchema,
    
    name: z.string(),
    slug: z.string(),
    avatar: z.string(),
    userId: z.number(),
    versions: z.array(versionSchema)
});

export type Modpack = z.infer<typeof modpackSchema>