import z from "zod";

export const generalFields = {
  id: z.string().regex(/^[a-f\d]{24}$/i, { error: "Invalid id" }),
};
