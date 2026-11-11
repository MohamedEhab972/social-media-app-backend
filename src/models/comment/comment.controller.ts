import { Router, type Response } from "express";
import type { RequestWithUser } from "../../middleware/auth.middleware.js";
import { validation } from "../../common/service/validation.js";
import { successResponse } from "../../common/exceptions/success.response.js";
import commentService from "./comment.service.js";
import {
  commentParamsSchema,
  createCommentSchema,
  postParamsSchema,
  updateCommentSchema,
} from "./comment.validation.js";

// Mounted on /post/:postId/comment (auth is applied by the post router)
const router: Router = Router({ mergeParams: true });

router.post(
  "/",
  validation(createCommentSchema),
  async (req: RequestWithUser, res: Response) => {
    const comment = await commentService.createComment(
      req.user!._id,
      req.params.postId as string,
      req.body.content,
    );
    successResponse(res, "Comment added successfully", 201, comment);
  },
);

router.get(
  "/",
  validation(postParamsSchema),
  async (req: RequestWithUser, res: Response) => {
    const comments = await commentService.getComments(
      req.user!._id,
      req.params.postId as string,
    );
    successResponse(res, "Comments retrieved successfully", 200, comments);
  },
);

router.patch(
  "/:commentId",
  validation(updateCommentSchema),
  async (req: RequestWithUser, res: Response) => {
    const comment = await commentService.updateComment(
      req.user!._id,
      req.params.postId as string,
      req.params.commentId as string,
      req.body.content,
    );
    successResponse(res, "Comment updated successfully", 200, comment);
  },
);

router.delete(
  "/:commentId",
  validation(commentParamsSchema),
  async (req: RequestWithUser, res: Response) => {
    await commentService.deleteComment(
      req.user!._id,
      req.params.postId as string,
      req.params.commentId as string,
    );
    successResponse(res, "Comment deleted successfully", 200);
  },
);

export default router;
