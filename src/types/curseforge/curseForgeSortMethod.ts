import z from "zod";

export const sortMethodSchema = z.enum(["0", "1", "2", "3"]);

export type SortMethod = z.infer<typeof sortMethodSchema>; 