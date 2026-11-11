import mongoose from "mongoose";
import {
  FriendRequestStatusEnum,
  type IFriendRequest,
} from "../../common/indexs.js";

const friendRequestSchema = new mongoose.Schema<IFriendRequest>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FriendRequestStatusEnum),
      default: FriendRequestStatusEnum.Pending,
    },
  },
  { timestamps: true },
);

friendRequestSchema.index({ sender: 1, receiver: 1 });

// ---------------- Mongoose middlewares ----------------

// A user can't send a friend request to himself
friendRequestSchema.pre("validate", function () {
  if (this.sender && this.receiver && this.sender.equals(this.receiver)) {
    throw new Error("You can't send a friend request to yourself");
  }
});

// When a request is accepted, add each user to the other's friends list
friendRequestSchema.post(
  "findOneAndUpdate",
  async function (doc: IFriendRequest | null) {
    if (doc && doc.status === FriendRequestStatusEnum.Accepted) {
      const User = mongoose.model("User");
      await Promise.all([
        User.updateOne({ _id: doc.sender }, { $addToSet: { friends: doc.receiver } }),
        User.updateOne({ _id: doc.receiver }, { $addToSet: { friends: doc.sender } }),
      ]);
    }
  },
);

const FriendRequestModel = mongoose.model<IFriendRequest>(
  "FriendRequest",
  friendRequestSchema,
);

export default FriendRequestModel;
