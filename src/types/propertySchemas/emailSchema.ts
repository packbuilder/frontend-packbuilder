import z from "zod";

export const emailSchema = z.email("You did not enter a valid email")
    .nonempty("Please enter an email.")
    .max(254, "Email must be under 254 characters long.")
    .trim();