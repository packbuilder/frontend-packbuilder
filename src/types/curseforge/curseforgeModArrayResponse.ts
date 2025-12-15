import z from "zod";
import { curseForgeModSchema } from "./curseforgeMod";
import { curseForgePaginationSchema } from "./curseforgePagination";

export const curseForgeModListResponseSchema = z.object({
    mods: z.array(curseForgeModSchema),
    pagination: curseForgePaginationSchema
});

export type CurseForgeModListResponse = z.infer<typeof curseForgeModListResponseSchema>