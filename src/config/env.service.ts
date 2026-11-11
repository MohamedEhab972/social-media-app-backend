import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(`./.env.${process.env.NODE_ENV}`) });

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;
const ADMIN_REFRESH_SECRET = process.env.ADMIN_REFRESH_SECRET;
const USER_REFRESH_SECRET = process.env.USER_REFRESH_SECRET;
const MODE = process.env.NODE_ENV;
const SALT = Number(process.env.SALT) || 10;
const SERVER_URI = process.env.SERVER_URI;
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIS_URL = process.env.REDIS_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(",").map((origin) =>
  origin.trim(),
);
const AWS_SECRIT = process.env.AWS_SECRIT_KEY;
const AWS_ACCESS = process.env.AWS_ACCESS_KEY;
const AWS_BOCKET_NAME = process.env.AWS_BOCKET_NAME;

export const env = {
  PORT,
  MONGO_URI,
  ADMIN_JWT_SECRET,
  USER_JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  ADMIN_REFRESH_SECRET,
  USER_REFRESH_SECRET,
  MODE,
  SALT,
  SERVER_URI,
  GOOGLE_EMAIL,
  GOOGLE_PASSWORD,
  GOOGLE_CLIENT_ID,
  REDIS_URL,
  CORS_ORIGIN,
  AWS_SECRIT,
  AWS_ACCESS,
  AWS_BOCKET_NAME,
};
