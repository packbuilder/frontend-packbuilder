import z from "zod";
import { versionModSchema } from "./versionMod";
import { suggestionSchema } from "./suggestion";
import { modificationSchema } from "./modification";
import { modpackSchema } from "./modpack";
import { bookmarkSchema } from "./bookmark";

export type PaginatedResponse<T> = {
    items: T[],
    page: number,
    pageSize: number,
    totalPages: number,
    totalItems: number 
}

export const paginatedResponseSchema = <T extends z.ZodType>(
    itemSchema: T
) => z.object({
    items: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalItems: z.number() 
});

export const paginatedModpackSchema = paginatedResponseSchema(modpackSchema);
export const paginatedBookmarkSchema = paginatedResponseSchema(bookmarkSchema);
export const paginatedVersionModSchema = paginatedResponseSchema(versionModSchema);
export const paginatedSuggestionSchema = paginatedResponseSchema(suggestionSchema);
export const paginatedModificationSchema = paginatedResponseSchema(modificationSchema);

export type PaginatedModpackSchema = z.infer<typeof paginatedModpackSchema>;
export type PaginatedBookmarkSchema = z.infer<typeof paginatedBookmarkSchema>;
export type PaginatedVersionModSchema = z.infer<typeof paginatedVersionModSchema>;
export type PaginatedSuggestionSchema = z.infer<typeof paginatedSuggestionSchema>;
export type PaginatedModificationSchema = z.infer<typeof paginatedModificationSchema>;