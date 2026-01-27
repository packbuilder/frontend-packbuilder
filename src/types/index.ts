import { z } from "zod";

export const dateSchema = z.string().optional().transform((str) => str ? new Date(str) : null);