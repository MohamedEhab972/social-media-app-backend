import z from "zod";
import { generalFields } from "../../common/service/general.fields.js";

export const userIdSchema = {
  params: z.strictObject({ userId: generalFields.id }),
};

export const requestIdSchema = {
  params: z.strictObject({ requestId: generalFields.id }),
};

export const friendIdSchema = {
  params: z.strictObject({ friendId: generalFields.id }),
};
