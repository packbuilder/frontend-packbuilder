import z from "zod";
import { modpackSchema } from "./modpack";

export const bookmarkSchema = z.object({
    id: z.number(),
    userId: z.number(),
    modpackId: z.number(),

    modpack: modpackSchema 
});

export type Bookmark = z.infer<typeof bookmarkSchema>