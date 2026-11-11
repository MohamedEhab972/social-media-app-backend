import type { Filter } from "mongodb";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/exceptions/error.exceptions.js";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  type IUser,
} from "../../common/indexs.js";
import { compareHash, generateHash } from "../../common/security/security.js";
import UserModel from "../../database/model/user.model.js";
import { DatabaseRepository } from "../../database/repository/database.repository.js";
import { TokenService } from "../../common/service/token.service.js";
import { s3Service } from "../../common/service/s3.service.js";
import { MulterStorageEnum } from "../../common/enums/multer.enum.js";
import { env } from "../../config/env.service.js";

// Precomputed bcrypt hash with no matching plaintext, used to keep the
// compare step's timing the same whether the user exists or not.
const DUMMY_PASSWORD_HASH =
  "$2b$10$s6cO78DcR3iSGtvw8eyOJu0Uu74IE3pK1gaTeFh8w.Y1riVd0XhRe";

class AuthService {
  private userRepository: DatabaseRepository<IUser>;
  private tokenService: TokenService;
  constructor() {
    this.userRepository = new DatabaseRepository<IUser>(UserModel);
    this.tokenService = new TokenService();
  }

  async getAllUsers() {
    return await this.userRepository.findAll({ select: "-password" });
  }

  async getUserByID(id: string) {
    const user = await this.userRepository.findByID({
      id,
      select: "-password",
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async getUser(filter: Omit<Filter<IUser>, "_id">) {
    const user = await this.userRepository.findOne({
      filter,
      select: "-password",
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async loginUser(data: Partial<IUser>) {
    const { email, password } = data;
    if (!email || !password) {
      throw new BadRequestException(
        "Missing required fields: email or password",
      );
    }

    const user = await this.userRepository.findOne({
      filter: { email },
      select: "+password",
    });

    const isPasswordMatch = await compareHash({
      planText: password,
      cypherText: user?.password ?? DUMMY_PASSWORD_HASH,
    });
    if (!user || !isPasswordMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const { password: _password, ...safeUser } = user.toObject();
    const token = this.tokenService.generateToken(safeUser);

    return { ...safeUser, token };
  }

  async registerUser(userData: IUser, file?: Express.Multer.File) {
    const { userName, email, phone, password, gender } = userData;
    if (!userName || !email || !phone || !password) {
      throw new BadRequestException(
        "Missing required fields: userName, email, phone, or password",
      );
    }

    const existingUserByEmail = await this.userRepository.findOne({
      filter: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException("Email is already registered");
    }

    const existingUserByPhone = await this.userRepository.findOne({
      filter: { phone },
    });
    if (existingUserByPhone) {
      throw new ConflictException("Phone number is already registered");
    }

    const hashedPassword = await generateHash({ planText: password });

    let profileImageKeys: string[] = [];

    if (file) {
      // Upload the file to S3 and get the URL
      let profileImageKey = await s3Service.uploadFile({
        storageKey: MulterStorageEnum.diskStorage,
        fileContent: file,
      });
      profileImageKeys.push(profileImageKey);
    }

    const newUser = await this.userRepository.create({
      userName,
      email,
      phone,
      password: hashedPassword,
      confirmPassword: false,
      gender: gender || GenderEnum.Male,
      provider: ProviderEnum.System,
      role: RoleEnum.User,
      profileImage: profileImageKeys,
    });

    return newUser; // Return the registered user data for demonstration
  }
}

export default new AuthService();
