import z from "zod";
import { versionModSchema } from "./versionMod";

export const paginatedResponseSchema = <T extends z.ZodType>(
    itemSchema: T
) => z.object({
    items: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalItems: z.number() 
});

export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;