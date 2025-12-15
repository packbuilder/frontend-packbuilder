import { z } from "zod";

export const dateSchema = z.string().transform((str) => new Date(str));