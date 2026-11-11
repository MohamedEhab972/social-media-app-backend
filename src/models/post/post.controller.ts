import { Router, type Response } from "express";
import { auth, type RequestWithUser } from "../../middleware/auth.middleware.js";
import { validation } from "../../common/service/validation.js";
import { successResponse } from "../../common/exceptions/success.response.js";
import { uploadFile } from "../../common/utils/multer/cloud.js";
import { MulterStorageEnum } from "../../common/enums/multer.enum.js";
import commentRouter from "../comment/comment.controller.js";
import postService from "./post.service.js";
import {
  createPostSchema,
  postIdSchema,
  updatePostSchema,
  userPostsSchema,
} from "./post.validation.js";

const router: Router = Router();

router.use(auth);

// Comment module: /post/:postId/comment/...
router.use("/:postId/comment", commentRouter);

router.post(
  "/",
  uploadFile({ storageKey: MulterStorageEnum.memoryStorage }).array(
    "attachments",
    5,
  ),
  validation(createPostSchema),
  async (req: RequestWithUser, res: Response) => {
    const post = await postService.createPost(
      req.user!._id,
      req.body,
      req.files as Express.Multer.File[],
    );
    successResponse(res, "Post created successfully", 201, post);
  },
);

router.get("/", async (req: RequestWithUser, res: Response) => {
  const posts = await postService.getFeed(req.user!._id);
  successResponse(res, "Feed retrieved successfully", 200, posts);
});

router.get(
  "/user/:userId",
  validation(userPostsSchema),
  async (req: RequestWithUser, res: Response) => {
    const posts = await postService.getUserPosts(
      req.user!._id,
      req.params.userId as string,
    );
    successResponse(res, "Posts retrieved successfully", 200, posts);
  },
);

router.get(
  "/:postId",
  validation(postIdSchema),
  async (req: RequestWithUser, res: Response) => {
    const post = await postService.getPost(
      req.user!._id,
      req.params.postId as string,
    );
    successResponse(res, "Post retrieved successfully", 200, post);
  },
);

router.patch(
  "/:postId",
  validation(updatePostSchema),
  async (req: RequestWithUser, res: Response) => {
    const post = await postService.updatePost(
      req.user!._id,
      req.params.postId as string,
      req.body,
    );
    successResponse(res, "Post updated successfully", 200, post);
  },
);

router.delete(
  "/:postId",
  validation(postIdSchema),
  async (req: RequestWithUser, res: Response) => {
    await postService.deletePost(req.user!._id, req.params.postId as string);
    successResponse(res, "Post deleted successfully", 200);
  },
);

router.patch(
  "/:postId/like",
  validation(postIdSchema),
  async (req: RequestWithUser, res: Response) => {
    const data = await postService.toggleLike(
      req.user!._id,
      req.params.postId as string,
    );
    successResponse(res, data.liked ? "Post liked" : "Post unliked", 200, data);
  },
);

export default router;
