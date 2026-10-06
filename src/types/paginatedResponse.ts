import z from "zod";
import { versionModSchema } from "./versionMod";
import { suggestionSchema } from "./suggestion";
import { modificationSchema } from "./modification";
import { modpackSchema } from "./modpack";

export const paginatedResponseSchema = <T extends z.ZodType>(
    itemSchema: T
) => z.object({
    items: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalItems: z.number() 
});

export const paginatedVersionModSchema = paginatedResponseSchema(versionModSchema);
export const paginatedSuggestionSchema = paginatedResponseSchema(suggestionSchema);
export const paginatedModificationSchema = paginatedResponseSchema(modificationSchema);
export const paginatedModpackSchema = paginatedResponseSchema(modpackSchema);

export type PaginatedResponse<T> = {
    items: T[],
    page: number,
    pageSize: number,
    totalPages: number,
    totalItems: number 
}

export type PaginatedVersionModSchema = z.infer<typeof paginatedVersionModSchema>;
export type PaginatedSuggestionSchema = z.infer<typeof paginatedSuggestionSchema>;
export type PaginatedModificationSchema = z.infer<typeof paginatedModificationSchema>;
export type PaginatedModpackSchema = z.infer<typeof paginatedModpackSchema>;