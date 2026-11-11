import z from "zod";
import { GenderEnum } from "../../common/indexs.js";

export const signUpSchema = {
  body: z
    .strictObject({
      email: z.email(),
      password: z
        .string()
        .min(6, { error: "Password must be at least 6 characters long" })
        .max(100, { error: "Password must be at most 100 characters long" }),
      userName: z
        .string()
        .min(3, { error: "Username must be at least 3 characters long" })
        .max(100, { error: "Username must be at most 100 characters long" }),
      phone: z
        .string()
        .min(3, { error: "Phone number must be at least 3 characters long" })
        .max(100, {
          error: "Phone number must be at most 100 characters long",
        }),
      gender: z
        .enum(["male", "female"])
        .default("male")
        .transform((g) => (g === "female" ? GenderEnum.Female : GenderEnum.Male)),
      confirmPassword: z.string().min(6).max(100),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
    }),
};

export const loginSchema = {
  body: z.strictObject({
    email: z.email(),
    password: z
      .string()
      .min(6, { error: "Password must be at least 6 characters long" })
      .max(100, { error: "Password must be at most 100 characters long" }),
  }),
};
