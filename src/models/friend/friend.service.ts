import { Types } from "mongoose";
import FriendRequestModel from "../../database/model/friendRequest.model.js";
import UserModel from "../../database/model/user.model.js";
import { FriendRequestStatusEnum } from "../../common/indexs.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions/error.exceptions.js";

// public profile only - used for pending requests (no email)
const USER_FIELDS = "firstName lastName profileImage";
// friends (accepted friendships) can also see each other's email
const FRIEND_FIELDS = "firstName lastName email profileImage";

class FriendService {
  private betweenUsers(a: string, b: string) {
    return {
      $or: [
        { sender: a, receiver: b },
        { sender: b, receiver: a },
      ],
    };
  }

  async sendRequest(userId: string, receiverId: string) {
    if (userId === receiverId) {
      throw new BadRequestException("You can't send a friend request to yourself");
    }

    const [me, receiver] = await Promise.all([
      UserModel.findById(userId).select("friends"),
      UserModel.findById(receiverId).select("_id"),
    ]);
    if (!me || !receiver) {
      throw new NotFoundException("User not found");
    }
    if (me.friends?.some((id) => id.equals(receiverId))) {
      throw new ConflictException("You are already friends");
    }

    const pending = await FriendRequestModel.findOne({
      ...this.betweenUsers(userId, receiverId),
      status: FriendRequestStatusEnum.Pending,
    });
    if (pending) {
      throw new ConflictException(
        pending.sender.equals(userId)
          ? "Friend request already sent"
          : "This user already sent you a friend request, accept it instead",
      );
    }

    // allow sending again after an old request was rejected
    await FriendRequestModel.deleteMany({
      ...this.betweenUsers(userId, receiverId),
      status: { $ne: FriendRequestStatusEnum.Pending },
    });

    // pre("validate") middleware also blocks self requests at the DB level
    return await FriendRequestModel.create({
      sender: new Types.ObjectId(userId),
      receiver: new Types.ObjectId(receiverId),
    });
  }

  private async respond(
    userId: string,
    requestId: string,
    status: FriendRequestStatusEnum,
  ) {
    // only the receiver can accept/reject a pending request
    const request = await FriendRequestModel.findOneAndUpdate(
      {
        _id: requestId,
        receiver: userId,
        status: FriendRequestStatusEnum.Pending,
      },
      { $set: { status } },
      { returnDocument: "after", runValidators: true },
    );
    if (!request) {
      throw new NotFoundException("Friend request not found");
    }
    return request;
  }

  async acceptRequest(userId: string, requestId: string) {
    // post("findOneAndUpdate") middleware adds both users to each other's friends
    return await this.respond(userId, requestId, FriendRequestStatusEnum.Accepted);
  }

  async rejectRequest(userId: string, requestId: string) {
    return await this.respond(userId, requestId, FriendRequestStatusEnum.Rejected);
  }

  async cancelRequest(userId: string, requestId: string) {
    const request = await FriendRequestModel.findOneAndDelete({
      _id: requestId,
      sender: userId,
      status: FriendRequestStatusEnum.Pending,
    });
    if (!request) {
      throw new NotFoundException("Friend request not found");
    }
    return request;
  }

  async getReceivedRequests(userId: string) {
    return await FriendRequestModel.find({
      receiver: userId,
      status: FriendRequestStatusEnum.Pending,
    })
      .populate("sender", USER_FIELDS)
      .sort({ createdAt: -1 });
  }

  async getSentRequests(userId: string) {
    return await FriendRequestModel.find({
      sender: userId,
      status: FriendRequestStatusEnum.Pending,
    })
      .populate("receiver", USER_FIELDS)
      .sort({ createdAt: -1 });
  }

  async getFriends(userId: string) {
    const user = await UserModel.findById(userId)
      .select("friends")
      .populate("friends", FRIEND_FIELDS);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user.friends ?? [];
  }

  async removeFriend(userId: string, friendId: string) {
    const result = await UserModel.updateOne(
      { _id: userId, friends: friendId },
      { $pull: { friends: friendId } },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException("This user is not in your friends list");
    }
    await Promise.all([
      UserModel.updateOne({ _id: friendId }, { $pull: { friends: userId } }),
      FriendRequestModel.deleteMany(this.betweenUsers(userId, friendId)),
    ]);
  }
}

export default new FriendService();
