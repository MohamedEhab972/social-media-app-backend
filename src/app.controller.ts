import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import authRouter from "./models/auth/auth.controller.js";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.service.js";
import { connectDB } from "./database/connection.js";
import { errorHandlingMiddleware } from "./middleware/errorHandling.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

export const bootstrap = () => {
  const app: Express = express();
  app.use(helmet());
  app.use(express.json());
  app.use(
    cors({
      origin: env.CORS_ORIGIN ?? false,
      methods: "GET,POST,PUT,DELETE",
      allowedHeaders:
        "Content-Type,Authorization,X-Requested-With,X-HTTP-Method-Override",
    }),
  );
  app.use(limiter);
  connectDB();
  app.use("/auth", authRouter);

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(errorHandlingMiddleware);
  app.listen(env.PORT, () => {
    console.log(`Server is listening on port ${env.PORT}`);
  });
};
