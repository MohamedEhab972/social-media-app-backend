import type { GenderEnum, ProviderEnum, RoleEnum } from "../indexs.js";

export interface IUser {
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: boolean;
  gender?: GenderEnum;
  provider?: ProviderEnum;
  role?: RoleEnum;
  profileImage?: string[];
}
