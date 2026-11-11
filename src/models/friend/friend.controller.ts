import { Router, type Response } from "express";
import { auth, type RequestWithUser } from "../../middleware/auth.middleware.js";
import { validation } from "../../common/service/validation.js";
import { successResponse } from "../../common/exceptions/success.response.js";
import friendService from "./friend.service.js";
import {
  friendIdSchema,
  requestIdSchema,
  userIdSchema,
} from "./friend.validation.js";

const router: Router = Router();

router.use(auth);

// ---------- friend requests ----------

router.post(
  "/request/:userId",
  validation(userIdSchema),
  async (req: RequestWithUser, res: Response) => {
    const request = await friendService.sendRequest(
      req.user!._id,
      req.params.userId as string,
    );
    successResponse(res, "Friend request sent", 201, request);
  },
);

router.get("/requests/received", async (req: RequestWithUser, res: Response) => {
  const requests = await friendService.getReceivedRequests(req.user!._id);
  successResponse(res, "Received friend requests", 200, requests);
});

router.get("/requests/sent", async (req: RequestWithUser, res: Response) => {
  const requests = await friendService.getSentRequests(req.user!._id);
  successResponse(res, "Sent friend requests", 200, requests);
});

router.patch(
  "/request/:requestId/accept",
  validation(requestIdSchema),
  async (req: RequestWithUser, res: Response) => {
    const request = await friendService.acceptRequest(
      req.user!._id,
      req.params.requestId as string,
    );
    successResponse(res, "Friend request accepted", 200, request);
  },
);

router.patch(
  "/request/:requestId/reject",
  validation(requestIdSchema),
  async (req: RequestWithUser, res: Response) => {
    const request = await friendService.rejectRequest(
      req.user!._id,
      req.params.requestId as string,
    );
    successResponse(res, "Friend request rejected", 200, request);
  },
);

router.delete(
  "/request/:requestId",
  validation(requestIdSchema),
  async (req: RequestWithUser, res: Response) => {
    await friendService.cancelRequest(req.user!._id, req.params.requestId as string);
    successResponse(res, "Friend request cancelled", 200);
  },
);

// ---------- friends ----------

router.get("/", async (req: RequestWithUser, res: Response) => {
  const friends = await friendService.getFriends(req.user!._id);
  successResponse(res, "Friends retrieved successfully", 200, friends);
});

router.delete(
  "/:friendId",
  validation(friendIdSchema),
  async (req: RequestWithUser, res: Response) => {
    await friendService.removeFriend(req.user!._id, req.params.friendId as string);
    successResponse(res, "Friend removed successfully", 200);
  },
);

export default router;
