import bcrypt from "bcrypt";
import { env } from "../../config/env.service.js";

export const generateHash = async ({
  planText,
  saltRounds = env.SALT,
}: {
  planText: string;
  saltRounds?: number;
}): Promise<string> => {
  const hashedPassword = await bcrypt.hash(planText, saltRounds);
  return hashedPassword;
};

export const compareHash = async ({
  planText,
  cypherText,
}: {
  planText: string;
  cypherText: string;
}): Promise<boolean> => {
  const isMatch = await bcrypt.compare(planText, cypherText);
  return isMatch;
};
