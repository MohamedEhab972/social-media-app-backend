import z from "zod";
import { generalFields } from "../../common/service/general.fields.js";

export const postParamsSchema = {
  params: z.strictObject({ postId: generalFields.id }),
};

export const commentParamsSchema = {
  params: z.strictObject({
    postId: generalFields.id,
    commentId: generalFields.id,
  }),
};

export const createCommentSchema = {
  params: postParamsSchema.params,
  body: z.strictObject({
    content: z
      .string()
      .trim()
      .min(1, { error: "Comment cannot be empty" })
      .max(2000),
  }),
};

export const updateCommentSchema = {
  params: commentParamsSchema.params,
  body: createCommentSchema.body,
};
