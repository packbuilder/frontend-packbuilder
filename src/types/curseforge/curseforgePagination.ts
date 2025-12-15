import z from "zod";

export const curseForgePaginationSchema = z.object({
    index: z.number(),
    pageSize: z.number(),
    resultCount: z.number(),
    totalCount: z.number()
});

export type CurseForgePagination = z.infer<typeof curseForgePaginationSchema>