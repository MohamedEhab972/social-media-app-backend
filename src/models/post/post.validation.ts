import z from "zod";
import { AvailabilityEnum } from "../../common/indexs.js";
import { generalFields } from "../../common/service/general.fields.js";

export const postIdSchema = {
  params: z.strictObject({ postId: generalFields.id }),
};

export const userPostsSchema = {
  params: z.strictObject({ userId: generalFields.id }),
};

export const createPostSchema = {
  body: z.strictObject({
    content: z.string().trim().max(5000).optional(),
    availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.Public),
  }),
};

export const updatePostSchema = {
  params: postIdSchema.params,
  body: z
    .strictObject({
      content: z.string().trim().min(1).max(5000).optional(),
      availability: z.enum(AvailabilityEnum).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      error: "Nothing to update",
    }),
};
