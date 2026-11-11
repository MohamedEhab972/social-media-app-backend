import { Router, type Request, type Response } from "express";
import { successResponse } from "../../common/exceptions/success.response.js";
import authServes from "./auth.serves.js";
import type { IUser } from "../../common/indexs.js";
import { auth } from "../../middleware/auth.middleware.js";
import { checkRole } from "../../middleware/checkRole.middleware.js";
import { uploadFile } from "../../common/utils/multer/cloud.js";
import { MulterStorageEnum } from "../../common/enums/multer.enum.js";
import { validation } from "../../common/service/validation.js";
import { loginSchema, signUpSchema } from "./auth.validation.js";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello from auth router");
});

router.get(
  "/users",
  auth,
  checkRole([0]),
  async (req: Request, res: Response) => {
    const users = await authServes.getAllUsers();
    successResponse(res, "Users retrieved successfully", 200, users);
  },
);

router.get(
  "/users/:id",
  auth,
  checkRole([0]),
  async (req: Request, res: Response) => {
    const user = await authServes.getUserByID(req.params.id as string);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    successResponse(res, "User retrieved successfully", 200, user);
  },
);

router.get("/users/:filter", auth, async (req: Request, res: Response) => {
  const user = await authServes.getUser(req.params.filter as Partial<IUser>);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  successResponse(res, "User retrieved successfully", 200, user);
});

router.post("/login", validation(loginSchema), async (req: Request, res: Response) => {
  const data = await authServes.loginUser(req.body);
  successResponse(res, "Login route", 200, data);
});

router.post(
  "/register",
  uploadFile({ storageKey: MulterStorageEnum.memoryStorage }).single("file"),
  validation(signUpSchema),
  async (req: Request, res: Response) => {
    const data = await authServes.registerUser(req.body, req.file);
    successResponse(res, "User registered successfully", 200, data);
  },
);

export default router;
