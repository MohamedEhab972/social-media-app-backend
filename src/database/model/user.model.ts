import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  type IUser,
} from "../../common/indexs.js";

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, select: false },
    confirmPassword: { type: Boolean, default: false },
    profileImage: [String],
    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.Male,
    },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.System,
    },
    role: {
      type: Number,
      enum: RoleEnum,
      default: RoleEnum.User,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema
  .virtual("userName")
  .set(function (value: string) {
    const [firstName, ...lastNameParts] = value.trim().split(/\s+/);
    if (!firstName || lastNameParts.length === 0) {
      throw new Error(
        "Invalid userName format. It should contain first and last name.",
      );
    }
    this.firstName = firstName;
    this.lastName = lastNameParts.join(" ");
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
