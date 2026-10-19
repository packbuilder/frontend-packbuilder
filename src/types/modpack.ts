import z from "zod";
import { versionSchema } from "./version";
import { userSchema } from "./user";
import { Game, ImageType } from "./enums";

export const modpackSchema = z.object({
    id: z.number(),
    user: userSchema,
    
    name: z.string(),
    slug: z.string(),
    game: z.coerce.string().pipe(z.enum(Game)),
    imageValue: z.string(),
    imageType: z.coerce.string().pipe(z.enum(ImageType)),
    userId: z.number(),
    versions: z.array(versionSchema)
});

export type Modpack = z.infer<typeof modpackSchema>